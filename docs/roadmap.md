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

Status: Done

Tasks:

- [x] Create meal ingredients (admin can assign ingredients + quantities to a meal)
- [x] Compare meal ingredients with user pantry (`POST /meals/:id/preview-kit`)
- [x] Generate missing ingredient list (`includedInOrder` per ingredient)
- [x] Calculate price (`totalPrice` from `Ingredient.pricePerUnit`)
- [x] Calculate nutrition (`apps/web/src/lib/meal-estimates.ts` sums calories/protein/carbs/fat client-side from ingredient data, scaled by quantity and adjusted for removed ingredients)
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

## Milestone: Production Deployment

Goal: Get the verified MVP running on real infrastructure, not just localhost.

Status: Done

- [x] API deployed on Railway, database on Neon Postgres (migrated off Railway's own
  Postgres after discovering its free-tier sleep mode is incompatible with a
  TCP-only database — Neon's autosuspend wakes correctly on a real Postgres
  connection, Railway's did not)
- [x] Customer web app + admin dashboard deployed on Vercel, auto-deploying from `main`
- [x] CORS wired between the two, admin/customer role gating verified against the
  live database
- [x] Seed data live: 26 ingredients and 10 meals, including 4 Tunisian dishes
  (Tunisian Couscous, Brik a l'oeuf, Lablabi, Salade Mechouia)
- [x] Verified responsive on mobile, tablet (portrait + landscape), and desktop —
  two real layout bugs found and fixed (header nav overflow, flex-shrink issues
  on the register form and admin layout)
- [x] Admin accounts separated from customer actions — an admin can no longer
  add to cart, check out, or place orders; API-level (403) and UI-level enforced

Rethink point: the roadmap below was written before deployment, when "what feature
comes next" was the only question. Now that this is live infrastructure, the more
honest question is "what breaks first if a real grocery store actually uses this" —
which reordered everything that follows. The original Phase 5–8 plan (QR → Mobile →
AI → SaaS layer) is superseded by the phases below.

## Phase 5: Production Hardening

Goal: Make the deployed product trustworthy before a real store or customer
depends on it. Currently the only test coverage in the repo is the default
NestJS/Next.js boilerplate stubs — zero coverage on auth, cart, checkout, or
orders — and there is no CI, no error monitoring, and no real meal photography
(every meal card is a generated color gradient with a letter).

Status: Not started

Tasks:

- [ ] Automated tests for auth, cart, checkout, and orders — the actual business
  logic, not the framework scaffolding
- [ ] CI pipeline: run lint + tests on every push/PR, block merges on failure
- [ ] Error monitoring on both API and web (e.g. Sentry) — right now a production
  exception is invisible unless someone happens to be reading Railway logs
- [ ] Real meal photography (or at minimum AI-generated images) to replace the
  gradient placeholders
- [ ] Basic uptime check / alerting on the API

## Phase 6: QR Code System

Goal: Add QR-enabled ingredient package details.

Status: Not started

Tasks:

- [ ] Generate a QR code per order item
- [ ] QR opens `/qr/:code`
- [ ] `/qr/:code` page shows ingredient details and the relevant cooking step
- [ ] Scanned via the phone's browser camera — no native app required (see the
  cut Mobile App phase below for why)
- [ ] No package printing in v1

## Phase 7: Pilot-Store Readiness

Goal: Make it realistic for one real grocery store to actually onboard and run
on this for a trial period, not just survive a demo.

Status: Not started

Tasks:

- [ ] CSV import for ingredients and meals — a real store has a catalog of
  hundreds of SKUs; hand-entering them one at a time through the admin UI
  doesn't scale even for a pilot
- [ ] Order confirmation / status-change email notifications (customer gets
  emailed when their order moves to Preparing/Ready/etc.)
- [ ] Security review pass: rate limiting on auth endpoints, input validation
  audit, dependency vuln scan
- [ ] Decide the paid-infra question — Railway/Neon free tiers are fine for a
  pilot but reassess once there's real, unpredictable traffic

## Phase 8: AI Recommendation Assistant

Goal: Add intelligent meal suggestions, once the core product is solid and
actually running for real users — not before.

Status: Not started

Tasks:

- [ ] Suggest 3 meals based on user goal, diet type, and pantry ingredients
- [ ] Explain each recommendation in plain language

Guardrail: AI never controls prices, allergies, or core ordering logic — recommendation only.

## Phase 9: SaaS Business Layer

Goal: Turn CookCart from a single-store product into a multi-tenant business.

Status: Not started

Deliberately last: this is the largest single investment on the roadmap
(multi-tenancy, billing, platform admin), and it only pays off once a real
pilot store has validated that someone will actually pay for this. Building
it earlier is designing for a hypothetical instead of a validated need.

Tasks:

- [ ] Multi-store support
- [ ] Store subscription plans
- [ ] Store onboarding
- [ ] Stripe subscriptions
- [ ] Platform admin

## Cut: Mobile App

The original plan had a React Native/Expo app as Phase 6. Deferred indefinitely:
the web app is already responsive on mobile, QR scanning (Phase 6 above) works
fine through a phone's browser camera, and a native app is real ongoing
maintenance cost for a product with zero pilot customers yet. Revisit only if a
real user base specifically asks for an installable app — not before.
