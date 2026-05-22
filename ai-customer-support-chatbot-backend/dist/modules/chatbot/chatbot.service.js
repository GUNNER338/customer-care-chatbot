"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/**
 * Chatbot Service Layer.
 * Interacts directly with the database via Prisma client.
 */
class ChatbotService {
    /**
     * Creates a new conversation session.
     * Status defaults to 'ACTIVE'.
     *
     * @param customerId - Optional customer identifier.
     */
    async createConversation(customerId) {
        return prisma_1.default.conversation.create({
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
    async createMessage(input) {
        const { conversationId, senderType, senderId, content } = input;
        // Check if the conversation exists to provide a friendly runtime error
        const conversationExists = await prisma_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversationExists) {
            throw new Error(`Conversation with ID ${conversationId} does not exist`);
        }
        return prisma_1.default.message.create({
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
    async getConversationMessages(conversationId) {
        // Check if conversation exists
        const conversationExists = await prisma_1.default.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversationExists) {
            throw new Error(`Conversation with ID ${conversationId} does not exist`);
        }
        return prisma_1.default.message.findMany({
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
    async getConversationById(conversationId) {
        const conversation = await prisma_1.default.conversation.findUnique({
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
exports.ChatbotService = ChatbotService;
