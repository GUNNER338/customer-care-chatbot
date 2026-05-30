const prisma = require("../../config/prisma");
const nlpIntentService = require("../nlp/intent.service");

class ChatbotService {
  async createConversation(customerId) {
    return prisma.conversation.create({
      data: {
        customerId: customerId || null,
        status: "ACTIVE",
      },
    });
  }

  async getUserConversations(customerId) {
    if (!customerId) return [];
    return prisma.conversation.findMany({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async renameConversation(conversationId, title) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async deleteConversation(conversationId) {
    return prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  async createMessage(input) {
    const { conversationId, senderType, senderId, content } = input;

    const conversationExists = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      throw new Error(`Conversation with ID ${conversationId} does not exist`);
    }

    return prisma.message.create({
      data: {
        conversationId,
        senderType,
        senderId: senderId || null,
        content,
      },
    });
  }

  async getConversationMessages(conversationId) {
    const conversationExists = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      throw new Error(`Conversation with ID ${conversationId} does not exist`);
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getConversationById(conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return conversation;
  }

  async handleChatMessage(input) {
    const { conversationId, startNewConversation, message, customerId, senderId } = input;

    let currentConversationId = conversationId;
    let isNew = false;

    if (startNewConversation || !currentConversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          customerId: customerId || null,
          title: message.substring(0, 50) || "New Chat",
          status: "ACTIVE",
        },
      });
      currentConversationId = conversation.id;
      isNew = true;
    } else {
      const conversationExists = await prisma.conversation.findUnique({
        where: { id: currentConversationId },
      });

      if (!conversationExists) {
        throw new Error(`Conversation with ID ${currentConversationId} not found`);
      }
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        senderType: "USER",
        senderId: senderId || null,
        content: message,
      },
    });

    // Call the NLP recognition engine
    const nlpResult = await nlpIntentService.processMessage(message);

    // Persist classification data
    if (nlpResult.intent) {
      await prisma.messageClassification.create({
        data: {
          messageId: userMessage.id,
          intent: nlpResult.intent,
          confidence: nlpResult.confidence || 0.0,
          reasoning: nlpResult.reasoning || null
        }
      });
    }

    // --- Entity Extraction System ---
    const entityService = require("../nlp/entity-extraction/entity.service");
    const entityRepository = require("../nlp/entity-extraction/entity.repository");

    const entities = await entityService.extractEntities(message, nlpResult.intent);
    const entityType = entityService.getEntityTypeFromIntent(nlpResult.intent);

    // Save extracted entities to DB
    for (const [key, value] of Object.entries(entities)) {
      await entityRepository.saveEntity({
        conversationId: currentConversationId,
        messageId: userMessage.id,
        entityType,
        entityKey: key,
        entityValue: value,
        confidence: nlpResult.confidence || 0.95
      });
    }

    // Lead Generation Readiness
    let leadCandidate = null;
    if (entityType === "employer") {
      // Check if essential employer entities exist to form a lead
      if (entities.companyName || entities.jobTitle || entities.hiringCount || entities.location) {
        leadCandidate = {
          companyName: entities.companyName || null,
          jobTitle: entities.jobTitle || null,
          hiringCount: entities.hiringCount || null,
          location: entities.location || null
        };
        console.log("Lead Generation Readiness: Candidate object prepared ->", leadCandidate);
      }
    }

    let botResponseContent;
    if (nlpResult.intent !== "unknown" && nlpResult.response) {
      botResponseContent = nlpResult.response;
    } else {
      botResponseContent = isNew 
        ? "Hello! Welcome to our Elements HR support. How can I help you today?" 
        : "I'm sorry, I didn't quite catch that. Could you describe your issue in more detail or ask another question?";
    }

    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        senderType: "BOT",
        senderId: "chatbot_v1",
        content: botResponseContent,
      },
    });

    return {
      success: true,
      conversationId: currentConversationId,
      response: botResponseContent,
      intent: nlpResult.intent !== "unknown" ? nlpResult.intent : undefined,
      confidence: nlpResult.intent !== "unknown" ? nlpResult.confidence : undefined,
      entities: Object.keys(entities).length > 0 ? entities : undefined,
      leadCandidate: leadCandidate || undefined,
      ...(isNew ? (startNewConversation ? { startNewConversation: true } : { isNewConversation: true }) : {}),
    };
  }
}

module.exports = { ChatbotService };
