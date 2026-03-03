import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { logger } from "../utils/logger.utils";

const FRONTEND_URL = env.data?.CLIENT_URL || "http://localhost:5173";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later",
    data: null,
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 mins
  message: {
    error: "Too many login attempts, please try again after 15 minutes",
    data: null,
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Auth Rate limit exceeded for IP: ${req.ip}`);

    // Only redirect if it's a browser navigation request
    const isNavigation = req.headers["sec-fetch-mode"] === "navigate";
    if (isNavigation && req.method === "GET") {
      return res.redirect(`${FRONTEND_URL}/login?error=rate_limit`);
    }

    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many AI requests from this IP, please try again after an hour",
    data: null,
  },
  handler: (req, res, _next, options) => {
    logger.warn(`AI Rate limit exceeded for IP: ${req.ip}`);
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
