import { Request, Response } from 'express';
import Coupon from '../Models/Coupon';
import Discount from '../Models/Discount';
import ComboDeal from '../Models/ComboDeal';
import GiftCard from '../Models/GiftCard';
import User from '../Models/Users';
import Product from '../Models/Products';
import Transaction from '../Models/Transaction';
import EmailService from '../Utils/EmailService';
import { Types } from 'mongoose';
import crypto from 'crypto';

// --- COUPON ANNOUNCEMENTS ---

export const adminCreateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const { code, discountType, discountValue, minOrderAmount, isAnnouncement, expiryDate } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      res.status(400).json({ success: false, message: 'Coupon code already exists' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      isAnnouncement: isAnnouncement !== undefined ? isAnnouncement : true,
      expiryDate: new Date(expiryDate),
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully!', coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Find active coupons that are announcements and have not expired
    const activeCoupons = await Coupon.find({
      isActive: true,
      isAnnouncement: true,
      expiryDate: { $gt: new Date() },
      _id: { $nin: user.accessedCoupons || [] } // Exclude coupons user already accessed in this session
    });

    res.status(200).json({
      success: true,
      announcements: activeCoupons
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const accessAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid coupon ID' });
      return;
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    // Add coupon ID to user's accessedCoupons array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { accessedCoupons: coupon._id }
    });

    res.status(200).json({
      success: true,
      message: 'Announcement marked as closed/accessed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- DYNAMIC DISCOUNTS ---

export const adminCreateDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const { name, targetType, targetValue, discountPercentage } = req.body;

    if (!name || !targetType || !targetValue || discountPercentage === undefined) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const discount = await Discount.create({
      name,
      targetType,
      targetValue,
      discountPercentage,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Discount rule created successfully! It is now directly applied to matching products.',
      discount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- COMBO DEALS ---

export const adminCreateComboDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const { name, products, comboPrice, totalLimit, endTime } = req.body;

    if (!name || !products || products.length === 0 || comboPrice === undefined || !totalLimit || !endTime) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Validate that all products exist
    for (const prodId of products) {
      if (!Types.ObjectId.isValid(prodId)) {
        res.status(400).json({ success: false, message: `Invalid Product ID: ${prodId}` });
        return;
      }
      const prodExists = await Product.findById(prodId);
      if (!prodExists) {
        res.status(404).json({ success: false, message: `Product not found: ${prodId}` });
        return;
      }
    }

    const comboDeal = await ComboDeal.create({
      name,
      products,
      comboPrice,
      totalLimit,
      endTime: new Date(endTime),
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Combo deal created successfully!', comboDeal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComboDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const combos = await ComboDeal.find({
      isActive: true,
      endTime: { $gt: new Date() }
    }).populate('products');

    res.status(200).json({
      success: true,
      combos
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const accessComboDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid Combo Deal ID' });
      return;
    }

    const comboDeal = await ComboDeal.findById(id);
    if (!comboDeal || !comboDeal.isActive) {
      res.status(404).json({ success: false, message: 'Combo Deal not found or inactive' });
      return;
    }

    // Check expiration time
    if (new Date() > comboDeal.endTime) {
      res.status(400).json({ success: false, message: 'Combo Deal has expired' });
      return;
    }

    // Check total limits
    if (comboDeal.timesAccessed >= comboDeal.totalLimit) {
      res.status(400).json({ success: false, message: 'Combo Deal access limit reached' });
      return;
    }

    // Check if user already claimed this deal
    const alreadyAccessed = comboDeal.accessedUsers.includes(userId as Types.ObjectId);
    if (alreadyAccessed) {
      res.status(400).json({ success: false, message: 'You have already accessed/claimed this Combo Deal' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Combo deal validated successfully!',
      comboDeal
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GIFT CARDS ---

export const purchaseGiftCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { amount, recipientEmail } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const value = Number(amount);
    if (!value || value <= 0) {
      res.status(400).json({ success: false, message: 'Please provide a valid gift card purchase amount' });
      return;
    }

    // Generate unique code GIFT-XXXX-YYYY
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `GIFT-${part1}-${part2}`;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Expiry in 1 year

    const giftCard = await GiftCard.create({
      code,
      originalValue: value,
      balance: value,
      owner: userId,
      recipientEmail: recipientEmail ? recipientEmail.toLowerCase() : undefined,
      expiryDate,
      isActive: true
    });

    const user = await User.findById(userId);

    // Send email with gift card code
    if (user) {
      await EmailService.sendGiftCardPurchase(user, giftCard);
    }

    res.status(201).json({
      success: true,
      message: 'Gift Card purchased successfully! Code details sent to email.',
      giftCard
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const redeemGiftCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { code } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!code) {
      res.status(400).json({ success: false, message: 'Please enter a Gift Card code' });
      return;
    }

    const giftCard = await GiftCard.findOne({ code: code.trim().toUpperCase() });

    if (!giftCard) {
      res.status(404).json({ success: false, message: 'Gift Card not found' });
      return;
    }

    if (!giftCard.isActive || giftCard.balance <= 0) {
      res.status(400).json({ success: false, message: 'This Gift Card is inactive or has zero balance' });
      return;
    }

    if (giftCard.expiryDate && new Date() > giftCard.expiryDate) {
      res.status(400).json({ success: false, message: 'This Gift Card has expired' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const giftAmount = giftCard.balance;

    // Credit user's walletBalance
    user.walletBalance = (user.walletBalance || 0) + giftAmount;
    await user.save();

    // Mark gift card redeemed and set new owner (the redeemer)
    giftCard.balance = 0;
    giftCard.isActive = false;
    giftCard.owner = new Types.ObjectId(userId as string);
    await giftCard.save();

    // Record Transaction
    await Transaction.create({
      user: userId,
      type: 'Credit',
      amount: giftAmount,
      description: `Redeemed Gift Card ${giftCard.code} to Wallet`
    });

    // Send notification email
    await EmailService.sendGiftCardRedeem(user, giftCard);

    res.status(200).json({
      success: true,
      message: `Gift card redeemed successfully! ₹${giftAmount.toFixed(2)} added to your wallet.`,
      walletBalance: user.walletBalance
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyGiftCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const cards = await GiftCard.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      giftCards: cards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllGiftCards = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }

    const cards = await GiftCard.find().populate('owner', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      giftCards: cards
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGiftCardByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ success: false, message: 'Please enter a Gift Card code' });
      return;
    }

    const giftCard = await GiftCard.findOne({ code: code.trim().toUpperCase() });
    if (!giftCard) {
      res.status(404).json({ success: false, message: 'Gift Card not found' });
      return;
    }

    if (!giftCard.isActive || giftCard.balance <= 0) {
      res.status(200).json({ success: false, message: 'Gift Card is inactive or has zero balance', giftCard });
      return;
    }

    if (giftCard.expiryDate && new Date() > giftCard.expiryDate) {
      res.status(200).json({ success: false, message: 'Gift Card has expired', giftCard });
      return;
    }

    res.status(200).json({
      success: true,
      giftCard
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCouponByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ success: false, message: 'Please enter a coupon code' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon code not found' });
      return;
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      res.status(200).json({ success: false, message: 'Coupon code has expired', coupon });
      return;
    }

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch active coupons publicly
export const getActiveCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeCoupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons: activeCoupons
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin fetches all coupons
export const adminGetCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin deletes a coupon by ID
export const adminDeleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin fetches all discounts
export const adminGetDiscounts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, discounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin deletes a discount by ID
export const adminDeleteDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
      return;
    }
    const { id } = req.params;
    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) {
      res.status(404).json({ success: false, message: 'Discount not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Discount deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




