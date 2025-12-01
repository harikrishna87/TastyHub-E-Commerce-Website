import express from 'express';
import {
    Add_Cart_item,
    Get_Cart_Items,
    Delete_Cart_Item,
    Update_Cart_Item_Quantity,
    Clear_Cart
} from '../Controller/Cart_ItemsController';
import { protect } from '../Middleware/AuthMiddleWare';

const router = express.Router();

router.post('/add_item', protect as express.RequestHandler, Add_Cart_item);
router.get('/get_cart_items', protect as express.RequestHandler, Get_Cart_Items);
router.delete('/delete_cart_item/:name', protect as express.RequestHandler, Delete_Cart_Item);
router.patch('/update_cart_quantity', protect as express.RequestHandler, Update_Cart_Item_Quantity);
router.delete('/clear_cart', protect as express.RequestHandler, Clear_Cart);

export default router;