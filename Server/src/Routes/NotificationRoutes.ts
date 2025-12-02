import express, { Router } from 'express';
import { createNotification, getUserNotifications, markNotificationRead, deleteNotification } from '../Controller/NotificationController';
import { protect } from "../Middleware/AuthMiddleWare"

const router: Router = express.Router();

router.post('/', protect as express.RequestHandler, createNotification as express.RequestHandler);
router.get('/', protect as express.RequestHandler, getUserNotifications as express.RequestHandler);
router.patch('/:id/read', protect as express.RequestHandler, markNotificationRead as express.RequestHandler);
router.delete("/delete/:id", protect as express.RequestHandler, deleteNotification as express.RequestHandler);

export default router;