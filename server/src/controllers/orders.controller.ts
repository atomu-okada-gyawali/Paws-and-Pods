import { Response } from "express";
import { OrderIdParamSchema, OrderStatusUpdateSchema } from "../validators/orders.validator.js";
import { listOrdersService, getOrderByIdService, updateOrderStatusService } from "../services/orders.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { recordActivity } from "../services/activity.service.js";

function serializeOrder(order: any) {
  const user = order.userId as any;
  return {
    id: order._id.toString(),
    status: order.status,
    totalAmount: order.totalAmount.toString(),
    paymentTrackingHash: order.paymentTrackingHash,
    userEmail: user && typeof user === "object" ? user.email : undefined,
    createdAt: order.createdAt,
  };
}

export async function listOrders(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const orders = await listOrdersService();
    res.status(200).json({ orders: orders.map(serializeOrder) });
  } catch (error: any) {
    console.error("Order listing failure:", error.message || error);
    res.status(500).json({ error: "Failed to load orders." });
  }
}

export async function getOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = OrderIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed on the provided order ID." });
      return;
    }

    const result = await getOrderByIdService(parseResult.data.id);
    if (!result) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    res.status(200).json({
      order: serializeOrder(result.order),
      items: result.items.map((item: any) => {
        const product = item.productId as any;
        return {
          productId: product && typeof product === "object" ? product._id.toString() : item.productId.toString(),
          productName: product && typeof product === "object" ? product.name : undefined,
          productSku: product && typeof product === "object" ? product.sku : undefined,
          quantity: item.quantity,
          price: item.price,
        };
      }),
    });
  } catch (error: any) {
    console.error("Order detail failure:", error.message || error);
    res.status(500).json({ error: "Failed to load order." });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const paramResult = OrderIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({ error: "Validation failed on the provided order ID." });
      return;
    }

    const bodyResult = OrderStatusUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided order status.",
        details: bodyResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const order = await updateOrderStatusService(paramResult.data.id, bodyResult.data.status);
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    await recordActivity("ORDER_STATUS_CHANGED", {
      userId: req.user!.id,
      detail: `Order ${paramResult.data.id} → ${bodyResult.data.status}`,
    });
    res.status(200).json({ order: serializeOrder(order) });
  } catch (error: any) {
    console.error("Order status update failure:", error.message || error);
    res.status(500).json({ error: "Failed to update order status." });
  }
}
