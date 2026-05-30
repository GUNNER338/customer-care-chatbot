const prisma = require('../../config/prisma');

const createResume = async (resumeData) => {
  return await prisma.resume.create({
    data: resumeData
  });
};

const getResumesByCandidate = async (candidateId) => {
  return await prisma.resume.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' }
  });
};

const updateCandidateProfileFromResume = async (userId, extractedData) => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId }
  });

  if (!profile) return null;

  // Auto-fill: Do not overwrite existing fields unless empty
  const updateData = {};
  
  if (!profile.skills && extractedData.skills) {
    updateData.skills = extractedData.skills;
  }
  if (!profile.experience && extractedData.experience) {
    updateData.experience = parseInt(extractedData.experience) || 0;
  }
  if (!profile.education && extractedData.education && extractedData.education.length > 0) {
    // Save primary education string
    updateData.education = `${extractedData.education[0].degree} - ${extractedData.education[0].university}`;
  }
  if (!profile.summary && extractedData.summary) {
    updateData.summary = extractedData.summary;
  }

  if (Object.keys(updateData).length > 0) {
    return await prisma.candidateProfile.update({
      where: { userId },
      data: updateData
    });
  }

  return profile;
};

const getAnalytics = async () => {
  const totalUploads = await prisma.resume.count();
  
  const allResumes = await prisma.resume.findMany({
    select: { analysis: true }
  });

  let totalScore = 0;
  let scoreCount = 0;
  const skillsCount = {};
  
  allResumes.forEach(r => {
    if (r.analysis && typeof r.analysis === 'object') {
      const analysis = r.analysis;
      if (analysis.score) {
        totalScore += analysis.score;
        scoreCount++;
      }
      
      if (analysis.skills && Array.isArray(analysis.skills)) {
        analysis.skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    }
  });

  const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  
  // Get Top 5 skills
  const topSkills = Object.entries(skillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ name: entry[0], count: entry[1] }));

  return {
    totalUploads,
    averageScore,
    topSkills
  };
};

module.exports = {
  createResume,
  getResumesByCandidate,
  updateCandidateProfileFromResume,
  getAnalytics
};
