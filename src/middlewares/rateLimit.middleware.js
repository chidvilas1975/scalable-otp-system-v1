import rateLimit from "express-rate-limit";


const apiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 100,

    message: {

        success:false,

        message: "Too many requests. Try again later."

    },


    standardHeaders:true,

    legacyHeaders:false

});


export default apiLimiter;