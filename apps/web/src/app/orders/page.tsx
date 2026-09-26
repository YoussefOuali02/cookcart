"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireCustomer } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { Order } from "@/types/api";

export default function OrdersPage() {
  const { user, token } = useRequireCustomer();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api
      .listOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load orders.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Orders
        </h1>

        {error ? (
          <p className="mt-8 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {!orders && !error ? (
          <p className="mt-8 text-sm text-zinc-500">Loading orders...</p>
        ) : null}

        {orders && orders.length === 0 ? (
          <div className="mt-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/meals"
              className="mt-4 inline-block text-sm font-medium text-black underline dark:text-zinc-50"
            >
              Browse meals
            </Link>
          </div>
        ) : null}

        {orders && orders.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-2">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-sm transition-shadow hover:shadow-sm dark:border-white/10 dark:bg-zinc-900"
                >
                  <div>
                    <div className="font-medium text-black dark:text-zinc-50">
                      Order #{order.id.slice(0, 8)}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
