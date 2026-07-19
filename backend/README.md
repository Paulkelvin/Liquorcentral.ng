# LiquorCentral Backend

The Medusa v2 commerce backend for [LiquorCentral.ng](../README.md). A Yarn-workspaces + Turborepo monorepo, per `docs/TECH_STACK.md`.

This is **engineering output**, not planning documentation. The authoritative source of truth for what this backend must do is `/docs` — see in particular `docs/IMPLEMENTATION_READINESS_REPORT.md`, `docs/ARCHITECTURE.md`, `docs/API_DECISIONS.md`, `docs/MEDUSA_EXTENSIONS.md`, and `docs/implementation-planning/`. Nothing here should contradict those documents; if it ever does, the documentation wins and the code is the bug.

## What's here

```
backend/
├── package.json          Workspace root (Yarn workspaces + Turborepo)
├── turbo.json
└── apps/
    └── backend/           The Medusa v2 application (@dtc/backend)
        ├── medusa-config.ts
        ├── src/
        │   ├── admin/
        │   │   ├── lib/sdk.ts               Shared Admin JS SDK client
        │   │   └── widgets/wine-details-widget.tsx   Product-page widget (Milestone 2)
        │   ├── api/
        │   │   └── middlewares.ts           additionalDataValidator for wine-details fields — no custom route
        │   ├── modules/
        │   │   └── wine-details/            Milestone 2 — see its own README.md
        │   ├── workflows/
        │   │   └── wine-details/            Steps + workflows + hooks wiring wine-details into product create/update
        │   ├── links/
        │   │   └── product-wine-details.ts  1:1 Product <> WineDetails link
        │   ├── subscribers/ Event subscribers — empty, not built yet
        │   ├── jobs/        Scheduled jobs — empty, not built yet
        │   └── migration-scripts/
        │       └── initial-data-seed.ts   Store-level foundation seed (see below)
        ├── .env.template       Copy to .env and fill in for local development
        └── .env.test.template  Copy to .env.test — used by module/integration tests only
```

`food-details`, delivery-slot, the local payment provider, and the notification provider are not built yet — only `wine-details` (Milestone 2). See `docs/PROJECT_STATUS.md` for current milestone status.

## What's configured

- **Medusa v2.17.2** — pinned to match the version `docs/ARCHITECTURE.md` researched and the vendored `medusa/` submodule is pinned to.
- **PostgreSQL** — required, no SQLite fallback (this project is never launched on dev defaults, per `docs/ROADMAP.md` Phase 1).
- **Redis, production-mode from day one** — `medusa-config.ts` explicitly wires the event bus, workflow engine, locking, and cache modules to Redis (`@medusajs/medusa/event-bus-redis`, `@medusajs/medusa/workflow-engine-redis`, `@medusajs/medusa/locking` with the `locking-redis` provider, and `@medusajs/medusa/cache-redis`). Medusa's in-memory/fake defaults are never used, per `docs/ROADMAP.md` Phase 1's explicit instruction. Note: `cache-redis` is marked deprecated upstream in favor of a new Caching Module, but that replacement is still behind an experimental feature flag (`MEDUSA_FF_CACHING`) as of v2.17.2 — using the still-supported deprecated module rather than adopting an experimental flag for infrastructure bootstrap. Revisit when the replacement graduates from feature-flagged status.
- **Store-level foundation** (`src/migration-scripts/initial-data-seed.ts`, runs automatically as part of `medusa db:migrate`):
  - One store, "LiquorCentral", NGN as the sole supported/default currency.
  - One sales channel, "LiquorCentral Storefront" (both product lines sell through it — no order-splitting, per `PRODUCT_BLUEPRINT.md` §9).
  - One region, "Nigeria" (country `ng`, currency `ngn`), using Medusa's built-in `pp_system_default` payment provider as a placeholder. This is **not** the local Nigerian payment provider `MEDUSA_EXTENSIONS.md` #4 describes — that is separate, later work gated on Paul's provider decision (see `docs/implementation-planning/TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md`).
  - One tax region, Nigeria, using Medusa's native system tax provider — deliberately **no tax rate set**. The exact VAT/tax treatment is an open business/legal decision (`docs/PROJECT_STATUS.md`), not something to invent here.
  - Deliberately **no** stock locations, fulfillment sets, shipping options, or demo products — those depend on `DELIVERY_MODEL.md` and the wine-details/food-details modules and belong to later milestones, not backend foundation.
- **`wine-details` module (Milestone 2)** — structured Wine & Spirits attribute data, linked 1:1 to Product. See `src/modules/wine-details/README.md` for what it is, what it deliberately isn't, and its known open items (the field list is provisional, not Paul-approved). No new API route: reads happen via Medusa's Query system (`fields=+wine_details.*`), writes happen via `POST /admin/products`/`POST /admin/products/:id`'s native `additional_data` extension, both validated end-to-end against a real running server (create, update, clear-to-delete, and re-create all confirmed working, including that a product with no wine-details values never gets an empty record).

## Local development

Prerequisites: Node.js 20+, Yarn 1.x (`packageManager` pins `yarn@1.22.22`), a running PostgreSQL 16 server, a running Redis server.

```bash
# from backend/
yarn install

# from backend/apps/backend/
cp .env.template .env
# fill in DATABASE_URL, JWT_SECRET, COOKIE_SECRET (generate real random
# values — e.g. `openssl rand -hex 32` — never reuse the template's blanks),
# and the five REDIS_URL-family variables

npx medusa db:migrate   # creates schema, links, and the store-level seed above
npx medusa user -e <you>@liquorcentral.ng -p <a-real-password>   # first admin user

npx medusa develop      # dev server, http://localhost:9000 (admin UI at /app)
# or, for a production build:
npx medusa build && npx medusa start
```

`GET /health` returns `200` once the server is up. Admin login is `POST /auth/user/emailpass` with the email/password from the `medusa user` step above.

### Running tests

```bash
cp .env.test.template .env.test   # fill in DB_USERNAME/DB_PASSWORD — used only
                                   # to create/drop temporary test databases,
                                   # separate from .env's persistent dev DB
yarn test:unit                    # pure logic, no DB (src/**/__tests__/*.unit.spec.ts)
yarn test:integration:modules     # real, isolated test DB per module (src/modules/*/__tests__)
```

## What's deliberately not here yet

Per `docs/IMPLEMENTATION_READINESS_REPORT.md`'s readiness classification — these are separate, later milestones, not omissions:

- The storefront (Next.js) — a later milestone.
- `food-details`, delivery-slot, the local payment provider, the notification provider — each has an Approved Tier B architecture document in `docs/implementation-planning/`, but none has been implemented in code yet (only `wine-details` has, Milestone 2).
- Any custom API route (still true after Milestone 2 — `wine-details` needed none; see its own README).
- Stock locations, fulfillment configuration, and shipping options for Wine & Spirits (nationwide) and Food Central (Lagos-only) — depends on `DELIVERY_MODEL.md` and the delivery-slot module.
- A real payment provider connection — blocked on Paul's provider decision, the project's sole confirmed launch-blocking open item.
- Any real product catalog data — Wine & Spirits and Food Central listings are populated once merchandising/catalog work begins; Milestone 2 only validated the mechanism with disposable test products, all deleted afterward.
