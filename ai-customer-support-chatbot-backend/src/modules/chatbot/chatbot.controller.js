const { ChatbotService } = require("./chatbot.service");
const { 
  createConversationSchema, 
  createMessageSchema, 
  uuidParamSchema,
  chatRequestSchema,
  renameConversationSchema
} = require("./chatbot.validation");

class ChatbotController {
  constructor() {
    this.chatbotService = new ChatbotService();
  }

  createConversation = async (req, res, next) => {
    try {
      const validatedBody = createConversationSchema.parse(req.body);
      // Use authenticated user's UID or fallback to body customerId
      const customerId = req.user?.uid || validatedBody.customerId || undefined;
      const conversation = await this.chatbotService.createConversation(customerId);

      res.status(201).json({
        success: true,
        data: {
          conversationId: conversation.id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getConversations = async (req, res, next) => {
    try {
      const customerId = req.user?.uid;
      const conversations = await this.chatbotService.getUserConversations(customerId);

      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  };

  renameConversation = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const validatedBody = renameConversationSchema.parse(req.body);
      const conversation = await this.chatbotService.renameConversation(validatedParams.id, validatedBody.title);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      await this.chatbotService.deleteConversation(validatedParams.id);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  createMessage = async (req, res, next) => {
    try {
      const validatedBody = createMessageSchema.parse(req.body);
      await this.chatbotService.createMessage(validatedBody);

      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req, res, next) => {
    try {
      // Guard: if conversationId is missing, respond with clear error
      if (!req.params.id) {
        return res.status(400).json({ success: false, message: 'Missing conversationId' });
      }
      const validatedParams = uuidParamSchema.parse(req.params);
      const messages = await this.chatbotService.getConversationMessages(validatedParams.id);
      
      res.status(200).json({
        success: true,
        data: messages,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const conversation = await this.chatbotService.getConversationById(validatedParams.id);

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };

  chat = async (req, res, next) => {
    try {
      const validatedBody = chatRequestSchema.parse(req.body);
      const customerId = req.user?.uid || validatedBody.customerId || undefined;
      const responsePayload = await this.chatbotService.handleChatMessage({
        ...validatedBody,
        customerId
      });

      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { ChatbotController };
