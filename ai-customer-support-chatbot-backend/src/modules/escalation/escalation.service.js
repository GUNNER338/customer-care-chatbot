const escalationRepository = require("./escalation.repository");
const prisma = require("../../config/prisma");

class EscalationService {
  /**
   * Creates an escalation and updates the conversation status to ESCALATED.
   */
  async createEscalation(data) {
    // Check if an active escalation already exists for this conversation
    const existing = await escalationRepository.findActiveByConversationId(data.conversationId);
    if (existing) {
      // If priority is higher now, we could update it, but let's just return the existing one for now to avoid duplicates
      return existing;
    }

    const escalation = await escalationRepository.createEscalation({
      ...data,
      status: "PENDING",
    });

    // Update conversation status
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { status: "ESCALATED" }
    });

    // TODO: Phase F Step 13 - Trigger notification service (Email/SMS/Dashboard alert)
    // notificationService.notifyRecruiter(escalation);

    return escalation;
  }

  async getEscalations(query) {
    return escalationRepository.getAllEscalations(query);
  }

  async getEscalationById(id) {
    return escalationRepository.findById(id);
  }

  async updateEscalationStatus(id, status) {
    const data = { status };
    if (status === "RESOLVED") {
      data.resolvedAt = new Date();
    }
    return escalationRepository.updateEscalation(id, data);
  }

  async assignRecruiter(id, recruiterId) {
    return escalationRepository.updateEscalation(id, {
      assignedRecruiter: recruiterId,
      assignedAt: new Date(),
      status: "ASSIGNED"
    });
  }

  async deleteEscalation(id) {
    return prisma.escalation.delete({ where: { id } });
  }

  async getDashboardStats() {
    return escalationRepository.getDashboardStats();
  }
}

module.exports = new EscalationService();
