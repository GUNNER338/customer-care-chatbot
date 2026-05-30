const prisma = require('../../config/prisma');

class MemoryRepository {
  async storeMemory(userId, memoryType, memoryKey, memoryValue, confidence) {
    const existing = await prisma.userMemory.findFirst({
      where: { userId, memoryKey }
    });

    if (existing) {
      return prisma.userMemory.update({
        where: { id: existing.id },
        data: {
          memoryValue,
          confidence,
          memoryType,
          lastUsedAt: new Date(),
        }
      });
    }

    return prisma.userMemory.create({
      data: {
        userId,
        memoryType,
        memoryKey,
        memoryValue,
        confidence,
        lastUsedAt: new Date()
      }
    });
  }

  async getMemoriesByUser(userId) {
    return prisma.userMemory.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' }
    });
  }

  async getMemoriesByUserAndType(userId, memoryType) {
    return prisma.userMemory.findMany({
      where: { userId, memoryType },
      orderBy: { lastUsedAt: 'desc' }
    });
  }

  async getMemoryByKey(userId, memoryKey) {
    return prisma.userMemory.findFirst({
      where: { userId, memoryKey }
    });
  }

  async deleteMemory(memoryId) {
    return prisma.userMemory.delete({
      where: { id: memoryId }
    });
  }

  async updateLastUsedAt(memoryId) {
    return prisma.userMemory.update({
      where: { id: memoryId },
      data: { lastUsedAt: new Date() }
    });
  }

  async getAnalytics() {
    const totalMemories = await prisma.userMemory.count();
    
    // Group by user
    const usersWithMemory = await prisma.userMemory.groupBy({
      by: ['userId'],
    });
    const activeUsers = usersWithMemory.length;

    // Group by type
    const topMemoryTypesRaw = await prisma.userMemory.groupBy({
      by: ['memoryType'],
      _count: { memoryType: true },
      orderBy: { _count: { memoryType: 'desc' } },
      take: 5
    });
    const topMemoryTypes = topMemoryTypesRaw.map(t => ({ name: t.memoryType, count: t._count.memoryType }));

    return {
      totalMemories,
      activeUsers,
      avgMemoriesPerUser: activeUsers > 0 ? (totalMemories / activeUsers).toFixed(2) : 0,
      topMemoryTypes
    };
  }
}

module.exports = new MemoryRepository();
