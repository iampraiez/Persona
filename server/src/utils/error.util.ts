import { type Express, type Request, type Response } from "express";
import { logger } from "./logger.utils";

const isDevelopment = process.env.NODE_ENV === "development";

export function errorHandler(app: Express) {
  app.use((err: Error, req: Request, res: Response, next: any) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({
      message: "An error occurred",
      error: isDevelopment ? err : null,
    });
  });
}

export function errorWrapper(error: unknown, prod: string) {
  if (isDevelopment) {
    return error;
  } else return prod;
}
