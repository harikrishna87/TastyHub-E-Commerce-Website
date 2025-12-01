import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, IShippingAddress } from '../Types';

const OrderItemSchema: Schema = new Schema<IOrderItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  original_price: { type: Number, required: true },
  discount_price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
}, { _id: false });

const ShippingAddressSchema: Schema = new Schema<IShippingAddress>({
  fullName: { type: String },
  phone: { type: String },
  addressLine1: { type: String },
  addressLine2: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
}, { _id: false });

const OrderSchema: Schema = new Schema<IOrder>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: false,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod',
  },
  paymentId: {
    type: String,
  },
}, { timestamps: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;