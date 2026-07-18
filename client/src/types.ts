/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PetType = "Dog" | "Cat" | "Hamster";
export type ProductSize = "Small" | "Medium" | "Large";
export type SortOption = "price_asc" | "price_desc" | "name_asc" | "newest";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  petType: PetType;
  size?: ProductSize;
  imageUrl?: string;
}

export interface ProductFilters {
  category?: string;
  petType?: PetType;
  size?: ProductSize;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = "CUSTOMER" | "VET" | "ADMIN";

export interface UserState {
  id: string;
  email: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  bio: string;
  avatarUrl: string;
  marketingOptIn: boolean;
  isMfaEnabled: boolean;
  createdAt?: string;
}

export interface ProfileUpdate {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  marketingOptIn?: boolean;
}

export interface ActivityEntry {
  action: string;
  detail?: string;
  ipAddress?: string;
  createdAt: string;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  paymentTrackingHash: string;
  userEmail?: string;
  createdAt: string;
}

export interface AdminOrderItem {
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  price: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  isMfaEnabled: boolean;
  createdAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  petType: PetType;
  size?: ProductSize | "";
  imageUrl?: string;
}
