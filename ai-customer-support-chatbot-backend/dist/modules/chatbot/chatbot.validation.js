"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidParamSchema = exports.createMessageSchema = exports.createConversationSchema = void 0;
const zod_1 = require("zod");
const generated_1 = require("../../generated");
/**
 * Zod validation schema for creating a Conversation.
 */
exports.createConversationSchema = zod_1.z.object({
    customerId: zod_1.z.string().trim().min(1, "Customer ID cannot be empty").optional().nullable(),
});
/**
 * Zod validation schema for creating a Message.
 */
exports.createMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid("Invalid conversationId format (must be a valid UUID)"),
    senderType: zod_1.z.nativeEnum(generated_1.SenderType, {
        message: "senderType must be either USER, BOT, or AGENT",
    }),
    senderId: zod_1.z.string().trim().min(1, "senderId cannot be empty").optional().nullable(),
    content: zod_1.z
        .string()
        .min(1, "content must be at least 1 character long")
        .max(5000, "content cannot exceed 5000 characters"),
});
/**
 * Zod validation schema for URL path parameters containing UUID ids.
 */
exports.uuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid ID format (must be a valid UUID)"),
});
