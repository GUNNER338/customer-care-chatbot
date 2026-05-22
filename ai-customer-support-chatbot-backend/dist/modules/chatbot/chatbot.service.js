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
    /**
     * Handles the unified chat API logic: creates new conversations,
     * stores user messages, and generates bot responses.
     *
     * @param input - The chat request payload.
     */
    async handleChatMessage(input) {
        const { conversationId, startNewConversation, message, customerId, senderId } = input;
        let currentConversationId = conversationId;
        let isNew = false;
        if (startNewConversation || !currentConversationId) {
            // Create new conversation
            const conversation = await prisma_1.default.conversation.create({
                data: {
                    customerId: customerId || null,
                    title: message.substring(0, 50) || "New Chat",
                    status: "ACTIVE",
                },
            });
            currentConversationId = conversation.id;
            isNew = true;
        }
        else {
            // Verify existing conversation
            const conversationExists = await prisma_1.default.conversation.findUnique({
                where: { id: currentConversationId },
            });
            if (!conversationExists) {
                throw new Error(`Conversation with ID ${currentConversationId} not found`);
            }
        }
        // Save user message
        await prisma_1.default.message.create({
            data: {
                conversationId: currentConversationId,
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
        await prisma_1.default.message.create({
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
exports.ChatbotService = ChatbotService;
