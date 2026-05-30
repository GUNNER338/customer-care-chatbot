const intentRepository = require("./intent.repository");

class IntentService {
  // --- Intent Service Methods ---

  async getAllIntents() {
    return intentRepository.findAll();
  }

  async getIntentById(id) {
    const intent = await intentRepository.findById(id);
    if (!intent) {
      const error = new Error(`Intent with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    return intent;
  }

  async createIntent(data) {
    const existing = await intentRepository.findByName(data.name);
    if (existing) {
      const error = new Error(`Intent with name '${data.name}' already exists`);
      error.statusCode = 400;
      throw error;
    }
    return intentRepository.create(data);
  }

  async updateIntent(id, data) {
    // Check if intent exists
    await this.getIntentById(id);

    if (data.name) {
      const existing = await intentRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        const error = new Error(`Intent with name '${data.name}' already exists`);
        error.statusCode = 400;
        throw error;
      }
    }

    return intentRepository.update(id, data);
  }

  async deleteIntent(id) {
    // Check if intent exists
    await this.getIntentById(id);
    return intentRepository.delete(id);
  }

  // --- Response Service Methods ---

  async getAllResponses(filter = {}) {
    return intentRepository.findAllResponses(filter);
  }

  async getResponseById(id) {
    const response = await intentRepository.findResponseById(id);
    if (!response) {
      const error = new Error(`Response with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }
    return response;
  }

  async createResponse(data) {
    // Verify that the linked intent exists
    await this.getIntentById(data.intentId);
    return intentRepository.createResponse(data);
  }

  async updateResponse(id, data) {
    // Verify that the response exists
    await this.getResponseById(id);
    return intentRepository.updateResponse(id, data);
  }

  async deleteResponse(id) {
    // Verify that the response exists
    await this.getResponseById(id);
    return intentRepository.deleteResponse(id);
  }
}

module.exports = new IntentService();
