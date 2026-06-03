import { Request, Response, RequestHandler } from 'express';
import Product from '../Models/Products';
import Discount from '../Models/Discount';

const applyActiveDiscounts = async (productsList: any[]) => {
    try {
        const activeDiscounts = await Discount.find({ isActive: true });
        return productsList.map(prod => {
            const plainProd = prod.toObject ? prod.toObject() : prod;
            let maxDiscount = 0;

            for (const discount of activeDiscounts) {
                const targetValue = (discount?.targetValue || '').toLowerCase();
                const targetType = discount?.targetType;
                const prodTitle = (plainProd?.title || '').toLowerCase();
                const prodCategory = (plainProd?.category || '').toLowerCase();

                if (targetType === 'product' && targetValue && prodTitle && targetValue === prodTitle) {
                    maxDiscount = Math.max(maxDiscount, discount.discountPercentage || 0);
                } else if (targetType === 'category' && targetValue && prodCategory && targetValue === prodCategory) {
                    maxDiscount = Math.max(maxDiscount, discount.discountPercentage || 0);
                }
            }

            if (maxDiscount > 0) {
                plainProd.discountPercentage = maxDiscount;
                plainProd.discountPrice = (plainProd.price || 0) * (1 - maxDiscount / 100);
            } else {
                plainProd.discountPercentage = 0;
                plainProd.discountPrice = plainProd.price || 0;
            }
            return plainProd;
        });
    } catch (error) {
        console.error("Error in applyActiveDiscounts:", error);
        return productsList;
    }
};

const applyDiscountToSingleProduct = async (product: any) => {
    try {
        const activeDiscounts = await Discount.find({ isActive: true });
        const plainProd = product.toObject ? product.toObject() : product;
        let maxDiscount = 0;

        for (const discount of activeDiscounts) {
            const targetValue = (discount?.targetValue || '').toLowerCase();
            const targetType = discount?.targetType;
            const prodTitle = (plainProd?.title || '').toLowerCase();
            const prodCategory = (plainProd?.category || '').toLowerCase();

            if (targetType === 'product' && targetValue && prodTitle && targetValue === prodTitle) {
                maxDiscount = Math.max(maxDiscount, discount.discountPercentage || 0);
            } else if (targetType === 'category' && targetValue && prodCategory && targetValue === prodCategory) {
                maxDiscount = Math.max(maxDiscount, discount.discountPercentage || 0);
            }
        }

        if (maxDiscount > 0) {
            plainProd.discountPercentage = maxDiscount;
            plainProd.discountPrice = (plainProd.price || 0) * (1 - maxDiscount / 100);
        } else {
            plainProd.discountPercentage = 0;
            plainProd.discountPrice = plainProd.price || 0;
        }
        return plainProd;
    } catch (error) {
        console.error("Error in applyDiscountToSingleProduct:", error);
        return product;
    }
};

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
        const productsWithDiscounts = await applyActiveDiscounts(products);
        res.status(200).json({
            success: true,
            count: productsWithDiscounts.length,
            data: productsWithDiscounts,
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

        const productWithDiscount = await applyDiscountToSingleProduct(product);

        res.status(200).json({
            success: true,
            data: productWithDiscount,
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch product', 
            error: error.message 
        });
    }
};