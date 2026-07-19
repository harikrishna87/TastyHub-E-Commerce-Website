import express, { Router } from 'express';
import {
  deliveryRegister,
  deliveryLogin,
  getAvailableOrders,
  getMyAcceptedOrders,
  acceptOrder,
  deliverOrder,
  updateOrderStatus,
  adminGetDeliveryExecutives,
  adminUpdateDEStatus,
  requestWithdrawal,
  getMyWithdrawals,
  adminGetWithdrawalRequests,
  adminUpdateWithdrawalStatus
} from '../Controller/DeliveryController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';
import { authLimiter } from '../Middleware/RateLimitMiddleware';

const deliveryRouter: Router = express.Router();

// Public routes for Delivery Partners
deliveryRouter.post('/register', authLimiter, deliveryRegister as express.RequestHandler);
deliveryRouter.post('/login', authLimiter, deliveryLogin as express.RequestHandler);

// Protected routes (Only for logged-in and approved Delivery Partners)
deliveryRouter.get('/orders/available', protect as express.RequestHandler, getAvailableOrders as express.RequestHandler);
deliveryRouter.get('/orders/my-accepted', protect as express.RequestHandler, getMyAcceptedOrders as express.RequestHandler);
deliveryRouter.patch('/orders/:id/accept', protect as express.RequestHandler, acceptOrder as express.RequestHandler);
deliveryRouter.patch('/orders/:id/deliver', protect as express.RequestHandler, deliverOrder as express.RequestHandler);
deliveryRouter.patch('/orders/:id/status', protect as express.RequestHandler, updateOrderStatus as express.RequestHandler);
deliveryRouter.post('/withdraw', protect as express.RequestHandler, requestWithdrawal as express.RequestHandler);
deliveryRouter.get('/withdrawals', protect as express.RequestHandler, getMyWithdrawals as express.RequestHandler);

// Admin-only management routes
deliveryRouter.get('/admin/executives', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminGetDeliveryExecutives as express.RequestHandler);
deliveryRouter.patch('/admin/executives/:id/status', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminUpdateDEStatus as express.RequestHandler);
deliveryRouter.get('/admin/withdrawals', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminGetWithdrawalRequests as express.RequestHandler);
deliveryRouter.patch('/admin/withdrawals/:id/status', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminUpdateWithdrawalStatus as express.RequestHandler);

export default deliveryRouter;
