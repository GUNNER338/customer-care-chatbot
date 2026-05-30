const leadService = require("./lead.service");

class LeadController {
  async getLeads(req, res) {
    try {
      const filters = {
        status: req.query.status,
        intent: req.query.intent,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0,
      };

      if (req.query.startDate && req.query.endDate) {
        filters.dateRange = {
          start: req.query.startDate,
          end: req.query.endDate,
        };
      }

      const leads = await leadService.getLeads(filters);
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ success: false, error: "Failed to fetch leads" });
    }
  }

  async getLeadById(req, res) {
    try {
      const lead = await leadService.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lead" });
    }
  }

  async createLead(req, res) {
    try {
      const lead = await leadService.createLead(req.body);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ success: false, error: "Failed to create lead" });
    }
  }

  async updateLead(req, res) {
    try {
      const lead = await leadService.updateLead(req.params.id, req.body);
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ success: false, error: "Failed to update lead" });
    }
  }

  async deleteLead(req, res) {
    try {
      await leadService.deleteLead(req.params.id);
      res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ success: false, error: "Failed to delete lead" });
    }
  }

  async getLeadStats(req, res) {
    try {
      const stats = await leadService.getLeadStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching lead stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lead stats" });
    }
  }
}

module.exports = new LeadController();
