const Redis = require('ioredis');

const ENV = require('../config/env');
const config = require('../config/index');

module.exports = new Redis(ENV.REDIS_URL || config.redis);
