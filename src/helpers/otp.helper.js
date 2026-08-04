import crypto from "node:crypto";

export const generateOtp = (length = 6) => {

    return crypto.randomInt(100000, 1000000).toString();

};