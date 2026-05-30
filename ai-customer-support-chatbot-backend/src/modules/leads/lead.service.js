const leadRepository = require("./lead.repository");
const leadValidation = require("./lead.validation");

class LeadService {
  async createLead(leadData) {
    return leadRepository.create(leadData);
  }

  async getLeadById(id) {
    return leadRepository.findById(id);
  }

  async updateLead(id, data) {
    return leadRepository.update(id, data);
  }

  async deleteLead(id) {
    return leadRepository.delete(id);
  }

  async getLeads(filters) {
    return leadRepository.findMany(filters);
  }

  async getLeadStats() {
    return leadRepository.getStats();
  }

  formatRequirementString(entities) {
    const parts = [];
    if (entities.hiringCount) parts.push(`${entities.hiringCount}`);
    if (entities.jobTitle) parts.push(`${entities.jobTitle}`);
    if (entities.employmentType) parts.push(`(${entities.employmentType})`);
    if (entities.location) parts.push(`in ${entities.location}`);
    
    return parts.length > 0 ? parts.join(" ") : null;
  }
}

module.exports = new LeadService();
