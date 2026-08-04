import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import {redisClient} from "../config/redis.js";

const otpRateLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 500,

    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (req) => {

        const email = req.body.email;

        const ip = req.ip;

        return `${email}:${ip}`;

    },

    store: new RedisStore({

        prefix: "otp-rate:",

        sendCommand:(...args)=>redisClient.sendCommand(args)

    }),

    message: {
        success: false,
        message:
            "Too many OTP requests. Please try again after 15 minutes."
    }

});

export default otpRateLimiter;