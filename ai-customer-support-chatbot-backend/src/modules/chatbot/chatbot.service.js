const prisma = require("../../config/prisma");

class ChatbotService {
  async createConversation(customerId) {
    return prisma.conversation.create({
      data: {
        customerId: customerId || null,
        status: "ACTIVE",
      },
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

    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        senderType: "USER",
        senderId: senderId || null,
        content: message,
      },
    });

    const botResponseContent = isNew 
      ? "Hello! How can I help you today?" 
      : "Please share your order ID or describe your issue in more detail.";

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
      ...(isNew ? (startNewConversation ? { startNewConversation: true } : { isNewConversation: true }) : {}),
    };
  }
}

module.exports = { ChatbotService };
