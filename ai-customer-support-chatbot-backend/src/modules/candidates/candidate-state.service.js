class CandidateStateService {
  constructor() {
    this.ESSENTIAL_FIELDS = ["currentRole", "experience", "preferredLocation", "expectedSalary"];
  }

  evaluateState(profile) {
    if (!profile) return { isComplete: false, nextQuestion: "Could you tell me a bit about your professional background?" };

    const missingFields = this.getMissingEssentialFields(profile);
    const isComplete = profile.profileCompletion >= 80;

    return {
      missingFields,
      isComplete,
      nextQuestion: isComplete ? null : this.generateFollowUpQuestion(missingFields)
    };
  }

  getMissingEssentialFields(profile) {
    const missing = [];
    for (const field of this.ESSENTIAL_FIELDS) {
      if (profile[field] === null || profile[field] === undefined || profile[field] === "") {
        missing.push(field);
      }
    }
    return missing;
  }

  generateFollowUpQuestion(missingFields) {
    if (!missingFields || missingFields.length === 0) return null;

    if (missingFields.includes("currentRole")) {
      return "What is your current or target job role?";
    }
    
    if (missingFields.includes("experience")) {
      return "How many years of professional experience do you have?";
    }

    if (missingFields.includes("preferredLocation")) {
      return "What location are you targeting for your next opportunity?";
    }

    if (missingFields.includes("expectedSalary")) {
      return "What is your expected compensation or salary range?";
    }

    return "Could you provide some more details about your professional profile?";
  }
}

module.exports = new CandidateStateService();
