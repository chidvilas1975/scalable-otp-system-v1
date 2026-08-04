import express from "express";
import { testRedis } from "../controllers/redis.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/redis/test:
 *   get:
 *     summary: Verify Redis connectivity
 *     tags:
 *       - Redis
 *     responses:
 *       200:
 *         description: Redis connection test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Redis test failed
 */
router.get("/test", testRedis);

export default router;