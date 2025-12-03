import { Request, Response, NextFunction } from 'express';
import admin from "../Utils/firebaseAdmin";
import Notification from '../Models/Notification';
import Order from '../Models/Orders';
import Cart from '../Models/Cart_Items';
import User from '../Models/Users';
import { OrderDeliveryStatus, IOrderPopulated, IOrder } from '../Types';
import { Types } from 'mongoose';
import EmailService from '../Utils/EmailService';

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

    const totalAmount = cart.items.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);

    const order = await Order.create({
      user: userId,
      items: cart.items,
      totalAmount,
      deliveryStatus: 'Pending',
      shippingAddress: shippingAddress,
      paymentMethod: req.body.paymentMethod || 'cod',
      paymentId: req.body.paymentId,
    });

    cart.items = [];
    await cart.save();

    EmailService.sendOrderConfirmation(
      user.email,
      user.name || 'Customer',
      order
    ).catch((error: any) => {
      console.error('Failed to send order confirmation email:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
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
      .populate('user', 'name email')
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
      .populate('user', 'name email')
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
      .populate('user', 'name email') as IOrderPopulated | null;

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

      const orderForEmail = {
        _id: order._id,
        user: order.user,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryStatus: order.deliveryStatus,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      } as IOrder;

      EmailService.sendOrderStatusUpdate(
        user.email,
        user.name || 'Customer',
        orderForEmail,
        status
      ).catch((error: any) => {
        console.error('❌ Failed to send order status update email:', error);
      });

      if (user && user.fcmTokens?.length) {
        console.log(`📱 Sending notification to ${user.fcmTokens.length} device(s)`);

        for (const token of user.fcmTokens) {
          const title = 'Order Status Updated 🎉';
          const body = `📦 Order: ${order._id}\n📝 Status: "${status}"\n💛 Thank you for shopping with us!`;

          const message = {
            token,
            notification: { title, body },
            android: { priority: "high" as const, notification: { sound: "default", channelId: "tastyhub_channel" } },
            apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
            webpush: { headers: { Urgency: "high" } },
            data: { type: "order_status", orderId: String(order._id), status }
          };

          try {
            const response = await admin.messaging().send(message);
            console.log(`✅ Notification sent successfully - Response: ${response}`);
            await Notification.create({ user: user._id, title, body, type: "order_status" });
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

    await order.populate('user', 'name email');

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



export { createOrder, getAllOrders, getUserOrders, updateOrderStatus, getOrderById };