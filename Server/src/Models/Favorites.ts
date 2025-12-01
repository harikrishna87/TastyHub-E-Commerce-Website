import mongoose, { Schema, Document } from "mongoose";

export interface IFavoriteItem {
  _id?: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  category: string;
  description?: string;
}

export interface IFavorites extends Document {
  user: mongoose.Types.ObjectId;
  items: IFavoriteItem[];
}

const FavoriteItemSchema: Schema = new Schema<IFavoriteItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  original_price: { type: Number, required: true },
  discount_price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String }
}, { _id: true });

const FavoritesSchema: Schema = new Schema<IFavorites>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: { type: [FavoriteItemSchema], default: [] }
}, { timestamps: true });

const Favorites = mongoose.model<IFavorites>("Favorites", FavoritesSchema);
export default Favorites;