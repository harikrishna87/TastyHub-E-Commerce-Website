import { rateLimit } from "express-rate-limit";
import MongoDBStore from "@iroomit/rate-limit-mongodb";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

let redisClient: any = undefined;
if (process.env.REDIS_URL) {
  console.log("ℹ️ Rate limiting: Initializing Redis client...");
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch((err: any) => {
    console.error("❌ Redis connection error in rate limiter store:", err);
  });
}

const createStore = (prefix: string) => {
  if (redisClient) {
    return new RedisStore({
      prefix: prefix + ":",
      sendCommand: async (...args: string[]) => {
        return redisClient.sendCommand(args);
      },
    });
  } else if (process.env.MONGO_URI) {
    console.log(`ℹ️ Rate limiting: Initializing MongoDB store with prefix "${prefix}"...`);
    return new MongoDBStore({
      uri: process.env.MONGO_URI,
      collectionName: "rate_limits",
      createTtlIndex: true,
      prefix: prefix + "-",
      authSource: "admin",
    });
  } else {
    return undefined; // Falls back to default memory store
  }
};

// General API requests limiter (e.g. browsing, adding to cart, fetching products)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 200 : 2000, // Increase limit in development to support live dashboard polling
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createStore("api"),
});

// Strict rate limiter for sensitive routes (e.g. login, register, password reset, OTP requests)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per 15 minutes
  message: {
    success: false,
    message: "Too many authentication or OTP requests. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("auth"),
});
