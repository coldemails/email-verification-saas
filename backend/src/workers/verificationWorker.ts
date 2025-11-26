import verificationQueue from '../config/queue';
import prisma from '../utils/prisma';
import enhancedVerificationService from '../services/enhancedVerificationService';
import { getIO } from '../config/socket';
import { trackProxyUsage } from '../utils/proxyTracker';

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
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '50');
const VERIFICATION_TIMEOUT = parseInt(
  process.env.VERIFICATION_TIMEOUT_MS || '10000'
);

console.log(`🔧 Worker Configuration:`);
console.log(`   - Concurrency: ${CONCURRENCY}`);
console.log(`   - Timeout: ${VERIFICATION_TIMEOUT}ms`);

// Create persistent Redis clients for Socket.IO
const { createClient } = require('redis');
let redisPub: any = null;
let redisSub: any = null;

const initRedisClients = async () => {
  if (!redisPub) {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');

    redisPub = createClient({ socket: { host: redisHost, port: redisPort } });
    redisSub = redisPub.duplicate();

    await Promise.all([redisPub.connect(), redisSub.connect()]);
    console.log('✅ Redis clients initialized for Socket.IO');
  }
};

const emitSocketEvent = async (event: string, data: any) => {
  try {
    await initRedisClients();

    const { Server } = require('socket.io');
    const { createAdapter } = require('@socket.io/redis-adapter');

    const io = new Server();
    io.adapter(createAdapter(redisPub, redisSub));

    io.to(`job-${data.jobId}`).emit(event, data);
    
    console.log(`📡 Emitted ${event} via Redis adapter`);
  } catch (error) {
    console.log(`ℹ️  Could not emit via Socket.IO:`, error);
  }
};

/**
 * Main worker processor
 */
verificationQueue.process(CONCURRENCY, async (job) => {
  const { jobId, emails, batchNumber, totalBatches } = job.data as JobData;

  console.log(`\n🔄 Processing batch ${batchNumber}/${totalBatches} for job ${jobId}`);
  console.log(`   - Emails in batch: ${emails.length}`);

  try {
    const verificationJob = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: { user: true },
    });

    if (!verificationJob) throw new Error(`Job ${jobId} not found`);
    if (verificationJob.status === 'CANCELLED') {
      console.log(`⏹️ Job ${jobId} cancelled`);
      return { success: false, reason: 'Job cancelled' };
    }

    const results = [];
    let processedCount = 0;
    let validCount = 0;
    let invalidCount = 0;
    let unknownCount = 0;
    let riskyCount = 0;

    for (const emailData of emails) {
      try {
        // 🔥 PROXY USAGE TRACKING
        const proxyIP = process.env.DECODO_PROXY_HOST || '127.0.0.1';

        const canProceed = await trackProxyUsage(proxyIP);
        if (!canProceed) {
          console.warn(`🚫 IP quota exceeded for ${proxyIP}. Skipping verification.`);

          await prisma.verificationResult.create({
            data: {
              jobId,
              email: emailData.email,
              status: 'RISKY',
              reason: 'IP_RATE_LIMIT_EXCEEDED',
              smtpValid: null,
              hasMxRecord: null,
              isCatchAll: null,
              isDisposable: false,
              isRoleAccount: false,
            },
          });

          riskyCount++;
          processedCount++;
          continue;
        }

        // Update progress
        job.progress(
          Math.round(((processedCount + 1) / emails.length) * 100)
        );

        const verificationResult = await Promise.race([
          enhancedVerificationService.verifyEmail(emailData.email),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Verification timeout')), VERIFICATION_TIMEOUT)
          ),
        ]) as Awaited<ReturnType<typeof enhancedVerificationService.verifyEmail>>;

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
        processedCount++;

        switch (verificationResult.status) {
          case 'VALID': validCount++; break;
          case 'INVALID': invalidCount++; break;
          case 'UNKNOWN': unknownCount++; break;
          case 'RISKY': riskyCount++; break;
        }

        if (processedCount % 10 === 0) {
          console.log(`   ✓ Processed ${processedCount}/${emails.length}`);
        }

      } catch (error) {
        console.error(`   ❌ Error verifying ${emailData.email}:`, error);

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

    // UPDATE JOB STATS
    const updatedJob = await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        processedEmails: { increment: processedCount },
        validEmails: { increment: validCount },
        invalidEmails: { increment: invalidCount },
        unknownEmails: { increment: unknownCount + riskyCount },
      },
    });

    // Emit progress
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

    console.log(`   ✅ Batch ${batchNumber}/${totalBatches} completed`);

    if (updatedJob.processedEmails >= updatedJob.totalEmails) {
      await markJobAsCompleted(jobId);
    }

    await prisma.user.update({
      where: { id: verificationJob.userId },
      data: {
        credits: { decrement: processedCount },
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
    console.error(`❌ Error processing batch ${batchNumber}:`, error);

    await prisma.verificationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });

    emitSocketEvent('job-error', {
      jobId,
      error: (error as Error).message,
    });

    throw error;
  }
});

async function markJobAsCompleted(jobId: string): Promise<void> {
  try {
    const completedJob = await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    const startTime = completedJob.startedAt?.getTime() || Date.now();
    const endTime = completedJob.completedAt?.getTime() || Date.now();
    const processingTimeMs = endTime - startTime;

    console.log(`\n🎉 Job ${jobId} completed`);
    console.log(`   Total: ${completedJob.totalEmails}`);
    console.log(`   ⏱️  Time: ${Math.round(processingTimeMs / 1000)}s`);

    emitSocketEvent('job-completed', {
      jobId,
      totalEmails: completedJob.totalEmails,
      processedEmails: completedJob.processedEmails,
      validEmails: completedJob.validEmails,
      invalidEmails: completedJob.invalidEmails,
      unknownEmails: completedJob.unknownEmails,
      completedAt: completedJob.completedAt,
      startedAt: completedJob.startedAt,
      processingTimeMs,
      processingTimeSeconds: Math.round(processingTimeMs / 1000),
    });

    // 🆕 ADD THIS EMAIL NOTIFICATION CODE HERE:
    try {
      // Get user details with the job
      const jobWithUser = await prisma.verificationJob.findUnique({
        where: { id: jobId },
        include: {
          user: {
            select: { email: true, name: true }
          }
        }
      });

      if (jobWithUser?.user?.email) {
        const processingTimeSeconds = Math.round(processingTimeMs / 1000);
        const averageSpeed = processingTimeSeconds > 0 
          ? Math.round(completedJob.totalEmails / processingTimeSeconds) 
          : completedJob.totalEmails;

        // Import at top if not already: import emailService from '../services/emailService';
        const emailService = require('../services/emailService').default;
        
        await emailService.sendJobCompletionEmail(
          jobWithUser.user.email,
          jobWithUser.user.name || 'User',
          jobId,
          jobWithUser.fileName,
          completedJob.totalEmails,
          completedJob.validEmails || 0,
          completedJob.invalidEmails || 0,
          completedJob.unknownEmails || 0,
          processingTimeSeconds,
          averageSpeed
        );
        
        console.log(`✅ Job completion email sent to ${jobWithUser.user.email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send job completion email:', emailError);
      // Don't fail the job if email fails
    }

  } catch (error) {
    console.error(`Error completing job ${jobId}:`, error);
  }
}

verificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

verificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

verificationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

verificationQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

process.on('SIGTERM', async () => {
  console.log('\n📴 Shutting down...');

  await verificationQueue.close();

  if (redisPub) await redisPub.quit();
  if (redisSub) await redisSub.quit();

  console.log('✅ Worker shut down');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📴 SIGINT received...');

  await verificationQueue.close();

  if (redisPub) await redisPub.quit();
  if (redisSub) await redisSub.quit();

  console.log('✅ Worker shut down');
  process.exit(0);
});

console.log('🚀 Worker started\n');

export default verificationQueue;

// Warm up worker pool
(async () => {
  console.log('🔥 Warming up worker pool...');

  try {
    const dns = require('dns').promises;
    await Promise.all([
      dns.resolve('gmail.com', 'MX').catch(() => {}),
      dns.resolve('outlook.com', 'MX').catch(() => {}),
      dns.resolve('yahoo.com', 'MX').catch(() => {}),
      dns.resolve('hotmail.com', 'MX').catch(() => {}),
    ]);

    await initRedisClients();

    console.log('✅ Worker pool ready');
  } catch (error) {
    console.warn('⚠️ Worker warm-up warning:', error);
  }
})();
