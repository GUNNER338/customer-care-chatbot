const memoryRepository = require('./memory.repository');
const memoryConfidenceService = require('./memory-confidence.service');

class MemoryEngineService {
  
  /**
   * Evaluates and stores meaningful extracted entities into UserMemory.
   * Filters out low-value or purely transactional keys.
   */
  async processAndStoreMemory(userId, entityType, entities, intentConfidence = 0.9) {
    if (!userId || !entities || Object.keys(entities).length === 0) return;

    // Keys we do NOT want to store in long-term memory because they are highly contextual or temporary
    const ignoredKeys = ['time', 'date', 'amount', 'greeting'];

    for (const [key, value] of Object.entries(entities)) {
      if (ignoredKeys.includes(key)) continue;
      
      // Filter out empty values
      if (value === null || value === undefined || value === "") continue;

      const initialConfidence = memoryConfidenceService.evaluateInitialConfidence(key, intentConfidence);
      
      await memoryRepository.storeMemory(
        userId,
        entityType, // "candidate" or "employer"
        key,
        value,
        initialConfidence
      );
    }
  }

  /**
   * Retrieves all active memories for a user, applying confidence decay.
   * Memories with a confidence that drops below a certain threshold are ignored or deleted.
   */
  async getActiveMemories(userId) {
    const rawMemories = await memoryRepository.getMemoriesByUser(userId);
    const activeMemories = [];

    for (const memory of rawMemories) {
      const lifespan = memoryConfidenceService.getMemoryLifespan(memory.memoryKey);
      const currentConfidence = memoryConfidenceService.decayConfidence(
        memory.confidence, 
        memory.lastUsedAt, 
        lifespan
      );

      // If confidence drops too low, we might delete it or just ignore it.
      if (currentConfidence < 0.2) {
        // Optional: clean up dead memories asynchronously
        memoryRepository.deleteMemory(memory.id).catch(err => console.error("Memory cleanup error:", err));
        continue;
      }

      // Update if significant decay happened but still active
      if (currentConfidence < memory.confidence - 0.1) {
        // We could update the DB here, but for read-heavy operations, 
        // we might just use the calculated confidence in-memory.
      }

      // Attach calculated current confidence
      activeMemories.push({
        ...memory,
        currentConfidence
      });
    }

    return activeMemories;
  }
}

module.exports = new MemoryEngineService();
