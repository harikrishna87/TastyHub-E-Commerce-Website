import { Request, Response, NextFunction } from 'express';
import AdminNotification from '../Models/AdminNotification';

const getAllNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { limit = 50, skip = 0, isRead } = req.query;

        const filter: any = {};
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true';
        }

        const notifications = await AdminNotification.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .populate('userId', 'name email')
            .populate('orderId', 'totalAmount deliveryStatus');

        const totalCount = await AdminNotification.countDocuments(filter);
        const unreadCount = await AdminNotification.countDocuments({ isRead: false });

        res.status(200).json({
            success: true,
            notifications,
            totalCount,
            unreadCount,
        });
    } catch (error: any) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await AdminNotification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification,
        });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await AdminNotification.updateMany({ isRead: false }, { isRead: true });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const notification = await AdminNotification.findByIdAndDelete(id);

        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAllNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await AdminNotification.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'All notifications deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getAllNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications };
