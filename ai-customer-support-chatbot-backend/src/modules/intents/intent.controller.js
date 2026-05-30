const intentService = require("./intent.service");
const {
  createIntentSchema,
  updateIntentSchema,
  createResponseSchema,
  updateResponseSchema,
  uuidParamSchema,
  getResponseQuerySchema,
} = require("./intent.validation");

class IntentController {
  // --- Intent Controllers ---

  getIntents = async (req, res, next) => {
    try {
      const intents = await intentService.getAllIntents();
      res.status(200).json({
        success: true,
        data: intents,
      });
    } catch (error) {
      next(error);
    }
  };

  getIntent = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const intent = await intentService.getIntentById(validatedParams.id);
      res.status(200).json({
        success: true,
        data: intent,
      });
    } catch (error) {
      next(error);
    }
  };

  createIntent = async (req, res, next) => {
    try {
      const validatedBody = createIntentSchema.parse(req.body);
      const intent = await intentService.createIntent(validatedBody);
      res.status(201).json({
        success: true,
        message: "Intent created successfully",
        data: intent,
      });
    } catch (error) {
      next(error);
    }
  };

  updateIntent = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const validatedBody = updateIntentSchema.parse(req.body);
      const intent = await intentService.updateIntent(validatedParams.id, validatedBody);
      res.status(200).json({
        success: true,
        message: "Intent updated successfully",
        data: intent,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteIntent = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      await intentService.deleteIntent(validatedParams.id);
      res.status(200).json({
        success: true,
        message: "Intent deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // --- Response Controllers ---

  getResponses = async (req, res, next) => {
    try {
      const validatedQuery = getResponseQuerySchema.parse(req.query);
      const responses = await intentService.getAllResponses(validatedQuery);
      res.status(200).json({
        success: true,
        data: responses,
      });
    } catch (error) {
      next(error);
    }
  };

  getResponse = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const response = await intentService.getResponseById(validatedParams.id);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  createResponse = async (req, res, next) => {
    try {
      const validatedBody = createResponseSchema.parse(req.body);
      const response = await intentService.createResponse(validatedBody);
      res.status(201).json({
        success: true,
        message: "Response created successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  updateResponse = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      const validatedBody = updateResponseSchema.parse(req.body);
      const response = await intentService.updateResponse(validatedParams.id, validatedBody);
      res.status(200).json({
        success: true,
        message: "Response updated successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteResponse = async (req, res, next) => {
    try {
      const validatedParams = uuidParamSchema.parse(req.params);
      await intentService.deleteResponse(validatedParams.id);
      res.status(200).json({
        success: true,
        message: "Response deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new IntentController();
