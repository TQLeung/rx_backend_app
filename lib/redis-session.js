const redis = require('./ioredis');
const logger = require('./logger').label('lib:redis-session');

class Store {
  constructor() {

  }

  static instance(...args) {
    return new Store(...args);
  }

  async get(key) {
    const result = await redis.get(key);
    return JSON.parse(result);
  }

  async set(key, value, maxAge) {
    await redis.set(key, JSON.stringify(value));
    await redis.expire(key, maxAge / 1000);
  }

  async destroy(key) {
    await redis.del(key);
  }
}

module.exports = Store;
