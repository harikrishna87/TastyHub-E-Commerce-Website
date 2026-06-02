import express, { Router } from "express";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from "../Controller/OfferBannerController";
import { protect, authorizeRoles } from "../Middleware/AuthMiddleWare";

const offerRouter: Router = express.Router();

offerRouter.get("/", getAllBanners as express.RequestHandler);

// Admin-only CRUD operations
offerRouter.post(
  "/",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  createBanner as express.RequestHandler
);

offerRouter.put(
  "/:id",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  updateBanner as express.RequestHandler
);

offerRouter.delete(
  "/:id",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  deleteBanner as express.RequestHandler
);

export default offerRouter;
