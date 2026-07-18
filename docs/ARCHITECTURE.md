# Architecture

**Status:** Approved (reference document)
**Version:** 1.0
**Owner:** Engineering
**Last Updated:** 2026-07-18

Based on direct research of the vendored Medusa codebase (v2.17.2). Update this file if the Medusa version changes materially or if architectural conventions used elsewhere in `/docs` change.

## What LiquorCentral is built on

LiquorCentral's backend is **Medusa v2**, vendored into this repository as a git submodule at `./medusa`. Medusa is a modular, headless commerce framework — not a monolith and not a low-code platform. It ships:

- A commerce backend (`packages/medusa`) exposing REST APIs under `/admin/*` and `/store/*`.
- ~30 isolated commerce modules (product, cart, order, payment, fulfillment, promotion, tax, inventory, pricing, customer, auth, and more), each owning its own database tables.
- A workflow engine that expresses business processes (place an order, capture a payment) as resumable, compensable step sequences rather than plain service calls.
- A React admin dashboard, extensible via widgets and routes.
- **No storefront.** The customer-facing website is a separate application LiquorCentral builds and owns (see `TECH_STACK.md`).

## The one rule that matters: module isolation

Medusa's commerce modules never import each other directly, and there are no foreign keys in the database connecting one module's tables to another's. Instead, cross-module relationships are expressed as **module links** — dedicated pivot tables declared with Medusa's `defineLink` helper — and read back out with a cross-module **Query** engine that joins data at request time.

This is the mechanism that makes safe customization possible:

- **New data (e.g. wine attributes, food attributes) is added as a new, small module**, linked to the existing Product module — never by editing Product's own tables.
- **New behavior is added via workflow hooks** (e.g. `createProductsWorkflow.hooks.productsCreated`) — never by editing a core workflow file.
- **New pages/data are added to the admin dashboard via widgets and routes** — never by editing the dashboard's own source.

## The rule for this project specifically

> **Medusa core (`medusa/`) is never modified.** It is a git submodule pinned to an upstream commit; any local edit inside it becomes an invisible diff that breaks on the next update and isn't tracked by this repository's own history in any meaningful way. Every customization LiquorCentral needs is implemented through the extension points above, living in LiquorCentral's own application code, not inside the submodule.

See `MEDUSA_EXTENSIONS.md` for the specific extensions this project has identified as necessary, and why each one is safe under this rule.

## The workflow engine, briefly

Every real business operation in Medusa (placing an order, capturing a payment, importing products) is written as a **workflow**: a sequence of steps, each with an optional compensation (rollback) function, executed by a saga-style orchestrator. If a step fails partway through, already-completed steps are unwound in reverse order automatically. This matters for LiquorCentral because:

- **Checkout** (`completeCartWorkflow`) already handles a cart with mixed line items (e.g. a wine and a dish) as a single transaction — no custom order-splitting logic is needed, consistent with the no-marketplace decision in `PRODUCT_BLUEPRINT.md` §9.
- Any new checkout-time rule (e.g. an age-verification backstop, a delivery-slot capacity check) is added as a **hook** into this workflow, not by rewriting it.

## Data model, at a glance

Relevant native modules for this project (all untouched, used as-is):

| Module | Role for LiquorCentral |
|---|---|
| Product | Wine, spirit, and dish listings; categories, collections, images |
| Pricing | Prices, currency, quantity-based pricing |
| Inventory | Stock tracking for Wine & Spirits (off for made-to-order Food Central items) |
| Cart / Order | One cart, one order, per customer session — holds mixed line items |
| Customer | One customer identity across both product lines |
| Payment | Payment sessions, captures, refunds — extended with a local payment provider (see `MEDUSA_EXTENSIONS.md`) |
| Fulfillment | Stock locations (warehouse + kitchen), service zones/geo zones (nationwide vs. Lagos-only), shipping options, pickup |
| Promotion | Discounts, if/when needed |
| Tax | Nigerian tax rules |
| Auth | Customer and admin-user identity, guest checkout |

New modules this project adds (see `MEDUSA_EXTENSIONS.md` for full detail): a wine-attributes module, a food-attributes module, and a delivery-slot scheduling module. All are linked to existing modules via module links — none require core changes.

## Where to look for more

- **`MEDUSA_EXTENSIONS.md`** — the specific custom modules/routes this project needs, with rationale and risk for each.
- **`API_DECISIONS.md`** — which parts of the API are used as-is vs. extended.
- **`TECH_STACK.md`** — the full technology stack, including the storefront, search, and third-party integrations.
- **`PRODUCT_CATALOG.md`** — how the Product module is configured for two distinct catalog behaviors.
- **`DELIVERY_MODEL.md`** — how the Fulfillment module is configured for nationwide vs. Lagos-only delivery.
