class KeywordService {
  /**
   * High-speed local keyword matcher to avoid hitting Gemini for simple/obvious queries.
   * @param {string} message - User message.
   * @returns {{intent: string, confidence: number}}
   */
  classify(message) {
    if (!message) return { intent: "unknown", confidence: 0.0 };
    
    const text = message.toLowerCase().trim();

    // Map regex patterns to intents
    const patterns = [
      { intent: "greeting", regex: /^(hello|hi|hey|greetings|good morning|good afternoon)\b/i },
      { intent: "human_support", regex: /\b(human|agent|recruiter|person|connect recruiter|talk to someone|live agent|customer service)\b/i },
      { intent: "career_transition", regex: /\b(career change|transition|new industry)\b/i },
      { intent: "salary_negotiation", regex: /\b(negotiate|salary offer|counter offer)\b/i },
      { intent: "resume_help", regex: /\b(resume|cv|resume review|cv review|format resume)\b/i },
      { intent: "interview_preparation", regex: /\b(interview|mock interview|interview prep)\b/i },
      { intent: "application_status", regex: /\b(application status|job status|status of my application|application update)\b/i },
      { intent: "job_search", regex: /\b(job|jobs|career|careers|vacancy|vacancies|find work|looking for a job)\b/i },
      { intent: "hiring_request", regex: /\b(hire|hiring|recruit|need developers|need staff)\b/i },
      { intent: "staffing_services", regex: /\b(staff|staffing|temp staff|temporary staff)\b/i },
      { intent: "executive_search", regex: /\b(executive|headhunter|senior role|leadership)\b/i },
      { intent: "payroll_services", regex: /\b(payroll|salary processing|pay cycle)\b/i },
      { intent: "recruitment_outsourcing", regex: /\b(outsourcing|rpo)\b/i },
      { intent: "talent_mapping", regex: /\b(talent mapping|salary benchmark)\b/i },
      { intent: "company_information", regex: /\b(about the company|who are you|what do you do|company info)\b/i },
      { intent: "office_location", regex: /\b(office|location|branch|where are you located)\b/i },
      { intent: "contact_information", regex: /\b(contact|email|phone number|call you)\b/i }
    ];

    for (const item of patterns) {
      if (item.regex.test(text)) {
        return { intent: item.intent, confidence: 0.95 };
      }
    }

    return { intent: "unknown", confidence: 0.0 };
  }
}

module.exports = new KeywordService();
