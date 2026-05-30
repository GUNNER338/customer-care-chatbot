require("dotenv").config({ path: __dirname + "/../../.env" });
const nlpIntentService = require("../../src/modules/nlp/intent.service");
const prisma = require("../../src/config/prisma");

const testCases = [
  // Employer Intents
  { text: "We need to hire 10 React developers ASAP", expected: "hiring_request" },
  { text: "Do you guys offer temp staffing services for warehouse workers?", expected: "staffing_services" },
  { text: "I need to find a new CFO for our enterprise. Can you help with senior leadership search?", expected: "executive_search" },
  { text: "Can you manage our payroll processing next month?", expected: "payroll_services" },
  { text: "We want to outsource our entire recruitment department to you.", expected: "recruitment_outsourcing" },
  // Candidate Intents
  { text: "I am looking for a job in software engineering.", expected: "job_search" },
  { text: "Can someone review my CV and give me feedback on my format?", expected: "resume_help" },
  { text: "I have an interview tomorrow, any mock interview prep available?", expected: "interview_preparation" },
  { text: "I want to change my career path from sales to marketing.", expected: "career_transition" },
  { text: "How should I negotiate a salary offer for a senior role?", expected: "salary_negotiation" },
  { text: "What is the status of my application for the data analyst position?", expected: "application_status" },
  // General / Static Intents
  { text: "Hello, good morning", expected: "greeting" },
  { text: "Where is your office located?", expected: "office_location" },
  { text: "Can you give me your contact phone number?", expected: "contact_information" },
  { text: "I need to talk to a human recruiter right now.", expected: "human_support" },
  // Ambiguous Queries (Targeting 0.50 - 0.75 Confidence -> clarification_needed)
  { text: "I need some help", expected: "clarification_needed" },
  { text: "Can you assist me with something?", expected: "clarification_needed" },
  // Vague Queries (Targeting < 0.50 Confidence -> human_support)
  { text: "dsfjsdlfkjsdlkfj", expected: "human_support" }
];

async function runTests() {
  console.log("=== NLP CLASSIFICATION AUTOMATED TEST ===\n");
  let correct = 0;
  let total = testCases.length;

  for (let i = 0; i < total; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}/${total}: "${testCase.text}"`);
    console.log(`Expected Intent: ${testCase.expected}`);
    
    try {
      const result = await nlpIntentService.processMessage(testCase.text);
      console.log(`Returned Intent: ${result.intent}`);
      console.log(`Confidence Score: ${result.confidence}`);
      console.log(`Reasoning: ${result.reasoning}`);
      if (result.response) {
         console.log(`Generated Response: "${result.response.substring(0, 100)}..."`);
      }

      if (result.intent === testCase.expected) {
        correct++;
        console.log("Status: ✅ PASS\n");
      } else {
        console.log("Status: ❌ FAIL\n");
      }
    } catch (e) {
      console.log("Status: ❌ ERROR", e.message, "\n");
    }
  }

  const accuracy = (correct / total) * 100;
  console.log("=== TEST RESULTS ===");
  console.log(`Total Cases: ${total}`);
  console.log(`Correct Matches: ${correct}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
  
  if (accuracy >= 85) {
    console.log("Target accuracy > 85% ACHIEVED ✅");
  } else {
    console.log("Target accuracy > 85% FAILED ❌");
  }
}

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
