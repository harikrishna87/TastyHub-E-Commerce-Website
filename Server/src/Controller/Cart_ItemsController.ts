import Cart, { ICartItem } from "../Models/Cart_Items";
import { Request, Response, NextFunction } from "express";

const Add_Cart_item = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const newItem = req.body as ICartItem;
        
        if (!newItem.name || !newItem.image || !newItem.original_price || !newItem.discount_price || !newItem.quantity || !newItem.category) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [newItem] });
        } else {
            const exists = cart.items.some(item => item.name.toLowerCase() === newItem.name.toLowerCase());
            if (exists) {
                res.status(400).json({ success: false, message: "Item already exists in cart" });
                return;
            }
            cart.items.push(newItem);
        }
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            items: cart.items
        });
    } catch (err: any) {
        console.error("Error adding item to cart:", err);
        res.status(500).json({ success: false, message: "Error occurred while adding item to cart" });
    }
};

const Get_Cart_Items = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const cart = await Cart.findOne({ user: userId });
        res.status(200).json({
            success: true,
            message: "Cart details fetched successfully",
            Cart_Items: cart?.items || []
        });
    } catch (err: any) {
        console.error("Error fetching cart items:", err);
        res.status(500).json({ success: false, message: "Error occurred while fetching cart details" });
    }
};

const Delete_Cart_Item = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const { name } = req.params;
        if (!name) {
            res.status(400).json({ success: false, message: "Item name is required" });
            return;
        }

        const cart = await Cart.findOne({ user: userId }); 
        if (!cart) {
            res.status(404).json({ success: false, message: "Cart not found" });
            return;
        }
        
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.name.toLowerCase() !== name.toLowerCase());
        
        if (cart.items.length === initialLength) {
            res.status(404).json({ success: false, message: "Item not found in cart" });
            return;
        }

        await cart.save();
        res.status(200).json({
            success: true,
            message: "Cart item deleted successfully"
        });
    } catch (err: any) {
        console.error("Error deleting cart item:", err);
        res.status(500).json({ success: false, message: "Error occurred while deleting the cart item" });
    }
};

const Update_Cart_Item_Quantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const { _id, quantity } = req.body;
        if (!_id || typeof quantity !== 'number' || quantity < 1) {
            res.status(400).json({
                success: false,
                message: "Invalid _id or quantity. Quantity must be a positive number."
            });
            return;
        }
        
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found"
            });
            return;
        }
        
        const itemIndex = cart.items.findIndex(item => item._id?.toString() === _id);
        if (itemIndex === -1) {
            res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
            return;
        }
        
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully",
            item: cart.items[itemIndex]
        });
    } catch (err: any) {
        console.error("Error updating cart item quantity:", err);
        res.status(500).json({
            success: false,
            message: "Error occurred while updating the quantity"
        });
    }
};

const Clear_Cart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            res.status(200).json({
                success: true,
                message: "Cart already empty or not found for this user."
            });
            return;
        }
        cart.items = [];
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (err: any) {
        console.error("Error clearing cart:", err);
        res.status(500).json({
            success: false,
            message: "Error occurred while clearing the cart"
        });
    }
};

export {
    Add_Cart_item,
    Get_Cart_Items,
    Delete_Cart_Item,
    Update_Cart_Item_Quantity,
    Clear_Cart
};