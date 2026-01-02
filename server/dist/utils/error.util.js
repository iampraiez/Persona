"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.errorWrapper = errorWrapper;
const logger_utils_1 = require("./logger.utils");
const env_1 = require("../config/env");
const isDevelopment = env_1.env.data?.NODE_ENV === "development";
function errorHandler(app) {
    app.use((err, req, res, next) => {
        logger_utils_1.logger.error(`Error: ${err.message}`);
        res.status(500).json({
            message: "An error occurred",
            error: isDevelopment ? err : null,
        });
    });
}
function errorWrapper(error, prod) {
    if (isDevelopment) {
        return error;
    }
    else
        return prod;
}
