# Tier B Module Inventory

**Status:** Approved (living, always current)
**Version:** 2.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-19

This is the single-page index of every module, integration, and backend capability identified anywhere in `/docs` — native Medusa modules, custom modules, third-party integrations, and not-yet-scoped operational needs. It exists to answer, at a glance, the questions that matter most as Tier B accumulates documents and development eventually begins: which modules exist, which are native vs. custom vs. an extension/integration, which depend on others, which are optional, and which are launch-critical.

**This document is a living index, not a Tier B document itself.** It does not define any module's architecture — each custom module's own Tier B document (once drafted) is the authoritative source for its responsibilities and boundaries; this page only tracks status and relationships across all of them, the same role `PROJECT_STATUS.md` plays for the documentation set as a whole. Update this table in the same change that creates, drafts, or approves any module-level document, per `DOCUMENTATION_GOVERNANCE.md` §5's rule that tracking documents change freely as part of normal work.

---

## How to read this table

- **Type** — `Native` (a Medusa module used as-is or configured, no custom code), `Custom Module` (new, linked to Product/Cart/etc. via `defineLink`), `Provider Module` (implements a Medusa provider interface — payment, notification), `Integration` (a third-party service wired in, not a Medusa module itself), or `Operational` (a process or configuration surface, not software).
- **Status** — `Native` (already exists, nothing to build), `Architecture Approved` (a Tier B document like this one exists and is approved — data/API design still ahead), `Implemented` (code exists and is validated — engineering has actually built it, per its own Tier B architecture), `Scoped` (named in `MEDUSA_EXTENSIONS.md` with a rationale, no Tier B document yet), `Not Yet Scoped` (named as a need by one or more specifications, no `MEDUSA_EXTENSIONS.md` entry and no Tier B document).
- **Launch-Critical?** — `Yes` (the platform cannot credibly ship Wine & Spirits' or Food Central's core purchase path without it), `Operationally important` (needed for a trustworthy, sustainable operation but not a hard blocker to a first transaction), `Optional` (a genuine enhancement, deferrable past v1 without breaking anything else).

---

## Native Medusa modules (no custom work)

| Module | Type | Role | Depends On | Launch-Critical? |
|---|---|---|---|---|
| Product | Native | Wine, spirit, and dish listings; categories, collections, images | — | Yes |
| Pricing | Native | Prices, currency, quantity-based pricing | Product | Yes |
| Inventory | Native | Stock tracking for Wine & Spirits (off for Food Central) | Product | Yes |
| Cart / Order | Native | One cart, one order per session; holds mixed line items | Product, Pricing | Yes |
| Customer | Native | One customer identity across both product lines | — | Yes |
| Payment | Native | Payment sessions, captures, refunds (extended — see Local Payment Provider below) | Order | Yes |
| Fulfillment | Native | Stock locations, service/geo zones, shipping options, pickup | Product, Order | Yes |
| Promotion | Native | Discounts, if/when needed | Pricing | Optional (no cart-level discount system established by any specification, per `06_CART_SPECIFICATION.md` §9) |
| Tax | Native | Nigerian tax rules | Order | Yes |
| Auth | Native | Customer and admin-user identity, guest checkout | Customer | Yes |

Source: `ARCHITECTURE.md`'s Data Model table, cross-checked against all 11 frozen specifications' Backend Requirements sections — no specification requires a native module beyond this list.

## Custom modules (new, linked to native modules)

| Module | Type | Status | Depends On | Launch-Critical? | Depended On By |
|---|---|---|---|---|---|
| `wine-details` (wine attributes) | Custom Module | **Implemented** (Engineering Milestone 2, 2026-07-19 — `backend/apps/backend/src/modules/wine-details`); architecture per `TIER_B_WINE_ATTRIBUTES_MODULE.md` v1.0; field list used is provisional, Paul's final field-list approval still open | Product | Yes | `01`,`03`,`04`,`05`,`11` |
| `food-details` (food attributes) | Custom Module | **Implemented** (Engineering Milestone 3, 2026-07-19 — `backend/apps/backend/src/modules/food-details`); architecture per `TIER_B_FOOD_ATTRIBUTES_MODULE.md` v1.0; field list used is provisional, Paul's final field-list approval and allergen-accuracy ownership still open | Product | Yes | `01`,`02`,`03`,`04`,`05`,`09`,`11` |
| Delivery-slot scheduling | Custom Module + workflow hook | **Implemented** (Engineering Milestone 4, 2026-07-19 — `backend/apps/backend/src/modules/delivery-slot`, linked to Fulfillment's Shipping Option, capacity enforced via `completeCartWorkflow`'s `validate` hook reusing Medusa's Locking Module); architecture per `TIER_B_DELIVERY_SLOT_MODULE.md` v1.0; operational parameters (slot length, cutoff timing, capacity-per-slot) still open | Fulfillment, Cart/Order | Yes (for Food Central same-day/scheduled delivery specifically) | `01`,`02`,`07`,`09`,`10`,`11` |
| **Product Relationship Module** ("pairs with") | Custom Module | **Architecture Approved** (`TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` v1.0) | Product | Operationally important — high architectural priority, not a hard blocker to a first transaction | `01`,`02`,`03`,`04`,`05`,`06`,`09` |
| Saved-for-Later | Custom Module | Not Yet Scoped — new recommendation, not yet in `MEDUSA_EXTENSIONS.md` | Cart | Optional | `06` |

## Provider modules (implement a Medusa provider interface)

| Module | Type | Status | Depends On | Launch-Critical? | Depended On By |
|---|---|---|---|---|---|
| Local payment provider | Provider Module | **Architecture Approved** (`TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` v1.0); provider choice + COD policy open | Payment | **Yes — the project's sole launch-blocking open decision** | `07` |
| Notification provider (customer-facing) | Provider Module | **Draft** (`TIER_B_NOTIFICATION_PROVIDER_MODULE.md` v1.0 — awaiting Paul's review before refinement/freeze); channel choice open | Order, Fulfillment | Operationally important — not confirmed launch-blocking by any document | `07`,`08`,`09`,`10` |

## Integrations (third-party services, not Medusa modules)

| Integration | Type | Status | Depends On | Launch-Critical? | Depended On By |
|---|---|---|---|---|---|
| Meilisearch | Integration | Scoped (`MEDUSA_EXTENSIONS.md` #6); formal sign-off pending | `wine-details`/`food-details` field lists | Operationally important — sequenced `ROADMAP.md` Phase 6, not a launch blocker for Wine & Spirits' Phase 1 core path | `01`,`03`,`04` |
| Sanity CMS | Integration | Scoped (`MEDUSA_EXTENSIONS.md` #7); explicitly low urgency | — | Optional | Editorial content generally; noted but not required by the Product Relationship Module (§16) |

## Not yet scoped anywhere (no `MEDUSA_EXTENSIONS.md` entry, no Tier B document)

Identified by `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §6–§13; none is resolved by this inventory, which only tracks them.

| Item | Type | Depends On | Launch-Critical? | Named By |
|---|---|---|---|---|
| Staff-facing internal notifications | Operational / future module | — | Optional for a first launch, operationally important soon after | `11` |
| Audit logging | Operational / future module | — | Operationally important | `11` |
| Reports & analytics aggregation | Operational / future module | — | Optional | `11` |
| Staff role/permission granularity | Configuration decision | Auth (native, single-role today) | Open question, not yet a build item | `11` |
| Proof of delivery | Operational mechanism | Fulfillment, Order | Operationally important | `10` |
| Kitchen operating-hours configuration | Operational configuration | — | Yes, for Food Central specifically | `09` |
| Product Relationship Module — staff curation workflow | Operational workflow, `11`-adjacent | Product Relationship Module | Operationally important (the module is architecturally complete but not yet administrable) | `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §7/§15/§20 |
| Product Relationship Module — `MEDUSA_EXTENSIONS.md` registration | Documentation/bookkeeping, not a build item | Product Relationship Module | N/A — a tracking correction, not a feature | `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §20 |
| Gift Wrap line item | Recommended, native mechanism (a priced line item, no new module) | Cart, Order | Optional | `05`,`06` |
| Order-status vocabulary (both catalogs) | Configuration decision | Order (native field) | Operationally important | `09`,`10`,`11` |
| Data-retention / NDPR policy | Legal/business decision | Customer (native mechanism sufficient) | Operationally important, legally-driven timeline | `08` |
| Account deletion-vs-deactivation policy | Business decision | Customer (native mechanism sufficient) | Operationally important | `08` |
| Doorstep age re-verification | Business decision | Order/Fulfillment | Operationally important, compliance-adjacent | `10` |
| Wine attribute data accuracy/verification ownership | Operational responsibility, not yet assigned | `wine-details` module | Operationally important (trust/accuracy, not safety-critical the way food allergen data is) | `TIER_B_WINE_ATTRIBUTES_MODULE.md` §16/§19 |
| Wine attribute product-vs-variant granularity | Data-modeling question, not yet decided | `wine-details` module, field-list decision | Operationally important — affects how bottle size and similar facts are eventually modeled | `TIER_B_WINE_ATTRIBUTES_MODULE.md` §6/§18/§19 |
| Food attribute data accuracy/verification ownership (allergen safety) | Operational responsibility, not yet assigned | `food-details` module | **Higher severity than any other not-yet-scoped item in this table** — a customer-safety matter, not only a trust/accuracy one, per `09_FOOD_ORDERING_SPECIFICATION.md` §2 | `MEDUSA_EXTENSIONS.md` #2, restated in `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §8/§18/§20 |
| Food attribute field-list gap: portion/serving-size | Data-modeling gap, not yet decided | `food-details` module, field-list decision | Operationally important — `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 requires it; `PRODUCT_CATALOG.md`'s proposed field list does not currently name it | `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §6/§20/§21 |
| Pickup-slot mechanism boundary (whether pickup should ever be booked through the delivery-slot module's capacity-limited mechanism, or remain a simpler ready-time estimate) | Architectural clarification, not yet decided | Delivery-slot scheduling module | Operationally important — affects whether pickup gets its own capacity model later | `TIER_B_DELIVERY_SLOT_MODULE.md` §5/§19 |
| Kitchen-capacity vs. rider/delivery-capacity reconciliation (how two distinct operational constraints combine into the single capacity figure the delivery-slot module tracks) | Operational judgment, not yet decided | Delivery-slot scheduling module | Operationally important — affects how staff set slot capacity day to day | `TIER_B_DELIVERY_SLOT_MODULE.md` §6/§18 |
| `11_ADMIN_WORKFLOWS_SPECIFICATION.md`'s refund workflow (§11) does not name the local payment provider module as its underlying mechanism | Documentation completeness gap, not yet reflected | Local payment provider module | Operationally important — worth closing before Tier C's Admin Workflow API planning | `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` §1/§15/§21 |

---

## Answering the standing questions

- **Which modules exist?** Ten native Medusa modules (table above), fully available today with zero custom work.
- **Which are Medusa-native?** Product, Pricing, Inventory, Cart/Order, Customer, Payment, Fulfillment, Promotion, Tax, Auth.
- **Which are custom?** `wine-details`, the Product Relationship Module, `food-details`, and delivery-slot scheduling (all four architecture approved; `wine-details`, `food-details`, and delivery-slot scheduling are also **implemented in code**, Engineering Milestones 2, 3, and 4); and Saved-for-Later (not yet scoped).
- **Which are extensions/integrations?** The local payment provider and notification provider (Medusa provider-interface modules), plus Meilisearch and Sanity (external service integrations).
- **Which depend on others?** Every custom module and integration is native-dependent (see "Depends On" columns) — none is a freestanding system; the Product Relationship Module depends only on Product, the simplest dependency footprint of any custom module identified so far.
- **Which are optional?** Promotion (unused today), Sanity, Saved-for-Later, Gift Wrap, reports/analytics aggregation.
- **Which are launch-critical?** All ten native modules; `wine-details`, `food-details`, and the delivery-slot module; the local payment provider (the project's sole confirmed launch blocker); and kitchen operating-hours configuration (specifically for Food Central).

## Maintenance

Update this document in the same change that:
- Creates a new Tier B module document (add a row, set Status to `Architecture Approved` once that document is approved).
- Resolves an open dependency or business decision affecting any row above.
- Discovers a new not-yet-scoped item during any future Tier A/B/C/D review.

This document does not require a separate approval round for routine updates — it is a tracking document under `DOCUMENTATION_GOVERNANCE.md` §5's "may be edited freely as part of normal work" rule, the same standard `PROJECT_STATUS.md` and `MEDUSA_EXTENSIONS.md`'s own summary table already follow.
