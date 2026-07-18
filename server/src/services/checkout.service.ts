import crypto from "crypto";
import mongoose from "mongoose";
import { Product, Order, OrderItem } from "../models/index.js";
import { connectDB } from "../db.js";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function processCheckoutService(userId: string, items: CheckoutItem[]) {
  await connectDB();
  const consolidatedQuantities = new Map<string, number>();
  for (const item of items) {
    const currentQty = consolidatedQuantities.get(item.productId) || 0;
    consolidatedQuantities.set(item.productId, currentQty + item.quantity);
  }

  const productIdsToFetch = Array.from(consolidatedQuantities.keys());

  const dbProducts = await Product.find({ _id: { $in: productIdsToFetch } });

  if (dbProducts.length !== productIdsToFetch.length) {
    const foundIds = new Set(dbProducts.map((p) => p._id.toString()));
    const missingIds = productIdsToFetch.filter((id) => !foundIds.has(id));
    throw new Error(`The catalog contains no products matching requested IDs: ${missingIds.join(", ")}`);
  }

  let totalOrderAmount = 0;
  const orderItemsToCreate: { productId: string; quantity: number; price: number }[] = [];

  // no transaction (standalone mongo). each decrement is atomic and we roll back if a later step fails
  const decrementedItems: { productId: string; quantity: number }[] = [];

  try {
    for (const product of dbProducts) {
      const requestedQty = consolidatedQuantities.get(product._id.toString())!;

      const basePrice = product.price;
      if (isNaN(basePrice) || basePrice < 0) {
        throw new Error(`Critical integrity error: Invalid pricing metadata detected for product ID ${product._id}`);
      }

      const decremented = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: requestedQty } },
        { $inc: { stock: -requestedQty } }
      );

      if (!decremented) {
        throw new Error(
          `Insufficient inventory: Cannot complete order. '${product.name}' only has ${product.stock} units available, but ${requestedQty} were requested.`
        );
      }

      decrementedItems.push({ productId: product._id.toString(), quantity: requestedQty });
      totalOrderAmount += basePrice * requestedQty;

      orderItemsToCreate.push({
        productId: product._id.toString(),
        quantity: requestedQty,
        price: basePrice,
      });
    }

    const inputRandomSeed = crypto.randomBytes(32).toString("hex");
    const trackingPayload = `checkout:${userId}:${totalOrderAmount.toFixed(2)}:${inputRandomSeed}`;
    const paymentTrackingHash = crypto.createHash("sha256").update(trackingPayload).digest("hex");

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      status: "PENDING",
      totalAmount: totalOrderAmount,
      paymentTrackingHash,
    });

    await OrderItem.insertMany(
      orderItemsToCreate.map((item) => ({
        orderId: order._id,
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: item.price,
      }))
    );

    return {
      order,
      itemsCount: orderItemsToCreate.length,
    };
  } catch (error) {
    for (const { productId, quantity } of decrementedItems) {
      await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }).catch((rollbackError) => {
        console.error(`Failed to roll back stock for product ${productId}:`, rollbackError);
      });
    }
    throw error;
  }
}
