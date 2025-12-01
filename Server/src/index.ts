import express, { Request, Response } from "express";
import connectDB from "./Config/Database_Connection";
import router_cart_item from "./Routes/Routes_Cart_Items";
import authRoutes from "./Routes/AuthRoutes";
import orderRoutes from "./Routes/OrderRoutes";
import payment_router from "./Routes/Razorpay_payment"
import product_router from "./Routes/ProductRoutes"
import favorite_router from "./Routes/FavoritesRoutes"
import notify_router from "./Routes/NotificationRoutes"
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from 'passport';

dotenv.config();

const app = express();

connectDB();

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

const allowedOrigins = [
  'https://food-delight-ecommerce-application-chi.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Welcome to the Backend API");
});

app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", message: "API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", router_cart_item);
app.use("/api/products", product_router);
app.use("/razorpay", payment_router);
app.use("/api/favorites", favorite_router);
app.use("/api/notifications", notify_router)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is Listening on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});