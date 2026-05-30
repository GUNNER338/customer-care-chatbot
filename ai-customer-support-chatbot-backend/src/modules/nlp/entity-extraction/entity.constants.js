const ENTITY_TYPES = {
  EMPLOYER: "employer",
  CANDIDATE: "candidate",
  CONTACT: "contact",
};

const ENTITY_KEYS = {
  // Employer
  COMPANY_NAME: "companyName",
  HIRING_COUNT: "hiringCount",
  JOB_TITLE: "jobTitle",
  LOCATION: "location",
  EMPLOYMENT_TYPE: "employmentType",
  
  // Candidate
  SKILLS: "skills",
  EXPERIENCE: "experience",
  CURRENT_ROLE: "currentRole",
  PREFERRED_LOCATION: "preferredLocation",
  EXPECTED_SALARY: "expectedSalary",
  NOTICE_PERIOD: "noticePeriod",
  
  // Contact
  NAME: "name",
  EMAIL: "email",
  PHONE: "phone",
};

const REGEX_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  PHONE: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  // Extract number of years
  EXPERIENCE: /(\d+)\s*(?:\+|-)?\s*(?:years?|yrs?)(?:\s*of)?\s*experience/i,
  // Extract notice period days/months
  NOTICE_PERIOD: /(\d+)\s*(?:days?|months?|weeks?)\s*(?:notice)?/i,
  // Extract hiring count
  HIRING_COUNT: /(?:need|looking for|hire|require|want)\s+(\d+)/i,
};

module.exports = {
  ENTITY_TYPES,
  ENTITY_KEYS,
  REGEX_PATTERNS
};
