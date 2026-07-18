import { Order, OrderItem, OrderStatus } from "../models/index.js";
import { connectDB } from "../db.js";

export async function listOrdersService() {
  await connectDB();
  return Order.find().sort({ createdAt: -1 }).populate("userId", "email");
}

export async function getOrderByIdService(id: string) {
  await connectDB();
  const order = await Order.findById(id).populate("userId", "email");
  if (!order) return null;

  const items = await OrderItem.find({ orderId: order._id }).populate("productId", "name sku");
  return { order, items };
}

export async function updateOrderStatusService(id: string, status: OrderStatus) {
  await connectDB();
  return Order.findByIdAndUpdate(id, { status }, { new: true }).populate("userId", "email");
}
