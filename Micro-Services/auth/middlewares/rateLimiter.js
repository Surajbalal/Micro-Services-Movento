const redis = require("../config/redis");

const createRateLimiter = ({
  windowSize = 60 * 1000,
  maxRequest = 5,
  prefix = "rate",
  type = "ip",
}) => {
  return async (req, res, next) => {
    try {
      let id;

      if (type == "ip") {
        id = req.ip;
      } else if (type == "email") {
        id = req.body?.email;
      } else if (type == "ip-email") {
        id = `${req.ip}:${req.body?.email}`;
      } else if (type == "user-id") {
        id = req.user?._id;
      }

      if(!id){
        return next();
      }

      const key = `${prefix}:${id}`;
      const now = Date.now();

      await redis.zadd(key, now, now);
      await redis.zremrangebyscore(key, 0, now - windowSize);

      const count = await redis.zcard(key);
      await redis.expire(key, Math.ceil(windowSize / 1000));

      if (count > maxRequest) {
        return res.status(429).json({ message: "Too many requests" });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};

module.exports = createRateLimiter;