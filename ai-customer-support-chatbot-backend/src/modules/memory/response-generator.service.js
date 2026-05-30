const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ResponseGeneratorService {
  /**
   * Generates a hyper-personalized response using Gemini.
   * 
   * @param {string} staticResponse The baseline/fallback response.
   * @param {string} intent The detected user intent.
   * @param {string} userMemoryContext A stringified summary of the user's long-term memory profile.
   * @param {Array} recentMessagesContext An array of recent messages.
   * @returns {string} The personalized response.
   */
  async generatePersonalizedResponse(staticResponse, intent, userMemoryContext, recentMessagesContext) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Convert recent messages into a readable text format for prompt
      const conversationHistory = recentMessagesContext
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');

      const prompt = `
You are an expert AI HR & Recruitment Assistant named Elements HR Bot.
Your task is to take a generic system response and rewrite it into a highly personalized, conversational, and helpful response.

User Memory Profile (Long-term Context):
${userMemoryContext}

Recent Conversation History:
${conversationHistory}

System Intent: ${intent}
Generic System Response: "${staticResponse}"

Instructions:
1. Rewrite the "Generic System Response" to sound natural and conversational.
2. If the user's Role, Skills, or Experience is mentioned in the Memory Profile, seamlessly weave that into your response to show that you remember them (e.g., "As a React Developer with 4 years of experience...").
3. Do NOT make up new facts or job opportunities. Stick to the constraints of the generic response, just personalize its delivery.
4. If there is no User Memory Profile, just make the generic response sound friendly.
5. Do NOT output markdown, just plain conversational text.
6. Keep it concise, similar in length to the original response unless personalization requires slightly more context.

Personalized Response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean up potential markdown formatting that Gemini might sneak in
      text = text.replace(/^\*?\*?Personalized Response:\*?\*?\s*/i, '');

      return text;
    } catch (error) {
      console.error('Error generating personalized response via Gemini:', error);
      // Fallback to the static system response if Gemini fails
      return staticResponse;
    }
  }
}

module.exports = new ResponseGeneratorService();
