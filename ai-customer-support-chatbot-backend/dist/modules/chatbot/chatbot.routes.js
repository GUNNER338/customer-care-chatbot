"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbot_controller_1 = require("./chatbot.controller");
const router = (0, express_1.Router)();
const controller = new chatbot_controller_1.ChatbotController();
// Create a new conversation
router.post("/conversations", controller.createConversation);
// Create / store a message under a conversation
router.post("/messages", controller.createMessage);
// Retrieve all messages for a specific conversation
router.get("/conversations/:id/messages", controller.getMessages);
// Retrieve details of a conversation (including aggregated message count)
router.get("/conversations/:id", controller.getConversation);
exports.default = router;
