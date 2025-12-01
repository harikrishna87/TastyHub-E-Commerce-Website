import { Document, Types } from 'mongoose';

export interface IShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  image?: string;
  googleId?: string;
  shippingAddress?: IShippingAddress;
  fcmToken?:string; 
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  getJwtToken: () => string;
}

export type OrderDeliveryStatus = 'Pending' | 'Shipped' | 'Delivered';

export interface ICartItem {
  _id?: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
  description?: string;
}

export interface ICart extends Document {
  user: IUser['_id'];
  items: ICartItem[];
}

export interface IOrderItem {
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryStatus: OrderDeliveryStatus;
  shippingAddress?: IShippingAddress;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderPopulated extends Omit<IOrder, 'user'> {
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

export interface IRating {
  rate: number;
  count: number;
}

export interface IProduct {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: IRating;
  ingredients: string[];
  calories: number;
  ageRecommendation: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}