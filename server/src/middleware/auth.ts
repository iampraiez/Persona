import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { logger } from "../utils/logger.utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.cookies || !req.cookies.access_token) {
      res.status(401).json({ error: "Unauthorized", data: null });
      return;
    }

    const token = req.cookies.access_token;

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({ error: "Token expired or invalid", data: null });
      return;
    }

    req.user = payload.email;
    next();
  } catch (error: unknown) {
    logger.error(`Auth Error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(401).json({ error: "Unauthorized", data: null });
  }
}
