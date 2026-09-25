"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { AdminOrder } from "@/types/api";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .listAdminOrders(token)
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load orders.");
      });
  }, [token]);

  const stats = useMemo(() => {
    if (!orders) return null;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const revenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalPrice, 0);
    return {
      total: orders.length,
      pending,
      revenue: Math.round(revenue * 100) / 100,
    };
  }, [orders]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Orders
      </h1>

      {stats ? (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-900">
            <div className="text-2xl font-semibold">{stats.total}</div>
            <div className="text-xs text-zinc-500">Total orders</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-900">
            <div className="text-2xl font-semibold">{stats.pending}</div>
            <div className="text-xs text-zinc-500">Pending</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-900">
            <div className="text-2xl font-semibold">
              ${stats.revenue.toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500">Revenue (non-cancelled)</div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {!orders && !error ? (
        <p className="mt-8 text-sm text-zinc-500">Loading orders...</p>
      ) : null}

      {orders && orders.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No orders yet.</p>
      ) : null}

      {orders && orders.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.03] text-xs text-zinc-500 dark:bg-white/[.04]">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Placed</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-black/5 dark:border-white/5"
                >
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-black hover:underline dark:text-zinc-50"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {order.user.email}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
