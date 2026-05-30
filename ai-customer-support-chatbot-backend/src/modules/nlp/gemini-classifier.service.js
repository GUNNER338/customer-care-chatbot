const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiClassifierService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  async classify(messageText) {
    if (!messageText) {
      return { intent: "unknown", confidence: 0 };
    }

    if (!this.genAI) {
      console.warn("GeminiClassifierService: GEMINI_API_KEY is not configured in environment variables. Falling back to unknown classification.");
      return { intent: "unknown", confidence: 0 };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const systemInstruction = `
You are a highly accurate Customer Support Intent Classifier. Your task is to analyze the user's customer service message and classify it into EXACTLY ONE of the following 8 categories, or select "unknown" if it does not fit any category:

Available Categories:
1. "greeting" - Welcome greetings, hellos, hi, standard opening remarks.
2. "refund_request" - Requests for refunds, money back, cancellation of orders, or billing chargebacks.
3. "order_tracking" - Inquiries about order status, tracking numbers, package delivery times, or shipments.
4. "password_reset" - Password resets, password recovery, login help, or changing account credentials.
5. "human_support" - Explicit requests to speak with a human support agent, representative, live chat operator, or real person.
6. "product_information" - Questions about product details, catalog, features, warranties, sizes, or specifications.
7. "billing_issue" - Problems with payment failures, invoices, wrong charges, duplicate billing, or payment methods.
8. "technical_support" - Platform issues, application crashes, technical bugs, website down, glitch, or loading failures.
9. "unknown" - General inquiries, unrelated chatter, weather questions, or queries that do not fit any of the above support categories.

Response Rules:
- You must return a valid JSON object matching the JSON schema.
- Do not add markdown backticks (\`\`\`json) or any conversational text around the JSON.
- The confidence score should be a float between 0.0 and 1.0 representing your classification certainty.

Required JSON Output Schema:
{
  "intent": "intent_name_string",
  "confidence": 0.95
}
`;

      const prompt = `
Message to classify: "${messageText}"

Please classify this message and output the classification JSON.
`;

      const result = await model.generateContent([systemInstruction, prompt]);
      const response = await result.response;
      const jsonText = response.text();

      const parsed = JSON.parse(jsonText.trim());

      // Validate parsed intent is a known category
      const validIntents = [
        "greeting", "refund_request", "order_tracking", "password_reset",
        "human_support", "product_information", "billing_issue", "technical_support", "unknown"
      ];

      if (!parsed || !parsed.intent || !validIntents.includes(parsed.intent)) {
        return { intent: "unknown", confidence: 0 };
      }

      return {
        intent: parsed.intent,
        confidence: parsed.confidence || 0.95
      };

    } catch (error) {
      console.error("GeminiClassifierService Error during API call:", error);
      return { intent: "unknown", confidence: 0 };
    }
  }
}

module.exports = new GeminiClassifierService();
