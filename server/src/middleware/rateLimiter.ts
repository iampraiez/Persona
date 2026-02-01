
import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger.utils";

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    error: "Too many AI requests from this IP, please try again after an hour",
    data: null,
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const eventWriteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: {
    error: "Too many event operations, please slow down",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
