import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  REDIS_USERNAME: process.env.REDIS_USERNAME || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  REDIS_TLS: process.env.REDIS_TLS === 'true',

  QUEUE_NAME: process.env.QUEUE_NAME || 'task-import-queue',
  WORKER_CONCURRENCY: Number(process.env.WORKER_CONCURRENCY || 3),
  BATCH_SIZE: Number(process.env.BATCH_SIZE || 20),
  JOB_ATTEMPTS: Number(process.env.JOB_ATTEMPTS || 3),
  JOB_BACKOFF_MS: Number(process.env.JOB_BACKOFF_MS || 1000),
  ENABLE_REALTIME: process.env.ENABLE_REALTIME === 'true',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  ENABLE_PM: process.env.ENABLE_PM === 'true',

};
