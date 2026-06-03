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
import { OrderDeliveryStatus, IOrderPopulated, IOrder } from '../Types';
import { Types } from 'mongoose';
import EmailService from '../Utils/EmailService';
import AdminNotification from '../Models/AdminNotification';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Cannot create order.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const shippingAddress = req.body.shippingAddress || user.shippingAddress;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required to create an order'
      });
    }

    const { couponCode, giftCardCode, useWallet = false, paymentMethod = 'cod', paymentId, comboId } = req.body;

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

    let finalAmount = baseTotal;
    let appliedCouponDiscount = 0;
    let appliedGiftCardDeduction = 0;
    let reminderMessage = '';

    // 1. Process Coupon Code
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (coupon) {
        if (baseTotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            appliedCouponDiscount = (baseTotal * coupon.discountValue) / 100;
          } else {
            appliedCouponDiscount = coupon.discountValue;
          }
          finalAmount = Math.max(0, finalAmount - appliedCouponDiscount);
        }
      }
    }

    // 2. Process Gift Card Code
    if (giftCardCode) {
      const giftCard = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (giftCard && giftCard.balance > 0) {
        if (giftCard.balance > finalAmount) {
          appliedGiftCardDeduction = finalAmount;
          giftCard.balance = Number((giftCard.balance - finalAmount).toFixed(2));
          finalAmount = 0;
        } else if (giftCard.balance === finalAmount) {
          appliedGiftCardDeduction = finalAmount;
          giftCard.balance = 0;
          giftCard.isActive = false;
          finalAmount = 0;
          reminderMessage = 'Your Gift Card has been fully consumed!';
        } else {
          appliedGiftCardDeduction = giftCard.balance;
          finalAmount = Number((finalAmount - giftCard.balance).toFixed(2));
          giftCard.balance = 0;
          giftCard.isActive = false;
        }
        await giftCard.save();
      }
    }

    // 3. Process Wallet Balance Deduction
    let appliedWalletDeduction = 0;
    if (useWallet && finalAmount > 0) {
      const walletBal = user.walletBalance || 0;
      if (walletBal > 0) {
        if (walletBal >= finalAmount) {
          appliedWalletDeduction = finalAmount;
          user.walletBalance = Number((walletBal - finalAmount).toFixed(2));
          finalAmount = 0;
        } else {
          appliedWalletDeduction = walletBal;
          finalAmount = Number((finalAmount - walletBal).toFixed(2));
          user.walletBalance = 0;
        }
        await user.save();

        // Record Transaction
        await Transaction.create({
          user: userId,
          type: 'Debit',
          amount: appliedWalletDeduction,
          description: `Paid for Order using Wallet Balance`
        });
      }
    }

    // Determine exact payment method
    let resolvedPaymentMethod = paymentMethod;
    if (finalAmount === 0) {
      if (appliedWalletDeduction > 0) {
        resolvedPaymentMethod = 'wallet';
      } else if (appliedGiftCardDeduction > 0) {
        resolvedPaymentMethod = 'gift_card';
      }
    }

    const order = await Order.create({
      user: userId,
      items: cart.items,
      totalAmount: finalAmount,
      deliveryStatus: 'Pending',
      shippingAddress: shippingAddress,
      paymentMethod: resolvedPaymentMethod,
      paymentId: paymentId || (resolvedPaymentMethod === 'gift_card' ? `GIFT-${Date.now()}` : (resolvedPaymentMethod === 'wallet' ? `WAL-${Date.now()}` : undefined)),
    });

    if (comboDealObj) {
      comboDealObj.timesAccessed += 1;
      comboDealObj.accessedUsers.push(userId as any);
      await comboDealObj.save();

      await EmailService.sendComboDealPurchase(user, comboDealObj).catch((err: any) => {
        console.error('Failed to send combo deal purchase email:', err);
      });
    }

    await AdminNotification.create({
      type: 'new_order',
      title: 'New Order Placed',
      message: `${user.name} Placed an Order Worth ₹${finalAmount.toFixed(2)} (Coupon: -₹${appliedCouponDiscount.toFixed(2)}, GiftCard: -₹${appliedGiftCardDeduction.toFixed(2)}, Wallet: -₹${appliedWalletDeduction.toFixed(2)})`,
      userId: user._id,
      orderId: order._id,
      userName: user.name,
      userEmail: user.email,
      orderAmount: finalAmount,
      isRead: false,
    });

    cart.items = [];
    await cart.save();


    // ✅ UPDATED: Pass order object directly (Brevo migration)
    const orderWithUser = {
      ...order.toObject(),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    };

    EmailService.sendOrderConfirmation(orderWithUser)
      .catch((error: any) => {
        console.error('Failed to send order confirmation email via Brevo:', error);
      });

    if (user && user.fcmTokens?.length) {
      const notification = {
        title: '🎉 Order Confirmed!',
        body: 'Restaurant is preparing your food with love.'
      };
      for (const token of user.fcmTokens) {
        const message = {
          token,
          notification: { title: notification.title, body: notification.body },
          android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
          apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
          webpush: { headers: { Urgency: "high" } },
          data: { type: "order_status", orderId: String(order._id), status: "Pending" }
        };
        try {
          await admin.messaging().send(message);
          await Notification.create({
            user: user._id,
            title: notification.title,
            body: notification.body,
            type: "order_status"
          });
        } catch (e) {
          const err = e as any;
          if (err?.errorInfo?.code === 'messaging/registration-token-not-registered') {
            await User.updateOne({ _id: user._id }, { $pull: { fcmTokens: token } });
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
      walletBalance: user.walletBalance,
      order,
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

    res.status(200).json({
      success: true,
      orders,
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
