const { z } = require("zod");
const { SenderType } = require("../../generated");

const createConversationSchema = z.object({
  customerId: z.string().trim().min(1, "Customer ID cannot be empty").optional().nullable(),
});

const createMessageSchema = z.object({
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

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format (must be a valid UUID)"),
});

const chatRequestSchema = z.object({
  conversationId: z.string().uuid("Invalid conversationId format (must be a valid UUID)").optional(),
  startNewConversation: z.boolean().optional(),
  message: z.string().min(1, "message must be at least 1 character long").max(5000, "message cannot exceed 5000 characters"),
  customerId: z.string().trim().min(1, "customerId cannot be empty").optional().nullable(),
  senderId: z.string().trim().min(1, "senderId cannot be empty").optional().nullable(),
});

module.exports = {
  createConversationSchema,
  createMessageSchema,
  uuidParamSchema,
  chatRequestSchema,
};
