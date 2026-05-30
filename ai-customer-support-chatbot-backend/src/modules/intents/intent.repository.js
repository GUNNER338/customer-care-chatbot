const prisma = require("../../config/prisma");

class IntentRepository {
  // --- Intent Database Methods ---
  
  async findAll() {
    return prisma.intent.findMany({
      include: {
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async findById(id) {
    return prisma.intent.findUnique({
      where: { id },
      include: {
        responses: true
      }
    });
  }

  async findByName(name) {
    return prisma.intent.findUnique({
      where: { name }
    });
  }

  async create(data) {
    return prisma.intent.create({
      data
    });
  }

  async update(id, data) {
    return prisma.intent.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.intent.delete({
      where: { id }
    });
  }

  // --- Response Database Methods ---

  async findAllResponses(filter = {}) {
    const where = {};
    if (filter.intentId) {
      where.intentId = filter.intentId;
    }
    return prisma.response.findMany({
      where,
      include: {
        intent: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findResponseById(id) {
    return prisma.response.findUnique({
      where: { id },
      include: {
        intent: {
          select: { name: true }
        }
      }
    });
  }

  async createResponse(data) {
    return prisma.response.create({
      data
    });
  }

  async updateResponse(id, data) {
    return prisma.response.update({
      where: { id },
      data
    });
  }

  async deleteResponse(id) {
    return prisma.response.delete({
      where: { id }
    });
  }
}

module.exports = new IntentRepository();
