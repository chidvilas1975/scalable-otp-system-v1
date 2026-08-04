import { createClient } from "redis";
import env from "./env.js";
import logger from "./logger.js";

const redisClient = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT)
    }
});

redisClient.on("connect", () => {
    logger.info("Redis connected");
});

redisClient.on("error", (err) => {
    logger.error(`Redis Error: ${err.message}`);
});

const connectRedis = async () => {
    await redisClient.connect();
};

export { redisClient, connectRedis };