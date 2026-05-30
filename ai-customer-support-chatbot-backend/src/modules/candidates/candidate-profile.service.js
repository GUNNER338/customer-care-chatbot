class CandidateProfileService {
  calculateCompletion(profile) {
    if (!profile) return 0;
    
    let score = 0;
    
    // Role = 15%
    if (profile.currentRole) score += 15;
    
    // Experience = 15%
    if (profile.experience !== null && profile.experience !== undefined) score += 15;
    
    // Skills = 20%
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) score += 20;
    
    // Location = 15%
    if (profile.preferredLocation || profile.currentLocation) score += 15;
    
    // Salary = 15%
    if (profile.expectedSalary) score += 15;
    
    // Resume = 20%
    if (profile.resumeUrl) score += 20;
    
    return Math.min(score, 100);
  }

  generateSummary(profile) {
    if (!profile) return null;

    const parts = [];
    
    if (profile.currentRole) {
      if (profile.experience !== null && profile.experience !== undefined) {
        parts.push(`${profile.currentRole} with ${profile.experience} years of experience`);
      } else {
        parts.push(`${profile.currentRole}`);
      }
    } else if (profile.experience !== null && profile.experience !== undefined) {
      parts.push(`Professional with ${profile.experience} years of experience`);
    }

    if (profile.preferredLocation) {
      parts.push(`seeking opportunities in ${profile.preferredLocation}`);
    } else if (profile.currentLocation) {
      parts.push(`based in ${profile.currentLocation}`);
    }

    if (profile.expectedSalary) {
      parts.push(`with an expected compensation of ${profile.expectedSalary}`);
    }

    if (parts.length > 0) {
      return parts.join(" ") + ".";
    }
    
    return "Profile is missing essential information to generate a summary.";
  }
}

module.exports = new CandidateProfileService();
