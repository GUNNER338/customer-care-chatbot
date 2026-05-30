const escalationService = require("./escalation.service");

class EscalationController {
  async createEscalation(req, res) {
    try {
      const escalation = await escalationService.createEscalation(req.body);
      res.status(201).json({ success: true, data: escalation });
    } catch (error) {
      console.error("Error creating escalation:", error);
      res.status(500).json({ success: false, error: "Failed to create escalation" });
    }
  }

  async getEscalations(req, res) {
    try {
      const escalations = await escalationService.getEscalations(req.query);
      res.json({ success: true, data: escalations });
    } catch (error) {
      console.error("Error fetching escalations:", error);
      res.status(500).json({ success: false, error: "Failed to fetch escalations" });
    }
  }

  async getEscalationById(req, res) {
    try {
      const escalation = await escalationService.getEscalationById(req.params.id);
      if (!escalation) {
        return res.status(404).json({ success: false, error: "Escalation not found" });
      }
      res.json({ success: true, data: escalation });
    } catch (error) {
      console.error("Error fetching escalation:", error);
      res.status(500).json({ success: false, error: "Failed to fetch escalation" });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const escalation = await escalationService.updateEscalationStatus(req.params.id, status);
      res.json({ success: true, data: escalation });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ success: false, error: "Failed to update escalation status" });
    }
  }

  async assignRecruiter(req, res) {
    try {
      const { recruiterId } = req.body;
      const escalation = await escalationService.assignRecruiter(req.params.id, recruiterId);
      res.json({ success: true, data: escalation });
    } catch (error) {
      console.error("Error assigning recruiter:", error);
      res.status(500).json({ success: false, error: "Failed to assign recruiter" });
    }
  }

  async deleteEscalation(req, res) {
    try {
      await escalationService.deleteEscalation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting escalation:", error);
      res.status(500).json({ success: false, error: "Failed to delete escalation" });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await escalationService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching escalation stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
  }
}

module.exports = new EscalationController();
