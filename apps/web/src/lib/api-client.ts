import type {
  AuthResult,
  LoginInput,
  Meal,
  MealKitPreview,
  RegisterInput,
  SafeUser,
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
    apiRequest(`/cart/meals`, {
      method: "POST",
      token,
      body: { mealId },
    }),
};
