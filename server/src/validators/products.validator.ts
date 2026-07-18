import { z } from "zod";

export const ProductIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Product ID must be a valid identifier."),
});

const SORT_OPTIONS = ["price_asc", "price_desc", "name_asc", "newest"] as const;

export const ProductListQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  petType: z.enum(["Dog", "Cat", "Hamster"]).optional(),
  size: z.enum(["Small", "Medium", "Large"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(SORT_OPTIONS).optional(),
});

// allow an upload path or an http url, nothing else (no javascript:/data:)
export const imageReference = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/api/uploads/") || /^https?:\/\/.+/i.test(v),
    "Image must be an uploaded file or a valid URL."
  );

export const ProductCreateSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required."),
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().min(1, "Description is required."),
  price: z.coerce.number().min(0, "Price must be zero or greater."),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock must be zero or greater."),
  category: z.string().trim().min(1, "Category is required."),
  petType: z.enum(["Dog", "Cat", "Hamster"]),
  size: z.enum(["Small", "Medium", "Large"]).optional(),
  imageUrl: imageReference.optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();
