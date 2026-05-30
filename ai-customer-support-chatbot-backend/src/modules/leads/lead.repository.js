const prisma = require("../../config/prisma");

class LeadRepository {
  async create(data) {
    return prisma.lead.create({
      data,
    });
  }

  async findById(id) {
    return prisma.lead.findUnique({
      where: { id },
    });
  }

  async update(id, data) {
    return prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.lead.delete({
      where: { id },
    });
  }

  async findMany(filters = {}) {
    const { status, intent, dateRange, limit = 50, offset = 0 } = filters;
    const where = {};

    if (status) where.status = status;
    if (intent) where.intent = intent;
    
    if (dateRange && dateRange.start && dateRange.end) {
      where.createdAt = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      };
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async getStats() {
    const totalLeads = await prisma.lead.count();
    const qualifiedLeads = await prisma.lead.count({ where: { status: "QUALIFIED" } });
    const convertedLeads = await prisma.lead.count({ where: { status: "CONVERTED" } });
    const byStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    const byIntent = await prisma.lead.groupBy({
      by: ['intent'],
      _count: { _all: true }
    });

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate),
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count._all })),
      byIntent: byIntent.map(i => ({ intent: i.intent, count: i._count._all }))
    };
  }
}

module.exports = new LeadRepository();
