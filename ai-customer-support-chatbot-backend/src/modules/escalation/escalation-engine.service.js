class EscalationEngineService {
  /**
   * Evaluates current conversational context to determine if human escalation is required.
   * @param {string} messageText - The raw user message
   * @param {string} intent - Current resolved intent
   * @param {object} entities - Entities extracted from the current message
   * @param {Array} historyClassifications - Array of previous MessageClassifications
   * @returns {{shouldEscalate: boolean, priority: string, reason: string|null}}
   */
  evaluate(messageText, intent, entities = {}, historyClassifications = []) {
    // Rule 1: Explicit Human Request
    if (intent === "human_support") {
      return {
        shouldEscalate: true,
        priority: "MEDIUM",
        reason: "Direct request for human support"
      };
    }

    // Rule 2: User Frustration
    if (intent === "frustration") {
      return {
        shouldEscalate: true,
        priority: "MEDIUM",
        reason: "User frustration detected"
      };
    }

    // Rule 3: Multiple clarification failures
    // Look at the last 3 classifications
    if (historyClassifications.length >= 3) {
      const recent = historyClassifications.slice(-3);
      const lowConfidenceCount = recent.filter(c => c.confidence < 0.50).length;
      if (lowConfidenceCount === 3 || (intent === "unknown" && recent.filter(c => c.intent === "unknown").length >= 2)) {
         return {
           shouldEscalate: true,
           priority: "MEDIUM",
           reason: "Repeated low confidence or unknown intents"
         };
      }
    }

    // Check raw message and entities for Rules 4 and 5
    const textContext = `${messageText || ""} ${JSON.stringify(entities)}`.toLowerCase();
    
    // Urgent Hiring requests
    const isUrgent = /(urgent|immediately|asap|this week|right now)/i.test(textContext);
    if (isUrgent) {
      return {
        shouldEscalate: true,
        priority: "URGENT",
        reason: "Urgent hiring requirement detected"
      };
    }

    // High-Value Employer Leads
    const isExecutive = /(cto|ceo|cfo|executive|vp|director|president)/i.test(textContext);
    const isBulkHiring = /(100|50|\b(fifty|hundred)\b)/i.test(textContext);
    
    if (isExecutive || isBulkHiring || intent === "executive_search") {
      return {
        shouldEscalate: true,
        priority: "HIGH",
        reason: "High-value employer requirement (Executive search or bulk hiring)"
      };
    }

    // No escalation trigger matched
    return {
      shouldEscalate: false,
      priority: null,
      reason: null
    };
  }
}

module.exports = new EscalationEngineService();
