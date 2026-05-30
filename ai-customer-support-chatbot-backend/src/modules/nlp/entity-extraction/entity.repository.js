const prisma = require("../../../config/prisma");

class EntityRepository {
  /**
   * Saves an extracted entity to the database.
   * @param {Object} data 
   * @param {string} data.conversationId
   * @param {string} data.messageId
   * @param {string} data.entityType
   * @param {string} data.entityKey
   * @param {any} data.entityValue
   * @param {number} data.confidence
   */
  async saveEntity(data) {
    // Serialize object/array values to string for database storage
    const stringifiedValue = typeof data.entityValue === "object" 
      ? JSON.stringify(data.entityValue) 
      : String(data.entityValue);
    
    return prisma.conversationEntity.create({
      data: {
        conversationId: data.conversationId,
        messageId: data.messageId,
        entityType: data.entityType,
        entityKey: data.entityKey,
        entityValue: stringifiedValue,
        confidence: data.confidence
      }
    });
  }

  /**
   * Retrieves all entities for a specific conversation.
   * @param {string} conversationId 
   */
  async getEntitiesByConversation(conversationId) {
    return prisma.conversationEntity.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" }
    });
  }
}

module.exports = new EntityRepository();
