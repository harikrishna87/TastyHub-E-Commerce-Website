import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  storeName: string;
  storeStatus: 'Open' | 'Closed';
  freeDeliveryMinAmount: number;
  flatDeliveryFee: number;
  supportEmail: string;
  supportPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema<ISystemSettings>({
  storeName: {
    type: String,
    default: 'TastyHub'
  },
  storeStatus: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  freeDeliveryMinAmount: {
    type: Number,
    default: 500
  },
  flatDeliveryFee: {
    type: Number,
    default: 40
  },
  supportEmail: {
    type: String,
    default: 'support@tastyhub.com'
  },
  supportPhone: {
    type: String,
    default: '+91 9876543210'
  }
}, { timestamps: true });

const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
export default SystemSettings;
