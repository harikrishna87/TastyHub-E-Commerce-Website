import mongoose, { Schema } from 'mongoose';
import { IWithdrawalRequest } from '../Types';

const WithdrawalRequestSchema: Schema = new Schema<IWithdrawalRequest>(
  {
    deliveryExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Delivery Executive ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Withdrawal amount must be at least ₹1'],
    },
    paymentDetails: {
      type: String,
      required: [true, 'Payment/Bank/UPI details are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    processedDate: {
      type: Date,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const WithdrawalRequest = mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
export default WithdrawalRequest;
