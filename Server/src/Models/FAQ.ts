import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: [true, 'Question is required.'],
      trim: true,
      unique: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
      default: 'General',
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
export default FAQ;
