# Contributing to CookCart

## Branches

- `main` — production. Auto-deploys to Railway (API) and Vercel (web) on every push.
- `develop` — integration branch. All work lands here first.
- Everything else is a short-lived, single-purpose branch off `develop`:
  `feature/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`.

Never commit directly to `develop` or `main`.

## Workflow

1. Branch off `develop`.
2. Make the change. Keep it focused — one branch, one concern.
3. Run the checks locally before pushing:
   ```bash
   cd apps/api && pnpm lint && pnpm test && pnpm test:e2e
   cd apps/web && pnpm lint && pnpm build
   ```
4. Push the branch and open a PR into `develop`. Use the PR template — it's applied automatically.
5. Wait for CI (`.github/workflows/ci.yml`) to go green on the PR.
6. Merge the PR (this repo merges its own PRs — there's no second reviewer on a solo project, but the PR + green CI is still the gate before anything lands).
7. Once `develop` is in a good state, open a PR from `develop` into `main` to ship it. Same rule: CI must be green before merging.
8. Merging into `main` triggers the real deploy. Confirm the Railway and Vercel deployments actually come up healthy — a merged PR isn't "done" until production is verified.

## Commits

Conventional-ish prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), explaining *why* a change was made, not just what changed line by line.

## Tests

- `apps/api/test/*.e2e-spec.ts` — end-to-end tests that hit a real running server over HTTP (see the comment in `apps/api/test/utils/test-app.ts` for why — some `@nestjs/*` dependencies are ESM-only and can't be loaded in-process inside Jest).
- Any change to auth, cart, checkout, orders, or role access should come with a test that would have caught the bug if the fix weren't there.

## Database

- Local dev runs against your own local Postgres (`pnpm db:up`, then `apps/api/.env` pointing at `localhost:5432`). Never point local dev at the production Neon database.
- Migrations: `pnpm exec prisma migrate dev` locally to create one, `prisma migrate deploy` is what CI/production run.

## Roadmap

`docs/roadmap.md` is the source of truth for what's done and what's next. Phases 5-9 are tracked as GitHub issues on the linked Project board — keep both in sync when a phase's status changes.
