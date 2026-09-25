"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRequireAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { Ingredient, PantryItem } from "@/types/api";

export default function PantryPage() {
  const { user, token } = useRequireAuth();

  const [items, setItems] = useState<PantryItem[] | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([api.listPantry(token), api.listIngredients()])
      .then(([pantryItems, allIngredients]) => {
        if (cancelled) return;
        setItems(pantryItems);
        setIngredients(allIngredients);
        if (allIngredients.length > 0) {
          setSelectedIngredientId(allIngredients[0].id);
          setUnit(allIngredients[0].defaultUnit);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Could not load pantry.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleIngredientChange(ingredientId: string) {
    setSelectedIngredientId(ingredientId);
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    if (ingredient) setUnit(ingredient.defaultUnit);
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedIngredientId || !quantity) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await api.addPantryItem(
        {
          ingredientId: selectedIngredientId,
          quantity: Number(quantity),
          unit,
          alwaysAvailable,
        },
        token,
      );
      setItems((current) => {
        if (!current) return [created];
        const withoutExisting = current.filter((i) => i.id !== created.id);
        return [...withoutExisting, created];
      });
      setQuantity("");
      setAlwaysAvailable(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not add ingredient.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuantityChange(item: PantryItem, newQuantity: number) {
    if (!token || Number.isNaN(newQuantity)) return;
    const updated = await api.updatePantryItem(
      item.id,
      { quantity: newQuantity },
      token,
    );
    setItems(
      (current) =>
        current?.map((i) => (i.id === updated.id ? updated : i)) ?? null,
    );
  }

  async function handleAlwaysAvailableToggle(item: PantryItem) {
    if (!token) return;
    const updated = await api.updatePantryItem(
      item.id,
      { alwaysAvailable: !item.alwaysAvailable },
      token,
    );
    setItems(
      (current) =>
        current?.map((i) => (i.id === updated.id ? updated : i)) ?? null,
    );
  }

  async function handleRemove(item: PantryItem) {
    if (!token) return;
    await api.removePantryItem(item.id, token);
    setItems((current) => current?.filter((i) => i.id !== item.id) ?? null);
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Pantry
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add what you already have — we&apos;ll skip it when you order a
          meal kit.
        </p>

        <form
          onSubmit={handleAdd}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
        >
          <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
            <label htmlFor="ingredient" className="text-xs font-medium">
              Ingredient
            </label>
            <select
              id="ingredient"
              value={selectedIngredientId}
              onChange={(event) => handleIngredientChange(event.target.value)}
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
            <label htmlFor="quantity" className="text-xs font-medium">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              step="any"
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
            />
          </div>

          <div className="flex w-20 flex-col gap-1.5">
            <label htmlFor="unit" className="text-xs font-medium">
              Unit
            </label>
            <input
              id="unit"
              type="text"
              required
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-900"
            />
          </div>

          <label className="flex items-center gap-2 pb-2 text-xs">
            <input
              type="checkbox"
              checked={alwaysAvailable}
              onChange={(event) => setAlwaysAvailable(event.target.checked)}
              className="h-4 w-4 rounded border-black/20 dark:border-white/30"
            />
            Always have it
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !selectedIngredientId}
            className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Add
          </button>
        </form>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {!items ? (
          <p className="mt-8 text-sm text-zinc-500">Loading pantry...</p>
        ) : items.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500">
            Your pantry is empty. Add ingredients above.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <span className="flex-1 font-medium text-black dark:text-zinc-50">
                  {item.ingredient.name}
                </span>

                <input
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={item.quantity}
                  onBlur={(event) =>
                    handleQuantityChange(item, Number(event.target.value))
                  }
                  className="w-20 rounded-lg border border-black/10 bg-white px-2 py-1 text-right text-sm dark:border-white/15 dark:bg-zinc-900"
                />
                <span className="w-10 text-xs text-zinc-500">
                  {item.unit}
                </span>

                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={item.alwaysAvailable}
                    onChange={() => handleAlwaysAvailableToggle(item)}
                    className="h-4 w-4 rounded border-black/20 dark:border-white/30"
                  />
                  always
                </label>

                <button
                  onClick={() => handleRemove(item)}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
