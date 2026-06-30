import { Router } from 'express';
import {
  CreateProduct,
  GetAllProducts,
  UpdateProduct,
  DeleteProduct,
  GetProductById,
} from '../Controller/ProductsControllers';
import { protect, authorizeRoles } from '../Middleware/AuthMiddleWare';

const product_router = Router();

product_router.post("/addproduct", protect as any, authorizeRoles("admin") as any, CreateProduct);
product_router.get("/getallproducts", GetAllProducts);
product_router.put("/updateproduct/:id", protect as any, authorizeRoles("admin") as any, UpdateProduct);
product_router.delete("/deleteproduct/:id", protect as any, authorizeRoles("admin") as any, DeleteProduct);
product_router.get("/getproduct/:id", GetProductById);

export default product_router;