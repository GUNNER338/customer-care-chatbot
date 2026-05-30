const express = require('express');
const router = express.Router();
const memoryController = require('./memory.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Base memory routes
router.get('/', authenticate, memoryController.getMemories);
router.get('/analytics', authenticate, memoryController.getAnalytics);

// Specific memory routes
router.get('/:id', authenticate, memoryController.getMemoryById);
router.patch('/:id', authenticate, memoryController.updateMemory);
router.delete('/:id', authenticate, memoryController.deleteMemory);

module.exports = router;
