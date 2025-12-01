import express, { Router } from 'express';
import { createOrder, getAllOrders, getUserOrders, updateOrderStatus, getOrderById } from '../Controller/OrderController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const router: Router = express.Router();

router.post('/', protect as express.RequestHandler, createOrder as express.RequestHandler);
router.get('/myorders', protect as express.RequestHandler, getUserOrders as express.RequestHandler);
router.get('/:id', protect as express.RequestHandler, getOrderById as express.RequestHandler);
router.get('/', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, getAllOrders as express.RequestHandler);
router.patch('/:id/status', protect as express.RequestHandler, authorizeRoles('admin') as express.RequestHandler, updateOrderStatus as express.RequestHandler);

export default router;