import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Centralized error handler middleware.
 * Catches all errors thrown in routes, controllers, or services, and formats the response.
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error encountered:", error);

  // Handle Zod Schema Validation errors
  if (error instanceof ZodError) {
    const errorDetails = error.issues
      .map((issue) => `"${issue.path.join(".")}" ${issue.message.toLowerCase()}`)
      .join("; ");
    
    res.status(400).json({
      success: false,
      message: `Validation Error: ${errorDetails}`,
    });
    return;
  }

  // Handle default runtime/internal server errors
  res.status(500).json({
    success: false,
    message: error.message || "An unexpected internal server error occurred.",
  });
};
