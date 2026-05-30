const { z } = require("zod");

const createIntentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Intent name is required and cannot be empty")
    .max(100, "Intent name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Intent name can only contain letters, numbers, underscores, and hyphens"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
});

const updateIntentSchema = createIntentSchema.partial();

const createResponseSchema = z.object({
  intentId: z.string().uuid("Invalid intentId format (must be a valid UUID)"),
  content: z
    .string()
    .trim()
    .min(1, "Response content is required and cannot be empty")
    .max(1000, "Response content cannot exceed 1000 characters"),
});

const updateResponseSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Response content is required and cannot be empty")
    .max(1000, "Response content cannot exceed 1000 characters"),
});

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format (must be a valid UUID)"),
});

const getResponseQuerySchema = z.object({
  intentId: z.string().uuid("Invalid intentId format (must be a valid UUID)").optional(),
});

module.exports = {
  createIntentSchema,
  updateIntentSchema,
  createResponseSchema,
  updateResponseSchema,
  uuidParamSchema,
  getResponseQuerySchema,
};
