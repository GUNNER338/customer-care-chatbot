const express = require("express");
const cors = require("cors");
const chatbotRoutes = require("./modules/chatbot/chatbot.routes");
const authRoutes = require("./modules/auth/auth.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Running Successfully",
  });
});

// Auth Module Routes
app.use("/api/auth", authRoutes);

// Chatbot Module Routes
app.use("/api/chatbot", chatbotRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;

