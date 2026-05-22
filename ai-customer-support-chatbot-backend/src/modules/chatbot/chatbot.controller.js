const { ChatbotService } = require("./chatbot.service");
const { 
  createConversationSchema, 
  createMessageSchema, 
  uuidParamSchema,
  chatRequestSchema
} = require("./chatbot.validation");

class ChatbotController {
  constructor() {
    this.chatbotService = new ChatbotService();
  }

  createConversation = async (req, res, next) => {
    try {
      const validatedBody = createConversationSchema.parse(req.body);
      const conversation = await this.chatbotService.createConversation(
        validatedBody.customerId || undefined
      );

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
      const validatedParams = uuidParamSchema.parse(req.params);
      const messages = await this.chatbotService.getConversationMessages(validatedParams.id);

      res.status(200).json({
        success: true,
        data: messages,
      });
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
      const responsePayload = await this.chatbotService.handleChatMessage(validatedBody);

      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { ChatbotController };
