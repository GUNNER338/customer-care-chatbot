const leadValidation = require("./lead.validation");

class LeadStateService {
  /**
   * Evaluates the current state of a lead for a conversation
   * @param {Array} historyEntities - Array of entity objects previously extracted
   * @param {Object} currentEntities - Entities extracted in the current message
   * @returns {Object} result
   */
  evaluateState(historyEntities = [], currentEntities = {}) {
    // 1. Aggregate all entities
    const aggregatedEntities = {};
    
    for (const ent of historyEntities) {
      // In db they are stored as entityKey and entityValue
      if (ent.entityKey && ent.entityValue) {
        aggregatedEntities[ent.entityKey] = ent.entityValue;
      }
    }

    // Merge current entities (they overwrite older ones if duplicate)
    for (const [key, value] of Object.entries(currentEntities)) {
      aggregatedEntities[key] = value;
    }

    // 2. Validate
    const isQualified = leadValidation.isLeadQualified(aggregatedEntities);
    const missingFields = leadValidation.getMissingRequiredFields(aggregatedEntities);

    return {
      aggregatedEntities,
      isQualified,
      missingFields,
      nextQuestion: isQualified ? null : this.generateFollowUpQuestion(missingFields)
    };
  }

  generateFollowUpQuestion(missingFields) {
    if (!missingFields || missingFields.length === 0) return null;

    // Prioritize asking for company name, then name, then email/phone
    if (missingFields.includes("companyName")) {
      return "What is your company name?";
    }
    
    if (missingFields.includes("name")) {
      return "Could you please provide your name or the name of the contact person?";
    }

    if (missingFields.includes("email")) {
      return "What email address or phone number should our recruitment team contact?";
    }

    // Fallback
    return "Could you provide some more details about your requirement?";
  }
}

module.exports = new LeadStateService();
