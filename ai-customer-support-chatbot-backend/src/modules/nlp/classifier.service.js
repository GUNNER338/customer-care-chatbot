// Using built-in fetch (Node 18+)

/**
 * GeminiClassifierService
 * Provides intent classification using Gemini Pro model.
 *
 * Intents are defined for the Elements HR Services (EHRS) domain.
 */
class GeminiClassifierService {
  constructor() {
    // List of all possible intents for EHRS
    this.intents = [
      // Employer Side
      "hiring_request",
      "staffing_services",
      "executive_search",
      "talent_acquisition",
      "payroll_services",
      "recruitment_outsourcing",
      "talent_mapping",
      // Candidate Side
      "job_search",
      "resume_help",
      "interview_preparation",
      "career_transition",
      "salary_negotiation",
      "application_status",
      // General
      "greeting",
      "company_information",
      "office_location",
      "contact_information",
      "human_support",
    ];
    this.apiKey = process.env.GEMINI_API_KEY;
this.endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  /** Build prompt for Gemini classification */
  buildPrompt(text) {
    const intentList = this.intents.map(i => `- ${i}`).join("\n");
    return `You are an HR & Recruitment assistant. Classify the following user message into one of the intents below and provide a confidence score (0.0-1.0). Return ONLY a JSON object with keys "intent" and "confidence".

Intents:\n${intentList}\n\nUser message: "${text}"`;
  }

  async callGemini(prompt) {
    const url = `${this.endpoint}?key=${this.apiKey}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.0, responseMimeType: "application/json" },
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return JSON.parse(jsonStr);
  }

  /** Classify user text and return intent with confidence */
  async classify(text) {
    if (!text) return { intent: "unknown", confidence: 0 };
    const prompt = this.buildPrompt(text);
    try {
      const result = await this.callGemini(prompt);
      const confidence = Math.min(Math.max(parseFloat(result.confidence), 0), 1);
      const intent = this.intents.includes(result.intent) ? result.intent : "unknown";
      if (confidence > 0.75) {
        return { intent, confidence };
      }
      return { intent: "clarification_needed", confidence };
    } catch (e) {
      console.error("Gemini classification failed:", e);
      return { intent: "unknown", confidence: 0 };
    }
  }
}

module.exports = new GeminiClassifierService();
