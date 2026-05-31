import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../Types';

const TransactionSchema: Schema = new Schema<ITransaction>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for a wallet transaction']
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  }
}, { timestamps: true });

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
