class ClassifierService {
  constructor() {
    this.intentKeywords = {
      greeting: [
        "hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy", "whats up"
      ],
      refund_request: [
        "refund", "money back", "cancel order", "reimbursement", "cancellation", "chargeback", "cancel my subscription", "refunds", "cancel"
      ],
      order_tracking: [
        "track order", "where is my order", "shipment", "delivery status", "package status", "tracking number", "shipped", "when will it arrive", "track", "tracking"
      ],
      password_reset: [
        "password reset", "reset password", "forgot password", "change password", "cannot log in", "reset credentials", "reset my login", "password", "reset", "sign in", "signing in", "login", "log in", "account access", "cannot access account", "unable to access", "can't log in"
      ],
      human_support: [
        "human support", "speak to human", "live agent", "support agent", "representative", "real person", "talk to agent", "human", "agent", "representative"
      ],
      product_information: [
        "product info", "about product", "specifications", "features", "details", "catalog", "warranty", "product"
      ],
      billing_issue: [
        "billing", "invoice", "payment failed", "charged twice", "wrong charge", "double billing", "overcharged", "receipt", "payment method", "payment", "charge"
      ],
      technical_support: [
        "technical support", "error", "bug", "app crash", "broken link", "not loading", "glitch", "website down", "crash", "technical"
      ]
    };
  }

  classify(text) {
    if (!text) {
      return { intent: "unknown", confidence: 0 };
    }

    const normalizedText = text.toLowerCase().trim();

    let bestIntent = "unknown";
    let maxMatches = 0;

    // Check each intent's keywords/phrases
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (keyword.includes(" ")) {
          // Phrase match (exact substring)
          if (normalizedText.includes(keyword)) {
            matches += 2; // heavier weight for phrase matches!
          }
        } else {
          // Word match with word boundaries to avoid false positives (like "hi" in "shipping")
          const regex = new RegExp(`\\b${keyword}\\b`, "i");
          if (regex.test(normalizedText)) {
            matches += 1;
          }
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = intent;
      }
    }

    if (maxMatches === 0) {
      return { intent: "unknown", confidence: 0 };
    }

    // Assign standard confidence of 0.85 (0.90 if multi-phrase match occurred)
    const confidence = maxMatches >= 2 ? 0.90 : 0.85;

    return {
      intent: bestIntent,
      confidence
    };
  }
}

module.exports = new ClassifierService();
