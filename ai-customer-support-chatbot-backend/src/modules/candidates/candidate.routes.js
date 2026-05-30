const { Router } = require("express");
const candidateController = require("./candidate.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();

// Dashboard Stats (requires auth, could add admin middleware later)
router.get("/stats", authenticate, candidateController.getStats.bind(candidateController));

// Candidate Profile Routes
router.get("/profile", authenticate, candidateController.getProfile.bind(candidateController));
router.post("/profile", authenticate, candidateController.updateProfile.bind(candidateController));
router.patch("/profile", authenticate, candidateController.updateProfile.bind(candidateController));

// Profile Extras
router.get("/completion", authenticate, candidateController.getCompletion.bind(candidateController));
router.get("/summary", authenticate, candidateController.getSummary.bind(candidateController));

module.exports = router;
