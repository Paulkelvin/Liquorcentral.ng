# LiquorCentral Documentation

**Status:** Approved (in force)
**Version:** 4.2
**Owner:** Program
**Last Updated:** 2026-07-19

This directory is the **single source of truth** for the LiquorCentral project. It replaces chat history as the record of what has been decided, why, and what remains open.

> **Rule:** if it isn't written here, it isn't decided. If a chat conversation reaches a conclusion, that conclusion must be reflected in the relevant document below (and logged in `DECISION_LOG.md`) before the work is considered done.

## Start here

Anyone — human or AI — picking up this project should read, in this order:

1. **[`AI_HANDOFF.md`](./AI_HANDOFF.md)** — the project-level onboarding document (business model, tech stack, approved decisions, current phase, and the rules every AI session must follow). Always read this first, before anything else in `/docs`.
2. **[`DOCUMENTATION_GOVERNANCE.md`](./DOCUMENTATION_GOVERNANCE.md)** — the governing standard for how every document in `/docs` is statused, changed, cross-referenced, and versioned, and the rules every AI and human contributor follows when touching documentation. Read this before editing anything below.
3. **`PROJECT_STATUS.md`** — current phase, what's done, what's in progress, what's next, what's blocked, and what's awaiting Paul's approval. Always read this next.
4. **`PRODUCT_BLUEPRINT.md`** — the product's reason for existing: vision, positioning, philosophy, and the 18 strategic pillars every other document is downstream of.
5. **`BRAND_IDENTITY.md`**, **`EXPERIENCE_PRINCIPLES.md`**, and **`DESIGN_SYSTEM.md`** — who LiquorCentral is, how customers should experience using it, and the design foundations everything downstream builds on. These four documents (with `PRODUCT_BLUEPRINT.md`) are **frozen as Phase 0's authoritative output** — do not modify them unless a business decision changes (see `PROJECT_STATUS.md`).
6. **`specifications/`** — behavior-level specifications for individual product surfaces, built on top of the four frozen documents. See the "Product Specifications" entry in the map below. All 11 are now Approved — Frozen.
7. **`IMPLEMENTATION_PLANNING.md`** — the master governing document for Phase 2 (Implementation Planning), now that Phase 1's specifications are complete. Read this before any implementation-planning document is drafted.
8. Everything else, as relevant to the task at hand (see the map below).

## Document map

| Document | What it answers |
|---|---|
| [`AI_HANDOFF.md`](./AI_HANDOFF.md) | Project-level onboarding — read this first |
| [`DOCUMENTATION_GOVERNANCE.md`](./DOCUMENTATION_GOVERNANCE.md) | What are the rules for creating, statusing, changing, and cross-referencing documentation itself? |
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | Where is the project right now? |
| [`PRODUCT_BLUEPRINT.md`](./PRODUCT_BLUEPRINT.md) | What is LiquorCentral, and why is it built this way? |
| [`BUSINESS_RULES.md`](./BUSINESS_RULES.md) | What are the non-negotiable rules of how the business operates? |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | How is the underlying Medusa platform structured? |
| [`MEDUSA_EXTENSIONS.md`](./MEDUSA_EXTENSIONS.md) | What custom modules/extensions does LiquorCentral need, and why? |
| [`API_DECISIONS.md`](./API_DECISIONS.md) | Where does LiquorCentral use Medusa's API as-is vs. extend it? |
| [`TECH_STACK.md`](./TECH_STACK.md) | What technology is this built on, end to end? |
| [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) | How is the site/product structured and navigated? |
| [`PRODUCT_CATALOG.md`](./PRODUCT_CATALOG.md) | How are Wine & Spirits and Food Central products modeled? |
| [`DELIVERY_MODEL.md`](./DELIVERY_MODEL.md) | How does delivery/pickup/scheduling actually work? |
| [`USER_FLOWS.md`](./USER_FLOWS.md) | What are the step-by-step customer journeys? |
| [`BRAND_IDENTITY.md`](./BRAND_IDENTITY.md) | Who is LiquorCentral, how should it feel, and how should its approved colors/type/photography be used? |
| [`EXPERIENCE_PRINCIPLES.md`](./EXPERIENCE_PRINCIPLES.md) | How should every screen, feature, and interaction feel to use? |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | What design principles govern the interface (not yet: what it looks like)? |
| [`BRAND_GUIDELINES.md`](./BRAND_GUIDELINES.md) | What are the exact logo/type/asset specs? *(placeholder — narrower scope now that `BRAND_IDENTITY.md` exists)* |
| [`specifications/`](./specifications/) | What exactly should each product surface do, in enough behavioral detail to design, build, and test it? See below. |
| [`IMPLEMENTATION_PLANNING.md`](./IMPLEMENTATION_PLANNING.md) | What is Phase 2, what implementation-planning documents will it produce, in what order, and what must be true before development begins? |
| [`ROADMAP.md`](./ROADMAP.md) | In what order will this get built? |
| [`DECISION_LOG.md`](./DECISION_LOG.md) | What was decided, when, why, and with what impact? |
| [`CHANGELOG.md`](./CHANGELOG.md) | What changed in the documentation itself, over time? |

## Product Specifications (`/docs/specifications/`)

Phase 0 (`PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0) is complete and frozen. Phase 1 — Product Specifications translates those decisions into behavior-level specifications for each product surface: what each page/flow must do, for whom, backed by what data — not what it looks like. Each specification derives from and must not contradict the four frozen documents.

| Specification | Status |
|---|---|
| [`01_NAVIGATION_SPECIFICATION.md`](./specifications/01_NAVIGATION_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`02_HOMEPAGE_SPECIFICATION.md`](./specifications/02_HOMEPAGE_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`03_SEARCH_SPECIFICATION.md`](./specifications/03_SEARCH_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`04_PRODUCT_LISTING_SPECIFICATION.md`](./specifications/04_PRODUCT_LISTING_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`05_PRODUCT_DETAILS_SPECIFICATION.md`](./specifications/05_PRODUCT_DETAILS_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`06_CART_SPECIFICATION.md`](./specifications/06_CART_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`07_CHECKOUT_SPECIFICATION.md`](./specifications/07_CHECKOUT_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`](./specifications/08_CUSTOMER_ACCOUNT_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`09_FOOD_ORDERING_SPECIFICATION.md`](./specifications/09_FOOD_ORDERING_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`10_DELIVERY_SPECIFICATION.md`](./specifications/10_DELIVERY_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |
| [`11_ADMIN_WORKFLOWS_SPECIFICATION.md`](./specifications/11_ADMIN_WORKFLOWS_SPECIFICATION.md) | **Approved — Frozen**, v1.0 |

All 11 planned specifications are now **Approved — Frozen** at v1.0 — Phase 1 — Product Specifications is complete. Each was sequenced only on Paul's explicit direction, and each was drafted, reviewed, and frozen in two passes rather than invented ahead of approval — see `PROJECT_STATUS.md` for what comes next.

## Implementation Planning (`/docs/IMPLEMENTATION_PLANNING.md`, `/docs/implementation-planning/`)

With Phase 1 complete, **Phase 2 — Implementation Planning** translates the 11 frozen specifications into concrete, reviewable implementation plans — data-model planning, API contract planning, integration planning, and testing planning — before any code is written. `IMPLEMENTATION_PLANNING.md` is the master governing document for this phase: its purpose and scope, the complete hierarchy of implementation documents it will produce, their dependencies and creation order, the approval workflow, versioning, engineering philosophy, and the exit criteria that must be true before development begins.

Actual Tier A–F documents live in `/docs/implementation-planning/`, parallel to how `/docs/specifications/` holds Product Specifications:

| Document | Tier | Status |
|---|---|---|
| [`TIER_A_FOUNDATIONAL_RECONCILIATION.md`](./implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md) | A — Foundational Reconciliation | **Approved**, v1.4 |
| [`TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`](./implementation-planning/TIER_B_PRODUCT_RELATIONSHIP_MODULE.md) | B — Module Data Planning | **Approved**, v1.0 |
| [`TIER_B_WINE_ATTRIBUTES_MODULE.md`](./implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md) | B — Module Data Planning | **Approved**, v1.0 |
| [`TIER_B_FOOD_ATTRIBUTES_MODULE.md`](./implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md) | B — Module Data Planning | **Approved**, v1.0 |
| [`TIER_B_DELIVERY_SLOT_MODULE.md`](./implementation-planning/TIER_B_DELIVERY_SLOT_MODULE.md) | B — Module Data Planning | **Approved**, v1.0 |
| [`TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md`](./implementation-planning/TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md) | B — Module Data Planning | **Draft**, v1.0 |
| [`MODULE_INVENTORY.md`](./implementation-planning/MODULE_INVENTORY.md) | Living index, not a tier document | **Approved** (living, always current), v1.7 |

**Four Tier B modules are Approved** — the Product Relationship Module, the Wine & Spirits Attributes Module, the Food Attributes Module, and the Delivery-Slot Module. **A fifth, the Local Payment Provider Module, is drafted (v1.0 — Draft) and awaits Paul's review.** No further Tier B–F document has been drafted yet — per the same placeholder-then-draft-then-approve discipline that governed Product Specifications, none begins without Paul's explicit direction. `MODULE_INVENTORY.md` is the single-page index of every module identified so far — which are native, custom, an extension/integration, launch-critical, or optional — updated in the same change as any future Tier B document.

## Document status convention

Every document in `/docs` carries a metadata block directly under its title:

```
**Status:** Not Started | Draft | In Progress | Under Review | Approved | Frozen | Deprecated | Superseded | Archived
**Version:** major.minor
**Owner:** the team/function responsible for keeping it current
**Last Updated:** YYYY-MM-DD
```

This lets anyone joining the project — human or AI — tell at a glance which documents are settled and which are still being shaped, without reading the whole file or asking in chat. **`DOCUMENTATION_GOVERNANCE.md` Section 4 is the authoritative definition of each status and when to use it** — this section only points to it rather than restating it, so the two can never drift apart. When a document's status changes, update its header in the same change that changes the content, and log the change in `DECISION_LOG.md` if it's a material decision (not just a wording fix) — see `DOCUMENTATION_GOVERNANCE.md` Sections 5 and 6 for the full change and cross-reference rules.

## Continuity rules (read this before doing anything)

These rules apply to every future session, human or AI. They are the short version; `DOCUMENTATION_GOVERNANCE.md` Sections 8 and 9 are the full AI and human contributor rules, and win if the two ever appear to disagree.

1. **Read the docs before acting.** At the start of any task, read `PROJECT_STATUS.md` in full, then whichever documents are relevant to the task. Do not rely on prior chat history — it is not authoritative and may not be available to whoever picks this up next.
2. **The docs are the memory, not the conversation.** A decision made in conversation but not written down here does not count as decided.
3. **Keep documentation synchronized.** Outdated documentation is treated as a bug. If a decision changes, update the document it lives in *and* add an entry to `DECISION_LOG.md` — don't leave the old version in place with the new decision only mentioned in chat.
4. **Every material decision is logged.** Business decisions, architecture decisions, and scope changes all get an entry in `DECISION_LOG.md` with the decision, the reasoning, the date, and the impact — even if the decision is also reflected elsewhere.
5. **`PROJECT_STATUS.md` is always current.** It should never describe a phase or task that has since changed without being updated in the same change.
6. **Don't invent business or brand decisions.** Where a document has a placeholder or an open question, leave it open and flag it for Paul rather than assuming an answer. See `PROJECT_STATUS.md` → "Decisions awaiting Paul's approval."
7. **No implementation code, UI mockups, or wireframes belong in `/docs`.** This directory documents product, architecture, and decisions — not interface design or source code. Visual design work begins only after the relevant blueprint sections are approved.

## Working rules for anyone extending Medusa on this project

- Never modify Medusa core (the `medusa/` submodule). All customization happens through Medusa's documented extension points — custom modules, module links, workflow hooks, custom API routes, and admin widgets/routes. See `MEDUSA_EXTENSIONS.md` for the specific extensions this project needs and `ARCHITECTURE.md` for why this constraint exists.
- Research UX and product principles, not visual designs. Do not copy layouts, branding, animations, or interactions from other websites — see `DESIGN_SYSTEM.md` and `BRAND_GUIDELINES.md` for what's actually been decided vs. left open.
- Every recommendation, in any document, should carry: why, business value, technical impact, implementation difficulty, risks, assumptions, and whether Paul's approval is required. This is the same structure `MEDUSA_EXTENSIONS.md` and `DECISION_LOG.md` use.
