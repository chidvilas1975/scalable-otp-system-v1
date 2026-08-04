import connectDatabase from "./config/database.js";
import {connectRedis} from "./config/redis.js";
import env from "./config/env.js";
import logger from "./config/logger.js";

const startServer = async () => {
    await connectDatabase();
    await connectRedis();

    const { default: app } = await import("./app.js");

    const server = app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    });

    process.on("SIGINT", async () => {

        logger.info("Gracefully shutting down...");

        server.close(() => {
            process.exit(0);
        });

    });
};

startServer();