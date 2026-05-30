const memoryRepository = require('./memory.repository');
const memoryEngine = require('./memory-engine.service');
const prismaClient = require('../../config/prisma');

class MemoryController {
  
  async getMemories(req, res) {
    try {
      const dbUser = await prismaClient.user.findUnique({ 
        where: { firebaseUid: req.user.uid } 
      });
      
      if (!dbUser) return res.status(404).json({ success: false, error: 'User not found' });

      // Gets active memories and calculates their current confidence
      const memories = await memoryEngine.getActiveMemories(dbUser.id);
      
      return res.status(200).json({ success: true, data: memories });
    } catch (error) {
      console.error("Get Memories Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to fetch memories' });
    }
  }

  async getMemoryById(req, res) {
    try {
      const dbUser = await prismaClient.user.findUnique({ 
        where: { firebaseUid: req.user.uid } 
      });
      if (!dbUser) return res.status(404).json({ success: false, error: 'User not found' });

      const memory = await prismaClient.userMemory.findFirst({
        where: { id: req.params.id, userId: dbUser.id }
      });
      
      if (!memory) return res.status(404).json({ success: false, error: 'Memory not found' });
      
      return res.status(200).json({ success: true, data: memory });
    } catch (error) {
      console.error("Get Memory Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to fetch memory' });
    }
  }

  async updateMemory(req, res) {
    try {
      const dbUser = await prismaClient.user.findUnique({ 
        where: { firebaseUid: req.user.uid } 
      });
      if (!dbUser) return res.status(404).json({ success: false, error: 'User not found' });

      const { memoryValue } = req.body;
      if (!memoryValue) {
        return res.status(400).json({ success: false, error: 'memoryValue is required' });
      }

      // Ensure the user owns this memory
      const existing = await prismaClient.userMemory.findFirst({
        where: { id: req.params.id, userId: dbUser.id }
      });
      if (!existing) return res.status(404).json({ success: false, error: 'Memory not found' });

      const updated = await prismaClient.userMemory.update({
        where: { id: req.params.id },
        data: { memoryValue, confidence: 1.0, lastUsedAt: new Date() } // User manually updated, high confidence
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("Update Memory Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to update memory' });
    }
  }

  async deleteMemory(req, res) {
    try {
      const dbUser = await prismaClient.user.findUnique({ 
        where: { firebaseUid: req.user.uid } 
      });
      if (!dbUser) return res.status(404).json({ success: false, error: 'User not found' });

      const existing = await prismaClient.userMemory.findFirst({
        where: { id: req.params.id, userId: dbUser.id }
      });
      if (!existing) return res.status(404).json({ success: false, error: 'Memory not found' });

      await memoryRepository.deleteMemory(req.params.id);
      
      return res.status(200).json({ success: true, message: 'Memory deleted' });
    } catch (error) {
      console.error("Delete Memory Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to delete memory' });
    }
  }

  async getAnalytics(req, res) {
    try {
      const stats = await memoryRepository.getAnalytics();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Memory Analytics Error:", error);
      return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }
}

module.exports = new MemoryController();
