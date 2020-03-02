import Redis from 'ioredis';

class Cache {
  constructor() {
    this.prefix = 'cache:';

    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: this.prefix,
    });
  }

  set(key, value) {
    const timeToExpireCache = 60 * 60 * 24;
    this.redis.set(key, JSON.stringify(value), 'EX', timeToExpireCache);
  }

  async get(key) {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    const keys = await this.redis.keys(`${this.prefix}:${prefix}:*`);

    const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));

    this.redis.del(keysWithoutPrefix);
  }
}

export default new Cache();
