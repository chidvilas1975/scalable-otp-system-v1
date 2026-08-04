import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import {redisClient} from "../config/redis.js";


const globalRateLimiter = rateLimit({

    windowMs:15 * 60 * 1000,

    max:500,

    standardHeaders:true,

    legacyHeaders:false,

    store:new RedisStore({
        sendCommand:(...args)=>redisClient.sendCommand(args)
    }),

    message:{
        success:false,
        message:
        "Rate Limited Hitted. Too many requests. Try again later."
    }

});


export default globalRateLimiter;