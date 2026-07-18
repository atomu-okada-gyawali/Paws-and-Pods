import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  status: OrderStatus;
  totalAmount: number;
  paymentTrackingHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentTrackingHash: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ userId: 1 });

export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);
