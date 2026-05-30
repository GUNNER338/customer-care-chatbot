const candidateRepository = require("./candidate.repository");
const candidateValidation = require("./candidate.validation");
const candidateProfileService = require("./candidate-profile.service");

class CandidateService {
  async getProfile(userId) {
    return candidateRepository.getProfileByUserId(userId);
  }

  async updateProfileFromEntities(userId, entities) {
    const updateData = {};

    if (entities.currentRole) updateData.currentRole = entities.currentRole;
    if (entities.experience !== undefined) {
      const validExp = candidateValidation.validateExperience(entities.experience);
      if (validExp !== null) updateData.experience = validExp;
    }
    if (entities.preferredLocation) updateData.preferredLocation = entities.preferredLocation;
    if (entities.expectedSalary) updateData.expectedSalary = entities.expectedSalary;
    if (entities.noticePeriod) updateData.noticePeriod = entities.noticePeriod;
    if (entities.skills) {
      // Ensure skills is an array
      const skillsArr = Array.isArray(entities.skills) ? entities.skills : [entities.skills];
      updateData.skills = skillsArr;
    }

    if (Object.keys(updateData).length === 0) {
      // No updates needed
      return this.getProfile(userId);
    }

    // Save initial update
    let profile = await candidateRepository.upsertProfile(userId, updateData);

    // Calculate Completion
    const completion = candidateProfileService.calculateCompletion(profile);
    
    // Update Completion
    profile = await candidateRepository.upsertProfile(userId, { profileCompletion: completion });

    return profile;
  }

  async updateProfileDirectly(userId, data) {
    let profile = await candidateRepository.upsertProfile(userId, data);
    const completion = candidateProfileService.calculateCompletion(profile);
    profile = await candidateRepository.upsertProfile(userId, { profileCompletion: completion });
    return profile;
  }

  async getCompletion(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) return { completion: 0 };
    return { completion: profile.profileCompletion };
  }

  async getSummary(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) return { summary: null };
    return { summary: candidateProfileService.generateSummary(profile) };
  }

  async getStats() {
    return candidateRepository.getStats();
  }
}

module.exports = new CandidateService();
