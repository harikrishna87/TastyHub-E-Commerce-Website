import { Router } from 'express';
import { handleChat, getChatHistory, clearChatHistory } from '../Controller/ChatController';
import { protect } from '../Middleware/AuthMiddleWare';

const router = Router();

// Endpoint for chatbot interactions
router.post('/', handleChat);

// Persistent history routes (authenticated users only)
router.get('/history', protect as any, getChatHistory);
router.delete('/history', protect as any, clearChatHistory);

export default router;
