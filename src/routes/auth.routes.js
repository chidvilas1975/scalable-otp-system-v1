import express from "express";

import { sendOtp, verifyOtp, refreshToken, logout } from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";

import { sendOtpSchema, verifyOtpSchema } from "../validations/auth.validation.js";
import otpRateLimiter from "../middlewares/otpRateLimit.middleware.js";


const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/send-otp:
 *   post:
 *     summary: Send OTP to a user's email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email or bad request
 *       429:
 *         description: Too many requests
 */
router.post(

    "/send-otp",

    otpRateLimiter,

    validate(sendOtpSchema),

    sendOtp

);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify an OTP code
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or missing fields
 */
router.post(

    "/verify-otp",

    validate(verifyOtpSchema),

    verifyOtp

);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh the current authentication token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized request
 */
router.post(

    "/refresh-token",

    refreshToken

);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized request
 */
router.post(
    "/logout",
    logout
);

export default router;