# AI Handoff Document — LiquorCentral.ng

**Status:** Approved (living, authoritative onboarding document)
**Version:** 3.0
**Owner:** Program
**Last Updated:** 2026-07-18

**This is the primary onboarding document for this project.** If you are a new developer or a new AI session, read this document in full before touching code, writing content, or answering questions about the project. Do not rely on prior chat history — none is available to you, and none should be assumed to exist. This document, and the rest of `/docs`, is the single source of truth.

> **Provenance note (read this once, then ignore it).** On 2026-07-18, project documentation existed on two independently-authored git branches that had diverged from a common commit and were never merged: `claude/medusa-repo-clone-ut5dl5` (which carried Phase 0 through to completion — Brand Identity, Experience Principles, Design System v2.0, and the opening of Phase 1 Product Specifications) and `claude/ai-handoff-docs-ufdn5t` (which authored this file but stopped several hours earlier, before any of that later work happened, and whose own copies of the shared documents were consequently out of date). Each branch's `PROJECT_STATUS.md` was unaware of the other branch's existence — one described this file as "lost," which was inaccurate; it was simply on an unmerged branch. Both branches have since been reconciled onto a single working branch: `claude/medusa-repo-clone-ut5dl5`'s documentation set was kept as the base (it held the latest approved work), and this file was recovered from `claude/ai-handoff-docs-ufdn5t` and rewritten against the reconciled state. Full detail is in `DECISION_LOG.md` under "Repository reconciliation: two unmerged documentation branches merged into one authoritative branch." If `/docs` ever again appears sparser than this document describes, check `git log --all` and `git branch -r` before concluding documentation is missing — history is never rewritten on this project, so nothing is ever actually lost, only possibly unmerged.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Technology](#2-current-technology)
3. [Business Decisions](#3-business-decisions)
4. [Major Architecture Decisions](#4-major-architecture-decisions)
5. [Repository Structure](#5-repository-structure)
6. [Documentation Reading Order](#6-documentation-reading-order)
7. [Documentation Guide and Status Summary](#7-documentation-guide-and-status-summary)
8. [Current Project State](#8-current-project-state)
9. [Current Roadmap](#9-current-roadmap)
10. [Immediate Next Step](#10-immediate-next-step)
11. [Rules for Future AI Sessions](#11-rules-for-future-ai-sessions)
12. [Project Principles](#12-project-principles)
13. [Versioning](#13-versioning)

---

## 1. Executive Summary

**LiquorCentral** is a premium online liquor and wine retailer serving customers nationwide across Nigeria. It is not a marketplace — LiquorCentral owns its own inventory, sets its own prices, and fulfills its own orders. The brand is positioned at the premium end of the market: the experience is designed to feel trustworthy, considered, and high-confidence rather than discount-driven or transactional.

**Food Central** is a food delivery subsidiary of the same company — a product line, not a separate business, spin-off, or marketplace of independent restaurants. It shares LiquorCentral's storefront, customer identity, cart, and checkout. Unlike liquor and wine (nationwide), Food Central currently operates in **Lagos only**, cooked to order, reflecting the operational realities of same-day, perishable food delivery.

**Business model:** One company, two product lines, no third-party vendors. All inventory (liquor, wine, and food) is company-owned. All delivery is fulfilled by company-owned riders for Food Central — not a gig-economy logistics marketplace. Customers can check out as guests, must confirm legal drinking age before browsing alcohol, and can choose between same-day delivery, scheduled delivery, or pickup depending on product line and location.

**Current project phase:** **Phase 0 (Brand & Design Foundation) is complete and frozen. Phase 1 — Product Specifications is underway.** `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0 are approved and frozen as the project's authoritative foundation. `02_HOMEPAGE_SPECIFICATION.md` (v0.1) is fully drafted and awaiting Paul's review; the other ten specification files are approved placeholders awaiting sequencing direction. See Section 8 for full detail.

**Product vision:** LiquorCentral is the platform Nigerians trust to deliver a bottle of wine and a home-cooked meal with the same care — curated, fast, and confident enough to buy on impulse. Every part of the product, from search to checkout, should reduce friction and increase the customer's confidence that they are buying the right product from a legitimate, premium operator.

---

## 2. Current Technology

| Technology | Role | Why it was chosen |
|---|---|---|
| **Medusa** (v2.17.2, vendored as a git submodule at `./medusa`) | Headless commerce engine — carts, checkout, orders, inventory, product catalog, customers | Open-source, self-hostable, modular by design (no core-editing required to extend it). Provides commerce fundamentals out of the box while remaining fully extensible via custom modules — necessary because the business has requirements a closed SaaS platform would make difficult or expensive: age verification, two product lines with different attribute schemas, and company-owned delivery logistics. See `ARCHITECTURE.md` and `MEDUSA_EXTENSIONS.md`. |
| **Next.js** (Medusa's official Next.js Starter, recommended — not yet formally approved) | Customer-facing storefront | Ships with cart, checkout, region/tax handling, and payment integration already wired against Medusa's API, avoiding a from-scratch reimplementation with no maintained upgrade path. SSR/SEO supports organic product discovery. See `TECH_STACK.md`. |
| **Sanity** (recommended, not urgent, not yet formally approved) | Content management (marketing/editorial content) | Kept strictly separate from commerce data, synced one-way from Medusa. Real-time collaborative editing, strong localization, official Medusa integration pattern. See `MEDUSA_EXTENSIONS.md` #7. |
| **Meilisearch** (recommended, not yet formally approved) | Product search and discovery | Open-source, officially documented Medusa integration, strong faceting for wine/food attribute filtering — the lowest-integration-risk option versus Algolia/Elasticsearch/Typesense. See `MEDUSA_EXTENSIONS.md` #6. |
| **PostgreSQL** | Primary relational database (via Medusa) | Medusa's own requirement; ACID-compliant and battle-tested for transactional integrity of orders, payments, and inventory. |
| **Redis** | Caching, session storage, background jobs/event queues | Required for production Medusa (its in-memory dev mode is explicitly not production-appropriate). Keeps checkout, search, and session operations fast under load. |

Payment provider and delivery-notification channel are **not yet decided** — see Section 8 and `MEDUSA_EXTENSIONS.md` #4–#5. Payment provider is **launch-blocking** for `ROADMAP.md` Phase 1.

---

## 3. Business Decisions

The following are **finalized, non-negotiable** unless Paul explicitly revisits one (logged in `DECISION_LOG.md`). Full detail in `BUSINESS_RULES.md`.

- **Single company.** LiquorCentral is one company operating its own product lines — not a federation of independent sellers.
- **Not a marketplace.** No third-party vendors, no vendor onboarding, no vendor dashboard, no vendor payouts, no marketplace commissions.
- **Food Central is a subsidiary product line**, not a separate company or website.
- **Wine and spirits ship nationwide** across Nigeria.
- **Food Central delivers Lagos only**, and is cooked on demand (no held stock of finished dishes).
- **Same-day delivery** is a core Food Central offering.
- **Scheduled delivery** — a future date/time window — is supported.
- **Pickup** is supported, with equal visual/UX weight to delivery.
- **Company-owned riders** fulfill all Food Central delivery — no third-party courier/dispatch platform. (Wine & Spirits' nationwide delivery mechanism — in-house fleet vs. courier partner — is still open; see Section 8.)
- **Guest checkout** is required throughout — never force account creation to complete a purchase.
- **Age confirmation** is required before browsing alcohol content, not just at checkout.
- **Premium positioning.** Feel: premium, modern, elegant, fast, trustworthy, mobile-first, effortless. Every design/product decision is judged against: *does this reduce friction and increase purchase confidence?*

---

## 4. Major Architecture Decisions

Full detail in `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, and `PRODUCT_BLUEPRINT.md`.

### Approved

- **One Medusa instance / one store** serves both product lines — not separate backends per business line.
- **One storefront**, one shared shell (header, search, cart, account) over two internally-distinct sections — not two microsites.
- **Two product lines** (Wine & Spirits, Food Central) as two configurations of the same Product module — not two catalog systems.
- **Two focused product-attribute modules** (`wine-details`, `food-details`), each linked 1:1 to Product via Medusa's `defineLink` — not one universal attribute module. A wine has no spice level; a dish has no vintage.
- **One cart, one checkout**, even for a mixed wine + food order — no order-splitting workflow.
- **Medusa vendored as a git submodule** at `./medusa`; **Medusa core is never modified** — all customization goes through documented extension points (custom modules, module links, workflow hooks, custom API routes, admin widgets).
- **Medusa's native auth** (customer + admin-user) is the system of record — no third-party identity provider for v1.

### Rejected / Superseded

Recorded intentionally, not deleted, so future sessions understand what was considered and explicitly ruled out. **Do not reintroduce these unless Paul explicitly changes the business model.**

- **Marketplace architecture — REJECTED/SUPERSEDED.** Earlier research explored a multi-vendor marketplace (Vendor module, vendor staff accounts, order-splitting checkout, per-vendor payouts). Retired in favor of the single-company model above. See the supersession notice at the top of `PRODUCT_BLUEPRINT.md`.
- **Vendor modules, vendor actor-type, order-splitting workflow, per-vendor payout API — REJECTED/SUPERSEDED**, along with the marketplace model that required them.

---

## 5. Repository Structure

```
/
├── README.md                          Root README — points here (/docs) as the source of truth
├── .gitmodules                        Registers the medusa/ submodule
├── medusa/                            Vendored medusajs/medusa v2 (git submodule) — never edited directly
└── docs/
    ├── AI_HANDOFF.md                  This file — read first
    ├── README.md                      Documentation index, reading order, continuity rules — see Section 6
    ├── PROJECT_STATUS.md              Current phase, work status, blockers, open questions — always current
    ├── PRODUCT_BLUEPRINT.md           Product vision, positioning, 18 strategic pillars — frozen (Phase 0)
    ├── BRAND_IDENTITY.md              Brand vision, personality, voice, approved colors and their usage — frozen (Phase 0)
    ├── EXPERIENCE_PRINCIPLES.md       15 experience principles, product vision, competitive positioning — frozen (Phase 0)
    ├── DESIGN_SYSTEM.md               Design principles + concrete foundations (type, spacing, color tokens, etc.) v2.0 — frozen (Phase 0)
    ├── BUSINESS_RULES.md              Finalized, non-negotiable business decisions
    ├── ARCHITECTURE.md                How the vendored Medusa codebase is structured
    ├── MEDUSA_EXTENSIONS.md           Catalog of custom modules/extensions needed, with approval status
    ├── API_DECISIONS.md               Native vs. custom API routes, and why
    ├── TECH_STACK.md                  Full technology stack, confirmed vs. recommended
    ├── INFORMATION_ARCHITECTURE.md    Site/navigation structure for both product lines
    ├── PRODUCT_CATALOG.md             How Wine & Spirits and Food Central products are modeled
    ├── DELIVERY_MODEL.md              Delivery/pickup/scheduling strategy
    ├── USER_FLOWS.md                  Step-by-step customer journeys (no visuals)
    ├── BRAND_GUIDELINES.md            Placeholder — tactical asset execution (logo, exact tokens), narrower scope now that BRAND_IDENTITY.md exists
    ├── ROADMAP.md                     Phased build sequence (no dates)
    ├── DECISION_LOG.md                Append-only record of every material decision
    ├── CHANGELOG.md                   Changelog of the documentation set itself
    └── specifications/                Phase 1 — behavior-level specs for each product surface
        ├── 01_NAVIGATION_SPECIFICATION.md          Not Started (placeholder)
        ├── 02_HOMEPAGE_SPECIFICATION.md             In Progress — v0.1 drafted, awaiting review
        ├── 03_SEARCH_SPECIFICATION.md                Not Started (placeholder)
        ├── 04_PRODUCT_LISTING_SPECIFICATION.md       Not Started (placeholder)
        ├── 05_PRODUCT_DETAILS_SPECIFICATION.md       Not Started (placeholder)
        ├── 06_CART_SPECIFICATION.md                  Not Started (placeholder)
        ├── 07_CHECKOUT_SPECIFICATION.md               Not Started (placeholder)
        ├── 08_CUSTOMER_ACCOUNT_SPECIFICATION.md      Not Started (placeholder)
        ├── 09_FOOD_ORDERING_SPECIFICATION.md         Not Started (placeholder)
        ├── 10_DELIVERY_SPECIFICATION.md              Not Started (placeholder)
        └── 11_ADMIN_WORKFLOWS_SPECIFICATION.md       Not Started (placeholder)
```

No implementation code, UI mockups, or wireframes exist anywhere in this repository yet — `/docs` and the vendored `medusa/` submodule are the entire contents besides the root README.

---

## 6. Documentation Reading Order

Anyone — human or AI — picking up this project should read, in this order:

1. **This document (`AI_HANDOFF.md`)** — project-level onboarding, business model, tech stack, current phase, rules.
2. **`docs/README.md`** — the documentation index proper: full document map, the document-status convention, and continuity rules for keeping `/docs` synchronized.
3. **`docs/PROJECT_STATUS.md`** — current phase in full detail, completed/in-progress/blocked work, and every decision awaiting Paul's approval.
4. **`docs/PRODUCT_BLUEPRINT.md`**, then **`docs/BRAND_IDENTITY.md`**, **`docs/EXPERIENCE_PRINCIPLES.md`**, and **`docs/DESIGN_SYSTEM.md`** — the four frozen Phase 0 documents; read together, they answer what LiquorCentral is, who it is, how it should feel to use, and what design foundations everything downstream builds on.
5. **`docs/specifications/`** — behavior-level specifications for individual product surfaces, built on the four frozen documents above. Start with `02_HOMEPAGE_SPECIFICATION.md`, the only one drafted so far.
6. **`docs/DECISION_LOG.md`** and **`docs/CHANGELOG.md`** — the authoritative history of what was decided and what changed, respectively. Read these when you need to understand *why* something is the way it is, or whether a document you're about to read is current.
7. Everything else in `docs/README.md`'s document map, as relevant to the task at hand.

---

## 7. Documentation Guide and Status Summary

`/docs` contains 20 documents plus the 11-file `specifications/` directory (31 files total). `docs/README.md` is the detailed document map with cross-links and the document-status convention; this section summarizes current status by category.

### Frozen (Phase 0 output — do not modify unless a business decision changes)

- `PRODUCT_BLUEPRINT.md` — approved and frozen, 2026-07-18.
- `BRAND_IDENTITY.md` — approved and frozen, 2026-07-18.
- `EXPERIENCE_PRINCIPLES.md` — approved and frozen, 2026-07-18.
- `DESIGN_SYSTEM.md` v2.0 — approved and frozen as the authoritative design foundation, 2026-07-18.

### Approved (living or reference documents, not frozen)

- `docs/AI_HANDOFF.md` (this file), `docs/README.md`, `docs/PROJECT_STATUS.md`, `docs/DECISION_LOG.md`, `docs/CHANGELOG.md` — process documents, expected to keep changing as the project moves.
- `BUSINESS_RULES.md` — finalized business decisions, changes only if Paul explicitly revisits a rule.
- `ARCHITECTURE.md` — reference document, changes only if the Medusa version or conventions change materially.

### In Progress

- `docs/specifications/02_HOMEPAGE_SPECIFICATION.md` — v0.1, fully drafted (all 25 required sections), awaiting Paul's review/approval.

### Not Started (approved placeholders)

- `docs/specifications/01_NAVIGATION_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, `04_PRODUCT_LISTING_SPECIFICATION.md`, `05_PRODUCT_DETAILS_SPECIFICATION.md`, `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, `09_FOOD_ORDERING_SPECIFICATION.md`, `10_DELIVERY_SPECIFICATION.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — Document Purpose, Scope, Dependencies, and Planned Sections exist; detailed content intentionally not invented ahead of sequencing. Do not add detail to a placeholder without Paul's explicit direction to begin that specification.

### Draft (strategy generally confirmed; specific values or formal sign-off still open)

- `TECH_STACK.md` — backend confirmed and vendored; storefront/search/CMS recommendations not yet formally signed off.
- `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `INFORMATION_ARCHITECTURE.md`, `PRODUCT_CATALOG.md`, `DELIVERY_MODEL.md`, `USER_FLOWS.md`, `ROADMAP.md` — see each document's own status header for exactly what remains open.
- `BRAND_GUIDELINES.md` — placeholder; narrower scope now that `BRAND_IDENTITY.md` exists; can begin whenever design capacity is available (no longer a hard blocker).

### Superseded

- An earlier multi-vendor marketplace architecture (Vendor module, vendor staff accounts, order-splitting checkout, per-vendor payouts) — retired in favor of the single-company model. See `PRODUCT_BLUEPRINT.md`'s supersession notice and `DECISION_LOG.md`.

| Document | Purpose | Owner | Update when |
|---|---|---|---|
| `docs/AI_HANDOFF.md` (this file) | Project-level onboarding; single source of truth entry point | Paul (final approver); maintained by whichever session makes the last approved change | Immediately on any business, architecture, tech-stack, or phase change |
| `docs/README.md` | Documentation index, reading order, continuity rules | Same | Whenever a document is added/removed/restructured |
| `docs/PROJECT_STATUS.md` | Current phase, completed/in-progress/blocked work, open questions | Whoever is actively working; approved by Paul | Every session — "an out-of-date status is a bug" |
| `docs/PRODUCT_BLUEPRINT.md` | Product vision, positioning, and 18 strategic pillars | Paul (approved, frozen) | Only if a strategic/product decision changes |
| `docs/BRAND_IDENTITY.md` | Brand vision, personality, voice, approved colors and their usage | Paul (approved, frozen) | Only if a business decision changes |
| `docs/EXPERIENCE_PRINCIPLES.md` | How every screen/feature/interaction should feel | Paul (approved, frozen) | Only if a business decision changes |
| `docs/DESIGN_SYSTEM.md` | Design principles and concrete foundations (type, spacing, color tokens, motion, etc.) | Design/Paul (approved, frozen, v2.0) | Only if a business decision changes |
| `docs/BUSINESS_RULES.md` | Finalized, non-negotiable business decisions | Paul | Only when Paul explicitly revisits a rule |
| `docs/ARCHITECTURE.md` | How the vendored Medusa codebase is structured, and the module-isolation rule | Engineering | When the Medusa version changes materially, or conventions change |
| `docs/MEDUSA_EXTENSIONS.md` | Authoritative catalog of every custom module/extension needed, with risk and approval status | Engineering; per-item approval from Paul | Before building anything not already listed here |
| `docs/API_DECISIONS.md` | Native vs. custom API routes, and why | Engineering | Whenever a new route is anticipated or built |
| `docs/TECH_STACK.md` | Full technology stack end to end, confirmed vs. recommended | Engineering; sign-off from Paul | Any stack component change, logged in `DECISION_LOG.md` |
| `docs/INFORMATION_ARCHITECTURE.md` | Site/navigation structure for both product lines | Product; merchandising input from Paul | When IA/category structure changes |
| `docs/PRODUCT_CATALOG.md` | How Wine & Spirits and Food Central products are modeled; proposed attribute field lists | Paul/merchandising (field lists); engineering (structure) | When attribute field lists are finalized or changed |
| `docs/DELIVERY_MODEL.md` | Delivery/pickup/scheduling strategy for both product lines | Paul (ops decisions); engineering (mechanics) | When delivery/ops decisions change |
| `docs/USER_FLOWS.md` | Step-by-step customer journeys (no visuals) | Product | When a flow's steps change |
| `docs/BRAND_GUIDELINES.md` | Tactical asset execution (logo, exact typefaces/tokens, physical branding) | Paul / a designer, once engaged | Once brand execution work begins |
| `docs/specifications/` | Behavior-level specs for each product surface | Product; per-file approval from Paul | One file at a time, only with Paul's explicit go-ahead to begin it |
| `docs/ROADMAP.md` | Phased build sequence (no dates) | Paul/engineering | When sequencing or phase scope changes |
| `docs/DECISION_LOG.md` | Append-only record of every material decision: what, why, when, impact, status | Whoever makes/logs the decision | Every material decision — append a new entry, never edit an old one |
| `docs/CHANGELOG.md` | Changelog of the documentation set itself (not the product) | Whoever adds/removes/restructures a document | Whenever `/docs` itself changes |

---

## 8. Current Project State

*(Condensed from `docs/PROJECT_STATUS.md` — that file is the detailed, always-current version. If the two ever disagree, `docs/PROJECT_STATUS.md` wins and this section should be updated to match.)*

**Completed**
- Business model finalized: single company, no marketplace, no vendors.
- `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md` approved and frozen.
- `DESIGN_SYSTEM.md` v2.0 finalized and frozen as the authoritative design foundation (typography, spacing, grid, elevation, a three-tier Color Architecture, motion, breakpoints, form behaviors, accessibility tokens, Future Theme Support, Component Philosophy, Design Quality Checklist).
- Full architecture, technology, and UX/product research completed and distilled into `ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `USER_FLOWS.md`, `DELIVERY_MODEL.md`.
- Medusa v2.17.2 vendored as a git submodule.
- `/docs/specifications/` opened for Phase 1; `02_HOMEPAGE_SPECIFICATION.md` fully drafted (v0.1, all 25 sections).
- **Repository reconciliation (2026-07-18):** two unmerged documentation branches (`claude/medusa-repo-clone-ut5dl5` and `claude/ai-handoff-docs-ufdn5t`) were merged into a single authoritative branch, preserving full git history from both. This file was recovered from the latter branch and rewritten against the former's more current state. See `DECISION_LOG.md` for the full entry.

**In Progress**
- `02_HOMEPAGE_SPECIFICATION.md` — v0.1, awaiting Paul's review/approval. No other specification is being actively developed.

**Not Started**
- Any implementation code, UI design, or wireframes.
- Specifications `01`, `03`–`11` (approved placeholders, awaiting sequencing direction).
- Component-level design work (`ROADMAP.md` Phase 0c).
- All custom Medusa modules listed in `MEDUSA_EXTENSIONS.md`, and the search/CMS integrations.

**Blocked**
- **Payment provider is undecided** — blocks the start of `ROADMAP.md` Phase 1 (backend foundation), and blocks detailed work on `07_CHECKOUT_SPECIFICATION.md` and `10_DELIVERY_SPECIFICATION.md` once their turn comes. This is the project's only hard, launch-critical blocker at present.

**Awaiting Paul's Approval** (full list with document references in `docs/PROJECT_STATUS.md`)
- Wine & Spirits' nationwide delivery mechanism (in-house fleet vs. courier partner) and whether cash-on-delivery is offered at all.
- Local payment provider choice (e.g. Paystack, Flutterwave) — **launch-blocking**.
- Delivery-update channel(s) (WhatsApp Business API and/or SMS).
- Exact age-gate mechanics (session duration; site-wide vs. alcohol-section-only) and whether a hard compliance re-check happens at order confirmation.
- Alcohol return/refund policy.
- Final field lists for the wine-attributes and food-attributes modules, and who owns allergen/ingredient data accuracy operationally.
- Delivery-slot operational parameters (slot length, cutoff times, capacity).
- Exact curated/occasion collections for Wine & Spirits (a merchandising decision).
- Formal sign-off on the Next.js Starter, Meilisearch, and Sanity recommendations.
- Review/approval of `02_HOMEPAGE_SPECIFICATION.md`, and sequencing direction for which specification to draft next.

---

## 9. Current Roadmap

Full detail in `ROADMAP.md`. Summary:

- **Phase 0 — Brand & Design Foundation: ✅ Complete.** Includes Phase 0b (Design System Foundations, frozen as v2.0).
- **Phase 0c — Component specification: Not yet started.** Next frontend-track step once Paul directs it; can run in parallel with backend Phase 1.
- **Phase 0d — Product Specifications: In progress.** `02_HOMEPAGE_SPECIFICATION.md` drafted; rest are placeholders. Runs in parallel with Phase 0c and Phase 1 — documentation, not implementation.
- **Phase 1 — Foundation (backend):** Stand up Medusa on Postgres + Redis, connect a payment provider (launch blocker), ship Wine & Spirits end to end (browse → age-gate → PDP → cart → guest checkout → payment → nationwide delivery).
- **Phase 2 — Product data foundation:** wine-attributes module.
- **Phase 3 — Food Central catalog and delivery foundation:** food-attributes module, Lagos-scoped fulfillment, ordinary (non-scheduled) ordering and pickup.
- **Phase 4 — Delivery scheduling:** delivery-slot module for same-day/scheduled Food Central delivery.
- **Phase 5 — Delivery communication:** notification provider (WhatsApp/SMS) integration.
- **Phase 6 — Search:** Meilisearch integration.
- **Phase 7 — Content and CMS:** Sanity integration.
- **Phase 8 — Mobile app:** after the web storefront's data layer and checkout are proven.
- **Phase 9 — Operational hardening.**

**Explicitly out of scope** (do not schedule without a new decision): any marketplace/vendor functionality, loyalty/subscription mechanics, third-party carrier integration.

---

## 10. Immediate Next Step

Two independent next steps, neither blocking the other:

1. **Paul to review and approve (or request changes to) `docs/specifications/02_HOMEPAGE_SPECIFICATION.md`.** Once approved, the next candidate specifications are `01_NAVIGATION_SPECIFICATION.md` and `03_SEARCH_SPECIFICATION.md` — but none should begin without Paul's explicit go-ahead, per the placeholder-only instruction for this phase.
2. **Paul to resolve the payment-provider decision** (`MEDUSA_EXTENSIONS.md` #4) — this is the project's sole launch-blocking open item, and blocks `ROADMAP.md` Phase 1 (backend foundation) regardless of how specification work proceeds.

Per Paul's explicit instruction as of this reconciliation: **do not begin Navigation Specification or any further Product Specifications until repository reconciliation is complete and approved.** That work is described in `DECISION_LOG.md`'s reconciliation entry; once Paul confirms it, Section 10's two items above resume as the next actionable work.

---

## 11. Rules for Future AI Sessions

Every future AI assistant working on this project must:

1. **Read `docs/AI_HANDOFF.md` first** (this document), then `docs/README.md`, then `docs/PROJECT_STATUS.md` — see Section 6 for the full reading order.
2. **Consult the relevant documentation** in `/docs` before answering questions or making changes, rather than guessing.
3. **Treat the documentation as the single source of truth** — not memory, not assumption, not inference from the codebase alone.
4. **Never rely on previous chat history.** Assume no prior conversation exists or is accessible. If something a user describes as "already created" or "already decided" doesn't appear in `/docs` on the current branch, check `git log --all` / `git branch -r` before concluding it doesn't exist — it may be sitting on an unmerged branch, exactly as happened with this file (see the provenance note at the top of this document and `DECISION_LOG.md`). Do not fabricate content to fill the gap either way, and do not declare work "lost" without first checking every branch.
5. **Never contradict approved business decisions** (Section 3) or architecture decisions (Section 4).
6. **Never modify the four frozen Phase 0 documents** (`PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md`) unless Paul explicitly makes a business decision that requires it.
7. **Never introduce marketplace concepts** — multi-vendor support, seller onboarding, vendor modules, commission/payout logic — unless Paul explicitly changes the business model. If asked to build something that resembles a marketplace feature, stop and confirm with Paul rather than proceeding.
8. **Never invent business or brand decisions.** Where a document has a placeholder or an open question (Section 8), leave it open and flag it for Paul rather than assuming an answer.
9. **Never draft a placeholder specification without Paul's explicit direction to begin that specific file** — the placeholder-only structure in `/docs/specifications/` is deliberate.
10. **Log every material decision** in `docs/DECISION_LOG.md` (append, don't edit old entries) and keep `docs/PROJECT_STATUS.md` current in the same change.
11. **When reconciling or merging documentation branches, merge — do not recreate.** Preserve git history, prefer the more current source for genuinely conflicting content, and only edit a document when reconciliation is actually required (a real inconsistency), not because a second version of it exists somewhere.

---

## 12. Project Principles

- **Premium over flashy.** Restraint and quality signal trust; novelty for its own sake does not.
- **Simplicity over feature bloat.** Ship what customers need to buy with confidence, not everything that's technically possible.
- **Documentation before implementation.** Decisions get written down and approved before code gets written.
- **Extend Medusa, never modify its core.** Custom logic lives in modules, module links, workflow hooks, and admin widgets/routes — never in edits to the `medusa/` submodule.
- **Research principles, never copy competitors.** Design and product decisions are grounded in what works for customers, not in mimicking other retailers.
- **Every page should reduce friction and increase purchase confidence.** This is the standard every screen and flow is judged against.
- **Mobile-first**, with a stricter performance bar for Food Central specifically (more likely to be a fast, one-thumb, on-the-go action).
- **Accessibility by default** — contrast, keyboard navigation, alt text, focus states — built in from launch, not retrofitted.
- **Performance matters.** Page weight and interaction latency are treated as conversion metrics, not just engineering ones.

---

## 13. Versioning

| Field | Value |
|---|---|
| Document Version | 3.0 |
| Last Updated | 2026-07-18 |
| Project Phase | Phase 0 complete and frozen; Phase 1 — Product Specifications underway (`02_HOMEPAGE_SPECIFICATION.md` drafted, awaiting review) |
| Next Planned Milestone | Paul's review of `02_HOMEPAGE_SPECIFICATION.md` and the payment-provider decision — see Section 10 |
