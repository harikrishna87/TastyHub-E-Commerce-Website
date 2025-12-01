import mongoose, { Schema } from "mongoose";
import { IProduct, IRating } from "../Types";

const RatingSchema = new Schema<IRating>({
  rate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required.'],
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required.'],
    },
    rating: {
      type: RatingSchema,
      default: () => ({ rate: 0, count: 0 }),
    },
    ingredients: {
      type: [String],
      required: [true, 'Product ingredients are required.'],
      default: [],
    },
    calories: {
      type: Number,
      required: [true, 'Product calories are required.'],
      min: [0, 'Calories cannot be negative.'],
      default: 0,
    },
    ageRecommendation: {
      type: String,
      required: [true, 'Age recommendation is required.'],
      trim: true,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('products', ProductSchema);

export default Product;