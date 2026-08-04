import jwt from "jsonwebtoken";
import env from "./env.js";

export const generateAccessToken = (payload)=>{

    return jwt.sign(

        payload,

        env.JWT_ACCESS_SECRET,

        {
            expiresIn:
            env.JWT_ACCESS_EXPIRY
        }

    );

};



export const generateRefreshToken = (payload)=>{

    return jwt.sign(

        payload,

        env.JWT_REFRESH_SECRET,

        {
            expiresIn:
            env.JWT_REFRESH_EXPIRY
        }

    );

};