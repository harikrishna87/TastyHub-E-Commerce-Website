import { Router } from 'express';
import { createInquiry, getInquiries, replyToInquiry } from '../Controller/InquiryController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const router = Router();

// Submit a new contact/inquiry form message (Public)
router.post('/', createInquiry);

// Retrieve all customer inquiries (Admin only)
router.get('/', protect as any, authorizeRoles('admin') as any, getInquiries);

// Reply to a customer inquiry (Admin only)
router.post('/:id/reply', protect as any, authorizeRoles('admin') as any, replyToInquiry);

export default router;
