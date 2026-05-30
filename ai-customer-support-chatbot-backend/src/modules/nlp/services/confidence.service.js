class ConfidenceService {
  /**
   * Evaluates classification confidence and resolves intent using confidence thresholds.
   * @param {string} intent - The classified intent name.
   * @param {number} confidence - The classification certainty score (0.0 to 1.0).
   * @returns {{intent: string}} Resolved intent object.
   */
  evaluate(intent, confidence) {
    if (confidence > 0.75) {
      return {
        intent
      };
    } else if (confidence >= 0.50 && confidence <= 0.75) {
      return {
        intent: "clarification_needed"
      };
    } else {
      return {
        intent: "human_support"
      };
    }
  }
}

module.exports = new ConfidenceService();
