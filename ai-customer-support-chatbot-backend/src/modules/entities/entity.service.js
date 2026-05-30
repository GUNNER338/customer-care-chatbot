const entityRepository = require('./entity.repository');
const regexExtractor = require('../nlp/regexExtractor'); // hypothetical helper
const geminiExtractor = require('../nlp/geminiExtractor'); // hypothetical helper

class ConversationEntityService {
  /**
   * Extract entities from a message and store them.
   * @param {string} conversationId - ID of the conversation.
   * @param {string} message - Raw user message.
   * @returns {Promise<Object>} The created ConversationEntity record.
   */
  async extractAndSave(conversationId, message) {
    // First try deterministic regex extraction
    let entities = regexExtractor.extract(message);
    // If regex fails to find any key fields, fallback to Gemini AI
    if (!entities || Object.keys(entities).length === 0) {
      entities = await geminiExtractor.extract(message);
    }
    const data = {
      conversationId,
      orderId: entities.orderId || null,
      email: entities.email || null,
      phoneNumber: entities.phoneNumber || null,
      productName: entities.productName || null,
      date: entities.date ? new Date(entities.date) : null,
    };
    return entityRepository.create(data);
  }

  async getByConversation(conversationId) {
    return entityRepository.findByConversationId(conversationId);
  }
}

module.exports = new ConversationEntityService();
