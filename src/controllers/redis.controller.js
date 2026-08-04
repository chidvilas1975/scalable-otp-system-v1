import { redisClient } from "../config/redis.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const testRedis = asyncHandler(async (req, res) => {

    await redisClient.set("health", "ok", {
        EX: 60
    });

    const value = await redisClient.get("health");

    res.json(
        new ApiResponse(
            200,
            "Redis working",
            {
                value
            }
        )
    );

});