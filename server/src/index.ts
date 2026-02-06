import express, { type Request, type Response, type Express } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { authMiddleware } from "./middleware/auth";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import eventRoutes from "./routes/events";
import goalRoutes from "./routes/goals";
import aiRoutes from "./routes/ai";
import analyticsRoutes from "./routes/analytics";
import subRoute from "./routes/notification";
import paymentsRoute from "./routes/payments";
import feedbackRoutes from "./routes/feedback";
import { logger } from "./utils/logger.utils";
import { shutdown } from "./lib/prisma";
import { errorHandler } from "./utils/error.util";
import { startScheduler } from "./scheduler";
import { env } from "./config/env";
import { aiRateLimiter, eventWriteRateLimiter } from "./middleware/rateLimiter";

const app: Express = express();
app.set('trust proxy', 1); 

startScheduler();
const CLIENT: string = env.data?.CLIENT_URL || "http://localhost:5173";
const corsOptions =  {
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        CLIENT,
        "http://localhost:5173",
        "https://timeforge-persona.vercel.app",
      ];

       const isAllowed = allowedOrigins.some((allowedOrigin) =>
         origin.startsWith(allowedOrigin),
       );

       if (isAllowed) {
         callback(null, true);
       } else {
         callback(new Error(`CORS: ${origin} not allowed`));
       }
    },
    credentials: true,
  }

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// Standard Middleware
app.use(express.json());  
app.use(cookieParser());
app.use(cors(corsOptions));
 
// ... Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, eventWriteRateLimiter, userRoutes); 
app.use("/api/events", authMiddleware, eventWriteRateLimiter, eventRoutes); 
app.use("/api/goals", authMiddleware, eventWriteRateLimiter, goalRoutes); 
app.use("/api/ai", authMiddleware, aiRateLimiter, aiRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/notification", authMiddleware, eventWriteRateLimiter, subRoute);
app.use("/api/payments", authMiddleware, paymentsRoute);
app.use("/api/feedback", authMiddleware, eventWriteRateLimiter, feedbackRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    date: new Date().toISOString(),
    data: {
      ip: req.ip,
      host: req.hostname,
    },
  });
});

errorHandler(app);
shutdown();

const port: Number = Number(env.data?.PORT) || 3000;
app.listen(port, (err?: Error | null) => {
  if (err) {
    logger.error(`Error starting server: ${err}`);
    process.exit(1);
  }
  logger.info(`Server running on port ${port}`);
});
