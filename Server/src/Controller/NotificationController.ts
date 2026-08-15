import { Request, Response } from 'express';
import Notification from '../Models/Notification';
import admin from '../Utils/firebaseAdmin';
import User from '../Models/Users';
import Product from '../Models/Products';
import Coupon from '../Models/Coupon';
import ComboDeal from '../Models/ComboDeal';
import Restaurant from '../Models/Restaurant';
import { GoogleGenAI } from '@google/genai';

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

const getTimeSlotName = (hour: number): string => {
  if (hour >= 7 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snacks';
  if (hour >= 19 && hour < 22) return 'dinner';
  return 'lateNight';
};

const extractJson = (text: string): any => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Ignore and try extraction
  }

  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(jsonBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // Ignore
    }
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Ignore
    }
  }

  throw new Error("No valid JSON structure found in response text: " + text);
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
    const slotName = getTimeSlotName(hour);
    const fallbackMessage = getDealByTime(hour);
    const fallbackTitle = getRandomTitle();

    let title = fallbackTitle;
    let body = fallbackMessage;

    // Try to generate dynamic message using Gemini
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        console.warn('⚠️ GEMINI_API_KEY is not configured or is a placeholder in environment. Using static fallback.');
      } else {
        console.log('🤖 Fetching context for Gemini generation...');
        const [products, coupons, combos, restaurants] = await Promise.all([
          Product.find().select('title price category rating').limit(15),
          Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } }).select('code discountType discountValue minOrderAmount'),
          ComboDeal.find({ isActive: true, endTime: { $gt: new Date() } }).select('name comboPrice products').populate({ path: 'products', select: 'title' }),
          Restaurant.find({}).select('name cuisines rating offer popularDish').limit(10)
        ]);

        const productsText = products.map(p => `- ${p.title} (${p.category}): ₹${p.price}`).join('\n');
        const couponsText = coupons.map(c => `- Code: ${c.code} (${c.discountValue}${c.discountType === 'percentage' ? '%' : ' INR'} OFF)`).join('\n');
        const combosText = combos.map((c: any) => `- Combo: ${c.name} (₹${c.comboPrice}) containing: ${c.products.map((p: any) => p.title).join(' + ')}`).join('\n');
        const restaurantsText = restaurants.map(r => `- ${r.name} (${r.cuisines.join(', ')}) - Popular: ${r.popularDish || 'N/A'}, Offer: ${r.offer || 'N/A'}`).join('\n');

        const systemPrompt = `You are Buddy, the witty and creative marketing copywriter for the TastyHub food delivery app.
Your task is to generate a highly engaging, catchy, creative, and witty push notification (like Zomato and Swiggy notifications) based on:
1. The current time of day/meal time slot.
2. The available products/menu catalog.
3. Active coupons and combo deals.
4. Active restaurants.

Rules:
- The tone must be extremely witty, casual, food-loving, and engaging.
- Use highly relevant food/time emojis in both the title and the body (maximum 1 or 2 in each field). Do NOT use excessive or unrelated emojis. Emojis must directly match the food items (e.g. 🍕 for pizza, 🍛 for biryani) or time (e.g. ⏰).
- Reference actual items from the menu, combo deals, restaurant names, or coupon codes provided in the user prompt to make the notification feel real and context-aware.
- Avoid generic placeholders (like "[Product Name]" or "[Coupon Code]"). If a field is empty, do not mention it.
- Keep the title and body extremely engaging, urging the user to tap and order now.
- CRITICAL: The "body" must be extremely short, using only 9 to 10 words maximum. Keep it punchy, creative, and fast to read!

You must output exactly a JSON object matching this schema:
{
  "title": "A short, catchy, emoji-rich notification title (under 50 chars)",
  "body": "A punchy, creative message of exactly 9 to 10 words maximum, including highly relevant food/time emojis."
}`;

        const userPrompt = `Generate a push notification for:
Time of Day Slot: ${slotName} (Hour: ${hour}:00 IST)

Here is the current database context:
---
Available Products:
${productsText || "None"}

Active Coupons:
${couponsText || "None"}

Active Combo Deals:
${combosText || "None"}

Active Restaurants:
${restaurantsText || "None"}
---
Make it sound like a catchy Zomato/Swiggy alert!`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.85,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                body: { type: 'STRING' }
              },
              required: ['title', 'body']
            }
          }
        });

        if (response.text) {
          console.log('🤖 Gemini Raw Response:', response.text);
          const generated = extractJson(response.text);
          if (generated.title && generated.body) {
            title = generated.title;
            body = generated.body;
            console.log(`✅ Gemini successfully generated Zomato/Swiggy style alert!`);
          }
        }
      }
    } catch (genError: any) {
      console.error('❌ Failed to generate dynamic message using Gemini. Error:', genError.message);
      console.log('➡️ Falling back to static deals.');
    }

    console.log(`⏰ Time: ${hour}:00 IST - Sending: "${title}" - "${body}"`);

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users) {
      for (const token of user.fcmTokens || []) {
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