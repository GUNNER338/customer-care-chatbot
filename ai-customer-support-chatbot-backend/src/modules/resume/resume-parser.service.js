const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parses a resume file (PDF or DOCX) and extracts raw text.
 * @param {string} filePath - Path to the uploaded file.
 * @param {string} fileType - MIME type of the file.
 * @returns {Promise<string>} Extracted text.
 */
const extractText = async (filePath, fileType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found at path: ' + filePath);
  }

  try {
    let extractedText = '';

    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      throw new Error(`Unsupported file type for parsing: ${fileType}`);
    }

    // Basic cleanup of extracted text (remove excess whitespace/newlines)
    const cleanText = extractedText.replace(/\n\s*\n/g, '\n').trim();
    return cleanText;
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse resume: ' + error.message);
  }
};

module.exports = {
  extractText
};
