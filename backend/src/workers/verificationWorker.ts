import verificationQueue from '../config/queue';
import prisma from '../utils/prisma';
import enhancedVerificationService from '../services/enhancedVerificationService';
import { getIO } from '../config/socket';

interface JobData {
  jobId: string;
  emails: Array<{
    email: string;
    originalRow?: any;
  }>;
  batchNumber: number;
  totalBatches: number;
}

// Worker configuration
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '10');
const VERIFICATION_TIMEOUT = parseInt(
  process.env.VERIFICATION_TIMEOUT_MS || '30000'
);

console.log(`🔧 Worker Configuration:`);
console.log(`   - Concurrency: ${CONCURRENCY}`);
console.log(`   - Timeout: ${VERIFICATION_TIMEOUT}ms`);

/**
 * Helper to emit Socket.IO events safely using Redis adapter
 */
const emitSocketEvent = async (event: string, data: any) => {
  try {
    // Create a temporary Socket.IO client to emit via Redis
    const { Server } = await import('socket.io');
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { createClient } = await import('redis');

    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');

    const pubClient = createClient({ 
      socket: { host: redisHost, port: redisPort }
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Create a minimal Socket.IO instance just for emitting
    const io = new Server();
    io.adapter(createAdapter(pubClient, subClient));

    // Emit the event
    io.to(`job-${data.jobId}`).emit(event, data);
    
    console.log(`📡 Emitted ${event} via Redis adapter`);

    // Cleanup
    await pubClient.quit();
    await subClient.quit();
  } catch (error) {
    console.log(`ℹ️  Could not emit via Socket.IO:`, error);
  }
};

/**
 * Main worker processor
 * Processes batches of emails from the queue
 */
verificationQueue.process(CONCURRENCY, async (job) => {
  const { jobId, emails, batchNumber, totalBatches } = job.data as JobData;

  console.log(
    `\n🔄 Processing batch ${batchNumber}/${totalBatches} for job ${jobId}`
  );
  console.log(`   - Emails in batch: ${emails.length}`);

  try {
    // Get job details
    const verificationJob = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: { user: true },
    });

    if (!verificationJob) {
      throw new Error(`Job ${jobId} not found in database`);
    }

    // Check if job was cancelled
    if (verificationJob.status === 'CANCELLED') {
      console.log(`⏹️ Job ${jobId} was cancelled, skipping batch`);
      return { success: false, reason: 'Job cancelled' };
    }

    // Process each email in the batch
    const results = [];
    let processedCount = 0;
    let validCount = 0;
    let invalidCount = 0;
    let unknownCount = 0;
    let riskyCount = 0;

    for (const emailData of emails) {
      try {
        // Update progress
        job.progress(
          Math.round(((processedCount + 1) / emails.length) * 100)
        );

        // Verify email using enhanced 12-layer service
        const verificationResult = await Promise.race([
          enhancedVerificationService.verifyEmail(emailData.email),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Verification timeout')),
              VERIFICATION_TIMEOUT
            )
          ),
        ]) as Awaited<ReturnType<typeof enhancedVerificationService.verifyEmail>>;

        // Save result to database
        await prisma.verificationResult.create({
          data: {
            jobId,
            email: verificationResult.email,
            status: verificationResult.status,
            reason: verificationResult.reason || null,
            smtpValid: verificationResult.checks.smtpValid,
            smtpResponse: null,
            hasMxRecord: verificationResult.checks.mxValid,
            mxRecords: verificationResult.details.mxRecords?.join(', ') || null,
            isCatchAll: verificationResult.checks.isCatchAll,
            isDisposable: verificationResult.checks.isDisposable,
            isRoleAccount: verificationResult.checks.isRole,
          },
        });

        results.push(verificationResult);

        // Update counts
        processedCount++;
        switch (verificationResult.status) {
          case 'VALID':
            validCount++;
            break;
          case 'INVALID':
            invalidCount++;
            break;
          case 'UNKNOWN':
            unknownCount++;
            break;
          case 'RISKY':
            riskyCount++;
            break;
        }

        // Log progress every 10 emails
        if (processedCount % 10 === 0) {
          console.log(
            `   ✓ Processed ${processedCount}/${emails.length} emails in batch ${batchNumber}`
          );
        }
      } catch (error) {
        console.error(`   ❌ Error verifying ${emailData.email}:`, error);

        // Save as unknown/error
        await prisma.verificationResult.create({
          data: {
            jobId,
            email: emailData.email,
            status: 'UNKNOWN',
            reason: `Verification error: ${error}`,
            smtpValid: null,
            hasMxRecord: null,
            isCatchAll: null,
            isDisposable: false,
            isRoleAccount: false,
          },
        });

        unknownCount++;
        processedCount++;
      }
    }

    // Update job statistics in database
    const updatedJob = await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        processedEmails: {
          increment: processedCount,
        },
        validEmails: {
          increment: validCount,
        },
        invalidEmails: {
          increment: invalidCount,
        },
        unknownEmails: {
          increment: unknownCount + riskyCount,
        },
      },
    });

    // Emit real-time progress via Socket.IO (if available)
    emitSocketEvent('job-progress', {
      jobId,
      totalEmails: updatedJob.totalEmails,
      processedEmails: updatedJob.processedEmails,
      validEmails: updatedJob.validEmails,
      invalidEmails: updatedJob.invalidEmails,
      unknownEmails: updatedJob.unknownEmails,
      riskyEmails: riskyCount,
      percentage: Math.round(
        (updatedJob.processedEmails / updatedJob.totalEmails) * 100
      ),
      batchNumber,
      totalBatches,
    });

    console.log(
      `   ✅ Batch ${batchNumber}/${totalBatches} completed for job ${jobId}`
    );
    console.log(`      Valid: ${validCount}, Invalid: ${invalidCount}, Unknown: ${unknownCount}, Risky: ${riskyCount}`);

    // Check if this was the last batch
    if (updatedJob.processedEmails >= updatedJob.totalEmails) {
      await markJobAsCompleted(jobId);
    }

    // Deduct credits from user
    await prisma.user.update({
      where: { id: verificationJob.userId },
      data: {
        credits: {
          decrement: processedCount,
        },
      },
    });

    return {
      success: true,
      processed: processedCount,
      valid: validCount,
      invalid: invalidCount,
      unknown: unknownCount,
      risky: riskyCount,
    };
  } catch (error) {
    console.error(`❌ Error processing batch ${batchNumber} for job ${jobId}:`, error);

    // Update job status to FAILED
    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
      },
    });

    // Emit error via Socket.IO (if available)
    emitSocketEvent('job-error', {
      jobId,
      error: (error as Error).message,
    });

    throw error;
  }
});

/**
 * Mark job as completed
 */
async function markJobAsCompleted(jobId: string): Promise<void> {
  try {
    const completedJob = await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Calculate actual processing time
    const startTime = completedJob.startedAt?.getTime() || Date.now();
    const endTime = completedJob.completedAt?.getTime() || Date.now();
    const processingTimeMs = endTime - startTime;
    const processingTimeSeconds = Math.round(processingTimeMs / 1000);

    console.log(`\n🎉 Job ${jobId} completed successfully!`);
    console.log(`   Total: ${completedJob.totalEmails}`);
    console.log(`   Valid: ${completedJob.validEmails}`);
    console.log(`   Invalid: ${completedJob.invalidEmails}`);
    console.log(`   Unknown: ${completedJob.unknownEmails}`);
    console.log(`   ⏱️  Processing time: ${processingTimeSeconds}s`);

    // Emit completion via Socket.IO (if available)
    emitSocketEvent('job-completed', {
      jobId,
      totalEmails: completedJob.totalEmails,
      processedEmails: completedJob.processedEmails,
      validEmails: completedJob.validEmails,
      invalidEmails: completedJob.invalidEmails,
      unknownEmails: completedJob.unknownEmails,
      completedAt: completedJob.completedAt,
      startedAt: completedJob.startedAt,  // ← ADD THIS
      processingTimeMs,  // ← ADD THIS
      processingTimeSeconds,  // ← ADD THIS
    });
  } catch (error) {
    console.error(`Error marking job ${jobId} as completed:`, error);
  }
}

// Worker event handlers
verificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

verificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

verificationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled - will be retried`);
});

verificationQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📴 Shutting down worker gracefully...');

  await verificationQueue.close();

  console.log('✅ Worker shut down complete');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📴 Received SIGINT, shutting down worker...');

  await verificationQueue.close();

  console.log('✅ Worker shut down complete');
  process.exit(0);
});

console.log('🚀 Worker started and waiting for jobs...');
console.log('   Press Ctrl+C to stop\n');

export default verificationQueue;