import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.utils";

export const prisma: PrismaClient = new PrismaClient();

export function shutdown() {
  const shutdown = async (signal: string) => {
    try {
      await prisma.$disconnect();
      logger.info(`Prisma client disconnected on ${signal}`);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
