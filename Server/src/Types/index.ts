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
  role: 'user' | 'admin' | 'delivery_executive';
  image?: string;
  googleId?: string;
  shippingAddress?: IShippingAddress;
  fcmTokens?: string[];
  deliveryStatus?: 'Pending' | 'Approved' | 'Rejected';
  isAvailable?: boolean;
  isActive?: boolean;
  walletBalance?: number;
  accessedCoupons?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  getJwtToken: () => string;
}

export type OrderDeliveryStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Pickup' | 'Out for Delivery' | 'Delivered' | 'Shipped';

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
  deliveryExecutive?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderPopulated extends Omit<IOrder, 'user'> {
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    image?: string;
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

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  isAnnouncement: boolean;
  expiryDate: Date;
  isActive: boolean;
}

export interface IDiscount extends Document {
  name: string;
  targetType: 'product' | 'category';
  targetValue: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface IComboDeal extends Document {
  name: string;
  products: Types.ObjectId[];
  comboPrice: number;
  totalLimit: number;
  timesAccessed: number;
  accessedUsers: Types.ObjectId[];
  endTime: Date;
  isActive: boolean;
}

export interface IGiftCard extends Document {
  code: string;
  originalValue: number;
  balance: number;
  owner: Types.ObjectId;
  recipientEmail?: string;
  isActive: boolean;
  expiryDate?: Date;
}

export interface ITransaction extends Document {
  user: Types.ObjectId;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  createdAt: Date;
}

export interface IWithdrawalRequest extends Document {
  deliveryExecutive: Types.ObjectId;
  amount: number;
  paymentDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: Date;
  processedDate?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}