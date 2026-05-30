const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Sends parsed resume text to Gemini and asks for structured extraction.
 * @param {string} resumeText - Raw text extracted from the resume.
 * @returns {Promise<Object>} The structured JSON analysis.
 */
const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert HR Recruitment AI.
Please analyze the following resume text and extract the structured information requested below.
Return strictly a JSON object with no markdown formatting, no code blocks, and no extra text.

Resume Text:
"""
${resumeText}
"""

Required JSON Structure:
{
  "personalInfo": {
    "name": "Full Name or null",
    "email": "Email address or null",
    "phone": "Phone number or null"
  },
  "skills": ["Array of technical and soft skills"],
  "experience": "Integer representing total years of experience, or 0",
  "education": [
    {
      "degree": "Degree name",
      "university": "University or Institution name",
      "graduationYear": "Year as string or null"
    }
  ],
  "certifications": ["Array of certification names"],
  "candidateLevel": "Junior, Mid-Level, Senior, or Executive",
  "primaryDomain": "e.g., Full Stack Development, Data Science, HR",
  "strengths": ["Array of 2-3 key strengths"],
  "improvementAreas": ["Array of 1-3 areas for improvement"],
  "summary": "A 2-3 sentence recruiter-friendly summary of the candidate"
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if Gemini included it despite instructions
    const jsonString = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);
    throw new Error("Failed to analyze resume with AI.");
  }
};

/**
 * Computes a resume score (0-100) based on extracted criteria.
 */
const computeScore = (analysis) => {
  let score = 0;

  // Skills (up to 30 points)
  if (analysis.skills && analysis.skills.length > 0) {
    score += Math.min(30, analysis.skills.length * 3);
  }

  // Experience (up to 30 points)
  const exp = parseInt(analysis.experience) || 0;
  if (exp > 0) {
    score += Math.min(30, 10 + (exp * 4)); 
  }

  // Education (up to 20 points)
  if (analysis.education && analysis.education.length > 0) {
    score += 20;
  }

  // Certifications (up to 10 points)
  if (analysis.certifications && analysis.certifications.length > 0) {
    score += Math.min(10, analysis.certifications.length * 5);
  }

  // Profile Completeness (up to 10 points - based on personal info + summary)
  if (analysis.personalInfo?.name) score += 3;
  if (analysis.personalInfo?.email) score += 3;
  if (analysis.summary && analysis.summary.length > 10) score += 4;

  return score;
};

/**
 * Detects missing key sections from the parsed resume.
 */
const detectMissingSections = (analysis) => {
  const missing = [];
  if (!analysis.skills || analysis.skills.length === 0) missing.push("Skills");
  if (!analysis.experience || parseInt(analysis.experience) === 0) missing.push("Experience Details");
  if (!analysis.education || analysis.education.length === 0) missing.push("Education");
  if (!analysis.certifications || analysis.certifications.length === 0) missing.push("Certifications");
  return missing;
};

module.exports = {
  analyzeResume,
  computeScore,
  detectMissingSections
};
