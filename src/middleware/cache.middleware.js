import redis from '../config/redis.js';

export const cacheTasks = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const key = `tasks:${userId}:${JSON.stringify(req.query)}`;
    const cached = await redis.get(key);
    if (cached) {
      console.log('from cache');
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.set(key, JSON.stringify(body), 'EX', 60);
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error('Cache error:', err);
    next();
  }
};

export const invalidateTasksCache = async () => {
  try {
    await redis.flushall();
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
};
