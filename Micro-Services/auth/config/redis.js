const Redis = require('ioredis');
const config = require('./config');

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
       return Math.min(times * 50, 2000);
    }
})
redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redis;
