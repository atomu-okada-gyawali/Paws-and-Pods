import mongoose, { Schema, Document, Model } from "mongoose";

export type PetType = "Dog" | "Cat" | "Hamster";
export type ProductSize = "Small" | "Medium" | "Large";

export interface IProduct extends Document {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  petType: PetType;
  size?: ProductSize;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      enum: ["Dog", "Cat", "Hamster"],
      required: true,
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ petType: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);
