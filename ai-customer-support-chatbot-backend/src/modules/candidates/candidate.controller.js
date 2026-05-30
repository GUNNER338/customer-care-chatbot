const candidateService = require("./candidate.service");

class CandidateController {
  async getProfile(req, res) {
    try {
      const profile = await candidateService.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ success: false, error: "Profile not found" });
      }
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
  }

  async updateProfile(req, res) {
    try {
      const profile = await candidateService.updateProfileDirectly(req.user.id, req.body);
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Error updating candidate profile:", error);
      res.status(500).json({ success: false, error: "Failed to update profile" });
    }
  }

  async getCompletion(req, res) {
    try {
      const data = await candidateService.getCompletion(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching completion:", error);
      res.status(500).json({ success: false, error: "Failed to fetch completion score" });
    }
  }

  async getSummary(req, res) {
    try {
      const data = await candidateService.getSummary(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({ success: false, error: "Failed to fetch profile summary" });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await candidateService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching candidate stats:", error);
      res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
  }
}

module.exports = new CandidateController();
