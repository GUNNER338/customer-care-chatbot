const analyticsService = require("./analytics.service");

class AnalyticsController {
  async getOverview(req, res) {
    try {
      const data = await analyticsService.getOverview(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch overview metrics" });
    }
  }

  async getIntents(req, res) {
    try {
      const data = await analyticsService.getIntents(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch intent analytics" });
    }
  }

  async getConversations(req, res) {
    try {
      const data = await analyticsService.getConversations(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch conversation analytics" });
    }
  }

  async getLeads(req, res) {
    try {
      const data = await analyticsService.getLeads(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch lead analytics" });
    }
  }

  async getCandidates(req, res) {
    try {
      const data = await analyticsService.getCandidates(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch candidate analytics" });
    }
  }

  async getEscalations(req, res) {
    try {
      const data = await analyticsService.getEscalations(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch escalation analytics" });
    }
  }

  async getTrends(req, res) {
    try {
      const data = await analyticsService.getTrends(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch trends analytics" });
    }
  }

  async getNlpStats(req, res) {
    try {
      const data = await analyticsService.getNlpStats(req.query.from, req.query.to);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch NLP analytics" });
    }
  }

  async exportData(req, res) {
    try {
      const format = req.query.format || "csv";
      const data = await analyticsService.generateExport(format, req.query.from, req.query.to);
      
      if (format === "csv") {
        res.header("Content-Type", "text/csv");
        res.attachment(`analytics_export_${new Date().toISOString().split("T")[0]}.csv`);
        return res.send(data);
      }
      
      res.status(400).json({ success: false, error: "Unsupported format" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to export data" });
    }
  }
}

module.exports = new AnalyticsController();
