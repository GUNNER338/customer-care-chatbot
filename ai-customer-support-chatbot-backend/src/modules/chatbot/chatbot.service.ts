import prisma from "../../config/prisma";
import { 
  CreateMessageInput, 
  ConversationResponse, 
  ConversationDetailsResponse, 
  MessageResponse,
  ChatRequest,
  ChatResponse
} from "./chatbot.types";

/**
 * Chatbot Service Layer.
 * Interacts directly with the database via Prisma client.
 */
export class ChatbotService {
  /**
   * Creates a new conversation session.
   * Status defaults to 'ACTIVE'.
   * 
   * @param customerId - Optional customer identifier.
   */
  public async createConversation(customerId?: string): Promise<ConversationResponse> {
    return prisma.conversation.create({
      data: {
        customerId: customerId || null,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Creates and stores a new message under a conversation.
   * Throws an error if the conversation does not exist.
   * 
   * @param input - The message details including conversationId, senderType, senderId, and content.
   */
  public async createMessage(input: CreateMessageInput): Promise<MessageResponse> {
    const { conversationId, senderType, senderId, content } = input;

    // Check if the conversation exists to provide a friendly runtime error
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

  /**
   * Retrieves all messages belonging to a conversation, ordered chronologically.
   * Throws an error if the conversation does not exist.
   * 
   * @param conversationId - The ID of the target conversation.
   */
  public async getConversationMessages(conversationId: string): Promise<MessageResponse[]> {
    // Check if conversation exists
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

  /**
   * Retrieves conversation details along with the message count.
   * Throws an error if the conversation does not exist.
   * 
   * @param conversationId - The ID of the target conversation.
   */
  public async getConversationById(conversationId: string): Promise<ConversationDetailsResponse> {
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

  /**
   * Handles the unified chat API logic: creates new conversations,
   * stores user messages, and generates bot responses.
   * 
   * @param input - The chat request payload.
   */
  public async handleChatMessage(input: ChatRequest): Promise<ChatResponse> {
    const { conversationId, startNewConversation, message, customerId, senderId } = input;

    let currentConversationId = conversationId;
    let isNew = false;

    if (startNewConversation || !currentConversationId) {
      // Create new conversation
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
      // Verify existing conversation
      const conversationExists = await prisma.conversation.findUnique({
        where: { id: currentConversationId },
      });

      if (!conversationExists) {
        throw new Error(`Conversation with ID ${currentConversationId} not found`);
      }
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: currentConversationId!,
        senderType: "USER",
        senderId: senderId || null,
        content: message,
      },
    });

    // Generate bot response (simulated for now, pending Gemini integration)
    const botResponseContent = isNew 
      ? "Hello! How can I help you today?" 
      : "Please share your order ID or describe your issue in more detail.";

    // Save bot message
    await prisma.message.create({
      data: {
        conversationId: currentConversationId!,
        senderType: "BOT",
        senderId: "chatbot_v1",
        content: botResponseContent,
      },
    });

    return {
      success: true,
      conversationId: currentConversationId!,
      response: botResponseContent,
      ...(isNew ? (startNewConversation ? { startNewConversation: true } : { isNewConversation: true }) : {}),
    };
  }
}
