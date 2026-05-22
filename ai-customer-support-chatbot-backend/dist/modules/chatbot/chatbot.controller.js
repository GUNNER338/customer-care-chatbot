"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const chatbot_service_1 = require("./chatbot.service");
const chatbot_validation_1 = require("./chatbot.validation");
/**
 * Controller layer for the Chatbot Module.
 * Responsible for request parsing, schema validation, and formatting responses.
 */
class ChatbotController {
    chatbotService;
    constructor() {
        this.chatbotService = new chatbot_service_1.ChatbotService();
    }
    /**
     * Controller for creating a new conversation.
     * POST /api/chatbot/conversations
     */
    createConversation = async (req, res, next) => {
        try {
            // Validate request payload
            const validatedBody = chatbot_validation_1.createConversationSchema.parse(req.body);
            const conversation = await this.chatbotService.createConversation(validatedBody.customerId || undefined);
            res.status(201).json({
                success: true,
                data: {
                    conversationId: conversation.id,
                },
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Controller for sending / storing a new message.
     * POST /api/chatbot/messages
     */
    createMessage = async (req, res, next) => {
        try {
            // Validate request payload
            const validatedBody = chatbot_validation_1.createMessageSchema.parse(req.body);
            await this.chatbotService.createMessage(validatedBody);
            res.status(201).json({
                success: true,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Controller for retrieving all messages under a conversation.
     * GET /api/chatbot/conversations/:id/messages
     */
    getMessages = async (req, res, next) => {
        try {
            // Validate route param (conversation ID)
            const validatedParams = chatbot_validation_1.uuidParamSchema.parse(req.params);
            const messages = await this.chatbotService.getConversationMessages(validatedParams.id);
            res.status(200).json({
                success: true,
                data: messages,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Controller for retrieving conversation details by ID.
     * GET /api/chatbot/conversations/:id
     */
    getConversation = async (req, res, next) => {
        try {
            // Validate route param (conversation ID)
            const validatedParams = chatbot_validation_1.uuidParamSchema.parse(req.params);
            const conversation = await this.chatbotService.getConversationById(validatedParams.id);
            res.status(200).json({
                success: true,
                data: conversation,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ChatbotController = ChatbotController;
