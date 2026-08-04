import logger from "../config/logger.js";


const requestLogger = (req, res, next)=>{

    const start = Date.now();

    res.on("finish", () => {

        const duration = Date.now() - start;

        logger.info("HTTP Request", {

            requestId: req.requestId,

            method: req.method,

            url: req.originalUrl,

            status: res.statusCode,

            durationMs: duration,

            ip: req.ip,

            userAgent: req.get("user-agent")

        });

    });

    next();

};


export default requestLogger;