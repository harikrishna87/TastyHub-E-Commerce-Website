import express, { Request, Response } from "express";
import connectDB from "./Config/Database_Connection";
import router_cart_item from "./Routes/Routes_Cart_Items";
import authRoutes from "./Routes/AuthRoutes";
import orderRoutes from "./Routes/OrderRoutes";
import payment_router from "./Routes/Razorpay_payment"
import product_router from "./Routes/ProductRoutes"
import favorite_router from "./Routes/FavoritesRoutes"
import notify_router from "./Routes/NotificationRoutes"
import {sendScheduledDealsNotifications} from "./Controller/NotificationController"
import cron from "node-cron"
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from 'passport';

dotenv.config();

const app = express();

connectDB();

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "https://tasty-hub-e-commerce-website.vercel.app",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked Origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Welcome to the Backend API");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "API is healthy" });
});

// MONDAY - 2 notifications
cron.schedule('0 11 * * 1', async () => {
  console.log('🍽️ Monday: Sending notification at 11:00 AM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('0 19 * * 1', async () => {
  console.log('🌙 Monday: Sending notification at 7:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// TUESDAY - 2 notifications
cron.schedule('30 10 * * 2', async () => {
  console.log('🌅 Tuesday: Sending notification at 10:30 AM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 18 * * 2', async () => {
  console.log('🌙 Tuesday: Sending notification at 6:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// WEDNESDAY - 2 notifications
cron.schedule('0 13 * * 3', async () => {
  console.log('🍽️ Wednesday: Sending notification at 1:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('0 20 * * 3', async () => {
  console.log('🌙 Wednesday: Sending notification at 8:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// THURSDAY - 2 notifications
cron.schedule('30 12 * * 4', async () => {
  console.log('🍽️ Thursday: Sending notification at 12:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('15 19 * * 4', async () => {
  console.log('🌙 Thursday: Sending notification at 7:15 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// FRIDAY - 2 notifications
cron.schedule('0 12 * * 5', async () => {
  console.log('🍽️ Friday: Sending notification at 12:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 20 * * 5', async () => {
  console.log('🌙 Friday: Sending notification at 8:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// SATURDAY - 2 notifications
cron.schedule('30 11 * * 6', async () => {
  console.log('🍽️ Saturday: Sending notification at 11:30 AM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('0 20 * * 6', async () => {
  console.log('🌙 Saturday: Sending notification at 8:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

// SUNDAY - 2 notifications
cron.schedule('0 12 * * 0', async () => {
  console.log('🍽️ Sunday: Sending notification at 12:00 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 19 * * 0', async () => {
  console.log('🌙 Sunday: Sending notification at 7:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});


app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", router_cart_item);
app.use("/api/products", product_router);
app.use("/razorpay", payment_router);
app.use("/api/favorites", favorite_router);
app.use("/api/notifications", notify_router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is Listening on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});