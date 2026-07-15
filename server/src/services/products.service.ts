import { Product, IProduct } from "../models/index.js";
import { connectDB } from "../db.js";

interface ProductListFilters {
  category?: string;
  petType?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "name_asc" | "newest";
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  newest: { createdAt: -1 },
};

export async function listProductsService(filters: ProductListFilters) {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.petType) {
    query.petType = filters.petType;
  }
  if (filters.size) {
    query.size = filters.size;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) (query.price as Record<string, number>).$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filters.maxPrice;
  }

  const sort = SORT_MAP[filters.sort || "newest"];

  return Product.find(query).sort(sort);
}

export async function getProductByIdService(id: string) {
  await connectDB();
  return Product.findById(id);
}

export async function createProductService(data: Partial<IProduct>) {
  await connectDB();
  return Product.create(data);
}

export async function updateProductService(id: string, data: Partial<IProduct>) {
  await connectDB();
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteProductService(id: string) {
  await connectDB();
  return Product.findByIdAndDelete(id);
}
