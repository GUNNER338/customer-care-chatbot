require("dotenv").config({ path: __dirname + "/../../.env" });
const { ChatbotService } = require("../../src/modules/chatbot/chatbot.service");
const candidateRepository = require("../../src/modules/candidates/candidate.repository");
const prisma = require("../../src/config/prisma");

const chatbotService = new ChatbotService();

// Mock Gemini Service to avoid real API calls and limits
const geminiService = require("../../src/modules/nlp/services/gemini.service");
geminiService.generate = async (prompt, systemInstruction) => {
  if (systemInstruction.includes("Intent Classifier")) {
    if (prompt.includes("I am a Node.js Developer")) return '{"intent": "job_search", "confidence": 0.99, "reasoning": "Mock"}';
    if (prompt.includes("I have 6 years experience")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}'; // Flow memory will catch this
    if (prompt.includes("Looking for jobs in Pune")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}';
    if (prompt.includes("My expected salary is 18 LPA")) return '{"intent": "unknown", "confidence": 0.99, "reasoning": "Mock"}';
  } else {
    // Entity Extraction
    if (prompt.includes("I am a Node.js Developer")) return '{"currentRole": "Node.js Developer", "skills": ["Node.js"]}';
    if (prompt.includes("I have 6 years experience")) return '{"experience": 6}';
    if (prompt.includes("Looking for jobs in Pune")) return '{"preferredLocation": "Pune"}';
    if (prompt.includes("My expected salary is 18 LPA")) return '{"expectedSalary": "18 LPA"}';
  }
  return "{}";
};

async function runTests() {
  console.log("=== CANDIDATE PROFILE SYSTEM AUTOMATED TEST ===\n");
  
  // Setup User
  const userId = "test_candidate_user_1";
  
  // Clean up
  await prisma.candidateProfile.deleteMany({ where: { userId } });
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    await prisma.user.create({
      data: {
        id: userId,
        firebaseUid: "firebase_" + userId,
        email: "candidate@test.com",
        fullName: "Test Candidate"
      }
    });
  }

  const conv = await chatbotService.createConversation(userId);

  try {
    console.log("--- Turn 1: Role ---");
    let result = await chatbotService.handleChatMessage({
      conversationId: conv.id,
      message: "I am a Node.js Developer",
      customerId: userId
    });
    console.log("Bot:", result.response);
    
    let profile = await candidateRepository.getProfileByUserId(userId);
    console.log("Role:", profile.currentRole);
    console.log("Completion Score:", profile.profileCompletion, "%");

    console.log("\n--- Turn 2: Experience ---");
    result = await chatbotService.handleChatMessage({
      conversationId: conv.id,
      message: "I have 6 years experience",
      customerId: userId
    });
    console.log("Bot:", result.response);
    
    profile = await candidateRepository.getProfileByUserId(userId);
    console.log("Experience:", profile.experience);
    console.log("Completion Score:", profile.profileCompletion, "%");

    console.log("\n--- Turn 3: Location ---");
    result = await chatbotService.handleChatMessage({
      conversationId: conv.id,
      message: "Looking for jobs in Pune",
      customerId: userId
    });
    console.log("Bot:", result.response);
    
    profile = await candidateRepository.getProfileByUserId(userId);
    console.log("Location:", profile.preferredLocation);
    console.log("Completion Score:", profile.profileCompletion, "%");

    console.log("\n--- Turn 4: Salary ---");
    result = await chatbotService.handleChatMessage({
      conversationId: conv.id,
      message: "My expected salary is 18 LPA",
      customerId: userId
    });
    console.log("Bot:", result.response);
    
    profile = await candidateRepository.getProfileByUserId(userId);
    console.log("Salary:", profile.expectedSalary);
    console.log("Completion Score:", profile.profileCompletion, "%");

    console.log("\n=== TEST RESULTS ===");
    if (profile.profileCompletion === 80) { // 15 + 15 + 20 + 15 + 15 = 80 (role, exp, skills, loc, salary)
      console.log("Target profile completion (80%) ACHIEVED ✅");
    } else {
      console.log(`Completion incorrect. Got ${profile.profileCompletion}% ❌`);
    }

    const { CandidateService } = require("../../src/modules/candidates/candidate.service");
    const summary = await require("../../src/modules/candidates/candidate.service").getSummary(userId);
    console.log("Generated Summary:", summary.summary);

    if (summary.summary.includes("Node.js") && summary.summary.includes("Pune")) {
      console.log("Summary generation ACHIEVED ✅");
    } else {
      console.log("Summary generation FAILED ❌");
    }

  } catch (e) {
    console.error("Test Failed", e);
  }
}

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
