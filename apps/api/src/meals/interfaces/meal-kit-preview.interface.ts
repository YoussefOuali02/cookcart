export interface MealKitPreviewIngredient {
  name: string;
  requiredQuantity: number;
  unit: string;
  userHasIt: boolean;
  includedInOrder: boolean;
}

export interface MealKitPreview {
  meal: string;
  ingredients: MealKitPreviewIngredient[];
  totalPrice: number;
}
