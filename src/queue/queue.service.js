import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import {config}  from '../config/config.js';
console.log(config)
// const connection = new IORedis({ host: config.REDIS_HOST, port: config.REDIS_PORT });

const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
};

if (config.REDIS_USERNAME) connectionOptions.username = config.REDIS_USERNAME;
if (config.REDIS_PASSWORD) connectionOptions.password = config.REDIS_PASSWORD;
if (config.REDIS_TLS) connectionOptions.tls = {}; // enables TLS/SSL

const connection = new IORedis(connectionOptions);


export const jobQueue = new Queue(config.QUEUE_NAME, { connection });

export async function enqueueTask(data){
  console.log('queued data');
  return jobQueue.add('import-task', data, {
    attempts: config.JOB_ATTEMPTS,
    backoff: { type: 'exponential', delay: config.JOB_BACKOFF_MS },
    removeOnComplete: true
  });
}
