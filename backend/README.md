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
        │   │   ├── widgets/wine-details-widget.tsx   Product-page widget (Milestone 2)
        │   │   └── widgets/food-details-widget.tsx   Product-page widget (Milestone 3)
        │   ├── api/
        │   │   └── middlewares.ts           additionalDataValidator — wine-details' and food-details' fields combined into one schema per route; no custom route
        │   ├── modules/
        │   │   ├── wine-details/            Milestone 2 — see its own README.md
        │   │   ├── food-details/            Milestone 3 — see its own README.md
        │   │   └── delivery-slot/           Milestone 4 — see its own README.md
        │   ├── workflows/
        │   │   ├── wine-details/            Steps + workflow for wine-details
        │   │   ├── food-details/            Steps + workflow for food-details
        │   │   ├── delivery-slot/           Atomic capacity lib + step for delivery-slot
        │   │   └── hooks/                   The ONE shared productsCreated/productsUpdated
        │   │                                handler wine-details/food-details run from (Medusa
        │   │                                allows only one handler per native hook, see below);
        │   │                                also complete-cart-validate.ts (delivery-slot capacity)
        │   ├── links/
        │   │   ├── product-wine-details.ts             1:1 Product <> WineDetails link
        │   │   ├── product-food-details.ts              1:1 Product <> FoodDetails link
        │   │   └── delivery-slot-shipping-option.ts     Many DeliverySlot <> one ShippingOption
        │   ├── subscribers/ Event subscribers — empty, not built yet
        │   ├── jobs/        Scheduled jobs — empty, not built yet
        │   └── migration-scripts/
        │       └── initial-data-seed.ts   Store-level foundation seed (see below)
        ├── .env.template       Copy to .env and fill in for local development
        └── .env.test.template  Copy to .env.test — used by module/integration tests only
```

The local payment provider and the notification provider are not built yet — `wine-details` (Milestone 2), `food-details` (Milestone 3), and `delivery-slot` (Milestone 4) are. See `docs/PROJECT_STATUS.md` for current milestone status.

**Genuine Medusa constraint discovered building Milestone 3, worth knowing before adding a third attribute module**: only one handler may be registered per native workflow hook (`createProductsWorkflow.hooks.productsCreated`, `updateProductsWorkflow.hooks.productsUpdated`) — registering a second throws "Cannot define multiple hook handlers for the X hook." `src/workflows/hooks/product-created.ts` and `product-updated.ts` are the single shared integration point every attribute module's own workflow is called from; a module's own directory never registers a hook itself.

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
- **`food-details` module (Milestone 3)** — structured Food Central attribute data, linked 1:1 to Product. See `src/modules/food-details/README.md` for what it is, how it genuinely differs from `wine-details` (no product-vs-variant question; a `safety_data_verified` field making allergen/dietary-flag verification state visible, per `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §7; a `portion_size` field carried forward from a frozen-spec gap `TIER_B` explicitly flags), and its known open items. Same no-new-route pattern as `wine-details`; validated end to end including the specific case of one product carrying both wine-details and food-details data in a single request, to confirm the shared hook handler (above) correctly runs both modules' workflows.
- **`delivery-slot` module (Milestone 4)** — a bookable, capacity-limited Food Central delivery/pickup time-window, linked to Fulfillment's Shipping Option (many slots to one option, not 1:1 like the attribute modules). See `src/modules/delivery-slot/README.md` for the full architecture summary, the deliberately-absent pickup/delivery discriminator field, and a residual compensation-gap limitation named honestly. **Capacity is enforced atomically** via Medusa's own Locking Module (`locking-redis`) wrapped around a check-and-increment, wired into `completeCartWorkflow`'s native `validate` hook with a genuine compensate function — validated with real, Redis-backed concurrency tests (not mocked), not just static analysis.

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

`delivery-slot`'s concurrency tests (`src/modules/delivery-slot/__tests__/capacity-concurrency.spec.ts`) boot the real `locking`/`locking-redis` module against this environment's actual Redis via `initModules`, in addition to its own isolated test database — the only test in the suite that talks to Redis directly, since it exists specifically to validate atomic capacity enforcement under real concurrency, not mocked locking.

## What's deliberately not here yet

Per `docs/IMPLEMENTATION_READINESS_REPORT.md`'s readiness classification — these are separate, later milestones, not omissions:

- The storefront (Next.js) — a later milestone.
- The local payment provider — has an Approved Tier B architecture document in `docs/implementation-planning/`, not yet implemented in code (Milestone 5, next).
- The notification provider — its Tier B document is still **Draft**, not Approved; not implemented until that document is finalized (`wine-details`, `food-details`, and `delivery-slot` have all been implemented, Milestones 2–4).
- Any custom API route (still true after Milestone 4 — none of the three modules built so far needed one; see each module's own README).
- Stock locations, fulfillment configuration, and shipping options for Wine & Spirits (nationwide) and Food Central (Lagos-only) — depends on `DELIVERY_MODEL.md`; `delivery-slot`'s own link target (Shipping Option) presumes these exist, but none has been seeded yet.
- Any admin-facing UI or API route for creating/managing delivery slots — Milestone 4 built the data model, link, and capacity-enforcement mechanism only; per `IMPLEMENTATION_PLANNING.md`'s Tier B → Tier C sequencing, API contract planning for this surface comes later.
- A real payment provider connection — blocked on Paul's provider decision, the project's sole confirmed launch-blocking open item.
- Any real product catalog data — Wine & Spirits and Food Central listings are populated once merchandising/catalog work begins; Milestones 2–4 only validated their respective mechanisms with disposable test data, all deleted afterward.
- Food Central's live availability-state mechanism, kitchen operating hours, and capacity logic — explicitly, repeatedly out of `food-details`' and `delivery-slot`'s scope; a separate, not-yet-built mechanism.
