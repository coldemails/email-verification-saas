import verificationQueue from '../config/queue';
import prisma from '../utils/prisma';
import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

interface EmailData {
  email: string;
  originalRow?: any;
}

export const startVerification = async (
  jobId: string,
  filePath: string,
  selectedColumn: string
): Promise<void> => {
  try {
    console.log(`🚀 Starting verification for job ${jobId}`);
    console.log(`📂 File path: ${filePath}`);
    console.log(`📋 Column: ${selectedColumn}`);

    // Read emails from CSV
    const emails: EmailData[] = [];
    const selectedColumnLower = selectedColumn.trim().toLowerCase();

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Normalize row keys to lowercase
          const normalizedRow: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          }

          const emailValue = normalizedRow[selectedColumnLower];

          if (emailValue && emailValue.trim()) {
            const trimmedEmail = emailValue.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(trimmedEmail)) {
              emails.push({
                email: trimmedEmail,
                originalRow: row,
              });
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📧 Extracted ${emails.length} valid emails`);

    if (emails.length === 0) {
      throw new Error('No valid emails found in CSV');
    }

    // Update job status to PROCESSING
    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        totalEmails: emails.length,
      },
    });

    // Add job to Bull queue with batching for better performance
    const batchSize = 100; // Process 100 emails per batch
    const batches = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      batches.push(batch);
    }

    // Add each batch as a separate job to the queue
    for (let i = 0; i < batches.length; i++) {
      await verificationQueue.add(
        {
          jobId,
          emails: batches[i],
          batchNumber: i + 1,
          totalBatches: batches.length,
        },
        {
          priority: 1, // Higher priority for paid users can be added later
          attempts: 3,
        }
      );
    }

    console.log(
      `✅ Job ${jobId} added to queue with ${batches.length} batches`
    );
  } catch (error) {
    console.error(`❌ Error starting verification for job ${jobId}:`, error);

    // Update job status to FAILED
    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
      },
    });

    throw error;
  }
};

// Get job statistics
export const getJobStats = async (jobId: string) => {
  try {
    const job = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: {
        results: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const stats = {
      total: job.totalEmails,
      processed: job.processedEmails,
      valid: job.validEmails,
      invalid: job.invalidEmails,
      unknown: job.unknownEmails,
      risky: job.results.filter((r) => r.status === 'RISKY').length,
      percentage: job.totalEmails > 0 
        ? Math.round((job.processedEmails / job.totalEmails) * 100) 
        : 0,
    };

    return stats;
  } catch (error) {
    console.error(`Error getting stats for job ${jobId}:`, error);
    throw error;
  }
};

// Cancel a running job
export const cancelJob = async (jobId: string): Promise<void> => {
  try {
    // Get all jobs in queue for this verification job
    const jobs = await verificationQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);

    // Remove jobs related to this verification job
    for (const job of jobs) {
      if (job.data.jobId === jobId) {
        await job.remove();
      }
    }

    // Update database
    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log(`🛑 Job ${jobId} cancelled successfully`);
  } catch (error) {
    console.error(`Error cancelling job ${jobId}:`, error);
    throw error;
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      verificationQueue.getWaitingCount(),
      verificationQueue.getActiveCount(),
      verificationQueue.getCompletedCount(),
      verificationQueue.getFailedCount(),
      verificationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    throw error;
  }
};

export default {
  startVerification,
  getJobStats,
  cancelJob,
  getQueueStats,
};
