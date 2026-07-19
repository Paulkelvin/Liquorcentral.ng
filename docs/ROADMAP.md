# Roadmap

**Status:** Draft (sequencing proposal; not yet approved as a committed schedule — no dates are attached, this defines order and dependency, not timing)
**Version:** 4.2
**Owner:** Program
**Last Updated:** 2026-07-19

> **Naming note:** this document uses "Phase 1" for the **backend foundation** track (Medusa/Postgres/payment/Wine & Spirits end-to-end — see below). Paul's Product Specification work is tracked separately below as **"Phase 0d — Product Specifications"**, since it is a documentation/behavior-definition track that runs on the frontend-track side, parallel to (not sequenced after) backend Phase 1. This avoids two unrelated efforts sharing the same phase number. For the same reason, the implementation-planning work Paul calls **"Phase 2"** in `IMPLEMENTATION_PLANNING.md` is tracked below as **"Phase 0f — Implementation Planning"** — it is the documentation/frontend-track's next step after Phase 0d/0e, distinct from this document's own numbered "Phase 2 — Product data foundation" further down. Both names are correct in their own context; this note exists so the two are never confused.

Based on the confirmed no-marketplace, single-company model.

## Sequencing logic

Prove ordinary commerce first, then layer in scheduling sophistication, then discovery/content polish, then mobile, then operational hardening. Each phase is a prerequisite for the one after it.

> This roadmap supersedes the marketplace-oriented rollout considered in earlier research (which included vendor onboarding and payout phases). Those phases are removed entirely — see `PRODUCT_BLUEPRINT.md` supersession notice.

## Phase 0 — Brand & design foundation ✅ Complete

- `BRAND_IDENTITY.md` v1 — vision, personality, voice, color-usage hierarchy, and visual/typography/photography principles for the four already-approved brand colors. **Approved in full by Paul, 2026-07-18.**
- `EXPERIENCE_PRINCIPLES.md` v1.0 — 15 principles defining how customers should experience every screen and interaction, plus a product vision and competitive positioning. **Approved in full by Paul, 2026-07-18.**

### Phase 0b — Design System Foundations ✅ Complete (frozen as v2.0)

`DESIGN_SYSTEM.md` has been elevated from principles-only to concrete, agreed foundations — **foundational rules, not page layouts**, deliberately not jumping straight to designing buttons, cards, or screens. Covers:

- **Typography scale** — the specific size/weight/line-height steps implementing `BRAND_IDENTITY.md` §14's direction.
- **Spacing scale** — the specific numeric steps implementing `BRAND_IDENTITY.md` §20's white-space philosophy.
- **Grid system** — concrete column/gutter rules for the mobile-first responsive grid already established in principle.
- **Elevation/shadows** — how depth and layering are expressed (modals, cards, dropdowns).
- **Border radius** — a consistent corner-rounding scale, one part of visual consistency.
- **Color Architecture** — an explicit three-tier system (Brand Colors / Functional UI Colors / Semantic Design Tokens), refined per Paul's direct feedback, mapped onto the four approved brand colors and their approved hierarchy/contrast rules from `BRAND_IDENTITY.md` §13 — not raw hex values used ad hoc.
- **Motion timing** — concrete durations/easings implementing `BRAND_IDENTITY.md` §17's "calm, confident gesture" principle.
- **Breakpoints** — the specific screen-width steps the mobile-first grid responds to.
- **Icon sizing** — a consistent size scale implementing `BRAND_IDENTITY.md` §18's clarity-first iconography principle.
- **Form behaviors** — validation states, error messaging patterns, focus/input states — directly serving `EXPERIENCE_PRINCIPLES.md` principles 1, 11, and 12 (Confidence Before Complexity, Consistency Creates Confidence, Reduce Cognitive Load).
- **Accessibility tokens** — minimum contrast ratios (already computed for the brand colors), minimum touch-target size, focus-ring specification — the concrete, testable expression of `BRAND_IDENTITY.md` §22 and `EXPERIENCE_PRINCIPLES.md` principle 13.

Every item above is a foundational rule every future component and screen will draw from — not a page design. Building actual UI after these are agreed should require far fewer ad hoc decisions, since every component follows the same language.

**Status:** Complete and approved in full by Paul, 2026-07-18, across three rounds of review. §B6 (Color Architecture) is a three-tier system (Brand Colors, Functional UI Colors, Semantic Design Tokens) with Gold's role locked to premium/curation use only, Danger kept visually distinct from primary Red, and all four Tier 2 Functional Colors (Success, Warning, Danger, Information) confirmed. The final round added semantic-intent token naming as the system's canonical language, an Interactive States mechanism, a Surface Elevated token, a Future Theme Support section, a Component Philosophy section, and a concluding Design Quality Checklist. `DESIGN_SYSTEM.md` is now frozen as **Version 2.0 — the authoritative foundation for all future UI and component work.** No open items remain.

- This phase can run in parallel with Phase 1's backend work below; it blocked visual/frontend work specifically, not backend/architecture work — that block is now lifted.

### Phase 0c — Component specification — Not yet started

The next frontend-track step: specifying actual components (buttons, cards, forms, navigation) against `DESIGN_SYSTEM.md` v2.0, each checked against its Design Quality Checklist and referencing only Tier 3 semantic tokens. Has not begun; awaits Paul's direction to start. Can run in parallel with Phase 1's backend work.

### Phase 0d — Product Specifications — ✅ Complete

With `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0 declared complete and frozen by Paul, this phase translates those decisions into **behavior-level specifications** for each product surface — what it must do, for whom, backed by what data — under a new `/docs/specifications/` directory. Deliberately not visual/UI design; that remains Phase 0c's job once it starts.

- `01_NAVIGATION_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18. The authoritative reference for all navigation implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `02_HOMEPAGE_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a consistency review against `01` and `03` (both frozen). No content changes were required. The authoritative reference for homepage implementation.
- `03_SEARCH_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Search Intent, Query Understanding, Ranking Philosophy, Operational Considerations, and a Search Quality Checklist. The authoritative reference for all search/discovery implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `04_PRODUCT_LISTING_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Listing Intent, Product Card Information Hierarchy, Merchandising Governance, Operational Behaviour, and a Listing Quality Checklist. The authoritative reference for all product listing/browsing implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `05_PRODUCT_DETAILS_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, drafted in full (including Product Information Hierarchy, Wine Product Experience, Food Product Experience, Trust Signals, Future Expansion, and a closing Product Details Quality Checklist) and frozen directly, per Paul's explicit instruction. The authoritative reference for all product detail page implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `06_CART_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Customer Decision States, an expanded Mixed Cart Behaviour, Pricing Transparency, Cart Recovery, expanded Accessibility, and an expanded Cart Quality Checklist. The authoritative reference for all cart implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `07_CHECKOUT_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Checkout Intent & Customer Decision States, Payment State Behaviour, Checkout Recovery, and a Checkout Quality Checklist. Extends `06_CART_SPECIFICATION.md` directly — completes its Pricing Transparency table, resolves its deferred delivery-eligibility check, and carries its two-fulfillment-leg mixed-order model through to order confirmation. The authoritative reference for all checkout implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Account Lifecycle (Guest → Registered → Active → Deactivated → Deleted), Session & Security Behaviour, and Account Recovery. Extends `01_NAVIGATION_SPECIFICATION.md` §16 (account shell), `06_CART_SPECIFICATION.md` (Saved-for-Later, cart persistence), and `07_CHECKOUT_SPECIFICATION.md` (the post-purchase account-creation offer it picks up from). Explicitly excludes loyalty, wishlists, reviews, subscriptions, personalization, social login, and AI features — none established elsewhere in `/docs`. The authoritative reference for all customer account implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `09_FOOD_ORDERING_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Food Ordering Intent, Freshness & Quality Philosophy, Availability Transition Behaviour, and Food Ordering Recovery. Extends `01_NAVIGATION_SPECIFICATION.md` §14, `04_PRODUCT_LISTING_SPECIFICATION.md` §19, `05_PRODUCT_DETAILS_SPECIFICATION.md` §11, `06_CART_SPECIFICATION.md` §6, and `07_CHECKOUT_SPECIFICATION.md` §9/§10 without redefining any of them; explicitly defers delivery's operational logistics to `10_DELIVERY_SPECIFICATION.md`. Explicitly excludes table booking, dine-in, loyalty, subscriptions, AI recommendations, reviews, recipe content, and customization beyond established attributes. The authoritative reference for all Food Central ordering implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `10_DELIVERY_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Delivery Intent, Delivery Trust & Professionalism, Customer Expectations During Delivery, and Delivery Recovery. Owns delivery operations and the post-order customer delivery experience; extends `06_CART_SPECIFICATION.md` §5/§6, `07_CHECKOUT_SPECIFICATION.md` §7–§13, and `09_FOOD_ORDERING_SPECIFICATION.md` §7–§13 operationally without redefining any of their pre-order, customer-facing mechanics. Specifies Wine & Spirits' delivery-status vocabulary for the first time (deferred to this document by `09`). Explicitly excludes third-party courier integration, live GPS tracking, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, and locker pickup as v1 commitments. The authoritative reference for all delivery-operations implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision.
- `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — **Approved — Frozen (v1.0)**, 2026-07-18, following a refinement pass adding Admin Workflow Intent, Operational Trust & Accountability, Cross-Catalog Operational Parity, and Admin Workflow Recovery. The eleventh and final planned Phase 1 specification — the internal, staff-facing counterpart to all ten customer-facing specifications, covering dashboard, product/category/inventory/pricing/promotions management, order and food-order/kitchen workflows, delivery management, customer support tooling, staff roles and permissions (flagged open), content management, search merchandising, reporting, notifications, audit logging, and security. Contains no UI mockups, wireframes, implementation code, database schema, or API design, per direct instruction. The authoritative reference for all internal/staff-facing admin implementation platform-wide; per `DOCUMENTATION_GOVERNANCE.md` Section 5, modified only in response to a new business decision. **With this freeze, all 11 planned Phase 1 specifications are complete.**

Can run in parallel with Phase 0c and Phase 1's backend work — it is documentation, not implementation, and does not block or get blocked by either. Briefly paused between 2026-07-18's repository reconciliation and the completion of Phase 0e below, per Paul's explicit instruction; resumed once Phase 0e was approved.

### Phase 0e — Documentation governance and repository reconciliation ✅ Complete

Infrastructure work on `/docs` itself, not the product — necessary once an audit found project documentation split across two unmerged git branches (see `DECISION_LOG.md`, "Repository reconciliation"). Two parts, both completed and approved by Paul, 2026-07-18:

- **Repository reconciliation** — the two unmerged branches were merged into one authoritative documentation branch, preserving full git history from both; `docs/AI_HANDOFF.md` was recovered and rewritten against the reconciled state.
- **Documentation governance hardening** — `docs/DOCUMENTATION_GOVERNANCE.md` created as the governing standard (hierarchy, lifecycle statuses, change rules, cross-reference rules, versioning rules, AI/human contributor rules, workflow, quality checklist, audit process), followed by a full `/docs` audit against that standard, fixing every inconsistency found.

The documentation architecture is now considered stable. This phase exists in the roadmap so future sessions can see why Phase 0d paused briefly and what unblocked it — it is not expected to recur as a scheduled phase, only as an occasional future audit per `DOCUMENTATION_GOVERNANCE.md` Section 12.

### Phase 0f — Implementation Planning (Paul's "Phase 2") — Tier A complete; two Tier B modules approved, a third drafted

With all 11 Product Specifications frozen, `docs/IMPLEMENTATION_PLANNING.md` (v1.0, Approved, 2026-07-18) was created as the master governing document for this phase — translating the frozen specifications into concrete implementation plans (data-model planning, API contract planning, integration planning, testing planning) before any code is written. It defines a six-tier hierarchy (A — Foundational Reconciliation, B — Module Data Planning, C — API Contract Planning, D — Integration Planning, E — Testing & Acceptance Planning, F — Rollout Sequencing), each tier's dependencies and creation order, an Approval Workflow reusing Phase 1's (Product Specifications') exact draft-then-refine-or-freeze pattern, and Exit Criteria that must be true per surface/module before actual development begins. See `docs/IMPLEMENTATION_PLANNING.md` for the full governing standard.

**Tier A — Foundational Reconciliation is complete**, per `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` (v1.0, Approved, 2026-07-18). It reviewed all 11 frozen specifications against `ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `PRODUCT_CATALOG.md`, `INFORMATION_ARCHITECTURE.md`, `DELIVERY_MODEL.md`, `BUSINESS_RULES.md`, `USER_FLOWS.md`, and this document — confirming every foundational architectural assumption still holds, finding no outright-obsolete assumption, one genuine conflict (the "pairs with" module's framing in `PRODUCT_CATALOG.md` vs. six specifications' treatment of it), and consolidating nineteen new or newly-sharpened missing-work items into one Definitive Implementation Baseline table. **It also flagged a gap in this document specifically**: neither `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` nor `11_ADMIN_WORKFLOWS_SPECIFICATION.md` is currently named in any Phase 1–9 backend phase below — explicitly left for Tier F (Rollout Sequencing) to resolve once Tiers B–E exist, not fixed in this pass.

**Two Tier B documents are Approved; a third is Draft, awaiting review.** `docs/implementation-planning/TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` (v1.0, Approved, 2026-07-18) is the purely architectural definition of the "pairs with" module's responsibilities, ownership, and integration points, finalized with one completeness correction (a new Integration with Navigation section). `docs/implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md` (v1.0, Approved, 2026-07-18) is the architecture of the `wine-details` module — selected via a six-criteria priority evaluation that placed it ahead of `food-details`, delivery-slot, and the payment/notification providers despite `IMPLEMENTATION_PLANNING.md` §6 naming the two attribute modules as a tied pair — full reasoning in `DECISION_LOG.md`. Its finalization review corrected a stale dependency list in `TIER_A_FOUNDATIONAL_RECONCILIATION.md` (then v1.1) and recorded two new open dependencies (wine-attribute accuracy ownership; product-vs-variant granularity), neither resolved. **`docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md` (v1.0, Draft, 2026-07-19)** is the architecture of the `food-details` module, drafted next per that same §6 ordering — its own re-verification pass found `food-details`' true dependency count had been undercounted (seven frozen specifications, not five: `01_NAVIGATION_SPECIFICATION.md` and `02_HOMEPAGE_SPECIFICATION.md` both genuinely depend on it for prep-time/availability data), corrected in `TIER_A_FOUNDATIONAL_RECONCILIATION.md` (now v1.2) and `MODULE_INVENTORY.md`. It elevates the already-flagged, safety-critical allergen-accuracy-ownership question as this module's own central risk, and surfaces one newly discovered field-list gap (portion/serving-size). Awaiting Paul's review before any refinement pass or freeze. `docs/implementation-planning/MODULE_INVENTORY.md` (v1.3, Approved, living) now indexes every module identified project-wide — native, custom, provider, integration, and not-yet-scoped — with type, status, dependencies, and launch-criticality, per Paul's explicit recommendation. No Tier C–F document has been drafted. Per `IMPLEMENTATION_PLANNING.md` §7 and `DOCUMENTATION_GOVERNANCE.md` §5/§8, no further Tier B document begins without Paul's explicit direction — the same sequencing discipline that governed Phase 0d's 11 specifications. Can run in parallel with Phase 0c and this document's own backend Phase 1, per the same logic already established for Phase 0d.

## Phase 1 — Foundation: single-catalog commerce, end to end

- Stand up Medusa on Postgres + Redis (production-mode from day one, never launched on in-memory dev defaults).
- Install and configure the storefront (see `TECH_STACK.md`), regions/currency/tax for Nigeria.
- Connect a payment provider (see `MEDUSA_EXTENSIONS.md` #4 — this decision is a launch blocker, not a nice-to-have).
- Build and ship **Wine & Spirits only** end to end: browse → age-gate → PDP → cart → guest checkout → payment → nationwide delivery.
- Include age verification here, not later — it's a legal gate on checkout, not an add-on.

## Phase 2 — Product data foundation

- Build the wine-attributes module (`MEDUSA_EXTENSIONS.md` #1) and its admin editing widget.
- This must happen before search (Phase 6) — indexing a still-changing schema wastes rework.

## Phase 3 — Food Central catalog and delivery foundation

- Build the food-attributes module (`MEDUSA_EXTENSIONS.md` #2).
- Configure Lagos-scoped fulfillment (Service Zone/Geo Zone) and pickup — both native, no new module required (see `DELIVERY_MODEL.md`).
- Ship ordinary (non-scheduled) Food Central ordering and pickup before adding time-slot scheduling on top.

## Phase 4 — Delivery scheduling

- Build the delivery-slot module (`MEDUSA_EXTENSIONS.md` #3) for same-day and scheduled Food Central delivery — the highest-complexity fulfillment feature, deliberately sequenced after the basics are proven.

## Phase 5 — Delivery communication

- Integrate the notification provider (WhatsApp/SMS — `MEDUSA_EXTENSIONS.md` #5) for proactive delivery updates, once real order volume exists to communicate about.

## Phase 6 — Search

- Integrate Meilisearch (`MEDUSA_EXTENSIONS.md` #6) now that both attribute modules' schemas are stable.

## Phase 7 — Content and CMS

- Integrate Sanity (`MEDUSA_EXTENSIONS.md` #7) for editorial content. Off the checkout critical path; can run in parallel with other phases once bandwidth allows.

## Phase 8 — Mobile app

- Build a mobile app only once the web storefront's data layer and checkout flow are proven — reduces rework since the underlying API contracts are already validated by then.

## Phase 9 — Operational hardening

- Admin-side tooling refinement, reporting, and any process gaps identified from real operational volume (e.g. whether a dedicated rider-dispatch module becomes justified — see `PRODUCT_BLUEPRINT.md` §17).

## Explicitly out of scope (do not schedule without a new decision)

- Any marketplace/vendor functionality.
- Loyalty/subscription mechanics (noted as a future opportunity, not committed).
- Third-party carrier integration (company riders only, per `BUSINESS_RULES.md`).

## Open questions blocking Phase 0 and Phase 1

See `PROJECT_STATUS.md` for the current, consolidated list. As of this version: **Phase 0 (including 0b) and Phase 1 — Product Specifications are both complete**, with all 11 specifications — `01_NAVIGATION_SPECIFICATION.md` through `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — Approved — Frozen and no open items on any of the 11 documents themselves, though `01`, `03`, `06`, `07`, `08`, `09`, `10`, and `11` each surfaced their own tracked open items — the exact Wine & Spirits mega-menu category grouping (navigation); Meilisearch's still-pending formal sign-off plus the unscoped "pairs with" cross-sell relationship (search, now depended on by eleven specifications in total); confirmed rather than newly discovered at the checkout level, five open delivery-related business decisions (Wine & Spirits delivery mechanism, Lagos delivery-area definition, delivery-slot parameters, cash-on-delivery, hard age-recheck at order confirmation) plus one new recommendation requiring scoping confirmation (Saved-for-Later, `06_CART_SPECIFICATION.md` §14/§26); from `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §17/§18, the data-retention/NDPR-compliance specifics and the account deletion-vs-deactivation policy; from `09_FOOD_ORDERING_SPECIFICATION.md` §9/§10/§22/§28, the order-status vocabulary, the scheduling-horizon limit, and kitchen operating hours/early-closure conditions (largely sharing dependencies already flagged by `07_CHECKOUT_SPECIFICATION.md`); from `10_DELIVERY_SPECIFICATION.md` §6/§13/§14/§16/§17/§28, the failed-delivery-attempt policy, the cancellation-cutoff policy, the delivery-fee schedule, and whether age is physically re-verified at hand-off (largely sharing dependencies already flagged by `06` and `07`); and, from `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6/§14/§15/§18/§19/§20/§28, staff-permission granularity, audit-log retention/granularity, report definitions, and staff-facing alert thresholds (the allergen/ingredient-data-verification-responsibility question shared with `09`) — all logged in `PROJECT_STATUS.md`. With Phase 1 complete, the next phase of work is Phase 2 (Implementation Planning), Phase 0c (component specification), and Phase 1 backend foundation work, none of which begins without Paul's explicit direction. The payment provider choice (`MEDUSA_EXTENSIONS.md` #4) remains the most launch-critical open decision, blocking both backend Phase 1 and final implementation of `07_CHECKOUT_SPECIFICATION.md`'s Payment Behaviour and Payment State Behaviour sections. None of these block each other. **Phase 2's Tier A (Foundational Reconciliation) is complete** (`docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md`), confirming every item above and adding one genuinely new, highest-priority finding: the "pairs with" product-relationship module — already the single most cross-referenced open dependency across Phase 1 — has no `MEDUSA_EXTENSIONS.md` entry at all. **The first Tier B document, `docs/implementation-planning/TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, is now Approved at v1.0** — its architecture is the reference Tier C and any future data-model work must build against. Two items it names remain open, tracked in `PROJECT_STATUS.md`, not resolved: no staff-facing curation workflow for this module exists anywhere yet, including in `11_ADMIN_WORKFLOWS_SPECIFICATION.md`; and a formal `MEDUSA_EXTENSIONS.md` entry for the module is deferred to Tier C. **A second Tier B document, `docs/implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md`, is now Approved at v1.0** — its finalization review named two further gaps, tracked and not resolved: no document assigns operational responsibility for verifying wine attribute accuracy, and whether any wine attribute needs Product-Variant-level (not Product-level) representation is undecided. **A third Tier B document, `docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md`, is drafted at v1.0 — Draft**, awaiting Paul's review — it corrected `food-details`' dependency count (seven frozen specifications, not five) and elevates the already-flagged allergen-accuracy-ownership question as its own central, safety-critical risk. See `docs/implementation-planning/MODULE_INVENTORY.md` for the consolidated, single-page view of every module's status and launch-criticality across the whole project.
