const entityService = require('./entity.service');
const { validateEntityExtraction } = require('./validation');

class EntityController {
  // POST /api/entities/extract
  async extract(req, res) {
    try {
      const { error } = validateEntityExtraction(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const { conversationId, message } = req.body;
      const result = await entityService.extractAndSave(conversationId, message);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      console.error('Entity extraction error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/entities/:conversationId
  async listByConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const entities = await entityService.getByConversation(conversationId);
      return res.status(200).json({ success: true, data: entities });
    } catch (err) {
      console.error('Fetch entities error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new EntityController();
