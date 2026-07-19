import { Request, Response } from 'express';
import Notification from '../Models/Notification';
import admin from '../Utils/firebaseAdmin';
import User from '../Models/Users';

const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, body, type } = req.body;
    const currentUserId = req.user?.id || req.user?._id?.toString();
    const currentUserRole = req.user?.role;

    if (userId !== currentUserId && currentUserRole !== 'admin') {
      res.status(403).json({ success: false, message: 'You are not authorized to create notifications for this user' });
      return;
    }

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
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });
    const notification = await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { read: true }, { new: true });
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

const titles = [
  "🍕 Hey Buddy, food time!",
  "🍔 Hey Buddy, your cravings called!",
  "😋 Hey Buddy, hungry much?",
  "🔥 Hey Buddy, mood = food!",
  "🎉 Hey Buddy, let's feast!",
  "🫶 Hey Buddy, treat yourself today!",
  "🌟 Hey Buddy, something yummy is loading...",
  "💫 Hey Buddy, your order vibe is ON!",
  "✨ Hey Buddy, ready for something delicious?"
];

const dealsByTimeSlot = {
  breakfast: [
    "Meal mood ON? Order before your hunger takes over!",
    "Today's vibe: Paneer Butter Masala. Agree?",
    "Pizza doesn't judge. Order now!",
    "Good food = good mood. Let's make your mood better"
  ],
  lunch: [
    "Burgers are calling you. Pick up the call!",
    "Meal mood ON? Order before your hunger takes over!",
    "Today's vibe: Paneer Butter Masala. Agree?",
    "Good food = good mood. Let's make your mood better"
  ],
  snacks: [
    "Pizza doesn't judge. Order now!",
    "Burgers are calling you. Pick up the call!",
    "Meal mood ON? Order before your hunger takes over!",
    "Good food = good mood. Let's make your mood better"
  ],
  dinner: [
    "Today's vibe: Paneer Butter Masala. Agree?",
    "Burgers are calling you. Pick up the call!",
    "Good food = good mood. Let's make your mood better",
    "Meal mood ON? Order before your hunger takes over!"
  ],
  lateNight: [
    "Midnight cravings? Order from late-night restaurants near you.",
    "Hot noodles + cold night = perfect combo!",
    "Meal mood ON? Order before your hunger takes over!",
    "Pizza doesn't judge. Order now!"
  ]
};

const getDealByTime = (hour: number): string => {
  let timeSlotDeals: string[];
  let slotName: string;

  if (hour >= 7 && hour < 11) {
    timeSlotDeals = dealsByTimeSlot.breakfast;
    slotName = 'breakfast';
  } else if (hour >= 11 && hour < 15) {
    timeSlotDeals = dealsByTimeSlot.lunch;
    slotName = 'lunch';
  } else if (hour >= 15 && hour < 19) {
    timeSlotDeals = dealsByTimeSlot.snacks;
    slotName = 'snacks';
  } else if (hour >= 19 && hour < 22) {
    timeSlotDeals = dealsByTimeSlot.dinner;
    slotName = 'dinner';
  } else {
    timeSlotDeals = dealsByTimeSlot.lateNight;
    slotName = 'lateNight';
  }

  const dealIndex = hour % timeSlotDeals.length;
  const deal = timeSlotDeals[dealIndex];

  console.log(`⏰ Time slot: ${slotName} (${hour}:00) - Deal index: ${dealIndex}`);
  return deal;
};

const getRandomTitle = (): string => {
  const randomIndex = Math.floor(Math.random() * titles.length);
  return titles[randomIndex];
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
    const dealMessage = getDealByTime(hour);

    console.log(`⏰ Time: ${hour}:00 IST - Sending: ${dealMessage}`);

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      for (const token of user.fcmTokens || []) {
        const title = getRandomTitle();
        const body = dealMessage;

        const message = {
          token,
          notification: { title, body },
          android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
          apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
          webpush: { headers: { Urgency: "high" } },
          data: { type: "deals", dealTitle: title }
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