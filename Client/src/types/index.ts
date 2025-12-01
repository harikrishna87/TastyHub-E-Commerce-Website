export interface IUser {
  _id: string;
  name?: string;
  image?: string;
  email: string;
  role: 'user' | 'admin';
  googleId?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  login: (userData: IUser, jwtToken: string) => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
  title?: string;
  rating_store?: {
    rate: number;
    count: number;
  };
}

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

export type OrderDeliveryStatus = 'Pending' | 'Shipped' | 'Delivered';

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    _id?: string;
    name: string;
    image: string;
    quantity: number;
    original_price?: number;
    discount_price?: number;
    category?: string;
  }>;
  totalAmount: number;
  deliveryStatus: OrderDeliveryStatus;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: ShippingAddress;
}

declare global {
  interface Window {
    Razorpay: any;
    updateCartCount?: () => void;
  }
}