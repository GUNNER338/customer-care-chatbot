const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../../middleware/auth.middleware');
const resumeController = require('./resume.controller');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Routes
router.post('/upload', authenticate, upload.single('resume'), resumeController.uploadResume);
router.get('/analytics', authenticate, resumeController.getAnalytics);

module.exports = router;
