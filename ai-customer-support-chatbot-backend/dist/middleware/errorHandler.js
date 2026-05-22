"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
/**
 * Centralized error handler middleware.
 * Catches all errors thrown in routes, controllers, or services, and formats the response.
 */
const errorHandler = (error, _req, res, _next) => {
    console.error("Error encountered:", error);
    // Handle Zod Schema Validation errors
    if (error instanceof zod_1.ZodError) {
        const errorDetails = error.issues
            .map((issue) => `"${issue.path.join(".")}" ${issue.message.toLowerCase()}`)
            .join("; ");
        res.status(400).json({
            success: false,
            message: `Validation Error: ${errorDetails}`,
        });
        return;
    }
    // Handle default runtime/internal server errors
    res.status(500).json({
        success: false,
        message: error.message || "An unexpected internal server error occurred.",
    });
};
exports.errorHandler = errorHandler;
