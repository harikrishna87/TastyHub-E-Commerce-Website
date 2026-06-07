import mongoose, { Schema } from 'mongoose';
import { IGiftCard } from '../Types';

const GiftCardSchema: Schema = new Schema<IGiftCard>({
  code: {
    type: String,
    required: [true, 'Gift card code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  originalValue: {
    type: Number,
    required: [true, 'Original value is required'],
    min: [1, 'Gift card value must be at least 1']
  },
  balance: {
    type: Number,
    required: [true, 'Balance is required'],
    min: [0, 'Balance cannot be negative']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gift card owner is required']
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  redeemedToWallet: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const GiftCard = mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
export default GiftCard;
