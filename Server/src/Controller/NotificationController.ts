import { Request, Response } from 'express';
import Notification from '../Models/Notification';
import admin from '../Utils/firebaseAdmin';
import User from '../Models/Users';

const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, body, type } = req.body;
    const notification = await Notification.create({ user: userId, title, body, type });
    res.status(201).json({ success: true, notification });
  } catch {
    res.status(500).json({ success: false, message: "Unable to Create the Notification" });
  }
};

const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch {
    res.status(500).json({ success: false, message: "Unable to get the Notifications" });
  }
};

const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, notification });
  } catch {
    res.status(500).json({ success: false, message: "Unable to read the Notification" });
  }
};

const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const deletedNotification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

    if (!deletedNotification) return res.status(404).json({ success: false, message: 'Notification not found or unauthorized' });

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to delete the Notification' });
  }
};

const deals = [
  {
    title: "🔥 Hot Biryani Deal!",
    description: "🍛 Aromatic biryani with rich spices. Order now!"
  },
  {
    title: "🍗 Grilled Chicken Special!",
    description: "🔥 Smoky tandoori chicken, fresh off the grill."
  },
  {
    title: "🦐 Fresh Seafood Deal!",
    description: "🐟 Prawns & fish in coastal spices. Dive in!"
  },
  {
    title: "🧀 Paneer Lovers Alert!",
    description: "😋 Creamy paneer tikkas & curries waiting for you."
  },
  {
    title: "🍕 Pizza Time!",
    description: "🧀 Crispy crust, melted cheese. Your slice awaits!"
  },
  {
    title: "🍰 Sweet Treats!",
    description: "🎂 Cakes to laddus – satisfy your sweet tooth."
  },
  {
    title: "🏠 Homestyle Comfort!",
    description: "🍛 Warm curries & dal that feel like home."
  },
  {
    title: "🍨 Ice Cream Delight!",
    description: "🍦 Creamy scoops in your favorite flavors."
  },
  {
    title: "🥤 Fresh Juice Bar!",
    description: "🍉 Chilled mango, watermelon & pomegranate juices."
  },
  {
    title: "⭐ Trending Dishes!",
    description: "🔥 Today’s most-loved meals are ready to order."
  }
];


const greetBySlot = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const sendScheduledDealsNotifications = async () => {
  try {
    console.log('🔔 Starting scheduled deals notification job...');

    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });

    if (!users.length) {
      console.log('⚠️ No users with FCM tokens found');
      return;
    }

    console.log(`👥 Found ${users.length} users with FCM tokens`);

    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istTime.getHours();
    const greeting = greetBySlot(hour);
    const dealIndex = hour % deals.length;
    const deal = deals[dealIndex];

    console.log(`⏰ Time: ${hour}:00 IST - Sending: ${deal.title}`);

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      for (const token of user.fcmTokens || []) {
        const title = `${greeting} ${user.name || 'Friend'}!`;
        const body = `${deal.title}\n${deal.description}`;

        const message = {
          token,
          notification: { title, body },
          android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
          apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
          webpush: { headers: { Urgency: "high" } },
          data: { type: "deals", dealTitle: deal.title }
        };

        try {
          await admin.messaging().send(message);
          await Notification.create({ user: user._id, title, body, type: 'deals' });
          sentCount++;
        } catch (e) {
          const err = e as any;
          failedCount++;
          console.error(`❌ Failed to send to user ${user.email}: ${err.message}`);
          if (err?.errorInfo?.code === 'messaging/registration-token-not-registered') {
            console.log(`🗑️ Removing invalid token for ${user.email}`);
            await User.updateOne(
              { _id: user._id },
              { $pull: { fcmTokens: token } }
            );
          }
        }
      }
    }

    console.log(`✅ Deals notification job completed - Sent: ${sentCount}, Failed: ${failedCount}`);
  } catch (error: any) {
    console.error('❌ Error in scheduled deals notifications:', error);
  }
};

export {
  sendScheduledDealsNotifications,
  createNotification,
  getUserNotifications,
  markNotificationRead,
  deleteNotification
}