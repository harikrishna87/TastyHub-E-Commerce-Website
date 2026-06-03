import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ProductReview from '../Models/ProductReview';
import DeliveryReview from '../Models/DeliveryReview';
import Product from '../Models/Products';
import User from '../Models/Users';
import Order from '../Models/Orders';

// Create or Update a Product Review by Customer
export const createProductReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { rating, review, orderId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!rating || rating < 1 || rating > 5 || !review || !orderId) {
      res.status(400).json({ success: false, message: 'Please provide rating (1-5 stars), feedback text, and order reference ID' });
      return;
    }

    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'Invalid product or order ID format' });
      return;
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const orderExists = await Order.findById(orderId);
    if (!orderExists) {
      res.status(404).json({ success: false, message: 'Order reference not found' });
      return;
    }

    // Create or update review uniquely per order per product
    const updatedReview = await ProductReview.findOneAndUpdate(
      { order: orderId, product: productId },
      { user: userId, rating, review },
      { new: true, upsert: true }
    );

    // Recalculate average rating and unique customer review count for the product
    const reviews = await ProductReview.find({ product: productId });
    const count = reviews.length;
    const rateSum = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRate = count > 0 ? Number((rateSum / count).toFixed(1)) : 0;

    // Update Product document
    productExists.rating = {
      rate: averageRate,
      count: count,
    };
    await productExists.save();

    // Mark order as rated for products
    await Order.findByIdAndUpdate(orderId, { isProductRated: true });

    res.status(200).json({
      success: true,
      message: 'Product review submitted successfully!',
      review: updatedReview,
      productRating: productExists.rating
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already submitted a rating for this product in this order.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all customer reviews for a specific Product
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: 'Invalid product ID format' });
      return;
    }

    const reviews = await ProductReview.find({ product: productId })
      .populate('user', 'name email image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or Update a Delivery Executive Review by Customer
export const createDeliveryReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryExecutiveId } = req.params;
    const { rating, feedback, orderId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!rating || rating < 1 || rating > 5 || !feedback || !orderId) {
      res.status(400).json({ success: false, message: 'Please provide rating, feedback description, and order reference ID' });
      return;
    }

    if (!Types.ObjectId.isValid(deliveryExecutiveId) || !Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'Invalid executive or order ID format' });
      return;
    }

    const executive = await User.findOne({ _id: deliveryExecutiveId, role: 'delivery_executive' });
    if (!executive) {
      res.status(404).json({ success: false, message: 'Delivery partner not found' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order reference not found' });
      return;
    }

    // A rating of 3 or below indicates a complaint automatically
    const isComplaint = rating <= 3;

    // Save review uniquely per order
    const updatedReview = await DeliveryReview.findOneAndUpdate(
      { order: orderId },
      { deliveryExecutive: deliveryExecutiveId, user: userId, rating, feedback, isComplaint },
      { new: true, upsert: true }
    );

    // Recalculate average rating and unique review count for delivery executive
    const reviews = await DeliveryReview.find({ deliveryExecutive: deliveryExecutiveId });
    const count = reviews.length;
    const rateSum = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRate = count > 0 ? Number((rateSum / count).toFixed(1)) : 0;

    // Update User model
    executive.rating = {
      rate: averageRate,
      count: count,
    };
    await executive.save();

    // Mark order as rated for delivery partner feedback
    await Order.findByIdAndUpdate(orderId, { isDeliveryRated: true });

    res.status(200).json({
      success: true,
      message: isComplaint 
        ? 'Feedback logged. Sorry for the inconvenience, your complaint has been forwarded to the administrator.'
        : 'Thank you! Your feedback has been shared with the delivery partner.',
      review: updatedReview,
      executiveRating: executive.rating
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already submitted feedback for this delivery.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all delivery reviews / complaints
export const adminGetDeliveryReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Administrator only.' });
      return;
    }

    const reviews = await DeliveryReview.find()
      .populate('deliveryExecutive', 'name email image rating')
      .populate('user', 'name email image')
      .populate({
        path: 'order',
        select: '_id totalAmount deliveryStatus items createdAt'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
