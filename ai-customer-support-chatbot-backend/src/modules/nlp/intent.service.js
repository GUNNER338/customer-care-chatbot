const keywordService = require("./services/keyword.service");
const classifierService = require("./services/classifier.service");
const confidenceService = require("./services/confidence.service");
const clarificationService = require("./services/clarification.service");
const intentRepository = require("../intents/intent.repository");

class NlpIntentService {
  async processMessage(messageText) {
    if (!messageText) {
      return {
        intent: "unknown",
        confidence: 0.0,
        reasoning: "Empty message",
        response: null
      };
    }

    // 1. High-speed local keyword classifier
    let classification = keywordService.classify(messageText);
    let reasoning = "Local keyword match";

    // 2. Hybrid Fallback: Invoke Gemini if keyword match is low/unknown
    if (classification.intent === "unknown" || classification.confidence < 0.80) {
      console.log("Keyword classifier confidence is below threshold. Falling back to Gemini AI classifier...");
      classification = await classifierService.classify(messageText);
      reasoning = classification.reasoning || "Gemini generative classification";
    }

    // 3. Evaluate Confidence Thresholds
    const evaluation = confidenceService.evaluate(classification.intent, classification.confidence);

    // 4. Handle Medium / Low Confidence Actions
    if (evaluation.intent === "clarification_needed") {
      const clarificationText = await clarificationService.generateClarification(messageText, classification.intent);
      return {
        intent: "clarification_needed",
        confidence: classification.confidence,
        reasoning,
        response: clarificationText
      };
    }

    // For human_support or correctly resolved intents, we query the DB to get the standard responses.
    const finalIntent = evaluation.intent; 

    // 5. High Confidence -> Fetch predefined response from Database
    try {
      const intentRecord = await intentRepository.findByName(finalIntent);
      
      if (!intentRecord) {
        return {
          intent: "unknown",
          confidence: 0,
          reasoning: "Intent not found in database",
          response: null
        };
      }

      const responses = await intentRepository.findAllResponses({
        intentId: intentRecord.id
      });

      if (!responses || responses.length === 0) {
        return {
          intent: finalIntent,
          confidence: classification.confidence,
          reasoning,
          response: null
        };
      }

      // Select a random response variation
      const randomIndex = Math.floor(Math.random() * responses.length);
      const selectedResponse = responses[randomIndex];

      return {
        intent: finalIntent,
        confidence: classification.confidence,
        reasoning,
        response: selectedResponse.content
      };
    } catch (error) {
      console.error("Error in NlpIntentService while querying intent/responses:", error);
      return {
        intent: finalIntent,
        confidence: classification.confidence,
        reasoning: "Database error",
        response: null
      };
    }
  }
}

module.exports = new NlpIntentService();
