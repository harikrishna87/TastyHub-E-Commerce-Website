import { Router } from 'express';
import {
  CreateProduct,
  GetAllProducts,
  UpdateProduct,
  DeleteProduct,
  GetProductById,
} from '../Controller/ProductsControllers';

const product_router = Router();

product_router.post("/addproduct", CreateProduct)
product_router.get("/getallproducts", GetAllProducts)
product_router.put("/updateproduct/:id", UpdateProduct);
product_router.delete("/deleteproduct/:id", DeleteProduct);
product_router.get("/getproduct/:id", GetProductById);

export default product_router;