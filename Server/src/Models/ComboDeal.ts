import mongoose, { Schema } from 'mongoose';
import { IComboDeal } from '../Types';

const ComboDealSchema: Schema = new Schema<IComboDeal>({
  name: {
    type: String,
    required: [true, 'Combo deal name is required'],
    trim: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: [true, 'Products are required for combo deal']
  }],
  comboPrice: {
    type: Number,
    required: [true, 'Combo price is required'],
    min: [0, 'Combo price cannot be negative']
  },
  totalLimit: {
    type: Number,
    required: [true, 'Total limit of access is required'],
    min: [1, 'Total limit must be at least 1']
  },
  timesAccessed: {
    type: Number,
    default: 0
  },
  accessedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const ComboDeal = mongoose.model<IComboDeal>('ComboDeal', ComboDealSchema);
export default ComboDeal;
