const prisma = require('../../config/prisma');

class ConversationEntityRepository {
  async create(entity) {
    return prisma.conversationEntity.create({ data: entity });
  }

  async findByConversationId(conversationId) {
    return prisma.conversationEntity.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id) {
    return prisma.conversationEntity.delete({ where: { id } });
  }
}

module.exports = new ConversationEntityRepository();
