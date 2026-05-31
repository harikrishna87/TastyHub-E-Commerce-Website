import mongoose, { Schema } from 'mongoose';
import { IDiscount } from '../Types';

const DiscountSchema: Schema = new Schema<IDiscount>({
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true
  },
  targetType: {
    type: String,
    enum: ['product', 'category'],
    required: [true, 'Target type is required']
  },
  targetValue: {
    type: String,
    required: [true, 'Target value is required (Product title or Category name)'],
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Discount = mongoose.model<IDiscount>('Discount', DiscountSchema);
export default Discount;
