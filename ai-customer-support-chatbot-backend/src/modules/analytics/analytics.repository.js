const prisma = require("../../config/prisma");

class AnalyticsRepository {
  /**
   * Tracks a custom analytics event (e.g., intent_classified, lead_created).
   */
  async trackEvent(eventType, eventName, metadata = {}) {
    return prisma.analyticsEvent.create({
      data: {
        eventType,
        eventName,
        metadata
      }
    });
  }

  async getOverviewMetrics(whereClause) {
    const [totalUsers, totalConversations, totalMessages, totalLeads, totalCandidates, totalEscalations] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.conversation.count({ where: whereClause }),
      prisma.message.count({ where: whereClause }),
      prisma.lead.count({ where: whereClause }),
      prisma.candidateProfile.count({ where: whereClause }),
      prisma.escalation.count({ where: whereClause })
    ]);
    return { totalUsers, totalConversations, totalMessages, totalLeads, totalCandidates, totalEscalations };
  }

  async getIntentDistribution(whereClause) {
    const classifications = await prisma.messageClassification.groupBy({
      by: ['intent'],
      where: whereClause,
      _count: { intent: true }
    });

    const distribution = {};
    for (const c of classifications) {
      distribution[c.intent] = c._count.intent;
    }
    return distribution;
  }

  async getConversationStats(whereClause) {
    const stats = await prisma.conversation.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true }
    });
    
    const result = { active: 0, closed: 0, escalated: 0 };
    for (const s of stats) {
      if (s.status === 'ACTIVE') result.active = s._count.status;
      if (s.status === 'CLOSED') result.closed = s._count.status;
      if (s.status === 'ESCALATED') result.escalated = s._count.status;
    }
    return result;
  }

  async getLeadStats(whereClause) {
    const stats = await prisma.lead.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true }
    });

    const result = { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, rejected: 0 };
    for (const s of stats) {
      result.total += s._count.status;
      const key = s.status.toLowerCase();
      result[key] = s._count.status;
    }
    return result;
  }

  async getCandidateStats(whereClause) {
    const candidates = await prisma.candidateProfile.findMany({
      where: whereClause,
      select: { experience: true, skills: true, profileCompletion: true }
    });

    let totalCandidates = candidates.length;
    let completedProfiles = 0;
    let totalExp = 0;
    let expCount = 0;
    const skillMap = {};

    candidates.forEach(c => {
      if (c.profileCompletion >= 100) completedProfiles++;
      if (c.experience) {
        totalExp += c.experience;
        expCount++;
      }
      
      if (c.skills && Array.isArray(c.skills)) {
        c.skills.forEach(skill => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
      }
    });

    const averageExperience = expCount > 0 ? Number((totalExp / expCount).toFixed(1)) : 0;
    
    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    return { totalCandidates, completedProfiles, averageExperience, topSkills };
  }

  async getEscalationStats(whereClause) {
    const stats = await prisma.escalation.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true }
    });

    const result = { pending: 0, assigned: 0, in_progress: 0, resolved: 0, closed: 0 };
    for (const s of stats) {
      const key = s.status.toLowerCase();
      result[key] = s._count.status;
    }

    const urgentCount = await prisma.escalation.count({
      where: { ...whereClause, priority: 'URGENT' }
    });

    return { ...result, urgent: urgentCount };
  }

  async getTrends(whereClause) {
    // Note: Prisma does not support native Date Truncation grouping in all providers smoothly out of the box.
    // For a robust approach, we fetch the dates and group in memory (fine for thousands of rows, but scale warning).
    const items = await prisma.conversation.findMany({
      where: whereClause,
      select: { createdAt: true }
    });

    const trendMap = {};
    items.forEach(i => {
      const dateStr = i.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });

    return Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getNlpStats(whereClause) {
    const totalClassifications = await prisma.messageClassification.count({ where: whereClause });
    const agg = await prisma.messageClassification.aggregate({
      where: whereClause,
      _avg: { confidence: true }
    });
    
    const unknownIntents = await prisma.messageClassification.count({
      where: { ...whereClause, intent: 'unknown' }
    });

    const clarifications = await prisma.analyticsEvent.count({
      where: { ...whereClause, eventName: 'clarification_requested' }
    });

    return {
      totalClassifications,
      avgConfidence: agg._avg.confidence ? Number(agg._avg.confidence.toFixed(2)) : 0,
      clarifications,
      unknownIntents
    };
  }
}

module.exports = new AnalyticsRepository();
