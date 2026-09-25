"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { Meal } from "@/types/api";

export default function AdminMealsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function refresh() {
    api
      .listMeals()
      .then(setMeals)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load meals.");
      });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const created = await api.createMeal({ name }, token);
      router.push(`/admin/meals/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create meal.");
      setIsCreating(false);
    }
  }

  async function handleDelete(meal: Meal) {
    if (!token) return;
    if (!window.confirm(`Delete ${meal.name}?`)) return;

    try {
      await api.deleteMeal(meal.id, token);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete meal.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Meals
      </h1>

      <form
        onSubmit={handleCreate}
        className="mt-6 flex items-end gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium">New meal name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beef Stir Fry"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Create &amp; edit
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {!meals ? (
        <p className="mt-8 text-sm text-zinc-500">Loading meals...</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {meals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-900"
            >
              <div>
                <Link
                  href={`/admin/meals/${meal.id}`}
                  className="font-medium text-black hover:underline dark:text-zinc-50"
                >
                  {meal.name}
                </Link>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {meal.ingredients.length} ingredient
                  {meal.ingredients.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    meal.isPublished
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {meal.isPublished ? "Published" : "Draft"}
                </span>
                <Link
                  href={`/admin/meals/${meal.id}`}
                  className="text-xs font-medium hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(meal)}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
