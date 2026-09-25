import type { MealIngredient } from "@/types/api";

export interface MealEstimate {
  totalPrice: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function scaledNutrient(
  quantity: number,
  per100g: number | null,
): number {
  if (per100g === null) {
    return 0;
  }
  return (quantity / 100) * per100g;
}

export function estimateMeal(
  ingredients: MealIngredient[],
  excludedIngredientIds: ReadonlySet<string> = new Set(),
): MealEstimate {
  let totalPrice = 0;
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const mealIngredient of ingredients) {
    const { ingredient, quantity } = mealIngredient;

    calories += scaledNutrient(quantity, ingredient.caloriesPer100g);
    protein += scaledNutrient(quantity, ingredient.proteinPer100g);
    carbs += scaledNutrient(quantity, ingredient.carbsPer100g);
    fat += scaledNutrient(quantity, ingredient.fatPer100g);

    if (!excludedIngredientIds.has(mealIngredient.ingredientId)) {
      totalPrice += quantity * ingredient.pricePerUnit;
    }
  }

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}
