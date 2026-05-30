/**
 * Service to calculate confidence scores and expiration rules for memory entities.
 */
class MemoryConfidenceService {
  
  /**
   * Evaluates the initial confidence of an extracted entity based on the source and NLP confidence.
   * Explicit statements from users should be high confidence (1.0).
   * Inferred data from resumes or other contexts might be lower (e.g. 0.8).
   */
  evaluateInitialConfidence(entityKey, nlpConfidence) {
    let baseConfidence = nlpConfidence || 0.8;
    
    // Explicit user statements generally have high intent confidence
    if (baseConfidence > 0.9) {
      return 1.0;
    }
    
    return baseConfidence;
  }

  /**
   * Decides whether a memory key should be permanent, semi-permanent, or temporary.
   */
  getMemoryLifespan(entityKey) {
    const permanentKeys = ['companyName', 'role', 'experience', 'skills', 'name', 'email', 'phone'];
    const semiPermanentKeys = ['preferredLocation', 'salaryExpectations'];
    const temporaryKeys = ['hiringVolume', 'currentRequirement'];

    if (permanentKeys.includes(entityKey)) return 'PERMANENT';
    if (semiPermanentKeys.includes(entityKey)) return 'SEMI_PERMANENT';
    if (temporaryKeys.includes(entityKey)) return 'TEMPORARY';
    
    return 'SEMI_PERMANENT';
  }

  /**
   * Adjusts the confidence of an existing memory based on how long ago it was last used/updated.
   * Old temporary information decays quickly. Permanent info stays strong.
   */
  decayConfidence(confidence, lastUsedAt, lifespan) {
    if (!lastUsedAt) return confidence;
    
    const daysOld = (new Date() - new Date(lastUsedAt)) / (1000 * 60 * 60 * 24);
    
    if (lifespan === 'PERMANENT') {
      return Math.max(0.8, confidence - (daysOld * 0.001));
    }
    if (lifespan === 'SEMI_PERMANENT') {
      return Math.max(0.5, confidence - (daysOld * 0.01));
    }
    if (lifespan === 'TEMPORARY') {
      return Math.max(0.1, confidence - (daysOld * 0.1));
    }
    
    return confidence;
  }
}

module.exports = new MemoryConfidenceService();
