const prisma = require("../../config/prisma");

class EscalationRepository {
  async createEscalation(data) {
    return prisma.escalation.create({
      data,
    });
  }

  async findById(id) {
    return prisma.escalation.findUnique({
      where: { id },
      include: {
        conversation: true,
        user: true,
        lead: true,
        candidateProfile: true
      }
    });
  }

  async findActiveByConversationId(conversationId) {
    return prisma.escalation.findFirst({
      where: {
        conversationId,
        status: {
          in: ["PENDING", "ASSIGNED", "IN_PROGRESS"]
        }
      }
    });
  }

  async updateEscalation(id, data) {
    return prisma.escalation.update({
      where: { id },
      data,
    });
  }

  async getAllEscalations(query = {}) {
    const { status, priority, limit = 50, skip = 0 } = query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    return prisma.escalation.findMany({
      where,
      take: Number(limit),
      skip: Number(skip),
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: { select: { title: true } },
        user: { select: { fullName: true, email: true } }
      }
    });
  }

  async getDashboardStats() {
    const [pending, assigned, resolved, urgent] = await Promise.all([
      prisma.escalation.count({ where: { status: "PENDING" } }),
      prisma.escalation.count({ where: { status: "ASSIGNED" } }),
      prisma.escalation.count({ where: { status: "RESOLVED" } }),
      prisma.escalation.count({ where: { priority: "URGENT" } })
    ]);

    return { pending, assigned, resolved, urgent };
  }
}

module.exports = new EscalationRepository();
