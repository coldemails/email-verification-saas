import Bull from 'bull';
import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis clients for Bull
const createRedisClient = () => new Redis(redisConfig);

// Create verification queue
export const verificationQueue = new Bull('email-verification', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

// Queue event listeners for monitoring
verificationQueue.on('error', (error) => {
  console.error('❌ Queue Error:', error);
});

verificationQueue.on('waiting', (jobId) => {
  console.log(`⏳ Job ${jobId} is waiting`);
});

verificationQueue.on('active', (job) => {
  console.log(`🔄 Job ${job.id} started processing`);
});

verificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

verificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

verificationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 Closing queue connections...');
  await verificationQueue.close();
  process.exit(0);
});

export default verificationQueue;
