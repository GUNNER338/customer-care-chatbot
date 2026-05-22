import express from "express";
import cors from "cors";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
import { errorHandler } from "./middleware/errorHandler";

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

// Chatbot Module Routes
app.use("/api/chatbot", chatbotRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;