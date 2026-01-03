"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const goals_1 = __importDefault(require("./routes/goals"));
const ai_1 = __importDefault(require("./routes/ai"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const notification_1 = __importDefault(require("./routes/notification"));
const logger_utils_1 = require("./utils/logger.utils");
const prisma_1 = require("./lib/prisma");
const error_util_1 = require("./utils/error.util");
const scheduler_1 = require("./scheduler");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
(0, scheduler_1.startScheduler)();
const CLIENT = env_1.env.data?.CLIENT_URL || "http://localhost:5173";
const corsOptions = {
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            CLIENT,
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use("/api/auth", auth_2.default);
app.use("/api/users", auth_1.authMiddleware, users_1.default);
app.use("/api/events", auth_1.authMiddleware, events_1.default);
app.use("/api/goals", auth_1.authMiddleware, goals_1.default);
app.use("/api/ai", auth_1.authMiddleware, ai_1.default);
app.use("/api/analytics", auth_1.authMiddleware, analytics_1.default);
app.use("/api/notification", auth_1.authMiddleware, notification_1.default);
app.get("/api/health", (req, res) => {
    res.status(200).json({
        date: new Date().toISOString(),
        data: {
            ip: req.ip,
            host: req.hostname,
        },
    });
});
(0, error_util_1.errorHandler)(app);
(0, prisma_1.shutdown)();
const port = Number(env_1.env.data?.PORT) || 3000;
app.listen(port, (err) => {
    if (err) {
        logger_utils_1.logger.error(`Error starting server: ${err}`);
        process.exit(1);
    }
    logger_utils_1.logger.info(`Server running on port ${port}`);
});
