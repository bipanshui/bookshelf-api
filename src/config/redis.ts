import "dotenv/config";
import Redis from "ioredis";
import { logger } from "./logger";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

redis.on("connect", () => {
  logger.info("Redis connection established", { host: redisHost, port: redisPort });
});

redis.on("ready", () => {
  logger.info("Redis client ready");
});

redis.on("error", (error) => {
  logger.error("Redis error", { error });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

export const connectRedis = async (): Promise<void> => {
  if (redis.status === "connecting" || redis.status === "ready") {
    return;
  }

  try {
    await redis.connect();
  } catch (error) {
    logger.warn("Redis unavailable, continuing without cache", { error });
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis.status === "end") {
    return;
  }

  await redis.quit();
  logger.info("Redis disconnected");
};
