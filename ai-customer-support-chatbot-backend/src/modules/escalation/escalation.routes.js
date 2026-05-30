const { Router } = require("express");
const escalationController = require("./escalation.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();

// Dashboard Stats (requires auth)
router.get("/stats", authenticate, escalationController.getStats.bind(escalationController));

// Standard CRUD
router.post("/", authenticate, escalationController.createEscalation.bind(escalationController));
router.get("/", authenticate, escalationController.getEscalations.bind(escalationController));
router.get("/:id", authenticate, escalationController.getEscalationById.bind(escalationController));
router.delete("/:id", authenticate, escalationController.deleteEscalation.bind(escalationController));

// Status & Assignment
router.patch("/:id/status", authenticate, escalationController.updateStatus.bind(escalationController));
router.patch("/:id/assign", authenticate, escalationController.assignRecruiter.bind(escalationController));

module.exports = router;
