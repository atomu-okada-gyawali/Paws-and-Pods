import { z } from "zod";

const CheckoutItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Product ID must be a valid identifier."),
  quantity: z.number().int("Quantity must be an integer.").positive("Quantity must be a positive integer (greater than 0)."),
});

export const CheckoutPayloadSchema = z.object({
  items: z.array(CheckoutItemSchema).nonempty("Checkout must contain at least one item."),
});
