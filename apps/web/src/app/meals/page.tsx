"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { estimateMeal } from "@/lib/meal-estimates";
import { MealImage } from "@/components/meal-image";
import type { Meal } from "@/types/api";

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .listMeals()
      .then((data) => {
        if (!cancelled) setMeals(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load meals.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Meals
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a meal to see exactly what you need to cook it.
        </p>

        {error ? (
          <p className="mt-8 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {!meals && !error ? (
          <p className="mt-8 text-sm text-zinc-500">Loading meals...</p>
        ) : null}

        {meals ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => {
              const estimate = estimateMeal(meal.ingredients);
              return (
                <Link
                  key={meal.id}
                  href={`/meals/${meal.id}`}
                  className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <MealImage name={meal.name} imageUrl={meal.imageUrl} />
                  </div>
                  <div className="p-4">
                    <h2 className="font-medium text-black group-hover:underline dark:text-zinc-50">
                      {meal.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {meal.cookingTimeMinutes ? (
                        <span>{meal.cookingTimeMinutes} min</span>
                      ) : null}
                      <span>~${estimate.totalPrice.toFixed(2)}</span>
                      <span>{estimate.calories} kcal</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
