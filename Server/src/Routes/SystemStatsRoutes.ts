import express, { Router } from 'express';
import { getSystemStats } from '../Controller/SystemStatsController';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const router: Router = express.Router();

router.get(
  '/',
  protect as express.RequestHandler,
  authorizeRoles('admin') as express.RequestHandler,
  getSystemStats as express.RequestHandler
);

export default router;
