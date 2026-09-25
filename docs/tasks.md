# CookCart Tasks

## Day 1

- [x] Create project folder
- [x] Initialize Git
- [x] Create README
- [x] Create docs folder
- [x] Create product document
- [x] Create roadmap document
- [x] Create database document
- [x] Create API document
- [x] Create docker-compose.yml
- [x] Create first Git commit

## Day 2

- [x] Set up NestJS API
- [x] Set up PostgreSQL with Docker
- [x] Set up Prisma
- [x] Connect API to database

## Day 3

- [x] Create Prisma schema
- [x] Create migrations
- [x] Seed ingredients
- [x] Seed meals

## Day 4

- [x] Build authentication

## Day 5

- [x] Build ingredients and meals APIs

## Day 6

- [x] Build pantry APIs

## Day 7

- [x] Build meal kit preview endpoint

The 7-day backend sprint above is complete. The tasks below continue
from it; see `docs/roadmap.md` for the full phase-level plan beyond
Week 3 (QR, mobile, AI, SaaS layer).

## Day 8

- [x] Build cart APIs (`GET /cart`, `POST /cart/meals`, `PATCH /cart/ingredients/:id`, `DELETE /cart/meals/:id`)
- [x] Adding a meal snapshots the preview-kit result into `CartMeal`/`CartIngredient`

## Day 9

- [x] Build `POST /cart/checkout` (cart -> Order + OrderItems)
- [x] Build customer order APIs (`GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel`)
- [x] Build admin order APIs (`GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`)

Backend is now complete enough for the full customer + admin flow —
still API-only, no UI.

## Day 10

- [x] Scaffold `apps/web` (Next.js + TypeScript + Tailwind) with a typed API client and JWT storage
- [x] Landing page
- [x] Login and register pages

## Day 11

- [ ] Meals list page
- [ ] Meal details page (live preview-kit, remove-ingredient checkboxes, add to cart)

## Day 12

- [ ] Pantry page
- [ ] Cart page (toggle removed ingredients, checkout)
- [ ] Orders page

## Day 13

- [ ] Admin shell (`/admin`, role-gated)
- [ ] Admin ingredients page
- [ ] Admin meals page (create/edit, assign ingredients)

## Day 14

- [ ] Admin orders page (list, update status)
- [ ] Record the first full product demo end to end in the real UI (roadmap Step 9)
