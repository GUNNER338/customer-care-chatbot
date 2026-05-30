const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  /**
   * Generates content using the Gemini-2.5-flash model.
   * @param {string|Array} prompt - Prompt or parts array for the generation.
   * @param {string} [systemInstruction] - Optional system system instructions to steer the model behavior.
   * @param {string} [responseMimeType] - Optional response MIME type (e.g. 'application/json').
   * @returns {Promise<string>} The generated text.
   */
  async generate(prompt, systemInstruction = null, responseMimeType = null, retries = 3) {
    if (!this.genAI) {
      const errMsg = "GeminiService: GEMINI_API_KEY is not configured in the environment variables.";
      console.warn(errMsg);
      throw new Error(errMsg);
    }

    try {
      const modelOptions = {
        model: "gemini-2.5-flash",
      };

      const generationConfig = {};

      if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
      }

      if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
      }

      const model = this.genAI.getGenerativeModel(modelOptions);

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: Object.keys(generationConfig).length ? generationConfig : undefined
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.status === 429 && retries > 0) {
        console.warn(`Gemini API Rate limit hit. Retrying in 10s... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this.generate(prompt, systemInstruction, responseMimeType, retries - 1);
      }
      console.error("GeminiService Error during generation API call:", error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
