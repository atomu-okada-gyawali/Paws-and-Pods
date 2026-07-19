

import { AdminOrder, AdminOrderItem, AdminUser, OrderStatus, Product, ProductInput, UserRole } from "../types";

async function request<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export async function adminCreateProduct(accessToken: string, input: ProductInput): Promise<Product> {
  const data = await request<{ product: Product }>("/api/v1/products", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.product;
}

export async function adminUpdateProduct(accessToken: string, id: string, input: Partial<ProductInput>): Promise<Product> {
  const data = await request<{ product: Product }>(`/api/v1/products/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.product;
}

export async function adminDeleteProduct(accessToken: string, id: string): Promise<void> {
  await request<{ success: boolean }>(`/api/v1/products/${id}`, accessToken, { method: "DELETE" });
}

export async function adminListOrders(accessToken: string): Promise<AdminOrder[]> {
  const data = await request<{ orders: AdminOrder[] }>("/api/v1/orders", accessToken);
  return data.orders;
}

export async function adminGetOrder(accessToken: string, id: string): Promise<{ order: AdminOrder; items: AdminOrderItem[] }> {
  return request<{ order: AdminOrder; items: AdminOrderItem[] }>(`/api/v1/orders/${id}`, accessToken);
}

export async function adminUpdateOrderStatus(accessToken: string, id: string, status: OrderStatus): Promise<AdminOrder> {
  const data = await request<{ order: AdminOrder }>(`/api/v1/orders/${id}/status`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.order;
}

export async function adminListUsers(accessToken: string): Promise<AdminUser[]> {
  const data = await request<{ users: AdminUser[] }>("/api/v1/users", accessToken);
  return data.users;
}

export async function adminUpdateUserRole(accessToken: string, id: string, role: UserRole): Promise<AdminUser> {
  const data = await request<{ user: AdminUser }>(`/api/v1/users/${id}/role`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return data.user;
}
