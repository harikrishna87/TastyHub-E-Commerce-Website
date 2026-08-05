import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  fullname: string;
  email: string;
  phone: string;
  preferredDish: string;
  dietaryRestrictions: string;
  orderType: string;
  message: string;
  guestCount?: number;
  eventDate?: string;
  status: 'Pending' | 'Replied';
  adminReply?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    preferredDish: {
      type: String,
      required: true,
    },
    dietaryRestrictions: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      default: 1,
    },
    eventDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Replied'],
      default: 'Pending',
    },
    adminReply: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);
export default Inquiry;
