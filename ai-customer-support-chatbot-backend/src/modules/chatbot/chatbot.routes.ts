import { Router } from "express";
import { ChatbotController } from "./chatbot.controller";

const router = Router();
const controller = new ChatbotController();

// Create a new conversation
router.post("/conversations", controller.createConversation);

// Create / store a message under a conversation
router.post("/messages", controller.createMessage);

// Retrieve all messages for a specific conversation
router.get("/conversations/:id/messages", controller.getMessages);

// Retrieve details of a conversation (including aggregated message count)
router.get("/conversations/:id", controller.getConversation);

// Unified chat endpoint for managing conversations
router.post("/chat", controller.chat);

export default router;
