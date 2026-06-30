import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  userData?: Record<string, any>;
  type: 'register' | 'reset';
  verified: boolean;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  userData: {
    type: Schema.Types.Mixed
  },
  type: {
    type: String,
    enum: ['register', 'reset'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: auto-deletes the document when expiresAt is reached
  }
}, { timestamps: true });

const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
export default OTP;
