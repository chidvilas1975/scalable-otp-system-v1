import { z } from "zod";

export const sendOtpSchema = z.object({

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

});

export const verifyOtpSchema = z.object({

    email: z
        .email("Invalid email")
        .trim()
        .toLowerCase(),


    otp: z
        .string()
        .length(6, "OTP must be 6 digits")

});