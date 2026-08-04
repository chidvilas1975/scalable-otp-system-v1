import env from "./env.js";

export const bullConnection = {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT)
};