import { Response } from "express";
import { CheckoutPayloadSchema } from "../validators/checkout.validator.js";
import { processCheckoutService } from "../services/checkout.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { recordActivity } from "../services/activity.service.js";

export async function processCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Authentication credentials required for checkout." });
      return;
    }

    const parseResult = CheckoutPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided cart items.",
        details: parseResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const result = await processCheckoutService(req.user.id, parseResult.data.items);

    await recordActivity("CHECKOUT_COMPLETED", {
      userId: req.user.id,
      detail: `Order ${result.order.id}`,
    });

    res.status(201).json({
      success: true,
      message: "Order checked out and processed successfully.",
      order: {
        id: result.order.id,
        status: result.order.status,
        totalAmount: result.order.totalAmount.toString(),
        paymentTrackingHash: result.order.paymentTrackingHash,
        createdAt: result.order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Secure Checkout Failure Exception:", error.message || error);

    if (error.message && (error.message.includes("Insufficient inventory") || error.message.includes("no products matching"))) {
      res.status(409).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Check-system database processing transaction failure." });
  }
}
