const prisma = require("../../config/prisma");
const nlpIntentService = require("../nlp/intent.service");

class ChatbotService {
  async createConversation(customerId) {
    return prisma.conversation.create({
      data: {
        customerId: customerId || null,
        status: "ACTIVE",
      },
    });
  }

  async getUserConversations(customerId) {
    if (!customerId) return [];
    return prisma.conversation.findMany({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async renameConversation(conversationId, title) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async deleteConversation(conversationId) {
    return prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  async createMessage(input) {
    const { conversationId, senderType, senderId, content } = input;

    const conversationExists = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      throw new Error(`Conversation with ID ${conversationId} does not exist`);
    }

    return prisma.message.create({
      data: {
        conversationId,
        senderType,
        senderId: senderId || null,
        content,
      },
    });
  }

  async getConversationMessages(conversationId) {
    const conversationExists = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      throw new Error(`Conversation with ID ${conversationId} does not exist`);
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getConversationById(conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return conversation;
  }

  async handleChatMessage(input) {
    const { conversationId, startNewConversation, message, customerId, senderId } = input;

    let currentConversationId = conversationId;
    let isNew = false;

    if (startNewConversation || !currentConversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          customerId: customerId || null,
          title: message.substring(0, 50) || "New Chat",
          status: "ACTIVE",
        },
      });
      currentConversationId = conversation.id;
      isNew = true;
    } else {
      const conversationExists = await prisma.conversation.findUnique({
        where: { id: currentConversationId },
      });

      if (!conversationExists) {
        throw new Error(`Conversation with ID ${currentConversationId} not found`);
      }
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        senderType: "USER",
        senderId: senderId || null,
        content: message,
      },
    });

    // Call the NLP recognition engine
    const nlpResult = await nlpIntentService.processMessage(message);

    // Persist classification data
    if (nlpResult.intent) {
      await prisma.messageClassification.create({
        data: {
          messageId: userMessage.id,
          intent: nlpResult.intent,
          confidence: nlpResult.confidence || 0.0,
          reasoning: nlpResult.reasoning || null
        }
      });
      
      if (nlpResult.intent === "clarification_needed") {
        const analyticsRepo = require("../analytics/analytics.repository");
        await analyticsRepo.trackEvent("nlp", "clarification_requested", {
          originalIntent: nlpResult.reasoning // Usually reasoning contains some intent fallback string
        });
      }
    }

    // --- Entity Extraction System ---
    const entityService = require("../nlp/entity-extraction/entity.service");
    const entityRepository = require("../nlp/entity-extraction/entity.repository");

    let effectiveIntent = nlpResult.intent;
    let entityType = entityService.getEntityTypeFromIntent(effectiveIntent);
    
    // Fetch history for flow fallback and lead manager
    const historyEntities = await entityRepository.getEntitiesByConversation(currentConversationId);

    // Fallback: Flow memory
    if (entityType === "contact" || entityType === "unknown") {
      const isEmployerFlow = historyEntities.some(e => e.entityType === "employer");
      const isCandidateFlow = historyEntities.some(e => e.entityType === "candidate");
      
      if (isEmployerFlow) {
        entityType = "employer";
        effectiveIntent = "hiring_request";
      } else if (isCandidateFlow) {
        entityType = "candidate";
        effectiveIntent = "job_search";
      }
    }

    const entities = await entityService.extractEntities(message, effectiveIntent);

    // Save extracted entities to DB
    for (const [key, value] of Object.entries(entities)) {
      await entityRepository.saveEntity({
        conversationId: currentConversationId,
        messageId: userMessage.id,
        entityType,
        entityKey: key,
        entityValue: value,
        confidence: nlpResult.confidence || 0.95
      });
    }

    // --- Memory Extraction Engine ---
    const memoryEngine = require("../memory/memory-engine.service");
    if (customerId) {
      await memoryEngine.processAndStoreMemory(customerId, entityType, entities, nlpResult.confidence);
    }

    // --- Escalation System ---
    const escalationEngine = require("../escalation/escalation-engine.service");
    const escalationService = require("../escalation/escalation.service");
    
    const historyClassifications = await prisma.messageClassification.findMany({
      where: { message: { conversationId: currentConversationId } },
      orderBy: { createdAt: 'asc' }
    });
    
    const escalationDecision = escalationEngine.evaluate(message, nlpResult.intent, entities, historyClassifications);
    
    let botResponseContent;
    let isEscalated = false;
    
    if (escalationDecision.shouldEscalate) {
      await escalationService.createEscalation({
        conversationId: currentConversationId,
        userId: customerId || null,
        reason: escalationDecision.reason,
        priority: escalationDecision.priority
      });
      
      botResponseContent = "Thank you. A recruitment consultant from Elements HR Services will contact you shortly.";
      if (escalationDecision.priority === "URGENT") botResponseContent = "Your request has been escalated as urgent and assigned immediate attention.";
      if (escalationDecision.priority === "HIGH") botResponseContent = "We have marked your request as high priority. A recruiter will reach out as soon as possible.";
      isEscalated = true;
    } else {
      // --- Lead Detection & Candidate Profile Managers ---
      let leadCandidate = null;

      if (nlpResult.intent !== "unknown" && nlpResult.response) {
        botResponseContent = nlpResult.response;
      } else {
        botResponseContent = isNew 
          ? "Hello! Welcome to our Elements HR support. How can I help you today?" 
          : "I'm sorry, I didn't quite catch that. Could you describe your issue in more detail or ask another question?";
      }

      if (entityType === "employer") {
        const leadStateService = require("../leads/lead-state.service");
        const leadService = require("../leads/lead.service");
        
        const leadState = leadStateService.evaluateState(historyEntities, entities);
        leadCandidate = leadState.aggregatedEntities;
        
        if (!leadState.isQualified) {
          if (leadState.nextQuestion) {
            botResponseContent = leadState.nextQuestion; // override response with follow up question
          }
        } else {
          // Qualified! Check if already converted to lead for this conversation
          const existingLeads = await leadService.getLeads({ limit: 100 });
          const alreadyCreated = existingLeads.find(l => l.conversationId === currentConversationId);
          
          if (!alreadyCreated) {
            const requirementStr = leadService.formatRequirementString(leadState.aggregatedEntities);
            await leadService.createLead({
              conversationId: currentConversationId,
              userId: customerId || null,
              name: leadState.aggregatedEntities.name || "Unknown Contact",
              email: leadState.aggregatedEntities.email || null,
              phone: leadState.aggregatedEntities.phone || null,
              companyName: leadState.aggregatedEntities.companyName || "Unknown Company",
              intent: nlpResult.intent,
              requirement: requirementStr,
              status: "QUALIFIED"
            });
            botResponseContent = "Thank you. Your requirement has been recorded successfully. A recruitment consultant from Elements HR Services will contact you shortly.";
          } else {
            botResponseContent = "Thank you. Your requirement has been recorded successfully. A recruitment consultant from Elements HR Services will contact you shortly.";
          }
        }
      } else if (entityType === "candidate") {
        if (customerId) {
          const candidateStateService = require("../candidates/candidate-state.service");
          const candidateService = require("../candidates/candidate.service");
          
          const profile = await candidateService.updateProfileFromEntities(customerId, entities);
          const candidateState = candidateStateService.evaluateState(profile);
          
          if (!candidateState.isComplete && candidateState.nextQuestion) {
            botResponseContent = candidateState.nextQuestion;
          }
        }
      }

      // --- Personalization Engine (Memory context) ---
      // Only personalize if we have a customer ID and it's not a generic unknown fallback
      if (customerId && nlpResult.intent !== "unknown" && !isNew) {
        const memoryContextService = require("../memory/memory-context.service");
        const responseGenerator = require("../memory/response-generator.service");

        const activeMemories = await memoryEngine.getActiveMemories(customerId);
        const userMemoryContext = memoryContextService.formatUserMemoryContext(activeMemories);
        const recentMessages = await memoryContextService.getRecentConversationContext(currentConversationId, 6);

        botResponseContent = await responseGenerator.generatePersonalizedResponse(
          botResponseContent,
          nlpResult.intent,
          userMemoryContext,
          recentMessages
        );
      }
    }

    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        senderType: "BOT",
        senderId: "chatbot_v1",
        content: botResponseContent,
      },
    });

    return {
      success: true,
      conversationId: currentConversationId,
      response: botResponseContent,
      intent: nlpResult.intent !== "unknown" ? nlpResult.intent : undefined,
      confidence: nlpResult.intent !== "unknown" ? nlpResult.confidence : undefined,
      entities: Object.keys(entities).length > 0 ? entities : undefined,
      leadCandidate: leadCandidate || undefined,
      ...(isNew ? (startNewConversation ? { startNewConversation: true } : { isNewConversation: true }) : {}),
    };
  }
}

module.exports = { ChatbotService };
