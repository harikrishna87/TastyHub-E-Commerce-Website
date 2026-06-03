import mongoose, { Schema } from 'mongoose';
import { IDeliveryReview } from '../Types';

const DeliveryReviewSchema = new Schema<IDeliveryReview>(
  {
    deliveryExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    isComplaint: {
      type: Boolean,
      default: false,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce rating a delivery executive unique per order
DeliveryReviewSchema.index({ order: 1 }, { unique: true });

const DeliveryReview = mongoose.model<IDeliveryReview>('DeliveryReview', DeliveryReviewSchema);
export default DeliveryReview;
