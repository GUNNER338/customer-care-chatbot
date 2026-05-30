const resumeService = require('./resume.service');
const prismaClient = require('../../config/prisma');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
    }

    // Fetch internal User ID from Firebase UID
    const dbUser = await prismaClient.user.findUnique({ 
      where: { firebaseUid: req.user.uid } 
    });
    
    if (!dbUser) {
      return res.status(404).json({ success: false, error: 'User not found in database.' });
    }
    const userId = dbUser.id;
    // Get candidate profile to link the resume
    let profile = await prismaClient.candidateProfile.findUnique({ where: { userId } });
    if (!profile) {
       // Create an empty profile if none exists
       profile = await prismaClient.candidateProfile.create({
         data: { userId }
       });
    }

    const result = await resumeService.processResumeUpload(req.file, userId, profile.id);
    
    return res.status(200).json({
      success: true,
      message: 'Resume parsed and analyzed successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload Controller Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = await resumeService.getAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Resume Analytics Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadResume,
  getAnalytics
};
