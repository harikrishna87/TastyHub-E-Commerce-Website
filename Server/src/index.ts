import express, { Request, Response, NextFunction } from "express";
import connectDB from "./Config/Database_Connection";
import router_cart_item from "./Routes/Routes_Cart_Items";
import authRoutes from "./Routes/AuthRoutes";
import orderRoutes from "./Routes/OrderRoutes";
import payment_router from "./Routes/Razorpay_payment"
import product_router from "./Routes/ProductRoutes"
import favorite_router from "./Routes/FavoritesRoutes"
import notify_router from "./Routes/NotificationRoutes"
import adminNotificationRoutes from './Routes/AdminNotification';
import deliveryRouter from "./Routes/DeliveryRoutes";
import promoRouter from "./Routes/PromoRoutes";
import restaurantRouter from "./Routes/RestaurantRoutes";
import offerRouter from "./Routes/OfferBannerRoutes";
import reviewRouter from "./Routes/ReviewRoutes";
import {sendScheduledDealsNotifications} from "./Controller/NotificationController"
import cron from "node-cron"
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from 'passport';
import helmet from "helmet";
import { apiLimiter } from "./Middleware/RateLimitMiddleware";
import { metricsMiddleware } from "./Middleware/MetricsMiddleware";
import systemStatsRouter from "./Routes/SystemStatsRoutes";
import chatRoutes from "./Routes/ChatRoutes";
import inquiryRouter from "./Routes/InquiryRoutes";


dotenv.config();

// Enforce environment variables validation on startup for operations & resilience
const requiredEnv = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "RAZORPAY_API_KEY",
  "RAZORPAY_SECRET_KEY",
  "BREVO_API_KEY",
  "BREVO_FROM_EMAIL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_LOGIN_CLIENT_ID",
  "GOOGLE_LOGIN_CLIENT_SECRET",
  "GEMINI_API_KEY"
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ CRITICAL CONFIG ERROR: Missing environment variable ${key}`);
    process.exit(1);
  }
});

const app = express();

// Trust the reverse proxy (e.g. Render, Heroku) to determine client's IP address
app.set("trust proxy", 1);

// Apply metrics tracking middleware globally
app.use(metricsMiddleware);

connectDB();

// Apply security headers
app.use(helmet());

// Enable standard request rate limiter for API stability and DDoS prevention (managed in RateLimitMiddleware)

app.use("/api", apiLimiter);

app.use(passport.initialize());

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === "production";

const productionOrigins = [
  "https://tasty-hub-e-commerce-website.vercel.app",
  "https://tastyhub-admin-dashboard-sable-zeta.vercel.app",
  "https://tastyhubadmin.haritechinfo.online",
  "https://tastyhub.haritechinfo.online"
];

const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:4200",
  "http://localhost:57306",
  "http://localhost:3000",
  "http://localhost:3001"
];

const allowedOrigins = isProduction ? productionOrigins : [...productionOrigins, ...developmentOrigins];

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow any localhost or 127.0.0.1 origin (with any port) to prevent CORS blocks
    const isLocalhost = !isProduction && origin && (
      origin.startsWith("http://localhost:") || 
      origin.startsWith("http://127.0.0.1:")
    );

    if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      console.log("❌ Blocked Origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Remember-Token"],
}));


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Welcome to the Backend API");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "API is healthy" });
});

const scheduleWithRandomDelay = (cronExpression: string, slotName: string, maxDelayMinutes: number) => {
  cron.schedule(cronExpression, () => {
    const delayMs = Math.floor(Math.random() * maxDelayMinutes * 60 * 1000);
    const delayMinutes = (delayMs / 1000 / 60).toFixed(1);
    console.log(`⏰ [${slotName}] Cron triggered. Scheduled to send in ${delayMinutes} minutes (delay of ${delayMs}ms)`);
    setTimeout(async () => {
      try {
        console.log(`🚀 [${slotName}] Delay finished. Sending dynamic Gemini notifications...`);
        await sendScheduledDealsNotifications();
      } catch (error) {
        console.error(`❌ Error in delayed notification trigger for ${slotName}:`, error);
      }
    }, delayMs);
  }, {
    timezone: 'Asia/Kolkata'
  });
};

// Schedule 4 daily notifications at randomized times:
// 1. Morning (Breakfast): Triggers at 9:00 AM IST, random delay up to 90 minutes (9:00 AM - 10:30 AM)
scheduleWithRandomDelay('0 9 * * *', 'Morning/Breakfast', 90);

// 2. Lunch: Triggers at 1:00 PM IST, random delay up to 90 minutes (1:00 PM - 2:30 PM)
scheduleWithRandomDelay('0 13 * * *', 'Lunch', 90);

// 3. Evening (Snacks): Triggers at 5:00 PM IST, random delay up to 90 minutes (5:00 PM - 6:30 PM)
scheduleWithRandomDelay('0 17 * * *', 'Evening/Snacks', 90);

// 4. Dinner: Triggers at 8:30 PM IST, random delay up to 90 minutes (8:30 PM - 10:00 PM)
scheduleWithRandomDelay('30 20 * * *', 'Dinner', 90);


app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", router_cart_item);
app.use("/api/products", product_router);
app.use("/razorpay", apiLimiter, payment_router);
app.use("/api/favorites", favorite_router);
app.use("/api/notifications", notify_router);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/system-stats', systemStatsRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/promo", promoRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/offers", offerRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/inquiries", inquiryRouter);

// Unified Global Error Handling Middleware for API stability and security
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled Application Error:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" 
      ? "An unexpected internal server error occurred" 
      : err.message || "Internal Server Error"
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is Listening on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});