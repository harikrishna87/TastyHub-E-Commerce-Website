import { Request, Response, NextFunction } from 'express';
import admin from "../Utils/firebaseAdmin";
import Notification from '../Models/Notification';
import Order from '../Models/Orders';
import Cart from '../Models/Cart_Items';
import User from '../Models/Users';
import Coupon from '../Models/Coupon';
import GiftCard from '../Models/GiftCard';
import Transaction from '../Models/Transaction';
import ComboDeal from '../Models/ComboDeal';
import ProductReview from '../Models/ProductReview';
import DeliveryReview from '../Models/DeliveryReview';
import { OrderDeliveryStatus, IOrderPopulated, IOrder } from '../Types';
import mongoose, { Types } from 'mongoose';
import Razorpay from 'razorpay';
import EmailService from '../Utils/EmailService';
import AdminNotification from '../Models/AdminNotification';
import SystemSettings from '../Models/SystemSettings';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { couponCode, giftCardCode, useWallet = false, paymentMethod = 'cod', paymentId, comboId } = req.body;

    const shippingAddress = req.body.shippingAddress;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required to create an order'
      });
    }

    // 1. Initial calculations and verification (Read-only / Pre-validation)
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Cannot create order.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let baseTotal = cart.items.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
    let comboDealObj = null;

    if (comboId) {
      if (!Types.ObjectId.isValid(comboId)) {
        return res.status(400).json({ success: false, message: 'Invalid Combo Deal ID' });
      }
      comboDealObj = await ComboDeal.findById(comboId);
      if (!comboDealObj || !comboDealObj.isActive) {
        return res.status(404).json({ success: false, message: 'Combo Deal not found or inactive' });
      }
      if (new Date() > comboDealObj.endTime) {
        return res.status(400).json({ success: false, message: 'Combo Deal has expired' });
      }
      if (comboDealObj.timesAccessed >= comboDealObj.totalLimit) {
        return res.status(400).json({ success: false, message: 'Combo Deal access limit reached' });
      }
      const alreadyClaimed = comboDealObj.accessedUsers.includes(userId as any);
      if (alreadyClaimed) {
        return res.status(400).json({ success: false, message: 'You have already claimed this Combo Deal' });
      }

      baseTotal = comboDealObj.comboPrice;
    }

    // Calculate and apply delivery fee dynamically from SystemSettings
    let deliveryFee = 0;
    if (!comboId) {
      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = await SystemSettings.create({});
      }
      const minAmountForFreeDelivery = settings.freeDeliveryMinAmount ?? 500;
      const flatFee = settings.flatDeliveryFee ?? 40;

      if (baseTotal < minAmountForFreeDelivery) {
        deliveryFee = flatFee;
      }
    }

    let finalAmount = baseTotal + deliveryFee;
    let appliedCouponDiscount = 0;
    let appliedGiftCardDeduction = 0;
    let reminderMessage = '';

    // Coupon Code check
    let couponObj = null;
    if (couponCode) {
      couponObj = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (couponObj) {
        if (baseTotal >= couponObj.minOrderAmount) {
          if (couponObj.discountType === 'percentage') {
            appliedCouponDiscount = (baseTotal * couponObj.discountValue) / 100;
          } else {
            appliedCouponDiscount = couponObj.discountValue;
          }
          finalAmount = Math.max(0, finalAmount - appliedCouponDiscount);
        }
      }
    }

    // Gift Card check
    let giftCardObj = null;
    if (giftCardCode) {
      giftCardObj = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (giftCardObj && giftCardObj.balance > 0) {
        if (giftCardObj.balance > finalAmount) {
          appliedGiftCardDeduction = finalAmount;
          finalAmount = 0;
        } else if (giftCardObj.balance === finalAmount) {
          appliedGiftCardDeduction = finalAmount;
          finalAmount = 0;
          reminderMessage = 'Your Gift Card has been fully consumed!';
        } else {
          appliedGiftCardDeduction = giftCardObj.balance;
          finalAmount = Number((finalAmount - giftCardObj.balance).toFixed(2));
        }
      }
    }

    // Wallet Balance check
    let appliedWalletDeduction = 0;
    if (useWallet && finalAmount > 0) {
      const walletBal = user.walletBalance || 0;
      if (walletBal > 0) {
        if (walletBal >= finalAmount) {
          appliedWalletDeduction = finalAmount;
          finalAmount = 0;
        } else {
          appliedWalletDeduction = walletBal;
          finalAmount = Number((finalAmount - walletBal).toFixed(2));
        }
      }
    }

    // 2. SERVER-SIDE RAZORPAY PAYMENT VERIFICATION
    if (paymentMethod === 'online' && finalAmount > 0) {
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required for online payments' });
      }
      try {
        const paymentDetails = await razorpayInstance.payments.fetch(paymentId);
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({
            success: false,
            message: `Payment verification failed. Razorpay status: ${paymentDetails.status}`
          });
        }
        const expectedPaise = Math.round(finalAmount * 100);
        if (Math.abs(Number(paymentDetails.amount) - expectedPaise) > 100) { // Allow up to 1 rupee difference for decimal rounding
          return res.status(400).json({
            success: false,
            message: `Payment verification failed. Paid amount: ₹${Number(paymentDetails.amount) / 100}, Expected: ₹${finalAmount}`
          });
        }
      } catch (rzpErr: any) {
        console.error('Razorpay payment fetch error:', rzpErr);
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment verification failed: Invalid Payment ID'
        });
      }
    }

    // Determine resolved payment method
    let resolvedPaymentMethod = paymentMethod;
    if (finalAmount === 0) {
      if (appliedWalletDeduction > 0) {
        resolvedPaymentMethod = 'wallet';
      } else if (appliedGiftCardDeduction > 0) {
        resolvedPaymentMethod = 'gift_card';
      }
    }

    // 3. Execution function wrapping database mutations
    const performCheckoutMutations = async (session?: mongoose.ClientSession) => {
      // Re-fetch documents within session to ensure concurrency control
      const dbUser = session ? await User.findById(userId).session(session) : await User.findById(userId);
      if (!dbUser) throw new Error('User not found during transaction');

      const dbCart = session ? await Cart.findOne({ user: userId }).session(session) : await Cart.findOne({ user: userId });
      if (!dbCart || dbCart.items.length === 0) throw new Error('Cart is empty during transaction');

      // Deduct gift card if applicable
      if (giftCardCode && appliedGiftCardDeduction > 0) {
        const dbGiftCard = session ? await GiftCard.findOne({ code: giftCardCode.toUpperCase() }).session(session) : await GiftCard.findOne({ code: giftCardCode.toUpperCase() });
        if (dbGiftCard) {
          dbGiftCard.balance = Number((dbGiftCard.balance - appliedGiftCardDeduction).toFixed(2));
          if (dbGiftCard.balance <= 0) {
            dbGiftCard.isActive = false;
          }
          await dbGiftCard.save({ session });
        }
      }

      // Deduct wallet if applicable
      if (useWallet && appliedWalletDeduction > 0) {
        dbUser.walletBalance = Number(((dbUser.walletBalance || 0) - appliedWalletDeduction).toFixed(2));
        await dbUser.save({ session });

        // Record Transaction
        const transactionRecord = new Transaction({
          user: userId,
          type: 'Debit',
          amount: appliedWalletDeduction,
          description: `Paid for Order using Wallet Balance`
        });
        await transactionRecord.save({ session });
      }

      // Update Combo Deal times accessed
      if (comboId && comboDealObj) {
        const dbCombo = session ? await ComboDeal.findById(comboId).session(session) : await ComboDeal.findById(comboId);
        if (dbCombo) {
          dbCombo.timesAccessed += 1;
          dbCombo.accessedUsers.push(userId as any);
          await dbCombo.save({ session });
        }
      }

      // Create Order
      const newOrder = new Order({
        user: userId,
        items: dbCart.items,
        totalAmount: finalAmount,
        deliveryStatus: 'Pending',
        shippingAddress: shippingAddress,
        paymentMethod: resolvedPaymentMethod,
        paymentId: paymentId || (resolvedPaymentMethod === 'gift_card' ? `GIFT-${Date.now()}` : (resolvedPaymentMethod === 'wallet' ? `WAL-${Date.now()}` : undefined)),
      });
      await newOrder.save({ session });

      // Create Admin Notification
      const adminNotify = new AdminNotification({
        type: 'new_order',
        title: 'New Order Placed',
        message: `${dbUser.name} Placed an Order Worth ₹${finalAmount.toFixed(2)} (Coupon: -₹${appliedCouponDiscount.toFixed(2)}, GiftCard: -₹${appliedGiftCardDeduction.toFixed(2)}, Wallet: -₹${appliedWalletDeduction.toFixed(2)})`,
        userId: dbUser._id,
        orderId: newOrder._id,
        userName: dbUser.name,
        userEmail: dbUser.email,
        orderAmount: finalAmount,
        isRead: false,
      });
      await adminNotify.save({ session });

      // Clear Cart
      dbCart.items = [];
      await dbCart.save({ session });

      return { newOrder, dbUser };
    };

    // 4. Run mutations inside safe transaction wrapper
    const checkoutWrapper = async () => {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        const result = await performCheckoutMutations(session);
        await session.commitTransaction();
        return result;
      } catch (error: any) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        const isReplicaSetError = error.message && (
          error.message.includes('Transaction numbers are only allowed on a replica set') ||
          error.message.includes('sessions are not supported') ||
          error.code === 20
        );
        if (isReplicaSetError) {
          console.warn("⚠️ Standalone MongoDB detected. Retrying checkout operations without transaction session.");
          return await performCheckoutMutations();
        }
        throw error;
      } finally {
        session.endSession();
      }
    };

    const { newOrder, dbUser } = await checkoutWrapper();

    // 5. Post-checkout operations (Emails & Push Notifications)
    if (comboId && comboDealObj) {
      await EmailService.sendComboDealPurchase(dbUser, comboDealObj).catch((err: any) => {
        console.error('Failed to send combo deal purchase email:', err);
      });
    }

    const orderWithUser = {
      ...newOrder.toObject(),
      user: {
        _id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email
      }
    };

    EmailService.sendOrderConfirmation(orderWithUser)
      .catch((error: any) => {
        console.error('Failed to send order confirmation email via Brevo:', error);
      });

    if (dbUser && dbUser.fcmTokens?.length) {
      const notification = {
        title: '🎉 Order Confirmed!',
        body: 'Restaurant is preparing your food with love.'
      };
      for (const token of dbUser.fcmTokens) {
        const message = {
          token,
          notification: { title: notification.title, body: notification.body },
          android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
          apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
          webpush: { headers: { Urgency: "high" } },
          data: { type: "order_status", orderId: String(newOrder._id), status: "Pending" }
        };
        try {
          await admin.messaging().send(message);
          await Notification.create({
            user: dbUser._id,
            title: notification.title,
            body: notification.body,
            type: "order_status"
          });
        } catch (e) {
          const err = e as any;
          if (err?.errorInfo?.code === 'messaging/registration-token-not-registered') {
            await User.updateOne({ _id: dbUser._id }, { $pull: { fcmTokens: token } });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: reminderMessage || 'Order placed successfully!',
      appliedCouponDiscount,
      appliedGiftCardDeduction,
      appliedWalletDeduction,
      walletBalance: dbUser.walletBalance,
      order: newOrder,
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email image')
      .populate('deliveryExecutive', 'name email image rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const orders = await Order.find({ user: userId })
      .populate('user', 'name email image')
      .populate('deliveryExecutive', 'name email image rating')
      .sort({ createdAt: -1 });

    // Fetch all reviews by this user to enrich the orders dynamically
    const productReviews = await ProductReview.find({ user: userId });
    const deliveryReviews = await DeliveryReview.find({ user: userId });

    // Map orderId -> list of product review ratings
    const productReviewsMap = new Map<string, number[]>();
    productReviews.forEach((r) => {
      if (r.order) {
        const orderIdStr = r.order.toString();
        if (!productReviewsMap.has(orderIdStr)) {
          productReviewsMap.set(orderIdStr, []);
        }
        productReviewsMap.get(orderIdStr)!.push(r.rating);
      }
    });

    // Map orderId -> delivery review rating
    const deliveryReviewsMap = new Map<string, number>();
    deliveryReviews.forEach((r) => {
      if (r.order) {
        deliveryReviewsMap.set(r.order.toString(), r.rating);
      }
    });

    const enrichedOrders = orders.map((order) => {
      const orderObj = order.toObject();
      const orderIdStr = (orderObj._id as any).toString();
      
      // Calculate average product rating for this order
      const productRatings = productReviewsMap.get(orderIdStr) || [];
      const avgProductRating = productRatings.length > 0
        ? Math.round(productRatings.reduce((sum, val) => sum + val, 0) / productRatings.length)
        : (orderObj.isProductRated ? 5 : 0); // fallback to 5 stars if marked as rated but review details missing

      // Get delivery rating for this order
      const deliveryRating = deliveryReviewsMap.get(orderIdStr) || (orderObj.isDeliveryRated ? 5 : 0);

      return {
        ...orderObj,
        productRating: avgProductRating,
        deliveryRating: deliveryRating,
      };
    });

    res.status(200).json({
      success: true,
      orders: enrichedOrders,
    });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email image')
      .populate('deliveryExecutive', 'name email image rating') as IOrderPopulated | null;

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderUserId = typeof order.user === 'object' && order.user._id
      ? order.user._id.toString()
      : order.user.toString();

    if (orderUserId !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Error fetching order by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📦 Order status update request - OrderID: ${id}, New Status: ${status}`);

    if (!Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid order ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
      console.log('❌ Invalid delivery status');
      return res.status(400).json({ success: false, message: 'Invalid delivery status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.deliveryStatus = status as OrderDeliveryStatus;
    await order.save();
    console.log(`✅ Order ${id} status updated to: ${status}`);

    const user = await User.findById(order.user);

    if (user) {
      console.log(`👤 User found: ${user.email}`);

      // ✅ UPDATED: Create order object with populated user (Brevo migration)
      const orderForEmail = {
        _id: order._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryStatus: order.deliveryStatus,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      // ✅ UPDATED: Pass order object and new status (Brevo migration)
      EmailService.sendOrderStatusUpdate(orderForEmail, status)
        .catch((error: any) => {
          console.error('❌ Failed to send order status update email via Brevo:', error);
        });

      if (user && user.fcmTokens?.length) {
        console.log(`📱 Sending notification to ${user.fcmTokens.length} device(s)`);

        const getOrderNotification = (status: string) => {
          const notifications: Record<string, { title: string; body: string }> = {
            'Pending': {
              title: '🎉 Order Confirmed!',
              body: 'Restaurant is preparing your food with love.'
            },
            'Shipped': {
              title: '🛵 Your food is on the way!',
              body: 'Delivery partner is heading towards you. Hang tight!'
            },
            'Delivered': {
              title: '✅ Order Delivered!',
              body: 'Enjoy your meal! Don\'t forget to rate us.'
            }
          };

          return notifications[status] || {
            title: '📦 Order Update',
            body: 'Your order status has been updated.'
          };
        };

        const notification = getOrderNotification(status);

        for (const token of user.fcmTokens) {
          const message = {
            token,
            notification: { title: notification.title, body: notification.body },
            android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
            apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
            webpush: { headers: { Urgency: "high" } },
            data: { type: "order_status", orderId: String(order._id), status }
          };

          try {
            const response = await admin.messaging().send(message);
            console.log(`✅ Notification sent successfully - Response: ${response}`);
            await Notification.create({ user: user._id, title: notification.title, body: notification.body, type: "order_status" });
          } catch (e) {
            const err = e as any;
            console.error(`❌ Failed to send notification - Error: ${err.message}`);
            if (err?.errorInfo?.code === 'messaging/registration-token-not-registered') {
              console.log(`🗑️ Removing invalid token: ${token.substring(0, 20)}...`);
              await User.updateOne({ _id: user._id }, { $pull: { fcmTokens: token } });
            }
          }
        }
      } else {
        console.log('⚠️ No FCM tokens found for user');
      }
    } else {
      console.log('⚠️ User not found for order');
    }

    await order.populate([
      { path: 'user', select: 'name email image' },
      { path: 'deliveryExecutive', select: 'name email image rating' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });

  } catch (error: any) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderUserId = order.user.toString();
    if (orderUserId !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this order'
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createOrder, getAllOrders, getUserOrders, updateOrderStatus, getOrderById, deleteOrder };
