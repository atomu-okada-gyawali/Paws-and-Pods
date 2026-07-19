

import { Product, ProductFilters } from "../types";

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.petType) params.set("petType", filters.petType);
  if (filters.size) params.set("size", filters.size);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  const res = await fetch(`/api/v1/products${query ? `?${query}` : ""}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load product catalog.");
  }
  return data.products;
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/v1/products/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load product.");
  }
  return data.product;
}
