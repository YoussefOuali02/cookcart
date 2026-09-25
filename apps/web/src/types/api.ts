export type UserRole = "CUSTOMER" | "ADMIN";

export interface SafeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: SafeUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  defaultUnit: string;
  pricePerUnit: number;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  storageInstructions: string | null;
}

export interface MealIngredient {
  id: string;
  mealId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  cookingStep: number | null;
  ingredient: Ingredient;
}

export interface Meal {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cookingTimeMinutes: number | null;
  difficulty: string | null;
  cuisine: string | null;
  dietTags: string[];
  instructions: string | null;
  isPublished: boolean;
  ingredients: MealIngredient[];
}

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

export type MealSummary = Omit<Meal, "ingredients">;

export interface PantryItem {
  id: string;
  userId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  alwaysAvailable: boolean;
  ingredient: Ingredient;
}

export interface CreatePantryItemInput {
  ingredientId: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  alwaysAvailable?: boolean;
}

export interface UpdatePantryItemInput {
  quantity?: number;
  unit?: string;
  expiryDate?: string;
  alwaysAvailable?: boolean;
}

export interface CartIngredientLine {
  id: string;
  cartMealId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  price: number;
  isRemovedByUser: boolean;
  removalReason: string | null;
  ingredient: Ingredient;
}

export interface CartMealLine {
  id: string;
  cartId: string;
  mealId: string;
  servings: number;
  meal: MealSummary;
  ingredients: CartIngredientLine[];
}

export interface CartResponse {
  id: string;
  userId: string;
  meals: CartMealLine[];
  totalPrice: number;
}

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  mealId: string | null;
  ingredientId: string;
  quantity: number;
  unit: string;
  price: number;
  ingredient: Ingredient;
  meal: MealSummary | null;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
