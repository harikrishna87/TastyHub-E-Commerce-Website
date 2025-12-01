import Favorites, { IFavoriteItem } from "../Models/Favorites";
import { Request, Response } from "express";

const Add_Favorite_Item = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const newItem = req.body as IFavoriteItem;
        
        if (!newItem.name || !newItem.image || !newItem.original_price || !newItem.discount_price || !newItem.category) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }

        let favorites = await Favorites.findOne({ user: userId });
        if (!favorites) {
            favorites = new Favorites({ user: userId, items: [newItem] });
        } else {
            const exists = favorites.items.some(item => item.name.toLowerCase() === newItem.name.toLowerCase());
            if (exists) {
                res.status(400).json({ success: false, message: "Item already exists in favorites" });
                return;
            }
            favorites.items.push(newItem);
        }
        await favorites.save();
        res.status(200).json({
            success: true,
            message: "Item added to favorites successfully",
            items: favorites.items
        });
    } catch (err: any) {
        console.error("Error adding item to favorites:", err);
        res.status(500).json({ success: false, message: "Error occurred while adding item to favorites" });
    }
};

const Get_Favorite_Items = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const favorites = await Favorites.findOne({ user: userId });
        res.status(200).json({
            success: true,
            message: "Favorites fetched successfully",
            Favorite_Items: favorites?.items || []
        });
    } catch (err: any) {
        console.error("Error fetching favorite items:", err);
        res.status(500).json({ success: false, message: "Error occurred while fetching favorites" });
    }
};

const Delete_Favorite_Item = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Item id is required" });
            return;
        }

        const favorites = await Favorites.findOne({ user: userId }); 
        if (!favorites) {
            res.status(404).json({ success: false, message: "Favorites not found" });
            return;
        }
        
        const initialLength = favorites.items.length;
        favorites.items = favorites.items.filter(item => item._id?.toString() !== id);
        
        if (favorites.items.length === initialLength) {
            res.status(404).json({ success: false, message: "Item not found in favorites" });
            return;
        }

        await favorites.save();
        res.status(200).json({
            success: true,
            message: "Favorite item deleted successfully"
        });
    } catch (err: any) {
        console.error("Error deleting favorite item:", err);
        res.status(500).json({ success: false, message: "Error occurred while deleting the favorite item" });
    }
};

const Clear_Favorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Not authorized, please log in" });
            return;
        }

        const favorites = await Favorites.findOne({ user: userId });
        if (!favorites) {
            res.status(200).json({
                success: true,
                message: "Favorites already empty or not found for this user."
            });
            return;
        }
        favorites.items = [];
        await favorites.save();
        
        res.status(200).json({
            success: true,
            message: "Favorites cleared successfully"
        });
    } catch (err: any) {
        console.error("Error clearing favorites:", err);
        res.status(500).json({
            success: false,
            message: "Error occurred while clearing the favorites"
        });
    }
};

export {
    Add_Favorite_Item,
    Get_Favorite_Items,
    Delete_Favorite_Item,
    Clear_Favorites
};