import mongoose, { Schema } from 'mongoose';
import { IProductReview } from '../Types';

const ProductReviewSchema = new Schema<IProductReview>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee a unique review per order per product
ProductReviewSchema.index({ order: 1, product: 1 }, { unique: true });

const ProductReview = mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);
export default ProductReview;
