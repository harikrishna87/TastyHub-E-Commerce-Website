import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  category: string;
  image: string;
  cuisines: string[];
  rating: number;
  reviewsCount: string;
  deliveryTime: string;
  costForTwo: string;
  offer: string;
  popularDish: string;
  isVeg: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Restaurant category is required.'],
    },
    image: {
      type: String,
      required: [true, 'Restaurant image URL is required.'],
    },
    cuisines: {
      type: [String],
      required: [true, 'Cuisines are required.'],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: String,
      default: '100+',
    },
    deliveryTime: {
      type: String,
      required: [true, 'Delivery time is required.'],
    },
    costForTwo: {
      type: String,
      required: [true, 'Cost for two is required.'],
    },
    offer: {
      type: String,
      default: '',
    },
    popularDish: {
      type: String,
      default: '',
    },
    isVeg: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model<IRestaurant>('restaurants', RestaurantSchema);

export default Restaurant;
