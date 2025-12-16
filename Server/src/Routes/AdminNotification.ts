import express, { Router } from 'express';
import { getAllNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../Controller/AdminNotification';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const router: Router = express.Router();

router.get('/', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, getAllNotifications as express.RequestHandler);

router.patch('/:id/read', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, markAsRead as express.RequestHandler);

router.patch('/read-all', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, markAllAsRead as express.RequestHandler);

router.delete('/:id', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, deleteNotification as express.RequestHandler);

router.delete('/', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, deleteAllNotifications as express.RequestHandler);

export default router;
