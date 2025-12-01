import { Request, Response, RequestHandler } from 'express';
import Product from '../Models/Products';

export const CreateProduct: RequestHandler = async (req: Request, res: Response) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error: any) {
        res.status(400).json({ 
            success: false, 
            message: 'Failed to create product', 
            error: error.message 
        });
    }
};

export const GetAllProducts: RequestHandler = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({});
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch products', 
            error: error.message 
        });
    }
};

export const UpdateProduct: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error: any) {
        res.status(400).json({ 
            success: false, 
            message: 'Failed to update product', 
            error: error.message 
        });
    }
};

export const DeleteProduct: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete product', 
            error: error.message 
        });
    }
};

export const GetProductById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch product', 
            error: error.message 
        });
    }
};