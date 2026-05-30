const { Router } = require("express");
const leadController = require("./lead.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();

// Stats route should be before /:id to prevent "stats" being parsed as an id
router.get("/stats", authenticate, leadController.getLeadStats.bind(leadController));

router.get("/", authenticate, leadController.getLeads.bind(leadController));
router.get("/:id", authenticate, leadController.getLeadById.bind(leadController));
router.post("/", authenticate, leadController.createLead.bind(leadController));
router.patch("/:id", authenticate, leadController.updateLead.bind(leadController));
router.delete("/:id", authenticate, leadController.deleteLead.bind(leadController));

module.exports = router;
