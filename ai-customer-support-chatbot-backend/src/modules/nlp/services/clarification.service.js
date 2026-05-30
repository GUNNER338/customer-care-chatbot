const geminiService = require("./gemini.service");

class ClarificationService {
  /**
   * Generates a contextual follow-up clarification question dynamically.
   * @param {string} userMessage - The original ambiguous user message.
   * @param {string} likelyIntent - The intent that was guessed but had medium confidence.
   * @returns {Promise<string>} The generated clarification text.
   */
  async generateClarification(userMessage, likelyIntent = "") {
    try {
      const systemInstruction = `
You are a highly polite and professional HR & Recruitment Assistant for Elements HR Services (EHRS).
The user asked a question or made a statement that was slightly ambiguous.
Your task is to generate a short, friendly follow-up clarification question to help determine their exact needs.
Ask whether they are looking for employer-related services (like hiring talent, staffing, or payroll) or candidate-related services (like job searching, resume review, or interview preparation).
Keep it concise (1-2 sentences). Do not answer the question; only ask for clarification.
`;

      const prompt = `
User Message: "${userMessage}"
Likely Intent Guessed (Low Confidence): "${likelyIntent}"

Generate the clarification question text only. No JSON, no quotes.
`;

      const responseText = await geminiService.generate(prompt, systemInstruction);
      return responseText.trim();
    } catch (error) {
      console.error("ClarificationService failed to generate dynamic clarification:", error);
      // Robust fallback response
      return "I'm not completely sure I understood that. Could you please clarify if you are looking for talent (Employer services) or searching for a job/career support (Candidate services)?";
    }
  }
}

module.exports = new ClarificationService();
