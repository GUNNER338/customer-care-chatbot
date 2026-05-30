const analyticsRepository = require("./analytics.repository");

class AnalyticsService {
  _buildWhereClause(from, to) {
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    return where;
  }

  async getOverview(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getOverviewMetrics(where);
  }

  async getIntents(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getIntentDistribution(where);
  }

  async getConversations(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getConversationStats(where);
  }

  async getLeads(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getLeadStats(where);
  }

  async getCandidates(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getCandidateStats(where);
  }

  async getEscalations(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getEscalationStats(where);
  }

  async getTrends(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getTrends(where);
  }

  async getNlpStats(from, to) {
    const where = this._buildWhereClause(from, to);
    return analyticsRepository.getNlpStats(where);
  }

  async generateExport(format, from, to) {
    const where = this._buildWhereClause(from, to);
    const [overview, leads, candidates, escalations] = await Promise.all([
      this.getOverview(from, to),
      this.getLeads(from, to),
      this.getCandidates(from, to),
      this.getEscalations(from, to)
    ]);

    if (format === "csv") {
      const lines = [
        "Metric,Value",
        `Total Users,${overview.totalUsers}`,
        `Total Conversations,${overview.totalConversations}`,
        `Total Leads,${overview.totalLeads}`,
        `Total Candidates,${overview.totalCandidates}`,
        `Escalations Pending,${escalations.pending}`,
        `Escalations Urgent,${escalations.urgent}`
      ];
      return lines.join("\n");
    }

    throw new Error("Unsupported format");
  }
}

module.exports = new AnalyticsService();
