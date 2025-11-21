import Redis from 'ioredis';
import { config } from './config.js';
import IORedis from 'ioredis';

// const redis = new Redis(config.redisUrl);

const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
};

if (config.REDIS_USERNAME) connectionOptions.username = config.REDIS_USERNAME;
if (config.REDIS_PASSWORD) connectionOptions.password = config.REDIS_PASSWORD;
if (config.REDIS_TLS) connectionOptions.tls = {}; // enables TLS/SSL

const redis = new IORedis(connectionOptions);

redis.on('connect', () => console.log('Redis Connected'));
redis.on('error', (err) => console.error('Redis error', err));

export default redis;
