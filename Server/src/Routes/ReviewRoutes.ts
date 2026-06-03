import express, { Router } from 'express';
import {
  createProductReview,
  getProductReviews,
  createDeliveryReview,
  adminGetDeliveryReviews,
} from '../Controller/ReviewController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const router: Router = express.Router();

// Product reviews routes
router.post('/products/:productId', protect as express.RequestHandler, createProductReview as express.RequestHandler);
router.get('/products/:productId', getProductReviews as express.RequestHandler);

// Delivery reviews routes
router.post('/delivery/:deliveryExecutiveId', protect as express.RequestHandler, createDeliveryReview as express.RequestHandler);
router.get('/delivery/admin/reviews', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, adminGetDeliveryReviews as express.RequestHandler);

export default router;
