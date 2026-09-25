"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { Ingredient, Meal, UpdateMealInput } from "@/types/api";

function toMealForm(meal: Meal): UpdateMealInput {
  return {
    name: meal.name,
    description: meal.description ?? "",
    imageUrl: meal.imageUrl ?? "",
    cookingTimeMinutes: meal.cookingTimeMinutes ?? undefined,
    difficulty: meal.difficulty ?? "",
    cuisine: meal.cuisine ?? "",
    dietTags: meal.dietTags,
    instructions: meal.instructions ?? "",
    isPublished: meal.isPublished,
  };
}

export default function AdminMealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState<UpdateMealInput | null>(null);
  const [dietTagsInput, setDietTagsInput] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newIngredientId, setNewIngredientId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newIsOptional, setNewIsOptional] = useState(false);

  function refreshMeal() {
    api
      .getMeal(id)
      .then((data) => {
        setMeal(data);
        setForm(toMealForm(data));
        setDietTagsInput(data.dietTags.join(", "));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load meal.");
      });
  }

  useEffect(() => {
    refreshMeal();
    api.listIngredients().then((all) => {
      setIngredients(all);
      if (all.length > 0) {
        setNewIngredientId(all[0].id);
        setNewUnit(all[0].defaultUnit);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleNewIngredientChange(ingredientId: string) {
    setNewIngredientId(ingredientId);
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    if (ingredient) setNewUnit(ingredient.defaultUnit);
  }

  async function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !form) return;

    setIsSaving(true);
    setError(null);

    try {
      await api.updateMeal(
        id,
        {
          ...form,
          dietTags: dietTagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
        token,
      );
      refreshMeal();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save meal.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAssignIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !newIngredientId || !newQuantity) return;

    setError(null);

    try {
      await api.addMealIngredient(
        id,
        {
          ingredientId: newIngredientId,
          quantity: Number(newQuantity),
          unit: newUnit,
          isOptional: newIsOptional,
        },
        token,
      );
      setNewQuantity("");
      setNewIsOptional(false);
      refreshMeal();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not assign ingredient.",
      );
    }
  }

  async function handleRemoveIngredient(ingredientId: string) {
    if (!token) return;
    try {
      await api.removeMealIngredient(id, ingredientId, token);
      refreshMeal();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not remove ingredient.",
      );
    }
  }

  async function handleDeleteMeal() {
    if (!token || !meal) return;
    if (!window.confirm(`Delete ${meal.name}? This cannot be undone.`)) return;

    try {
      await api.deleteMeal(id, token);
      router.push("/admin/meals");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete meal.");
    }
  }

  if (!meal || !form) {
    return <p className="text-sm text-zinc-500">{error ?? "Loading..."}</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {meal.name}
        </h1>
        <button
          onClick={handleDeleteMeal}
          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Delete meal
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <form
        onSubmit={handleSaveDetails}
        className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="meal-name" className="text-xs font-medium">
            Name
          </label>
          <input
            id="meal-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="meal-description" className="text-xs font-medium">
            Description
          </label>
          <textarea
            id="meal-description"
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-cookingTime" className="text-xs font-medium">
            Cooking time (min)
          </label>
          <input
            id="meal-cookingTime"
            type="number"
            min="0"
            value={form.cookingTimeMinutes ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                cookingTimeMinutes:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-difficulty" className="text-xs font-medium">
            Difficulty
          </label>
          <input
            id="meal-difficulty"
            value={form.difficulty ?? ""}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-cuisine" className="text-xs font-medium">
            Cuisine
          </label>
          <input
            id="meal-cuisine"
            value={form.cuisine ?? ""}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meal-dietTags" className="text-xs font-medium">
            Diet tags (comma separated)
          </label>
          <input
            id="meal-dietTags"
            value={dietTagsInput}
            onChange={(e) => setDietTagsInput(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="meal-imageUrl" className="text-xs font-medium">
            Image URL
          </label>
          <input
            id="meal-imageUrl"
            value={form.imageUrl ?? ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="meal-instructions" className="text-xs font-medium">
            Cooking instructions
          </label>
          <textarea
            id="meal-instructions"
            rows={4}
            value={form.instructions ?? ""}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>

        <label
          htmlFor="meal-isPublished"
          className="col-span-2 flex items-center gap-2 text-sm"
        >
          <input
            id="meal-isPublished"
            type="checkbox"
            checked={form.isPublished ?? false}
            onChange={(e) =>
              setForm({ ...form, isPublished: e.target.checked })
            }
            className="h-4 w-4 rounded border-black/20 dark:border-white/30"
          />
          Published (visible to customers)
        </label>

        <div className="col-span-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isSaving ? "Saving..." : "Save details"}
          </button>
        </div>
      </form>

      <h2 className="mt-8 font-medium text-black dark:text-zinc-50">
        Ingredients
      </h2>

      <ul className="mt-3 flex flex-col gap-2">
        {meal.ingredients.map((mealIngredient) => (
          <li
            key={mealIngredient.id}
            className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-zinc-900"
          >
            <span className="font-medium text-black dark:text-zinc-50">
              {mealIngredient.ingredient.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {mealIngredient.quantity}
                {mealIngredient.unit}
                {mealIngredient.isOptional ? " (optional)" : ""}
              </span>
              <button
                onClick={() =>
                  handleRemoveIngredient(mealIngredient.ingredientId)
                }
                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {meal.ingredients.length === 0 ? (
          <li className="text-sm text-zinc-500">No ingredients assigned yet.</li>
        ) : null}
      </ul>

      <form
        onSubmit={handleAssignIngredient}
        className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <label htmlFor="assign-ingredient" className="text-xs font-medium">
            Ingredient
          </label>
          <select
            id="assign-ingredient"
            value={newIngredientId}
            onChange={(e) => handleNewIngredientChange(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          >
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-24 flex-col gap-1.5">
          <label htmlFor="assign-quantity" className="text-xs font-medium">
            Quantity
          </label>
          <input
            id="assign-quantity"
            type="number"
            min="0"
            step="any"
            required
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex w-20 flex-col gap-1.5">
          <label htmlFor="assign-unit" className="text-xs font-medium">
            Unit
          </label>
          <input
            id="assign-unit"
            required
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-xs">
          <input
            type="checkbox"
            checked={newIsOptional}
            onChange={(e) => setNewIsOptional(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 dark:border-white/30"
          />
          Optional
        </label>
        <button
          type="submit"
          disabled={!newIngredientId}
          className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Assign
        </button>
      </form>
    </div>
  );
}
