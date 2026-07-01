import { Request, Response } from 'express';
import User from '../Models/Users';
import Order from '../Models/Orders';
import sendToken from '../Utils/jwt';
import EmailService from '../Utils/EmailService';
import AdminNotification from '../Models/AdminNotification';
import { Types } from 'mongoose';
import WithdrawalRequest from '../Models/WithdrawalRequest';
import DeliveryReview from '../Models/DeliveryReview';
import { createUserSession, clearUserSession } from '../Utils/sessionHelper';

// Register Delivery Executive
export const deliveryRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please enter all fields' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Account with this email already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'delivery_executive',
      deliveryStatus: 'Pending',
      isAvailable: true
    });

    // Notify Admin of new Delivery Executive
    await AdminNotification.create({
      type: 'new_user',
      title: 'New Delivery Partner Registered',
      message: `${name} has applied as a Delivery Executive and is waiting for approval!`,
      userId: user._id,
      userName: name,
      userEmail: email,
      isRead: false,
    });

    // Send registration pending email
    await EmailService.sendDERegistrationPending(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Waiting for admin approval.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        deliveryStatus: user.deliveryStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Delivery Executive
export const deliveryLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please enter email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'delivery_executive') {
      res.status(401).json({ success: false, message: 'Invalid credentials or you are not a delivery partner' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (user.deliveryStatus === 'Rejected') {
      res.status(403).json({
        success: false,
        message: 'Your application has been rejected by the administrator.'
      });
      return;
    }

    if (user.deliveryStatus === 'Pending') {
      // Allow login but explicitly signal they are not approved yet
      const token = user.getJwtToken();
      const rememberToken = await createUserSession(user._id as any, req, res, rememberMe);
      
      res.status(200).json({
        success: true,
        approved: false,
        message: 'Login successful, but waiting for admin approval to perform operations.',
        token,
        rememberToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          deliveryStatus: user.deliveryStatus,
        }
      });
      return;
    }

    // Fully approved, send standard auth response
    const rememberToken = await createUserSession(user._id as any, req, res, rememberMe);
    sendToken(user, 200, res, rememberToken);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Available Orders for delivery (Pending & No DE assigned)
export const getAvailableOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. You must be an approved Delivery Partner.' });
      return;
    }

    const orders = await Order.find({
      deliveryStatus: 'Pending',
      deliveryExecutive: null
    }).populate('user', 'name email shippingAddress');

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Accepted Orders for currently logged-in DE
export const getMyAcceptedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. You must be an approved Delivery Partner.' });
      return;
    }

    const orders = await Order.find({
      deliveryExecutive: req.user._id
    }).populate('user', 'name email shippingAddress');

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept an Order
export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. You must be an approved Delivery Partner.' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.deliveryStatus !== 'Pending' || order.deliveryExecutive) {
      res.status(400).json({ success: false, message: 'Order is already accepted or processed.' });
      return;
    }

    order.deliveryExecutive = req.user._id as Types.ObjectId;
    order.deliveryStatus = 'Accepted'; // Update status to Accepted
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Send status update email to the customer
    await EmailService.sendOrderStatusUpdate(populatedOrder, 'Accepted').catch((err: any) => {
      console.error('Failed to send Accepted status update email:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully!',
      order: populatedOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Order as Delivered
export const deliverOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. You must be an approved Delivery Partner.' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (String(order.deliveryExecutive) !== String(req.user._id)) {
      res.status(403).json({ success: false, message: 'You are not authorized to deliver this order' });
      return;
    }

    if (order.deliveryStatus !== 'Shipped' && order.deliveryStatus !== 'Out for Delivery') {
      res.status(400).json({ success: false, message: 'Order is not in shipped or out-for-delivery status.' });
      return;
    }

    order.deliveryStatus = 'Delivered';
    await order.save();

    // Delivery Executive commissions are calculated dynamically from completed orders, no wallet Balance update needed.

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Send delivered email to customer
    await EmailService.sendOrderStatusUpdate(populatedOrder, 'Delivered').catch((err: any) => {
      console.error('Failed to send Delivered status update email:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Order marked as Delivered successfully!',
      order: populatedOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order Status sequentially (Accepted -> Preparing -> Pickup -> Out for Delivery -> Delivered)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. You must be an approved Delivery Partner.' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (String(order.deliveryExecutive) !== String(req.user._id)) {
      res.status(403).json({ success: false, message: 'You are not authorized to manage this order' });
      return;
    }

    const validStatuses = ['Accepted', 'Preparing', 'Pickup', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}` });
      return;
    }

    // COD check: If status is being set to Delivered and order is COD, executive must confirm cash collection
    if (status === 'Delivered' && order.paymentMethod === 'cod') {
      const { confirmCodCollected } = req.body;
      if (!confirmCodCollected) {
        res.status(400).json({
          success: false,
          codRequired: true,
          message: 'Cash collection confirmation is required to deliver Cash on Delivery orders.'
        });
        return;
      }
    }

    if (status === 'Delivered') {
      // Delivery Executive commissions are calculated dynamically from completed orders, no wallet Balance update needed.
    }

    order.deliveryStatus = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Send status update email to customer
    await EmailService.sendOrderStatusUpdate(populatedOrder, status).catch((err: any) => {
      console.error(`Failed to send status update email for ${status}:`, err);
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully!`,
      order: populatedOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Delivery Executives
export const adminGetDeliveryExecutives = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const executives = await User.find({ role: 'delivery_executive' });
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const executivesWithStats = [];
    for (const exec of executives) {
      const dailyOrderCount = await Order.countDocuments({
        deliveryExecutive: exec._id,
        deliveryStatus: 'Delivered',
        updatedAt: { $gte: startOfToday, $lte: endOfToday }
      });
      
      let performance = 'Low';
      if (dailyOrderCount >= 5) {
        performance = 'High';
      } else if (dailyOrderCount >= 2) {
        performance = 'Medium';
      }

      // Dynamically calculate overall average rating (all reviews) and complaint count (rating < 3)
      const allReviews = await DeliveryReview.find({ deliveryExecutive: exec._id });
      const allCount = allReviews.length;
      const allRateSum = allReviews.reduce((sum, item) => sum + item.rating, 0);
      const overallRate = allCount > 0 ? Number((allRateSum / allCount).toFixed(1)) : 0;

      const complaintCount = await DeliveryReview.countDocuments({ deliveryExecutive: exec._id, rating: { $lt: 3 } });

      // Update User model in DB if rating is stale/mismatched
      if (!exec.rating || exec.rating.rate !== overallRate || exec.rating.count !== complaintCount) {
        exec.rating = {
          rate: overallRate,
          count: complaintCount
        };
        await exec.save();
      }

      executivesWithStats.push({
        ...exec.toObject(),
        rating: {
          rate: overallRate,
          count: complaintCount
        },
        dailyOrderCount,
        performance
      });
    }

    res.status(200).json({
      success: true,
      executives: executivesWithStats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve / Reject Delivery Executive
export const adminUpdateDEStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status. Must be Approved or Rejected' });
      return;
    }

    const executive = await User.findById(id);
    if (!executive || executive.role !== 'delivery_executive') {
      res.status(404).json({ success: false, message: 'Delivery Partner not found' });
      return;
    }

    executive.deliveryStatus = status;
    await executive.save();

    // Send email notification to Delivery Partner
    await EmailService.sendDEStatusUpdate(executive, status);

    res.status(200).json({
      success: true,
      message: `Delivery Partner has been successfully ${status}!`,
      executive
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a withdrawal for delivery partner
// @route   POST /api/delivery/withdraw
// @access  Private/Delivery Executive
export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, paymentDetails } = req.body;

    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied. Only approved partners can request withdrawals.' });
      return;
    }

    if (!amount || amount < 100 || !paymentDetails) {
      res.status(400).json({ success: false, message: 'Please provide withdrawal amount (minimum ₹100) and bank account details.' });
      return;
    }

    const executive = await User.findById(req.user._id);
    if (!executive) {
      res.status(404).json({ success: false, message: 'Delivery partner profile not found.' });
      return;
    }

    // Calculate Available Balance Dynamically
    const completedOrdersCount = await Order.countDocuments({
      deliveryExecutive: req.user._id,
      deliveryStatus: 'Delivered'
    });
    const lifetimeEarnings = completedOrdersCount * 30;

    const activeWithdrawals = await WithdrawalRequest.find({
      deliveryExecutive: req.user._id,
      status: { $ne: 'Rejected' }
    });
    const totalWithdrawnOrPending = activeWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const withdrawableBalance = Math.max(0, lifetimeEarnings - totalWithdrawnOrPending);

    if (withdrawableBalance < amount) {
      res.status(400).json({ success: false, message: `Insufficient earnings balance. Available balance: ₹${withdrawableBalance.toFixed(2)}` });
      return;
    }

    const request = await WithdrawalRequest.create({
      deliveryExecutive: req.user._id as Types.ObjectId,
      amount,
      paymentDetails,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully!',
      request,
      walletBalance: withdrawableBalance - amount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get executive's own withdrawal history
// @route   GET /api/delivery/withdrawals
// @access  Private/Delivery Executive
export const getMyWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'delivery_executive' || req.user?.deliveryStatus !== 'Approved') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const requests = await WithdrawalRequest.find({ deliveryExecutive: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all withdrawal requests
// @route   GET /api/delivery/admin/withdrawals
// @access  Private/Admin
export const adminGetWithdrawalRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const requests = await WithdrawalRequest.find({})
      .populate('deliveryExecutive', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Approve / Reject withdrawal request
// @route   PATCH /api/delivery/admin/withdrawals/:id/status
// @access  Private/Admin
export const adminUpdateWithdrawalStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // Approved or Rejected

    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status. Must be Approved or Rejected' });
      return;
    }

    const request = await WithdrawalRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Withdrawal request not found' });
      return;
    }

    if (request.status !== 'Pending') {
      res.status(400).json({ success: false, message: `Request has already been processed and is currently: ${request.status}` });
      return;
    }

    request.status = status;
    request.adminNotes = adminNotes || '';
    request.processedDate = new Date();
    await request.save();

    // If Rejected, refund the amount back to delivery executive's wallet balance (only if not a delivery executive, since they use dynamic calculations)
    if (status === 'Rejected') {
      const executive = await User.findById(request.deliveryExecutive);
      if (executive && executive.role !== 'delivery_executive') {
        executive.walletBalance = (executive.walletBalance || 0) + request.amount;
        await executive.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Withdrawal request successfully ${status}!`,
      request
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
