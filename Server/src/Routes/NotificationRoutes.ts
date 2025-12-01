import express, { Router } from 'express';
import { createNotification, getUserNotifications, markNotificationRead, sendScheduledDealsNotifications } from '../Controller/NotificationController';
import { protect } from "../Middleware/AuthMiddleWare"

const router: Router = express.Router();

router.post('/', protect as express.RequestHandler, createNotification as express.RequestHandler);
router.get('/', protect as express.RequestHandler, getUserNotifications as express.RequestHandler);
router.patch('/:id/read', protect as express.RequestHandler, markNotificationRead as express.RequestHandler);

router.post('/deals/schedule', protect as express.RequestHandler, async (req, res) => {
  try {
    await sendScheduledDealsNotifications();
    res.status(200).json({ success: true, message: 'Scheduled deals notifications sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
