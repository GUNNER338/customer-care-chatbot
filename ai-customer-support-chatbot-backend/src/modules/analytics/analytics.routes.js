const { Router } = require("express");
const analyticsController = require("./analytics.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();

// Secure all analytics routes
router.use(authenticate);

router.get("/overview", analyticsController.getOverview.bind(analyticsController));
router.get("/intents", analyticsController.getIntents.bind(analyticsController));
router.get("/conversations", analyticsController.getConversations.bind(analyticsController));
router.get("/leads", analyticsController.getLeads.bind(analyticsController));
router.get("/candidates", analyticsController.getCandidates.bind(analyticsController));
router.get("/escalations", analyticsController.getEscalations.bind(analyticsController));
router.get("/trends", analyticsController.getTrends.bind(analyticsController));
router.get("/nlp", analyticsController.getNlpStats.bind(analyticsController));
router.get("/export", analyticsController.exportData.bind(analyticsController));

module.exports = router;
