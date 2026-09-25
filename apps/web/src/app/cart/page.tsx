"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { CartResponse } from "@/types/api";

export default function CartPage() {
  const { user, token } = useRequireAuth();
  const router = useRouter();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api
      .getCart(token)
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load cart.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function toggleIngredient(ingredientLineId: string, removed: boolean) {
    if (!token) return;
    const updated = await api.updateCartIngredient(
      ingredientLineId,
      !removed,
      token,
    );
    setCart(updated);
  }

  async function removeMeal(cartMealId: string) {
    if (!token) return;
    await api.removeCartMeal(cartMealId, token);
    const refreshed = await api.getCart(token);
    setCart(refreshed);
  }

  async function handleCheckout() {
    if (!token) return;
    setIsCheckingOut(true);
    setError(null);

    try {
      const order = await api.checkout(token);
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not check out.",
      );
      setIsCheckingOut(false);
    }
  }

  if (!user) {
    return null;
  }

  if (!cart) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-zinc-500">
          {error ?? "Loading cart..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Cart
        </h1>

        {cart.meals.length === 0 ? (
          <div className="mt-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your cart is empty.
            </p>
            <Link
              href="/meals"
              className="mt-4 inline-block text-sm font-medium text-black underline dark:text-zinc-50"
            >
              Browse meals
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-4">
              {cart.meals.map((cartMeal) => (
                <div
                  key={cartMeal.id}
                  className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-black dark:text-zinc-50">
                      {cartMeal.meal.name}
                    </h2>
                    <button
                      onClick={() => removeMeal(cartMeal.id)}
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>

                  <ul className="mt-3 flex flex-col gap-2">
                    {cartMeal.ingredients.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <label className="flex flex-1 items-center gap-2">
                          <input
                            type="checkbox"
                            checked={line.isRemovedByUser}
                            onChange={() =>
                              toggleIngredient(line.id, line.isRemovedByUser)
                            }
                            className="h-4 w-4 rounded border-black/20 dark:border-white/30"
                          />
                          <span
                            className={
                              line.isRemovedByUser
                                ? "text-zinc-400 line-through dark:text-zinc-600"
                                : "text-zinc-800 dark:text-zinc-200"
                            }
                          >
                            {line.ingredient.name}
                          </span>
                        </label>
                        <span className="text-xs text-zinc-500">
                          {line.quantity}
                          {line.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">
                ${cart.totalPrice.toFixed(2)}
              </span>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {isCheckingOut ? "Placing order..." : "Checkout"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
