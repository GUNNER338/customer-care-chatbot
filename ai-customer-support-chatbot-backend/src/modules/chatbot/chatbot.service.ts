import prisma from "../../config/prisma";
import { 
  CreateMessageInput, 
  ConversationResponse, 
  ConversationDetailsResponse, 
  MessageResponse 
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
}
