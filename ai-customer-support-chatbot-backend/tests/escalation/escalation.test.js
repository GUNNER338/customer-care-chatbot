require("dotenv").config({ path: __dirname + "/../../.env" });
const { ChatbotService } = require("../../src/modules/chatbot/chatbot.service");
const escalationRepository = require("../../src/modules/escalation/escalation.repository");
const prisma = require("../../src/config/prisma");

const chatbotService = new ChatbotService();

// Mock Gemini Service to avoid real API calls and limits
const geminiService = require("../../src/modules/nlp/services/gemini.service");
geminiService.generate = async (prompt, systemInstruction) => {
  if (systemInstruction.includes("Intent Classifier")) {
    if (prompt.includes("Need 50 engineers immediately")) return '{"intent": "hiring_request", "confidence": 0.99, "reasoning": "Mock"}';
    if (prompt.includes("Looking for a CTO")) return '{"intent": "executive_search", "confidence": 0.99, "reasoning": "Mock"}';
    return '{"intent": "unknown", "confidence": 0.0, "reasoning": "Mock"}';
  } else {
    // Entity Extraction
    if (prompt.includes("Need 50 engineers immediately")) return '{"hiringCount": "50", "jobTitle": "engineers"}';
    if (prompt.includes("Looking for a CTO")) return '{"jobTitle": "CTO"}';
  }
  return "{}";
};

async function runTests() {
  console.log("=== HUMAN RECRUITER ESCALATION SYSTEM AUTOMATED TEST ===\n");
  
  // Clean up
  const userId = "test_escalation_user_1";
  await prisma.escalation.deleteMany();
  await prisma.conversation.deleteMany({ where: { customerId: userId } });
  
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    await prisma.user.create({
      data: {
        id: userId,
        firebaseUid: "firebase_" + userId,
        email: "escalation@test.com",
        fullName: "Test Escalation User"
      }
    });
  }

  try {
    console.log("--- Test 1: Manual Escalation Request ---");
    const conv1 = await chatbotService.createConversation(userId);
    const res1 = await chatbotService.handleChatMessage({
      conversationId: conv1.id,
      message: "I want to speak with a recruiter", // Triggers human_support via Keyword Matching
      customerId: userId
    });
    console.log("Bot:", res1.response);
    const esc1 = await escalationRepository.findActiveByConversationId(conv1.id);
    console.log("Escalation Created:", !!esc1);
    console.log("Priority:", esc1?.priority);
    if (esc1?.priority === "MEDIUM") console.log("✅ Passed"); else console.log("❌ Failed");

    console.log("\n--- Test 2: Frustrated User ---");
    const conv2 = await chatbotService.createConversation(userId);
    const res2 = await chatbotService.handleChatMessage({
      conversationId: conv2.id,
      message: "This chatbot is useless", // Triggers frustration via Keyword Matching
      customerId: userId
    });
    console.log("Bot:", res2.response);
    const esc2 = await escalationRepository.findActiveByConversationId(conv2.id);
    console.log("Escalation Created:", !!esc2);
    console.log("Priority:", esc2?.priority);
    if (esc2?.priority === "MEDIUM") console.log("✅ Passed"); else console.log("❌ Failed");

    console.log("\n--- Test 3: Urgent Hiring ---");
    const conv3 = await chatbotService.createConversation(userId);
    const res3 = await chatbotService.handleChatMessage({
      conversationId: conv3.id,
      message: "Need 50 engineers immediately", // Triggers Gemini + urgent regex
      customerId: userId
    });
    console.log("Bot:", res3.response);
    const esc3 = await escalationRepository.findActiveByConversationId(conv3.id);
    console.log("Escalation Created:", !!esc3);
    console.log("Priority:", esc3?.priority);
    if (esc3?.priority === "URGENT") console.log("✅ Passed"); else console.log("❌ Failed");

    console.log("\n--- Test 4: Executive Search ---");
    const conv4 = await chatbotService.createConversation(userId);
    const res4 = await chatbotService.handleChatMessage({
      conversationId: conv4.id,
      message: "Looking for a CTO", // Triggers Gemini + high value regex
      customerId: userId
    });
    console.log("Bot:", res4.response);
    const esc4 = await escalationRepository.findActiveByConversationId(conv4.id);
    console.log("Escalation Created:", !!esc4);
    console.log("Priority:", esc4?.priority);
    if (esc4?.priority === "HIGH") console.log("✅ Passed"); else console.log("❌ Failed");

    console.log("\n=== TEST RESULTS SUMMARY ===");
    const finalDbState = await prisma.conversation.findUnique({ where: { id: conv4.id }});
    console.log("Conversation 4 Status:", finalDbState.status);
    if (finalDbState.status === "ESCALATED") console.log("Status transition ✅ Passed"); else console.log("Status transition ❌ Failed");

    const stats = await require("../../src/modules/escalation/escalation.service").getDashboardStats();
    console.log("Dashboard Stats:", stats);
    if (stats.pending === 4 && stats.urgent === 1) console.log("Dashboard Aggregation ✅ Passed"); else console.log("Dashboard Aggregation ❌ Failed");

  } catch (e) {
    console.error("Test Failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
