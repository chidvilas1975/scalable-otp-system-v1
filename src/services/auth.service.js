import bcrypt from "bcrypt";

import userRepository from "../repositories/user.repository.js";
import otpRepository from "../repositories/otp.repository.js";

import { generateOtp } from "../helpers/otp.helper.js";

import { OTP } from "../constants/otp.constants.js";
import emailQueue from "../queues/email.queue.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

class AuthService {

    async sendOtp(email) {

        const allowed = await otpRepository.checkRequestLimit(email);

        if(!allowed){

            throw new ApiError(
                429,
                "Too many OTP requests. Try again later."
            );

        }

        const user = await userRepository.findByEmail(email);

        const hasCooldown = await otpRepository.hasCooldown(email);

        if(hasCooldown){

            throw new ApiError(429, "Please wait before requesting a new OTP");

        }

        const otp = generateOtp(OTP.LENGTH);

        const otpHash = await bcrypt.hash(otp, 10);

        const saved = await otpRepository.save(

            email,

            otpHash,

            OTP.EXPIRY_SECONDS

        );

        if(!saved){

            throw new ApiError(
                429,
                "OTP already requested. Please wait."
            );

        }

        await otpRepository.setCooldown(email);

        const job = await emailQueue.add(
            "send-otp",
            {
                email,
                otp
            },
            {
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 1000
                },
                removeOnComplete: true,
                removeOnFail: true
            }
        );

        logger.info(
            {
                jobId: job.id,
            },
            "OTP email job added to queue"
        )

        return {

            userExists: !!user,

            message: "OTP generated"

        };

    }

    async verifyOtp(email,otp){
      const storedHash = await otpRepository.get(email);

      if (!storedHash) {
        throw new ApiError(401, "OTP expired");
      }

      const isValid = await bcrypt.compare(otp, storedHash);

        if(!isValid){

            const attempts =
            await otpRepository.increaseAttempt(
                email
            );

            if(attempts >= 5){


                await otpRepository.delete(
                    email
                );


                await otpRepository.clearAttempts(
                    email
                );


                throw new ApiError(
                    429,
                    "Too many failed attempts. Request a new OTP."
                );

            }

            throw new ApiError(
                401,
                `Invalid OTP. Attempts left: ${5 - attempts}`
            );

        }

      await otpRepository.delete(email);

      let user = await userRepository.findByEmail(email);

      if (!user) {
        user = await userRepository.create({
          email,

          isVerified: true,
        });
      }

      const accessToken = generateAccessToken(user);


        const refreshToken = generateRefreshToken(user);



        await userRepository.updateRefreshToken(

            user._id,

            refreshToken

        );



        return {

            user,

            accessToken,

            refreshToken

        };
    }

    async refreshAccessToken(refreshToken){
      const decoded = verifyRefreshToken(refreshToken);

      const user = await userRepository.findById(decoded.id);

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const accessToken = generateAccessToken(user);

      return {
        accessToken,
      };
    }

    async logout(refreshToken) {

        if (!refreshToken) {
            throw new ApiError(401, "Refresh token missing");
        }

        const decoded = verifyRefreshToken(refreshToken);

        await userRepository.clearRefreshToken(decoded.id);

    }

}

export default new AuthService();