require("dotenv").config();
const prisma = require("../src/config/prisma");


const seedData = [
  // Employer Side Intents
  {
    name: "hiring_request",
    description: "Employer requests hiring services for specific roles.",
    responses: [
      "Sure, I can help you with hiring. Could you provide the job title and number of positions required?",
      "Let's discuss your hiring needs. What role are you looking to fill and how many candidates do you need?"
    ]
  },
  {
    name: "staffing_services",
    description: "Employer asks about staffing and temporary workforce solutions.",
    responses: [
      "We offer staffing services ranging from temporary to permanent placements. What type of staff are you looking for?",
      "Our staffing solutions can match your requirements. Please let me know the skill sets you need."
    ]
  },
  {
    name: "executive_search",
    description: "Employer inquires about executive search services.",
    responses: [
      "Our executive search team can help you find senior leadership. Which position are you recruiting for?",
      "We specialize in executive search. Please share the role and level you're targeting."
    ]
  },
  {
    name: "talent_acquisition",
    description: "Employer wants talent acquisition strategy assistance.",
    responses: [
      "We can support your talent acquisition pipeline. What areas are you focusing on?",
      "Let's improve your talent acquisition. Tell me about the positions you're hiring for."
    ]
  },
  {
    name: "payroll_services",
    description: "Employer asks about payroll management services.",
    responses: [
      "Our payroll services ensure compliance and timely payments. Which payroll cycles are you interested in?",
      "We handle payroll processing. Please provide details of your employee count and frequency."
    ]
  },
  {
    name: "recruitment_outsourcing",
    description: "Employer wants recruitment process outsourcing (RPO).",
    responses: [
      "Our RPO solutions can manage end‑to‑end recruitment. What functions would you like to outsource?",
      "We offer recruitment outsourcing. Let me know the scope you need assistance with."
    ]
  },
  {
    name: "talent_mapping",
    description: "Employer seeks talent mapping and market analysis.",
    responses: [
      "We can provide talent mapping reports. Which market or skill areas are you interested in?",
      "Our talent mapping helps you understand talent pools. Please specify the region or domain."
    ]
  },
  // Candidate Side Intents
  {
    name: "job_search",
    description: "Candidate searches for job opportunities.",
    responses: [
      "Sure, I can help you find jobs. What role or industry are you interested in?",
      "Let's look for positions that match your skills. Please tell me your desired job title."
    ]
  },
  {
    name: "resume_help",
    description: "Candidate asks for resume review or improvement.",
    responses: [
      "I can review your resume. Please upload it or paste the content, and I'll provide feedback.",
      "Let's improve your resume. Share the current version and I'll suggest enhancements."
    ]
  },
  {
    name: "interview_preparation",
    description: "Candidate wants help preparing for interviews.",
    responses: [
      "I can help you prepare for interviews. What role are you interviewing for?",
      "Let's practice interview questions. Tell me the position you're applying for."
    ]
  },
  {
    name: "career_transition",
    description: "Candidate seeks guidance on changing career paths.",
    responses: [
      "Changing careers can be exciting. What new field are you interested in?",
      "Let's discuss your career transition. Share your current background and target industry."
    ]
  },
  {
    name: "salary_negotiation",
    description: "Candidate wants advice on salary negotiation.",
    responses: [
      "I can provide salary negotiation tips. What role are you negotiating for?",
      "Let's work on salary negotiation strategies. Please tell me the offer details."
    ]
  },
  {
    name: "application_status",
    description: "Candidate checks status of a job application.",
    responses: [
      "Sure, I can check your application status. Please provide the application reference or job title.",
      "Let me look up your application. Share the job ID or company name."
    ]
  },
  // General Intents
  {
    name: "greeting",
    description: "Welcome greetings and opening remarks.",
    responses: [
      "Hello! Welcome to Elements HR Services (EHRS). How can I help you today?",
      "Hi there! I am your EHRS AI assistant. Are you looking to hire top talent, or are you seeking new job opportunities today?"
    ]
  },
  {
    name: "company_information",
    description: "Information about Elements HR Services (EHRS), mission, and services.",
    responses: [
      "Elements HR Services (EHRS) is a premier recruitment and talent solutions agency, specializing in executive search, temporary staffing, payroll management, and end-to-end recruitment process outsourcing.",
      "At Elements HR Services, we bridge the gap between top-tier talent and leading organizations. We provide tailored recruitment and HR solutions to drive business growth."
    ]
  },
  {
    name: "office_location",
    description: "Physical office branches and locations.",
    responses: [
      "Elements HR Services has physical office branches located in major business hubs, including Gurgaon (NCR), Bangalore, Mumbai, and Hyderabad. You can visit or contact the nearest branch for support.",
      "Our headquarters is located in Gurgaon (NCR), and we have regional offices in Bangalore, Mumbai, and Hyderabad to serve our clients and candidates across the country."
    ]
  },
  {
    name: "contact_information",
    description: "Contact details for EHRS.",
    responses: [
      "You can contact Elements HR Services by emailing support@elements-hr.com or calling our customer care desk at +91-124-555-0199. Alternatively, you can fill out our web contact form.",
      "For business inquiries, reach us at info@elements-hr.com. Candidate support can be reached at placements@elements-hr.com or via phone at +91-80-555-0188."
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
  }
];

async function main() {
  console.log("Starting seeding process...");

  // Delete legacy / generic intents that are not in the EHRS dataset
  const activeIntentNames = seedData.map(item => item.name);
  const deletedResult = await prisma.intent.deleteMany({
    where: {
      name: {
        notIn: activeIntentNames
      }
    }
  });
  console.log(`Deleted ${deletedResult.count} legacy/generic intents.`);
  
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

