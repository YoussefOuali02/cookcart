"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { AdminOrder, OrderStatus } from "@/types/api";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  function refresh() {
    if (!token) return;
    api
      .getAdminOrder(id, token)
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load order.");
      });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  async function handleUpdateStatus() {
    if (!token || !selectedStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const updated = await api.updateOrderStatus(id, selectedStatus, token);
      setOrder(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update status.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (!order) {
    return <p className="text-sm text-zinc-500">{error ?? "Loading..."}</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Order #{order.id.slice(0, 8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {order.user.firstName ?? order.user.email} &middot;{" "}
        {new Date(order.createdAt).toLocaleString()}
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-900"
          >
            <div>
              <div className="font-medium text-black dark:text-zinc-50">
                {item.ingredient.name}
              </div>
              {item.meal ? (
                <div className="text-xs text-zinc-500">for {item.meal.name}</div>
              ) : null}
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>
                {item.quantity}
                {item.unit}
              </div>
              <div>${(item.quantity * item.price).toFixed(2)}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <span className="text-sm font-medium">Total</span>
        <span className="text-lg font-semibold">
          ${order.totalPrice.toFixed(2)}
        </span>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="mt-4 flex items-end gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="order-status" className="text-xs font-medium">
            Status
          </label>
          <select
            id="order-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleUpdateStatus}
          disabled={isUpdating || selectedStatus === order.status}
          className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {isUpdating ? "Updating..." : "Update status"}
        </button>
      </div>
    </div>
  );
}
