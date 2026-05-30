const { ENTITY_TYPES, ENTITY_KEYS, REGEX_PATTERNS } = require("./entity.constants");
const entityValidation = require("./entity.validation");
const geminiService = require("../services/gemini.service");

// Employer intent lists
const EMPLOYER_INTENTS = [
  "hiring_request", "staffing_services", "executive_search", 
  "talent_acquisition", "payroll_services", "recruitment_outsourcing", "talent_mapping"
];

const CANDIDATE_INTENTS = [
  "job_search", "resume_help", "interview_preparation", 
  "career_transition", "salary_negotiation", "application_status"
];

class EntityService {
  /**
   * Extracts entities from a message using a hybrid approach.
   * @param {string} message - User message
   * @param {string} intent - The classified intent
   * @returns {Promise<Object>} Extracted and validated entities
   */
  async extractEntities(message, intent) {
    if (!message || intent === "unknown") return {};

    const expectedKeys = this._getExpectedKeys(intent);
    if (expectedKeys.length === 0) return {};

    let extracted = {};

    // --- Layer 1: Regex Extraction ---
    if (expectedKeys.includes(ENTITY_KEYS.EMAIL)) {
      const match = message.match(REGEX_PATTERNS.EMAIL);
      if (match) extracted[ENTITY_KEYS.EMAIL] = match[0];
    }
    if (expectedKeys.includes(ENTITY_KEYS.PHONE)) {
      const match = message.match(REGEX_PATTERNS.PHONE);
      if (match) extracted[ENTITY_KEYS.PHONE] = match[0];
    }
    if (expectedKeys.includes(ENTITY_KEYS.EXPERIENCE)) {
      const match = message.match(REGEX_PATTERNS.EXPERIENCE);
      if (match) extracted[ENTITY_KEYS.EXPERIENCE] = match[1];
    }
    if (expectedKeys.includes(ENTITY_KEYS.NOTICE_PERIOD)) {
      const match = message.match(REGEX_PATTERNS.NOTICE_PERIOD);
      if (match) extracted[ENTITY_KEYS.NOTICE_PERIOD] = match[0];
    }

    // Determine missing keys
    const missingKeys = expectedKeys.filter(key => !extracted[key]);

    // --- Layer 2: Gemini Extraction ---
    if (missingKeys.length > 0) {
      const geminiData = await this._extractWithGemini(message, intent, missingKeys);
      // Merge results, giving precedence to Gemini if it found something Regex missed
      for (const [key, value] of Object.entries(geminiData)) {
        if (value !== null && value !== undefined && value !== "") {
          extracted[key] = value;
        }
      }
    }

    // --- Validate and Clean ---
    const finalEntities = {};
    for (const key of expectedKeys) {
      const validatedValue = entityValidation.validate(key, extracted[key]);
      if (validatedValue !== null) {
        finalEntities[key] = validatedValue;
      }
    }

    return finalEntities;
  }

  _getExpectedKeys(intent) {
    const keys = [ENTITY_KEYS.NAME, ENTITY_KEYS.EMAIL, ENTITY_KEYS.PHONE]; // Always look for contact
    
    if (EMPLOYER_INTENTS.includes(intent)) {
      keys.push(ENTITY_KEYS.COMPANY_NAME, ENTITY_KEYS.HIRING_COUNT, ENTITY_KEYS.JOB_TITLE, ENTITY_KEYS.LOCATION, ENTITY_KEYS.EMPLOYMENT_TYPE);
    } else if (CANDIDATE_INTENTS.includes(intent)) {
      keys.push(ENTITY_KEYS.SKILLS, ENTITY_KEYS.EXPERIENCE, ENTITY_KEYS.CURRENT_ROLE, ENTITY_KEYS.PREFERRED_LOCATION, ENTITY_KEYS.EXPECTED_SALARY, ENTITY_KEYS.NOTICE_PERIOD);
    }

    return keys;
  }

  async _extractWithGemini(message, intent, missingKeys) {
    const systemInstruction = `
You are a highly accurate HR Data Extraction Assistant for Elements HR Services (EHRS).
Your task is to extract specific information from the user's message.
Return ONLY valid JSON matching the requested keys.
Do not extract information that is not present in the text (return null for missing values).
For 'employmentType', detect if it is Permanent, Contract, Temporary, or Internship.
For 'skills', return an array of strings.
`;
    
    const prompt = `
User Message: "${message}"
Intent Context: "${intent}"

Extract the following keys if present:
${missingKeys.join(", ")}

Respond ONLY with a JSON object containing ONLY the keys you found. Example:
{
  "companyName": "ABC Technologies",
  "skills": ["React", "Node.js"],
  "location": "Gurgaon"
}
`;
    
    try {
      const response = await geminiService.generate(prompt, systemInstruction, "application/json");
      return JSON.parse(response.trim());
    } catch (err) {
      console.error("Gemini Entity Extraction failed:", err);
      return {};
    }
  }

  getEntityTypeFromIntent(intent) {
    if (EMPLOYER_INTENTS.includes(intent)) return ENTITY_TYPES.EMPLOYER;
    if (CANDIDATE_INTENTS.includes(intent)) return ENTITY_TYPES.CANDIDATE;
    return ENTITY_TYPES.CONTACT;
  }
}

module.exports = new EntityService();
