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

const dealsByTimeSlot = {
  breakfast: [
    {
      title: "☕ Craving Comfort Food?",
      description: "Fluffy pancakes, perfectly cooked eggs, and freshly brewed coffee. Pure breakfast bliss awaits you ☀️"
    },
    {
      title: "🥞 Start Your Day Right!",
      description: "Freshly made tiffins, crispy dosas, and hot idlis with chutneys. The perfect breakfast combo! 🌅"
    },
    {
      title: "🥤 Morning Refreshment Special",
      description: "Freshly squeezed juices, creamy smoothies, and power-packed breakfast bowls. Energize your morning! ⚡"
    }
  ],
  lunch: [
    {
      title: "🍗 Aromatic Biryani Fresh from the Kitchen",
      description: "Fragrant basmati rice layered with tender chicken and signature spices. A flavor explosion in every bite! 🔥"
    },
    {
      title: "🥗 Fresh & Flavorful Bowls",
      description: "Crisp salads and grilled chicken loaded with nutrients and flavor. Healthy never tasted this good! 💪"
    },
    {
      title: "🍜 Wok-Fired Noodle Perfection",
      description: "Stir-fried noodles tossed with fresh vegetables and your choice of protein. Authentic flavors in every forkful 🥢"
    }
  ],
  snacks: [
    {
      title: "🍕 Hand-Tossed Pizza Perfection",
      description: "Crispy crust, bubbling cheese, and premium toppings baked fresh just for you. Order your slice of heaven! 🧀"
    },
    {
      title: "🌮 Let's Taco 'Bout Deliciousness",
      description: "Crispy shells packed with seasoned meat, fresh veggies, and zesty sauces. Your taste buds will thank you! 🔥"
    },
    {
      title: "🍰 Sweet Indulgence Awaits",
      description: "Decadent cakes, flaky pastries, and traditional desserts made fresh daily. Treat yourself to something special 🎂"
    },
    {
      title: "🥤 Refreshment Calling Your Name",
      description: "Freshly squeezed juices, creamy smoothies, and iced beverages made to order. Beat the heat deliciously! 🌡️"
    }
  ],
  dinner: [
    {
      title: "🍔 Flame-Grilled Burger Heaven",
      description: "Juicy patties topped with crispy lettuce, ripe tomatoes, and our secret sauce. One bite says it all! 🔥"
    },
    {
      title: "🦐 Dive Into Coastal Flavors",
      description: "Fresh prawns and fish cooked in aromatic coastal spices. A seafood lover's dream come true 🌊"
    },
    {
      title: "🍗 Aromatic Biryani Fresh from the Kitchen",
      description: "Fragrant basmati rice layered with tender chicken and signature spices. A flavor explosion in every bite! 🔥"
    },
    {
      title: "🍜 Wok-Fired Noodle Perfection",
      description: "Stir-fried noodles tossed with fresh vegetables and your choice of protein. Authentic flavors in every forkful 🥢"
    }
  ],
  lateNight: [
    {
      title: "🌙 Midnight Hunger Sorted!",
      description: "Hot burgers, crispy fries, and cheesy pizzas ready to satisfy those late-night cravings! 🍔"
    },
    {
      title: "🍕 Late Night Pizza Delivery",
      description: "Craving something cheesy at midnight? Fresh pizza delivered hot to your doorstep. We're open late! 🌃"
    },
    {
      title: "🍜 Comfort Food After Dark",
      description: "Steaming noodles, crispy fried chicken, and hot soups perfect for late-night indulgence! 🥡"
    },
    {
      title: "🌮 Night Owl Special",
      description: "Loaded tacos, spicy wings, and cheesy nachos. Because midnight snacks should be legendary! 🦉"
    }
  ]
};

const greetBySlot = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 20) return 'Good Evening';
  return 'Good Night';
};

const getDealByTime = (hour: number): { title: string; description: string } => {
  let timeSlotDeals: { title: string; description: string }[];
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
    const deal = getDealByTime(hour);

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