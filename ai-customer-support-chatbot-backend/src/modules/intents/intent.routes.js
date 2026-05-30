const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const intentController = require("./intent.controller");

const router = express.Router();

// --- Intent Endpoints ---
router.get("/intents", authenticate, intentController.getIntents);
router.get("/intents/:id", authenticate, intentController.getIntent);
router.post("/intents", authenticate, intentController.createIntent);
router.patch("/intents/:id", authenticate, intentController.updateIntent);
router.delete("/intents/:id", authenticate, intentController.deleteIntent);

// --- Response Endpoints ---
router.get("/responses", authenticate, intentController.getResponses);
router.get("/responses/:id", authenticate, intentController.getResponse);
router.post("/responses", authenticate, intentController.createResponse);
router.patch("/responses/:id", authenticate, intentController.updateResponse);
router.delete("/responses/:id", authenticate, intentController.deleteResponse);

module.exports = router;
