import type {
  AddMealIngredientInput,
  AdminOrder,
  AuthResult,
  CartResponse,
  CreateIngredientInput,
  CreateMealInput,
  CreatePantryItemInput,
  Ingredient,
  LoginInput,
  Meal,
  MealIngredient,
  MealKitPreview,
  Order,
  OrderStatus,
  PantryItem,
  RegisterInput,
  SafeUser,
  UpdateIngredientInput,
  UpdateMealInput,
  UpdatePantryItemInput,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data: unknown = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const payload = data as { message?: string | string[] } | undefined;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : (payload?.message ?? response.statusText);
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export const api = {
  register: (input: RegisterInput) =>
    apiRequest<AuthResult>("/auth/register", { method: "POST", body: input }),
  login: (input: LoginInput) =>
    apiRequest<AuthResult>("/auth/login", { method: "POST", body: input }),
  me: (token: string) => apiRequest<SafeUser>("/auth/me", { token }),
  listMeals: () => apiRequest<Meal[]>("/meals"),
  getMeal: (id: string) => apiRequest<Meal>(`/meals/${id}`),
  previewKit: (id: string, token: string) =>
    apiRequest<MealKitPreview>(`/meals/${id}/preview-kit`, {
      method: "POST",
      token,
    }),
  addMealToCart: (mealId: string, token: string) =>
    apiRequest<CartResponse>(`/cart/meals`, {
      method: "POST",
      token,
      body: { mealId },
    }),
  listIngredients: () => apiRequest<Ingredient[]>("/ingredients"),

  // Pantry
  listPantry: (token: string) =>
    apiRequest<PantryItem[]>("/pantry", { token }),
  addPantryItem: (input: CreatePantryItemInput, token: string) =>
    apiRequest<PantryItem>("/pantry", { method: "POST", token, body: input }),
  updatePantryItem: (
    id: string,
    input: UpdatePantryItemInput,
    token: string,
  ) =>
    apiRequest<PantryItem>(`/pantry/${id}`, {
      method: "PATCH",
      token,
      body: input,
    }),
  removePantryItem: (id: string, token: string) =>
    apiRequest<void>(`/pantry/${id}`, { method: "DELETE", token }),

  // Cart
  getCart: (token: string) => apiRequest<CartResponse>("/cart", { token }),
  updateCartIngredient: (
    id: string,
    isRemovedByUser: boolean,
    token: string,
  ) =>
    apiRequest<CartResponse>(`/cart/ingredients/${id}`, {
      method: "PATCH",
      token,
      body: { isRemovedByUser },
    }),
  removeCartMeal: (id: string, token: string) =>
    apiRequest<void>(`/cart/meals/${id}`, { method: "DELETE", token }),
  checkout: (token: string) =>
    apiRequest<Order>("/cart/checkout", { method: "POST", token }),

  // Orders
  listOrders: (token: string) => apiRequest<Order[]>("/orders", { token }),
  getOrder: (id: string, token: string) =>
    apiRequest<Order>(`/orders/${id}`, { token }),
  cancelOrder: (id: string, token: string) =>
    apiRequest<Order>(`/orders/${id}/cancel`, { method: "PATCH", token }),

  // Admin: ingredients
  createIngredient: (input: CreateIngredientInput, token: string) =>
    apiRequest<Ingredient>("/admin/ingredients", {
      method: "POST",
      token,
      body: input,
    }),
  updateIngredient: (
    id: string,
    input: UpdateIngredientInput,
    token: string,
  ) =>
    apiRequest<Ingredient>(`/admin/ingredients/${id}`, {
      method: "PATCH",
      token,
      body: input,
    }),
  deleteIngredient: (id: string, token: string) =>
    apiRequest<void>(`/admin/ingredients/${id}`, {
      method: "DELETE",
      token,
    }),

  // Admin: meals
  createMeal: (input: CreateMealInput, token: string) =>
    apiRequest<Meal>("/admin/meals", { method: "POST", token, body: input }),
  updateMeal: (id: string, input: UpdateMealInput, token: string) =>
    apiRequest<Meal>(`/admin/meals/${id}`, {
      method: "PATCH",
      token,
      body: input,
    }),
  deleteMeal: (id: string, token: string) =>
    apiRequest<void>(`/admin/meals/${id}`, { method: "DELETE", token }),
  addMealIngredient: (
    mealId: string,
    input: AddMealIngredientInput,
    token: string,
  ) =>
    apiRequest<MealIngredient>(`/admin/meals/${mealId}/ingredients`, {
      method: "POST",
      token,
      body: input,
    }),
  removeMealIngredient: (
    mealId: string,
    ingredientId: string,
    token: string,
  ) =>
    apiRequest<void>(
      `/admin/meals/${mealId}/ingredients/${ingredientId}`,
      { method: "DELETE", token },
    ),

  // Admin: orders
  listAdminOrders: (token: string) =>
    apiRequest<AdminOrder[]>("/admin/orders", { token }),
  getAdminOrder: (id: string, token: string) =>
    apiRequest<AdminOrder>(`/admin/orders/${id}`, { token }),
  updateOrderStatus: (id: string, status: OrderStatus, token: string) =>
    apiRequest<AdminOrder>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),
};
