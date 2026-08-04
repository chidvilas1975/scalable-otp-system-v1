import dotenv from "dotenv";
import { z } from "zod";


dotenv.config();


const envSchema = z.object({

    PORT: z.string(),

    MONGODB_URI: z.string(),

    REDIS_HOST: z.string(),

    REDIS_PORT: z.string(),

    JWT_ACCESS_SECRET: z.string(),

    JWT_REFRESH_SECRET: z.string(),

    JWT_ACCESS_EXPIRY: z.string(),

    JWT_REFRESH_EXPIRY: z.string(),

    EMAIL_USER: z.string(),

    EMAIL_PASSWORD: z.string()

});

const env = envSchema.parse(process.env);

export default env;