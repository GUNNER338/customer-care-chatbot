const prisma = require('../../config/prisma');

class MemoryContextService {
  /**
   * Builds the recent conversation history to provide as context.
   * Gets the last N messages (e.g., 5 user and 5 bot messages).
   */
  async getRecentConversationContext(conversationId, limit = 10) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Reverse to chronological order
    messages.reverse();

    return messages.map(msg => ({
      sender: msg.senderType === 'USER' ? 'User' : 'Bot',
      text: msg.content
    }));
  }

  /**
   * Compiles the user's active memories into a compact text format.
   */
  formatUserMemoryContext(memories) {
    if (!memories || memories.length === 0) return "No prior memory.";
    
    const candidateContext = [];
    const employerContext = [];
    
    memories.forEach(m => {
      // Only include memories with decent confidence
      if (m.confidence > 0.4) {
        if (m.memoryType === 'candidate') {
          candidateContext.push(`${m.memoryKey}: ${JSON.stringify(m.memoryValue)}`);
        } else if (m.memoryType === 'employer') {
          employerContext.push(`${m.memoryKey}: ${JSON.stringify(m.memoryValue)}`);
        }
      }
    });

    let contextString = "";
    if (candidateContext.length > 0) {
      contextString += `Candidate Profile:\n- ${candidateContext.join('\n- ')}\n\n`;
    }
    if (employerContext.length > 0) {
      contextString += `Employer Profile:\n- ${employerContext.join('\n- ')}\n`;
    }

    return contextString.trim();
  }
}

module.exports = new MemoryContextService();
