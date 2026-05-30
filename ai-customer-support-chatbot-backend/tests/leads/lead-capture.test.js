require("dotenv").config({ path: __dirname + "/../../.env" });
const { ChatbotService } = require("../../src/modules/chatbot/chatbot.service");
const prisma = require("../../src/config/prisma");

const chatbotService = new ChatbotService();

// Mock Gemini Service to avoid real API calls and limits
const geminiService = require("../../src/modules/nlp/services/gemini.service");
geminiService.generate = async (prompt, systemInstruction) => {
  if (systemInstruction.includes("Intent Classifier")) {
    if (prompt.includes("Need 15 Java developers in Bangalore")) return '{"intent": "hiring_request", "confidence": 0.99, "reasoning": "Mock"}';
    if (prompt.includes("ABC Corp")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}'; // Contextual follow up
    if (prompt.includes("john@abccorp.com")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}'; // Contextual follow up
    if (prompt.includes("Looking for a CTO")) return '{"intent": "executive_search", "confidence": 0.99, "reasoning": "Mock"}';
    if (prompt.includes("Tech Innovators")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}';
  } else {
    // Entity Extraction
    if (prompt.includes("Need 15 Java developers in Bangalore")) return '{"jobTitle": "Java", "location": "Bangalore"}'; // hiringCount extracted by regex
    if (prompt.includes("ABC Corp")) return '{"companyName": "ABC Corp"}';
    if (prompt.includes("john@abccorp.com")) return '{"name": "John"}'; // email by regex
    if (prompt.includes("Looking for a CTO")) return '{"jobTitle": "CTO"}';
    if (prompt.includes("Tech Innovators")) return '{"companyName": "Tech Innovators"}';
  }
  return "{}";
};

async function runTests() {
  console.log("=== LEAD CAPTURE SYSTEM AUTOMATED TEST ===\n");
  let correct = 0;
  let total = 2; // Two full conversation flows

  // Test 1: Hiring Request Flow
  try {
    console.log("--- Scenario 1: Multi-turn Hiring Request ---");
    const conv1 = await chatbotService.createConversation("test_user_lead_1");
    
    // Turn 1
    let result = await chatbotService.handleChatMessage({
      conversationId: conv1.id,
      message: "Need 15 Java developers in Bangalore",
      customerId: "test_user_lead_1"
    });
    console.log("Bot:", result.response);
    let pass = result.response.includes("company name");

    // Turn 2
    result = await chatbotService.handleChatMessage({
      conversationId: conv1.id,
      message: "Company is ABC Corp",
      customerId: "test_user_lead_1"
    });
    console.log("Bot:", result.response);
    pass = pass && result.response.includes("name");

    // Turn 3
    result = await chatbotService.handleChatMessage({
      conversationId: conv1.id,
      message: "I am John, email john@abccorp.com",
      customerId: "test_user_lead_1"
    });
    console.log("Bot:", result.response);
    pass = pass && result.response.includes("recorded successfully");

    // Verify DB
    const leads = await prisma.lead.findMany({ where: { conversationId: conv1.id } });
    if (leads.length === 1 && leads[0].companyName === "ABC Corp" && leads[0].email === "john@abccorp.com") {
      console.log("✅ Lead correctly stored in DB");
    } else {
      pass = false;
      console.log("❌ Lead missing or incorrect in DB", leads);
    }

    if (pass) correct++;
  } catch (e) {
    console.error("Test 1 Failed", e);
  }

  // Test 2: Executive Search Flow
  try {
    console.log("\n--- Scenario 2: Executive Search (Missing Contact Info) ---");
    const conv2 = await chatbotService.createConversation("test_user_lead_2");
    
    // Turn 1
    let result = await chatbotService.handleChatMessage({
      conversationId: conv2.id,
      message: "Looking for a CTO for Tech Innovators",
      customerId: "test_user_lead_2"
    });
    console.log("Bot:", result.response);
    let pass = result.response.includes("name") || result.response.includes("contact");

    if (pass) {
      console.log("✅ Flow handled correctly");
      correct++;
    } else {
      console.log("❌ Incorrect follow-up generated.");
    }
  } catch (e) {
    console.error("Test 2 Failed", e);
  }

  console.log("\n=== TEST RESULTS ===");
  console.log(`Total Cases: ${total}`);
  console.log(`Success: ${correct}`);
  const accuracy = (correct / total) * 100;
  console.log(`Lead capture success rate: ${accuracy.toFixed(2)}%`);
  
  if (accuracy >= 90) {
    console.log("Target success rate > 90% ACHIEVED ✅");
  } else {
    console.log("Target success rate > 90% FAILED ❌");
  }
}

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
