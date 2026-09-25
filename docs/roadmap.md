# CookCart Roadmap

Status legend: Done, In progress, Not started.

## Phase 0: Project Setup

Goal: Create a clean project foundation.

Status: Done

Tasks:

- [x] Create repository
- [x] Create documentation
- [x] Define MVP
- [x] Set up folder structure
- [x] Prepare backend and frontend setup

## Phase 1: Backend Foundation

Goal: Build the core API.

Status: Done

Tasks:

- [x] Set up NestJS
- [x] Set up PostgreSQL
- [x] Set up Prisma
- [x] Create authentication (register, login, JWT guard, roles)
- [x] Create user model
- [x] Create ingredient model
- [x] Create meal model
- [x] Create pantry model
- [x] Create order model (schema only — no endpoints yet, see Phase 2)

## Phase 2: Core Meal Kit Logic

Goal: Build the heart of CookCart, end to end through checkout.

Status: Done (nutrition calculation deferred — not blocking)

Tasks:

- [x] Create meal ingredients (admin can assign ingredients + quantities to a meal)
- [x] Compare meal ingredients with user pantry (`POST /meals/:id/preview-kit`)
- [x] Generate missing ingredient list (`includedInOrder` per ingredient)
- [x] Calculate price (`totalPrice` from `Ingredient.pricePerUnit`)
- [ ] Calculate nutrition (sum `caloriesPer100g`/protein/carbs/fat for the meal, scaled by quantity — not started, deferred to whenever a screen actually needs it)
- [x] Cart APIs: `GET /cart`, `POST /cart/meals`, `PATCH /cart/ingredients/:id`, `DELETE /cart/meals/:id`
  - Adding a meal to cart snapshots the preview-kit-style comparison into `CartMeal`/`CartIngredient` (quantity scaled by `servings`, unit, per-unit `price`, `isRemovedByUser` pre-checked from the pantry) so the customer can toggle ingredients in the cart without recomputing against a pantry that may change.
- [x] `POST /cart/checkout`: converts the current cart into an `Order` + `OrderItem` rows, clears the cart, returns the created order.
- [x] Order APIs: `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel` (customer, own orders only; cancel only allowed while `PENDING`).
- [x] Admin order APIs: `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`.

Backend is now complete enough for the full Step 9 demo flow (verified end to end via API). What's left is entirely UI (Phases 3–4 below).

## Phase 3: Customer Web App

Goal: Build the first customer-facing version.

Status: Done

Tasks:

- [x] Scaffold `apps/web` (Next.js + TypeScript + Tailwind), wired to the API with a typed client and JWT stored client-side.
- [x] Landing page
- [x] Login and register pages
- [x] Meal list (cards: image/placeholder, name, cooking time, price estimate, calories)
- [x] Meal details page (ingredients with "remove — I already have it" checkboxes, pre-checked from `preview-kit`, live price estimate, nutrition, cooking instructions, add to cart)
- [x] Pantry page (add/edit/remove pantry items)
- [x] Cart page (review kit, toggle removed ingredients, checkout)
- [x] Orders page (order history + status, with cancel while pending)

## Phase 4: Admin Dashboard

Goal: Allow grocery store admins to manage the system.

Status: Done

Tasks:

- [x] Admin shell (`/admin`), gated by the `ADMIN` role
- [x] Ingredient management (list/create/edit/delete)
- [x] Meal management (list/create/edit, assign/unassign ingredients with quantities)
- [x] Order management (list, view detail, update status)
- [x] Basic analytics (total orders, pending count, revenue — kept minimal for MVP)

## Milestone: First Product Demo (roadmap Step 9)

Goal: Record the full customer + admin flow working end to end in the real UI (not curl).

Status: Verified — every step below has been driven end to end in the real UI with a
headless browser (admin CRUD in the Day 13 test, pantry/cart/checkout in the Day 12
test, admin-sees-order-and-updates-status/customer-sees-update in the Day 14 test).
No actual screen recording exists; "Record" here means capture this as a real demo
video when useful (e.g. for stakeholders), which is a presentation step, not
further engineering.

Flow to demo:

1. Admin creates ingredients
2. Admin creates a meal
3. User registers/logs in
4. User adds ingredients to pantry
5. User opens a meal, sees required ingredients minus what they have
6. User removes ingredients they already have
7. User adds the kit to cart and places the order
8. Admin sees the order
9. Admin updates status to Preparing

## Phase 5: QR Code System

Goal: Add QR-enabled ingredient package details.

Status: Not started

Tasks:

- [ ] Generate a QR code per order item
- [ ] QR opens `/qr/:code`
- [ ] `/qr/:code` page shows ingredient details and the relevant cooking step
- [ ] No package printing in v1

## Phase 6: Mobile App

Goal: Build the mobile app.

Status: Not started

Tasks:

- [ ] React Native / Expo setup (`apps/mobile`)
- [ ] Authentication
- [ ] Meals
- [ ] Meal details
- [ ] Pantry
- [ ] Cart
- [ ] Orders
- [ ] QR scanner
- [ ] Cooking instructions

Uses the same backend as web — no new API work expected beyond what Phases 2–5 already built.

## Phase 7: AI Recommendation Assistant

Goal: Add intelligent meal suggestions, after the product already works.

Status: Not started

Tasks:

- [ ] Suggest 3 meals based on user goal, diet type, and pantry ingredients
- [ ] Explain each recommendation in plain language

Guardrail: AI never controls prices, allergies, or core ordering logic — recommendation only.

## Phase 8: SaaS Business Layer

Goal: Prepare the app for real grocery stores.

Status: Not started

Tasks:

- [ ] Multi-store support
- [ ] Store subscription plans
- [ ] Store onboarding
- [ ] Stripe subscriptions
- [ ] Platform admin
