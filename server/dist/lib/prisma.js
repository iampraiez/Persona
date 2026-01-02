"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.shutdown = shutdown;
const client_1 = require("@prisma/client");
const logger_utils_1 = require("../utils/logger.utils");
exports.prisma = new client_1.PrismaClient();
function shutdown() {
    const shutdown = async (signal) => {
        try {
            await exports.prisma.$disconnect();
            logger_utils_1.logger.info(`Prisma client disconnected on ${signal}`);
        }
        finally {
            process.exit(0);
        }
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
