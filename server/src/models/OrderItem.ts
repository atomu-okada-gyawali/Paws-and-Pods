import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

OrderItemSchema.index({ orderId: 1, productId: 1 }, { unique: true });

export const OrderItem: Model<IOrderItem> = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
