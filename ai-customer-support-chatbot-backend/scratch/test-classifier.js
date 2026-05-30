require("dotenv").config({ path: "c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/.env" });
const classifierService = require("c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/src/modules/nlp/classifier.service");
const nlpIntentService = require("c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/src/modules/nlp/intent.service");
const prisma = require("c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/src/config/prisma");

const testPhrases = [
  { text: "Hello there, how are you?", expected: "greeting" },
  { text: "Can I get a refund for my order?", expected: "refund_request" },
  { text: "Where is my order? I want to track shipment delivery status", expected: "order_tracking" },
  { text: "I forgot my password, how do I reset it?", expected: "password_reset" },
  { text: "I want to talk to a live agent, connect me with real person please", expected: "human_support" },
  { text: "Can you give me features and specifications details about product?", expected: "product_information" },
  { text: "Why did my payment fail? I think I was double billing overcharged", expected: "billing_issue" },
  { text: "The app crashed and it's not loading, some technical error glitch!", expected: "technical_support" },
  { text: "Could you guys please help me get back into my account? I'm having issues signing in with my email.", expected: "password_reset" },
  { text: "What is the weather outside?", expected: "unknown" }
];

async function run() {
  console.log("=== NLP CLASSIFIER & INTENT SERVICE VERIFICATION ===\n");

  for (const item of testPhrases) {
    console.log(`Input Message: "${item.text}"`);

    // 1. Check raw classifier
    const classification = classifierService.classify(item.text);
    console.log(`- Raw Classifier: Intent='${classification.intent}', Confidence=${classification.confidence}`);

    // 2. Check full NLP Intent Service (queries DB responses)
    const result = await nlpIntentService.processMessage(item.text);
    console.log(`- DB Response Selected: "${result.response}"`);

    const status = result.intent === item.expected ? "✅ MATCHED" : "❌ MISMATCH";
    console.log(`- Expected: '${item.expected}' -> Result: ${status}\n`);
  }
}

run()
  .catch(err => {
    console.error("Verification failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
