import 'dotenv/config';
import { Pool } from 'pg';
import type { SafeUser } from '../../src/users/user.serializer';
import type { OrderWithItems } from '../../src/orders/interfaces/order-with-items.interface';
import type { CartResponse } from '../../src/cart/interfaces/cart-with-total.interface';
import type { MealKitPreview } from '../../src/meals/interfaces/meal-kit-preview.interface';

export type { SafeUser, OrderWithItems, CartResponse, MealKitPreview };

/** Shape of POST /auth/register and POST /auth/login responses. */
export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

/** These e2e tests hit a real running server over HTTP rather than booting
 * Nest in-process inside Jest. Jest's CJS module runtime cannot load some
 * of our dependencies (@nestjs/jwt, @nestjs/passport, @nestjs/mapped-types
 * all ship ESM-only builds as of their current major version) — Node's own
 * runtime handles this natively (which is why the real server boots fine),
 * but Jest's separate module loader does not. Testing over HTTP sidesteps
 * that entirely and, as a side benefit, exercises the actual built server. */
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.cookcart.dev`;
}

export async function promoteToAdmin(userId: string): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set (needed to promote a test user to ADMIN)',
    );
  }

  const pool = new Pool({ connectionString });
  try {
    await pool.query('UPDATE "User" SET role = $1 WHERE id = $2', [
      'ADMIN',
      userId,
    ]);
  } finally {
    await pool.end();
  }
}
