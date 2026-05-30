require("dotenv").config();
const prisma = require("../src/config/prisma");


const seedData = [
  {
    name: "greeting",
    description: "Welcome greetings for customers starting a new interaction.",
    responses: [
      "Hello! Welcome to our customer support. How can I help you today?",
      "Hi there! I'm your virtual assistant. What can I do for you today?",
      "Greetings! How may I assist you with our services today?"
    ]
  },
  {
    name: "refund_request",
    description: "Handling refund requests and cancellation policy queries.",
    responses: [
      "I can certainly help you with your refund request. Could you please provide your order number and the reason for the refund?",
      "To request a refund, please share your order details. I'll pass this along to our billing department to process it for you.",
      "Refunds are processed within 5-7 business days once approved. Please provide your order ID so we can look into this immediately."
    ]
  },
  {
    name: "order_tracking",
    description: "Queries related to order shipping, status, and tracking info.",
    responses: [
      "To track your order, please provide your Order ID. I will look up the status and shipment details for you.",
      "You can track your order using the tracking number sent to your email, or you can share your Order ID here, and I'll find it for you.",
      "Let me check that order for you! What is your order number?"
    ]
  },
  {
    name: "password_reset",
    description: "Steps for account password recovery and login assistance.",
    responses: [
      "If you've forgotten your password, you can click on the 'Forgot Password' link on the login page to receive a reset link.",
      "To reset your password, please check your email for a reset link. Alternatively, let me know if you are experiencing any error messages.",
      "I can help with password resets. Head to our login screen, click 'Forgot Password', and enter your email address to receive secure instructions."
    ]
  },
  {
    name: "human_support",
    description: "Requests to speak with a live support representative or agent.",
    responses: [
      "I'll connect you with a human support representative right away. Please hold on for a moment.",
      "Let me transfer you to one of our live agents. They will be happy to help you with this!",
      "Connecting you to a support specialist now. Please stay online while we transfer your chat."
    ]
  },
  {
    name: "product_information",
    description: "Providing features, specs, and details about products.",
    responses: [
      "I would be happy to share details about our products! Which product or feature are you interested in?",
      "You can find comprehensive product specifications on our catalog page. Let me know what specific product you'd like to learn more about.",
      "What product details are you looking for? Feel free to ask, and I will find the information for you."
    ]
  },
  {
    name: "billing_issue",
    description: "Resolving billing discrepancies, invoice questions, and payment errors.",
    responses: [
      "I'm sorry to hear that you have a billing issue. Please share your account email and the invoice number so we can investigate.",
      "For billing queries, including duplicate charges or invoice questions, please provide your email and details of the charge, and our finance team will resolve it.",
      "Let's get this billing issue sorted out! Can you describe what happened or provide your billing ID?"
    ]
  },
  {
    name: "technical_support",
    description: "Troubleshooting platform bugs, performance, and usage errors.",
    responses: [
      "It sounds like you're experiencing a technical issue. Could you please describe what error you are seeing or what's not working?",
      "I can help troubleshoot technical problems. Please let me know what platform (web/mobile) you are on and describe the issue.",
      "Our technical team is ready to help. What is the specific issue or error message you've encountered?"
    ]
  }
];

async function main() {
  console.log("Starting seeding process...");
  
  for (const item of seedData) {
    // 1. Create or update the Intent
    const intent = await prisma.intent.upsert({
      where: { name: item.name },
      update: { description: item.description },
      create: { name: item.name, description: item.description }
    });
    
    console.log(`Intent '${intent.name}' processed (ID: ${intent.id}).`);
    
    // 2. Clear old responses for this intent to avoid duplicates during seeding
    await prisma.response.deleteMany({
      where: { intentId: intent.id }
    });
    
    // 3. Insert the new responses
    const responsesData = item.responses.map(content => ({
      intentId: intent.id,
      content
    }));
    
    await prisma.response.createMany({
      data: responsesData
    });
    
    console.log(`Seeded ${responsesData.length} responses for intent '${intent.name}'.`);
  }
  
  console.log("Seeding process completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Clean up Prisma resources
    await prisma.$disconnect();
  });
