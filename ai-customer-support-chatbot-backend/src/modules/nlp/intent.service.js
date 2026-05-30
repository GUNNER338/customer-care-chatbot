const classifierService = require("./classifier.service");
const intentRepository = require("../intents/intent.repository");

class NlpIntentService {
  async processMessage(messageText) {
    if (!messageText) {
      return {
        intent: "unknown",
        confidence: 0,
        response: null
      };
    }

    // 1. Classify the user's message
    const classification = classifierService.classify(messageText);

    if (classification.intent === "unknown" || classification.confidence === 0) {
      return {
        intent: "unknown",
        confidence: 0,
        response: null
      };
    }

    try {
      // 2. Fetch the corresponding intent from the database
      const intentRecord = await intentRepository.findByName(classification.intent);
      if (!intentRecord) {
        return {
          intent: "unknown",
          confidence: 0,
          response: null
        };
      }

      // 3. Fetch all predefined responses for this intent
      const responses = await intentRepository.findAllResponses({
        intentId: intentRecord.id
      });

      if (!responses || responses.length === 0) {
        return {
          intent: classification.intent,
          confidence: classification.confidence,
          response: null
        };
      }

      // 4. Select a response variation at random
      const randomIndex = Math.floor(Math.random() * responses.length);
      const selectedResponse = responses[randomIndex];

      return {
        intent: classification.intent,
        confidence: classification.confidence,
        response: selectedResponse.content
      };
    } catch (error) {
      console.error("Error in NlpIntentService while querying intent/responses:", error);
      // Fallback gracefully rather than crashing the chat dialog
      return {
        intent: classification.intent,
        confidence: classification.confidence,
        response: null
      };
    }
  }
}

module.exports = new NlpIntentService();
