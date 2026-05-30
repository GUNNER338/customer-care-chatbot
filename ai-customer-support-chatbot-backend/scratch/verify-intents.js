require("dotenv").config({ path: "c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/.env" });
const prisma = require("c:/Users/WELCOME/OneDrive/Documents/customer-care-chatbot/ai-customer-support-chatbot-backend/src/config/prisma");

async function verify() {
  console.log("=== ELEMENT HR SERVICES (EHRS) INTENTS VERIFICATION ===");
  const intents = await prisma.intent.findMany({
    include: {
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { name: "asc" }
  });

  console.log(`Total Intents in Database: ${intents.length}`);
  console.log("--------------------------------------------------------------------------------");
  intents.forEach((intent, idx) => {
    console.log(`${idx + 1}. [${intent.name}] (Responses: ${intent._count.responses})`);
    console.log(`   Description: ${intent.description || "N/A"}`);
  });
  console.log("--------------------------------------------------------------------------------");
}

verify()
  .catch(err => console.error("Verification failed:", err))
  .finally(async () => {
    await prisma.$disconnect();
  });
