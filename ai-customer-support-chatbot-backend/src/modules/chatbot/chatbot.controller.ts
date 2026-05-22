import { Request, Response, NextFunction } from "express";
import { ChatbotService } from "./chatbot.service";
import { 
  createConversationSchema, 
  createMessageSchema, 
  uuidParamSchema 
} from "./chatbot.validation";

/**
 * Controller layer for the Chatbot Module.
 * Responsible for request parsing, schema validation, and formatting responses.
 */
export class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
  }

  /**
   * Controller for creating a new conversation.
   * POST /api/chatbot/conversations
   */
  public createConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request payload
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

  /**
   * Controller for sending / storing a new message.
   * POST /api/chatbot/messages
   */
  public createMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request payload
      const validatedBody = createMessageSchema.parse(req.body);

      await this.chatbotService.createMessage(validatedBody);

      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller for retrieving all messages under a conversation.
   * GET /api/chatbot/conversations/:id/messages
   */
  public getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate route param (conversation ID)
      const validatedParams = uuidParamSchema.parse(req.params);

      const messages = await this.chatbotService.getConversationMessages(
        validatedParams.id
      );

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller for retrieving conversation details by ID.
   * GET /api/chatbot/conversations/:id
   */
  public getConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate route param (conversation ID)
      const validatedParams = uuidParamSchema.parse(req.params);

      const conversation = await this.chatbotService.getConversationById(
        validatedParams.id
      );

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };
}
