const { Router } = require("express");
const { ChatbotController } = require("./chatbot.controller");

const router = Router();
const controller = new ChatbotController();

router.post("/conversations", controller.createConversation);
router.post("/messages", controller.createMessage);
router.get("/conversations/:id/messages", controller.getMessages);
router.get("/conversations/:id", controller.getConversation);
router.post("/chat", controller.chat);

module.exports = router;
