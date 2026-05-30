const { ZodError } = require("zod");

const errorHandler = (error, _req, res, _next) => {
  console.error("Error encountered:", error);

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

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "An unexpected internal server error occurred.",
  });
};

module.exports = { errorHandler };

