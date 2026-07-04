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
  "GOOGLE_LOGIN_CLIENT_SECRET"
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/system-stats', systemStatsRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/promo", promoRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/offers", offerRouter);
app.use("/api/reviews", reviewRouter);

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