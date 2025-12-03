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

cron.schedule('0 9 * * *', async () => {
  console.log('Sending notification at 9:00 AM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 11 * * *', async () => {
  console.log('Sending notification at 11:30 AM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 14 * * *', async () => {
  console.log('Sending notification at 2:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 17 * * *', async () => {
  console.log('Sending notification at 5:30 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});


cron.schedule('15 20 * * *', async () => {
  console.log('Sending notification at 8:15 PM');
  await sendScheduledDealsNotifications();
}, {
  timezone: 'Asia/Kolkata'
});

cron.schedule('30 22 * * *', async () => {
  console.log('Sending notification at 10:30 PM');
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