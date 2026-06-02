import mongoose, { Schema, Document } from "mongoose";

export interface IOfferBanner extends Document {
  title: string;
  subtitle: string;
  image: string;
  linkCategory: string;
  discountText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferBannerSchema = new Schema<IOfferBanner>(
  {
    title: {
      type: String,
      required: [true, 'Offer banner title is required.'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Offer banner subtitle is required.'],
    },
    image: {
      type: String,
      required: [true, 'Offer banner image URL is required.'],
    },
    linkCategory: {
      type: String,
      required: [true, 'Offer banner link category is required.'],
    },
    discountText: {
      type: String,
      required: [true, 'Discount text is required.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const OfferBanner = mongoose.model<IOfferBanner>('offer_banners', OfferBannerSchema);

export default OfferBanner;
