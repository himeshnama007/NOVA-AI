import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  }
});

redis.on("connect", () => {
  console.log("✅ Redis Connected on", redisUrl);
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

export default redis;