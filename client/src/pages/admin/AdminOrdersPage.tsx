/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { AdminOrder, OrderStatus } from "../../types";
import { adminListOrders, adminUpdateOrderStatus } from "../../lib/adminApi";
import { useApp } from "../../context/AppContext";
import { Card, Alert, Spinner, Select } from "../../components/ui";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export function AdminOrdersPage() {
  const { accessToken } = useApp();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    adminListOrders(accessToken)
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleStatusChange(order: AdminOrder, status: OrderStatus) {
    if (!accessToken) return;
    setUpdatingId(order.id);
    try {
      const updated = await adminUpdateOrderStatus(accessToken, order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400" role="status">
        <Spinner className="w-6 h-6 mr-2" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-neutral-500">
                No orders yet.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-neutral-500">{order.id}</td>
                <td className="px-5 py-3 text-neutral-700">{order.userEmail || "—"}</td>
                <td className="px-5 py-3 font-semibold text-neutral-900">${order.totalAmount}</td>
                <td className="px-5 py-3 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Select
                      size="sm"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={STATUS_STYLES[order.status]}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                    {updatingId === order.id && <Spinner className="w-3.5 h-3.5 text-neutral-400" />}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
