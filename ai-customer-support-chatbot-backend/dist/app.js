"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const chatbot_routes_1 = __importDefault(require("./modules/chatbot/chatbot.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Standard Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check Endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server Running Successfully",
    });
});
// Chatbot Module Routes
app.use("/api/chatbot", chatbot_routes_1.default);
// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
