import { type Express, type Request, type Response } from "express";
import { logger } from "./logger.utils";
import { env } from "../config/env";

const isDevelopment = env.data?.NODE_ENV === "development";

export function errorHandler(app: Express) {
  app.use((err: Error, req: Request, res: Response, next: any) => {
    logger.error(`Error: ${err.message}`);
    const message = isDevelopment ? err.message : "An unexpected error occurred";
    res.status(500).json({
      data: null,
      error: message,
    });
  });
}

export function errorWrapper(error: unknown, prod: string) {
  if (isDevelopment) {
    return error;
  } else return prod;
}
