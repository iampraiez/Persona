import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { logger } from "../utils/logger.utils";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({ error: "Unauthorized", data: null });
      return;
    }

    // handle expired token
    const payload = verifyToken(token);

    if (!payload) {
      res.clearCookie("access_token");
      res.status(401).json({ error: "Invalid token", data: null });
      return;
    }

    req.user = payload.email;
    next();
  } catch (error: any) {
    logger.error(`Auth Error: ${error.message}`);
    res.clearCookie("access_token");
    res.status(401).json({ error: "Unauthorized", data: null });
  }
}
