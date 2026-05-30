const express = require("express");
const cors = require("cors");
const chatbotRoutes = require("./modules/chatbot/chatbot.routes");
const authRoutes = require("./modules/auth/auth.routes");
const intentRoutes = require("./modules/intents/intent.routes");
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

// Leads Module Routes
const leadRoutes = require("./modules/leads/lead.routes");
app.use("/api/leads", leadRoutes);

// Candidates Module Routes
const candidateRoutes = require("./modules/candidates/candidate.routes");
app.use("/api/candidates", candidateRoutes);

// Escalation Module Routes
const escalationRoutes = require("./modules/escalation/escalation.routes");
app.use("/api/escalations", escalationRoutes);

// Analytics Module Routes
const analyticsRoutes = require("./modules/analytics/analytics.routes");
app.use("/api/analytics", analyticsRoutes);

// Resume Module Routes
const resumeRoutes = require("./modules/resume/resume.routes");
app.use("/api/resume", resumeRoutes);

// Memory Module Routes
const memoryRoutes = require("./modules/memory/memory.routes");
app.use("/api/memory", memoryRoutes);

// Intent Module Routes
app.use("/api", intentRoutes);

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;


