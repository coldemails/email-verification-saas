import Redis from 'ioredis';
import Queue from 'bull';
import logger from '../utils/logger';

// Redis client for general use
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

// Bull queue for email verification jobs
export const emailVerificationQueue = new Queue('email-verification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Queue event listeners
emailVerificationQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

emailVerificationQueue.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

emailVerificationQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

export default { redisClient, emailVerificationQueue };
