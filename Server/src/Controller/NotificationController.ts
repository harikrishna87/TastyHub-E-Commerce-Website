import { Request, Response } from 'express';
import Notification from '../Models/Notification';
import admin from '../Utils/firebaseAdmin';
import User from '../Models/Users';

const createNotification = async (req: Request, res: Response) => {
    try {
        const { userId, title, body, type } = req.body;
        const notification = await Notification.create({ user: userId, title, body, type });
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to Create the Notification" });
    }
};

const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to get the Notifications" });
    }
};

const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to read the Notification" });
    }
};

const deals = [
    {
        title: "Your Biryani Craving Just Went Active!",
        description: "Aromatic, steaming biryani packed with rich spices and flavors that hit differently every single time."
    },
    {
        title: "Smoky Chicken Fresh Off the Grill!",
        description: "Juicy, tender chicken loaded with tandoori smokiness — the kind that makes you hungry instantly."
    },
    {
        title: "Seafood Magic Is Cooking Right Now!",
        description: "Fresh prawns and fish simmered in coastal spices — fragrant, rich, and impossible to resist."
    },
    {
        title: "Paneer Lovers, Your Favorite Is Ready!",
        description: "Soft, creamy paneer in lush gravies and tikkas that melt right in your mouth."
    },
    {
        title: "Pizza Straight Out of the Oven!",
        description: "Golden crusts, bubbling cheese, and bold toppings — your perfect pizza moment is right here."
    },
    {
        title: "Dessert That Makes Your Day Better!",
        description: "From cakes to laddus, sweet treats crafted to lift your mood with the very first bite."
    },
    {
        title: "Hot & Fresh Homestyle Meals!",
        description: "Warm curries, rasam, pappu, and comforting dishes that feel like home in every spoon."
    },
    {
        title: "Ice Cream Time? Always Yes!",
        description: "Creamy scoops in chocolate, mango, berry, and nutty flavors — your chill moment is waiting."
    },
    {
        title: "Refreshing Juices for a Fresh Start!",
        description: "Mango, watermelon, pomegranate and more — chilled, natural, and instantly refreshing."
    },
    {
        title: "Cravings Alert: Trending Dishes Are Live!",
        description: "Today’s most-loved dishes are sizzling hot and ready — tap to explore the favorites everyone is ordering."
    }
];

const greetBySlot = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Good Morning';
    else if (hour >= 12 && hour < 17) return 'Good Afternoon';
    else if (hour >= 17 && hour < 21) return 'Good Evening';
    else return 'Good Night';
};

const sendScheduledDealsNotifications = async () => {
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    if (!users.length) return;

    const now = new Date();
    const hour = now.getHours();
    const greeting = greetBySlot(hour);
    const dealIndex = hour % deals.length;
    const deal = deals[dealIndex];

    for (const user of users) {
        if (!user.fcmToken) continue;

        const personalizedTitle = `${greeting} ${user.name}`;
        const body = `${deal.title}\n${deal.description}`;

        const message = {
            notification: {
                title: personalizedTitle,
                body
            },
            token: user.fcmToken,
            android: { priority: 'high' as const },
            apns: { headers: { 'apns-priority': '10' } },
            webpush: { headers: { Urgency: 'high' } }
        };

        await admin.messaging().send(message);

        await Notification.create({
            user: user._id,
            title: personalizedTitle,
            body,
            type: 'deals'
        });
    }
};

export {
    sendScheduledDealsNotifications,
    createNotification,
    getUserNotifications,
    markNotificationRead
}