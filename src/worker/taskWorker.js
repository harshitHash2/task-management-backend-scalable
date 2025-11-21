import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import {config} from '../config/config.js';
import { sendNotification } from '../services/notification.service.js';


const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null,

};

const connection = new IORedis(connectionOptions);


// function chunkArray(arr, size){
//   const out = [];
//   for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
//   return out;
// }


export function startWorker() {
  try {
    const worker = new Worker(
      config.QUEUE_NAME,
      async job => {
        try {
          const { userId, email, type, payload } = job.data;

          
          if (!userId || !email || !type) {
            throw new Error('Invalid job payload');
          }

         
          const result = await sendNotification({ userId, email, type, payload });

          
          if (global.io) {
            global.io.emit('email_sent', {
              jobId: job.id,
              userId,
              type,
              payload,
            });
          }

          return {
            status: 'success',
            jobId: job.id,
            result,
          };
        } catch (err) {
          console.error('Job failed:', err.message);
          throw err; 
        }
      },
      {
        connection,
        concurrency: Number(config.WORKER_CONCURRENCY) || 5,
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400, count: 500 },
        limiter: config.WORKER_RATE_LIMIT
          ? {
              max: config.WORKER_RATE_LIMIT,
              duration: 1000,
            }
          : undefined,
      }
    );

    // events worker
    worker.on('completed', job => {
      console.log('Worker completed the job');
    });

    worker.on('failed', (job, err) => {
      console.error('Worker failed the job',err.message);
    });

    worker.on('error', err => {
      console.error('Worker error:', err);
    });

    console.log(
      'Worker started '
    );

    return worker;
  } catch (err) {
    console.error('Failed to start the worker', err);
    throw err;
  }
}
if (config.ENABLE_PM) {
  console.log('Starting worker from worker process');
     startWorker()
}