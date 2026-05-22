import { z } from "zod";
import { SenderType } from "../../generated";

/**
 * Zod validation schema for creating a Conversation.
 */
export const createConversationSchema = z.object({
  customerId: z.string().trim().min(1, "Customer ID cannot be empty").optional().nullable(),
});

/**
 * Zod validation schema for creating a Message.
 */
export const createMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversationId format (must be a valid UUID)"),
  senderType: z.nativeEnum(SenderType, {
    message: "senderType must be either USER, BOT, or AGENT",
  }),
  senderId: z.string().trim().min(1, "senderId cannot be empty").optional().nullable(),
  content: z
    .string()
    .min(1, "content must be at least 1 character long")
    .max(5000, "content cannot exceed 5000 characters"),
});

/**
 * Zod validation schema for URL path parameters containing UUID ids.
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format (must be a valid UUID)"),
});
