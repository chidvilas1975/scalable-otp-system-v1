import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateAccessToken = (user)=>{

    return jwt.sign(

        {
            id:user._id,
            email:user.email
        },

        env.JWT_ACCESS_SECRET,

        {
            expiresIn:
            env.JWT_ACCESS_EXPIRY
        }

    );

};



export const generateRefreshToken = (user)=>{

    return jwt.sign(

        {
            id:user._id
        },

        env.JWT_REFRESH_SECRET,

        {
            expiresIn:
            env.JWT_REFRESH_EXPIRY
        }

    );

};

export const verifyRefreshToken = (token)=>{

    return jwt.verify(

        token,

        env.JWT_REFRESH_SECRET

    );

};