import express from 'express';
import {
    Add_Favorite_Item,
    Get_Favorite_Items,
    Delete_Favorite_Item,
    Clear_Favorites
} from '../Controller/FavoritesController';
import { protect } from '../Middleware/AuthMiddleWare';

const router = express.Router();

router.post('/add_item', protect as express.RequestHandler, Add_Favorite_Item);
router.get('/get_favorite_items', protect as express.RequestHandler, Get_Favorite_Items);
router.delete('/delete_favorite_item/:id', protect as express.RequestHandler, Delete_Favorite_Item);
router.delete('/clear_favorites', protect as express.RequestHandler, Clear_Favorites);

export default router;