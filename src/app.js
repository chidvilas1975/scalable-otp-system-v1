import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";
import redisRouter from "./routes/redis.router.js";
import authRoutes from "./routes/auth.routes.js";

import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import globalRateLimiter from "./middlewares/globalRateLimit.middleware.js";
import otpRateLimiter from "./middlewares/otpRateLimit.middleware.js";
import env from "./config/env.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import requestIdMiddleware from "./middlewares/requestId.middleware.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));

app.use(compression());

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);

app.use(globalRateLimiter);

app.use(cookieParser());

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/redis", redisRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use(notFound);

app.use(errorHandler);

export default app;