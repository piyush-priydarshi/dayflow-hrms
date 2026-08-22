import express from 'express';
import { handleAIChat } from '../controllers/aiAssistantController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, handleAIChat);

export default router;
