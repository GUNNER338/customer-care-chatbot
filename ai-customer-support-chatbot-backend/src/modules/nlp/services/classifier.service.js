const geminiService = require("./gemini.service");
const { ALL_INTENTS } = require("../config/intents");

class ClassifierService {
  /**
   * Classifies a user message into one of the EHRS intents.
   * @param {string} message - The user's input chat message.
   * @returns {Promise<{intent: string, confidence: number, reasoning: string}>}
   */
  async classify(message) {
    if (!message || !message.trim()) {
      return {
        intent: "unknown",
        confidence: 0.0,
        reasoning: "User message is empty."
      };
    }

    try {
      const systemInstruction = `
You are a highly accurate HR & Recruitment Assistant Intent Classifier for Elements HR Services (EHRS). Your task is to analyze the user's message and classify it into EXACTLY ONE of the following 18 categories, or select "unknown" if it does not fit any category:

Available Categories:
1. "hiring_request" - Employer requests hiring or recruitment services for specific roles or vacancies.
2. "staffing_services" - Employer asks about staffing solutions, temporary workforce, or contract-to-hire placements.
3. "executive_search" - Employer inquires about executive search, leadership recruiting, or headhunting for senior roles.
4. "talent_acquisition" - Employer seeks strategic assistance, advisory, or solutions for talent acquisition pipelines.
5. "payroll_services" - Employer asks about payroll management, processing, outsourcing, compliance, or payroll cycles.
6. "recruitment_outsourcing" - Employer wants recruitment process outsourcing (RPO) to manage end-to-end recruitment.
7. "talent_mapping" - Employer seeks talent mapping, talent pooling, salary benchmarks, or competitive market analysis.
8. "job_search" - Candidate searches for jobs, vacancies, applications, or career opportunities.
9. "resume_help" - Candidate asks for resume review, feedback, formatting, cv builder, or cv improvement.
10. "interview_preparation" - Candidate wants help, tips, practice questions, or mock interviews.
11. "career_transition" - Candidate seeks guidance on changing career paths, fields, or industries.
12. "salary_negotiation" - Candidate wants advice, strategy, or support on negotiating a salary offer.
13. "application_status" - Candidate checks the status of their job application or recruitment stage.
14. "greeting" - Welcome greetings, hellos, hi, standard opening remarks.
15. "company_information" - Information about Elements HR Services (EHRS), its mission, services, or overview.
16. "office_location" - Physical office branches, branch addresses, or locations.
17. "contact_information" - Contact phone numbers, emails, addresses, or web contact forms.
18. "human_support" - Requests to talk to a live agent, human recruiter, support representative, or coordinator.

19. "unknown" - General inquiries or queries completely unrelated to HR, job search, or recruitment.

Response Rules:
- Select exactly one intent.
- Return valid JSON matching the requested schema.
- The confidence score must be a float between 0.0 and 1.0 representing your certainty.
- IMPORTANT SCORING RULES:
  * If the message is highly ambiguous (e.g., "I need help", "assist me"), set confidence to 0.60.
  * If the message is complete gibberish (e.g., "asdfasdf", "hjkl"), set confidence to 0.20.
- The reasoning should explain why the user message fits the chosen intent.
`;

      const prompt = `
User Message: "${message}"

Please classify this user message. Return ONLY a JSON object matching this schema:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this intent was selected."
}
`;

      const responseText = await geminiService.generate(prompt, systemInstruction, "application/json");
      
      const parsed = JSON.parse(responseText.trim());

      // Validate parsed content
      const intent = ALL_INTENTS.includes(parsed.intent) ? parsed.intent : "unknown";
      const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.95;
      const reasoning = parsed.reasoning || "";

      return {
        intent,
        confidence,
        reasoning
      };
    } catch (error) {
      console.error("ClassifierService error during classification:", error);
      return {
        intent: "unknown",
        confidence: 0.0,
        reasoning: `Error classifying message: ${error.message}`
      };
    }
  }
}

module.exports = new ClassifierService();
