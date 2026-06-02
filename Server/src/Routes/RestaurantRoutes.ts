import express, { Router } from "express";
import {
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from "../Controller/RestaurantController";
import { protect, authorizeRoles } from "../Middleware/AuthMiddleWare";

const restaurantRouter: Router = express.Router();

restaurantRouter.get("/", getAllRestaurants as express.RequestHandler);

// Admin-only CRUD operations
restaurantRouter.post(
  "/",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  createRestaurant as express.RequestHandler
);

restaurantRouter.put(
  "/:id",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  updateRestaurant as express.RequestHandler
);

restaurantRouter.delete(
  "/:id",
  protect as express.RequestHandler,
  authorizeRoles("admin") as express.RequestHandler,
  deleteRestaurant as express.RequestHandler
);

export default restaurantRouter;
