"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { Order } from "@/types/api";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useRequireAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api
      .getOrder(id, token)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load order.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  async function handleCancel() {
    if (!token) return;
    setIsCancelling(true);
    setError(null);

    try {
      const updated = await api.cancelOrder(id, token);
      setOrder(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not cancel order.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (!user) {
    return null;
  }

  if (error && !order) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-zinc-500">Loading order...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Order #{order.id.slice(0, 8)}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Placed {new Date(order.createdAt).toLocaleString()}
        </p>

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
                  <div className="text-xs text-zinc-500">
                    for {item.meal.name}
                  </div>
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
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {order.status === "PENDING" ? (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-red-200 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {isCancelling ? "Cancelling..." : "Cancel order"}
          </button>
        ) : null}
      </div>
    </main>
  );
}
