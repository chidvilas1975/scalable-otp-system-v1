import { ZodError } from "zod";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {

    if(process.env.NODE_ENV === "development"){

        logger.error({
            message: err.message,
            stack: err.stack
        });
    }

    if (err instanceof ZodError) {

        return res.status(400).json({

            success: false,

            message: err.issues[0].message

        });

    }

    return res.status(err.statusCode || 500).json({

        success: false,

        message: err.message || "Internal Server Error"

    });

};

export default errorHandler;