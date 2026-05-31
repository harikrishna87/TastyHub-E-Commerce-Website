import express, { Router } from 'express';
import {
  adminCreateCoupon,
  getAnnouncements,
  accessAnnouncement,
  adminCreateDiscount,
  adminCreateComboDeal,
  getComboDeals,
  accessComboDeal,
  purchaseGiftCard,
  redeemGiftCard,
  getMyGiftCards,
  getAllGiftCards,
  getGiftCardByCode,
  getCouponByCode,
  adminGetCoupons,
  adminDeleteCoupon,
  adminGetDiscounts,
  adminDeleteDiscount,
  getMyTransactions
} from '../Controller/PromoController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const promoRouter: Router = express.Router();

// --- WALLET TRANSACTIONS ---
promoRouter.get('/transactions/my', protect as express.RequestHandler, getMyTransactions as express.RequestHandler);

// --- COUPON ANNOUNCEMENTS ---
// Admin gets all coupons
promoRouter.get('/coupons', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminGetCoupons as express.RequestHandler);
// Admin deletes coupon by ID
promoRouter.delete('/coupons/:id', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminDeleteCoupon as express.RequestHandler);
// Admin creates coupon
promoRouter.post('/coupons', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminCreateCoupon as express.RequestHandler);
// User fetches active session announcements
promoRouter.get('/coupons/announcements', protect as express.RequestHandler, getAnnouncements as express.RequestHandler);
// User closes/acknowledges announcement
promoRouter.post('/coupons/:id/access', protect as express.RequestHandler, accessAnnouncement as express.RequestHandler);

// --- DYNAMIC DISCOUNTS ---
// Admin gets all discounts
promoRouter.get('/discounts', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminGetDiscounts as express.RequestHandler);
// Admin deletes discount by ID
promoRouter.delete('/discounts/:id', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminDeleteDiscount as express.RequestHandler);
// Admin creates category or product discount rule
promoRouter.post('/discounts', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminCreateDiscount as express.RequestHandler);

// --- COMBO DEALS ---
// Admin creates combo deal
promoRouter.post('/combos', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminCreateComboDeal as express.RequestHandler);
// Fetch active combo deals
promoRouter.get('/combos', getComboDeals as express.RequestHandler);
// User accesses/claims combo deal
promoRouter.post('/combos/:id/access', protect as express.RequestHandler, accessComboDeal as express.RequestHandler);

// --- GIFT CARDS ---
// User buys a gift card
promoRouter.post('/giftcards', protect as express.RequestHandler, purchaseGiftCard as express.RequestHandler);
// User redeems a gift card code
promoRouter.post('/giftcards/redeem', protect as express.RequestHandler, redeemGiftCard as express.RequestHandler);
// User fetches their purchased/received gift cards
promoRouter.get('/giftcards/my', protect as express.RequestHandler, getMyGiftCards as express.RequestHandler);
// Admin fetches all gift cards in the system
promoRouter.get('/giftcards/all', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, getAllGiftCards as express.RequestHandler);
// Check/validate gift card code and return balance
promoRouter.get('/giftcards/check/:code', protect as express.RequestHandler, getGiftCardByCode as express.RequestHandler);
// Check/validate coupon code and return details
promoRouter.get('/coupons/check/:code', protect as express.RequestHandler, getCouponByCode as express.RequestHandler);




export default promoRouter;
