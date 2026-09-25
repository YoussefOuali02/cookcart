"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { CreateIngredientInput, Ingredient } from "@/types/api";

const EMPTY_FORM: CreateIngredientInput = {
  name: "",
  category: "",
  defaultUnit: "g",
  pricePerUnit: 0,
  caloriesPer100g: undefined,
  proteinPer100g: undefined,
  carbsPer100g: undefined,
  fatPer100g: undefined,
  storageInstructions: "",
};

export default function AdminIngredientsPage() {
  const { token } = useAuth();

  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateIngredientInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    api
      .listIngredients()
      .then(setIngredients)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Could not load ingredients.",
        );
      });
  }

  useEffect(() => {
    refresh();
  }, []);

  function startEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      category: ingredient.category ?? "",
      defaultUnit: ingredient.defaultUnit,
      pricePerUnit: ingredient.pricePerUnit,
      caloriesPer100g: ingredient.caloriesPer100g ?? undefined,
      proteinPer100g: ingredient.proteinPer100g ?? undefined,
      carbsPer100g: ingredient.carbsPer100g ?? undefined,
      fatPer100g: ingredient.fatPer100g ?? undefined,
      storageInstructions: ingredient.storageInstructions ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await api.updateIngredient(editingId, form, token);
      } else {
        await api.createIngredient(form, token);
      }
      cancelEdit();
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save ingredient.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(ingredient: Ingredient) {
    if (!token) return;
    if (!window.confirm(`Delete ${ingredient.name}?`)) return;

    try {
      await api.deleteIngredient(ingredient.id, token);
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete ingredient.",
      );
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Ingredients
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium">Name</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-medium">Category</label>
          <input
            id="category"
            value={form.category ?? ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="defaultUnit" className="text-xs font-medium">Default unit</label>
          <input
            id="defaultUnit"
            required
            value={form.defaultUnit}
            onChange={(e) =>
              setForm({ ...form, defaultUnit: e.target.value })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pricePerUnit" className="text-xs font-medium">Price / unit</label>
          <input
            id="pricePerUnit"
            type="number"
            min="0"
            step="any"
            value={form.pricePerUnit ?? 0}
            onChange={(e) =>
              setForm({ ...form, pricePerUnit: Number(e.target.value) })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="caloriesPer100g" className="text-xs font-medium">Calories/100g</label>
          <input
            id="caloriesPer100g"
            type="number"
            min="0"
            step="any"
            value={form.caloriesPer100g ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                caloriesPer100g:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="proteinPer100g" className="text-xs font-medium">Protein/100g</label>
          <input
            id="proteinPer100g"
            type="number"
            min="0"
            step="any"
            value={form.proteinPer100g ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                proteinPer100g:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="carbsPer100g" className="text-xs font-medium">Carbs/100g</label>
          <input
            id="carbsPer100g"
            type="number"
            min="0"
            step="any"
            value={form.carbsPer100g ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                carbsPer100g:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fatPer100g" className="text-xs font-medium">Fat/100g</label>
          <input
            id="fatPer100g"
            type="number"
            min="0"
            step="any"
            value={form.fatPer100g ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                fatPer100g:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-3">
          <label htmlFor="storageInstructions" className="text-xs font-medium">Storage instructions</label>
          <input
            id="storageInstructions"
            value={form.storageInstructions ?? ""}
            onChange={(e) =>
              setForm({ ...form, storageInstructions: e.target.value })
            }
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
          />
        </div>

        <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {editingId ? "Save" : "Add"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium dark:border-white/15"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!ingredients ? (
        <p className="mt-8 text-sm text-zinc-500">Loading ingredients...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.03] text-xs text-zinc-500 dark:bg-white/[.04]">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Unit</th>
                <th className="px-4 py-2 font-medium">Price/unit</th>
                <th className="px-4 py-2 font-medium">Calories/100g</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr
                  key={ingredient.id}
                  className="border-t border-black/5 dark:border-white/5"
                >
                  <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                    {ingredient.name}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {ingredient.category ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {ingredient.defaultUnit}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    ${ingredient.pricePerUnit.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {ingredient.caloriesPer100g ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(ingredient)}
                      className="mr-3 text-xs font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient)}
                      className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
