const { Router } = require("express");
const { ChatbotController } = require("./chatbot.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();
const controller = new ChatbotController();

router.post("/conversations", authenticate, controller.createConversation);
router.get("/conversations", authenticate, controller.getConversations);
router.patch("/conversations/:id", authenticate, controller.renameConversation);
router.delete("/conversations/:id", authenticate, controller.deleteConversation);

router.post("/messages", authenticate, controller.createMessage);
router.get("/conversations/:id/messages", authenticate, controller.getMessages);
router.get("/conversations/:id", authenticate, controller.getConversation);
router.post("/chat", authenticate, controller.chat);

module.exports = router;
