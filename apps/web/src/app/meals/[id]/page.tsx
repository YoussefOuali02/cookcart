"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { estimateMeal } from "@/lib/meal-estimates";
import { MealImage } from "@/components/meal-image";
import type { Meal } from "@/types/api";

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, isLoading: isAuthLoading } = useAuth();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const [addStatus, setAddStatus] = useState<
    "idle" | "adding" | "added" | "error"
  >("idle");
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getMeal(id)
      .then((data) => {
        if (cancelled) return;
        setMeal(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Could not load this meal.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!token || !meal) {
      return;
    }

    let cancelled = false;

    api
      .previewKit(id, token)
      .then((data) => {
        if (cancelled) return;

        const alreadyHave = new Set(
          data.ingredients
            .filter((item) => item.userHasIt)
            .map((item) => item.name),
        );
        const preRemoved = new Set(
          meal.ingredients
            .filter((mi) => alreadyHave.has(mi.ingredient.name))
            .map((mi) => mi.ingredientId),
        );
        setRemovedIds(preRemoved);
      })
      .catch(() => {
        // Preview is a nice-to-have; the page still works without it.
      });

    return () => {
      cancelled = true;
    };
  }, [id, token, meal]);

  const estimate = useMemo(() => {
    if (!meal) return null;
    return estimateMeal(meal.ingredients, removedIds);
  }, [meal, removedIds]);

  function toggleIngredient(ingredientId: string) {
    setRemovedIds((current) => {
      const next = new Set(current);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  }

  async function handleAddToCart() {
    if (!token || !meal) return;

    setAddStatus("adding");
    setAddError(null);

    try {
      await api.addMealToCart(meal.id, token);
      setAddStatus("added");
    } catch (err) {
      setAddStatus("error");
      setAddError(
        err instanceof ApiError ? err.message : "Could not add to cart.",
      );
    }
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </main>
    );
  }

  if (!meal) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-zinc-500">Loading meal...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <div className="aspect-video overflow-hidden rounded-2xl">
            <MealImage name={meal.name} imageUrl={meal.imageUrl} />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {meal.name}
          </h1>

          {meal.description ? (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {meal.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {meal.cookingTimeMinutes ? (
              <span className="rounded-full bg-black/[.06] px-3 py-1 dark:bg-white/[.08]">
                {meal.cookingTimeMinutes} min
              </span>
            ) : null}
            {meal.difficulty ? (
              <span className="rounded-full bg-black/[.06] px-3 py-1 dark:bg-white/[.08]">
                {meal.difficulty}
              </span>
            ) : null}
            {meal.cuisine ? (
              <span className="rounded-full bg-black/[.06] px-3 py-1 dark:bg-white/[.08]">
                {meal.cuisine}
              </span>
            ) : null}
            {meal.dietTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/[.06] px-3 py-1 dark:bg-white/[.08]"
              >
                {tag}
              </span>
            ))}
          </div>

          {estimate ? (
            <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl border border-black/10 p-4 text-center text-sm dark:border-white/10">
              <div>
                <div className="font-semibold">{estimate.calories}</div>
                <div className="text-xs text-zinc-500">kcal</div>
              </div>
              <div>
                <div className="font-semibold">{estimate.protein}g</div>
                <div className="text-xs text-zinc-500">protein</div>
              </div>
              <div>
                <div className="font-semibold">{estimate.carbs}g</div>
                <div className="text-xs text-zinc-500">carbs</div>
              </div>
              <div>
                <div className="font-semibold">{estimate.fat}g</div>
                <div className="text-xs text-zinc-500">fat</div>
              </div>
            </div>
          ) : null}

          {meal.instructions ? (
            <div className="mt-8">
              <h2 className="font-medium text-black dark:text-zinc-50">
                Cooking instructions
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {meal.instructions}
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
            <h2 className="font-medium text-black dark:text-zinc-50">
              Ingredients
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Uncheck anything you don&apos;t already have to include it in
              your order.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {meal.ingredients.map((mealIngredient) => {
                const isRemoved = removedIds.has(mealIngredient.ingredientId);
                return (
                  <li
                    key={mealIngredient.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <label className="flex flex-1 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isRemoved}
                        onChange={() =>
                          toggleIngredient(mealIngredient.ingredientId)
                        }
                        className="h-4 w-4 rounded border-black/20 dark:border-white/30"
                      />
                      <span
                        className={
                          isRemoved
                            ? "text-zinc-400 line-through dark:text-zinc-600"
                            : "text-zinc-800 dark:text-zinc-200"
                        }
                      >
                        {mealIngredient.ingredient.name}
                      </span>
                    </label>
                    <span className="text-xs text-zinc-500">
                      {mealIngredient.quantity}
                      {mealIngredient.unit}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
              <span className="text-sm font-medium">Estimated price</span>
              <span className="text-lg font-semibold">
                ${estimate?.totalPrice.toFixed(2)}
              </span>
            </div>

            {isAuthLoading ? null : user ? (
              <div className="mt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addStatus === "adding"}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {addStatus === "adding" ? "Adding..." : "Add to cart"}
                </button>
                {addStatus === "added" ? (
                  <p className="mt-2 text-center text-sm text-emerald-600 dark:text-emerald-400">
                    Added to your cart.
                  </p>
                ) : null}
                {addStatus === "error" && addError ? (
                  <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                    {addError}
                  </p>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-black/[.08] text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Log in to order
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
