const INTENTS = {
  EMPLOYER: [
    "hiring_request",
    "staffing_services",
    "executive_search",
    "talent_acquisition",
    "payroll_services",
    "recruitment_outsourcing",
    "talent_mapping"
  ],
  CANDIDATE: [
    "job_search",
    "resume_help",
    "interview_preparation",
    "career_transition",
    "salary_negotiation",
    "application_status"
  ],
  GENERAL: [
    "greeting",
    "company_information",
    "office_location",
    "contact_information",
    "human_support"
  ]
};

const ALL_INTENTS = [
  ...INTENTS.EMPLOYER,
  ...INTENTS.CANDIDATE,
  ...INTENTS.GENERAL
];

module.exports = {
  INTENTS,
  ALL_INTENTS
};
