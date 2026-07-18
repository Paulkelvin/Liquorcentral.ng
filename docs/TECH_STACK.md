# Tech Stack

**Status:** Backend confirmed (already vendored in this repository). Storefront and third-party integrations recommended in earlier research; formal sign-off tracked in `PROJECT_STATUS.md`.

## Backend

| Component | Choice | Status |
|---|---|---|
| Commerce platform | Medusa v2 (vendored as a git submodule at `./medusa`) | Confirmed, in repo |
| Language | TypeScript | Confirmed (Medusa's own stack) |
| Database | PostgreSQL | Confirmed (Medusa's requirement) |
| Cache / queues / workflow persistence | Redis | Confirmed for production use (Medusa supports an in-memory dev mode, not appropriate for production) |
| Package manager / monorepo tooling | Yarn workspaces + Turborepo | Confirmed (inherited from Medusa's own tooling conventions) |

See `ARCHITECTURE.md` for how Medusa itself is structured.

## Storefront

| Component | Recommendation | Status |
|---|---|---|
| Framework | Next.js Starter ("DTC Starter"), Medusa's official reference storefront | Recommended, not yet formally approved |
| Rationale | Maintained, works against Medusa's Store API out of the box, strong SSR/SEO for organic product discovery | — |

## Search

| Component | Recommendation | Status |
|---|---|---|
| Engine | Meilisearch | Recommended, not yet formally approved — see `MEDUSA_EXTENSIONS.md` #6 |
| Rationale | Open-source (cost/data control), officially documented Medusa integration, strong faceting for wine/food attributes | — |

## CMS

| Component | Recommendation | Status |
|---|---|---|
| System | Sanity | Recommended, not urgent — see `MEDUSA_EXTENSIONS.md` #7 |
| Rationale | Real-time collaborative editing, strong localization support, officially documented Medusa integration pattern | — |

## Payments

| Component | Recommendation | Status |
|---|---|---|
| Provider | Not yet decided — a Nigerian PSP (e.g. Paystack or Flutterwave class) | **Open — needs Paul's decision**, see `MEDUSA_EXTENSIONS.md` #4 |
| Rationale | Card-only checkout is insufficient for the Nigerian market; bank transfer/USSD support is required | — |

## Notifications

| Component | Recommendation | Status |
|---|---|---|
| Channel | Not yet decided — WhatsApp Business API and/or SMS | **Open — needs Paul's decision**, see `MEDUSA_EXTENSIONS.md` #5 |

## Authentication

| Component | Choice | Status |
|---|---|---|
| System | Medusa's native auth (customer + admin-user actor types) | Confirmed — this is not an interchangeable choice; it's required infrastructure the rest of Medusa depends on. No third-party identity provider (e.g. Clerk, Auth.js) is needed for v1. |

## What's explicitly not in the stack

- No multi-vendor/marketplace infrastructure of any kind.
- No third-party carrier/logistics API (company-owned riders — see `DELIVERY_MODEL.md`).
- No separate mobile app for v1 (see `ROADMAP.md`).

## Change process

Any change to this stack (adding, removing, or replacing a component) is a decision that must be logged in `DECISION_LOG.md` and reflected here in the same change.
