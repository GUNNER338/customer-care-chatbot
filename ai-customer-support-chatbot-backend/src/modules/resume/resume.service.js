const resumeParser = require('./resume-parser.service');
const resumeAnalyzer = require('./resume-analyzer.service');
const resumeRepository = require('./resume.repository');

const processResumeUpload = async (file, userId, candidateProfileId) => {
  if (!file) throw new Error('No file provided');
  if (!userId || !candidateProfileId) throw new Error('User context missing');

  try {
    // 1. Extract Text
    const rawText = await resumeParser.extractText(file.path, file.mimetype);

    // 2. Analyze with AI
    const analysis = await resumeAnalyzer.analyzeResume(rawText);
    
    // 3. Compute Scores & Missing Sections
    const score = resumeAnalyzer.computeScore(analysis);
    const missingSections = resumeAnalyzer.detectMissingSections(analysis);

    // Append extras to analysis JSON
    analysis.score = score;
    analysis.missingSections = missingSections;

    // 4. Save to Database
    const resumeRecord = await resumeRepository.createResume({
      candidateId: candidateProfileId,
      fileName: file.originalname,
      fileUrl: file.path, // In a real app this would be an S3 URL
      fileType: file.mimetype,
      parsedData: { rawTextLength: rawText.length }, // Not saving raw text to save DB space, just metadata
      analysis: analysis
    });

    // 5. Auto-fill Profile
    await resumeRepository.updateCandidateProfileFromResume(userId, analysis);

    return {
      resumeId: resumeRecord.id,
      analysis
    };
  } catch (error) {
    console.error("Resume Processing Error:", error);
    throw new Error('Failed to process resume: ' + error.message);
  }
};

const getAnalytics = async () => {
  return await resumeRepository.getAnalytics();
};

module.exports = {
  processResumeUpload,
  getAnalytics
};
