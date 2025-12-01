import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

const payment_router = express.Router();
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

const Process_Payment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    // ✅ Validate and convert safely
    const amountValue = Number(amount);
    if (!amountValue || isNaN(amountValue)) {
      res.status(400).json({ success: false, message: "Invalid or missing amount" });
      return;
    }

    const options = {
      amount: Math.round(amountValue * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Razorpay order creation failed",
    });
  }
};

const Get_Key = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

payment_router.route("/payment/process").post(Process_Payment);
payment_router.route("/getkey").get(Get_Key);

export default payment_router;