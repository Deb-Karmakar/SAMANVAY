import express from 'express';
import { chatController } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat routes
router.post('/message', chatController.sendMessage);
router.get('/suggestions', chatController.getSuggestions);
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);

export default router;