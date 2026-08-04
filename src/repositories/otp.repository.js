import { redisClient } from "../config/redis.js";

class OTPRepository {

    async save(email, otpHash, ttl) {

        const result = await redisClient.set(

            `otp:${email}`,

            otpHash,

            {
                NX: true,
                EX: ttl
            }

        );

        return result === "OK";

    }

    async get(email) {

        return await redisClient.get(

            `otp:${email}`

        );

    }

    async delete(email) {

        await redisClient.del(

            `otp:${email}`

        );

    }

    async hasCooldown(email) {

        const value = await redisClient.get(
            `otp-cooldown:${email}`
        );

        return !!value;

    }

    async setCooldown(email) {

        await redisClient.set(

            `otp-cooldown:${email}`,

            "1",

            {
                EX:60
            }

        );

    }

    async checkRequestLimit(email) {

        const key = `otp-request-limit:${email}`;

        const count = await redisClient.get(key);


        if (!count) {

            await redisClient.set(
                key,
                1,
                {
                    EX: 3600
                }
            );

            return true;
        }


        if (Number(count) >= 5) {

            return false;

        }


        await redisClient.incr(key);

        return true;

    }

    async increaseAttempt(email) {

        const key = `otp-attempt:${email}`;


        const attempts = await redisClient.incr(key);


        // Set expiry only first time
        if (attempts === 1) {

            await redisClient.expire(
                key,
                300
            );

        }

        return attempts;

    }

    async getAttempts(email) {

        const attempts = await redisClient.get(
            `otp-attempt:${email}`
        );


        return Number(attempts || 0);

    }

    async clearAttempts(email) {

        await redisClient.del(
            `otp-attempt:${email}`
        );

    }

}

export default new OTPRepository();