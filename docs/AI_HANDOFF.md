# AI Handoff Document — LiquorCentral.ng

**This is the primary onboarding document for this project.** If you are a new developer or a new AI session, read this document in full before touching code, writing content, or answering questions about the project. Do not rely on prior chat history — none is available to you, and none should be assumed to exist. This document, and the rest of `/docs`, is the single source of truth.

> **Provenance note.** This documentation set was assembled from two separately-authored, unmerged git branches that were consolidated into one working branch on 2026-07-18 following a documentation audit. If `/docs` ever again appears sparser than this document describes, check `git log --all` and `git branch -r` before concluding documentation is missing — it may simply be sitting on an unmerged branch. Full detail is in `DECISION_LOG.md` under "Documentation audit: two unmerged branches consolidated into one working branch."

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Technology](#2-current-technology)
3. [Business Decisions](#3-business-decisions)
4. [Major Architecture Decisions](#4-major-architecture-decisions)
5. [Documentation Guide](#5-documentation-guide)
6. [Current Project State](#6-current-project-state)
7. [Immediate Next Step](#7-immediate-next-step)
8. [Rules for Future AI Sessions](#8-rules-for-future-ai-sessions)
9. [Project Principles](#9-project-principles)
10. [Versioning](#10-versioning)

---

## 1. Executive Summary

**LiquorCentral** is a premium online liquor and wine retailer serving customers nationwide across Nigeria. It is not a marketplace — LiquorCentral owns its own inventory, sets its own prices, and fulfills its own orders. The brand is positioned at the premium end of the market: the experience is designed to feel trustworthy, considered, and high-confidence rather than discount-driven or transactional.

**Food Central** is a food delivery subsidiary of the same company — a product line, not a separate business, spin-off, or marketplace of independent restaurants. It shares LiquorCentral's storefront, customer identity, cart, and checkout. Unlike liquor and wine (nationwide), Food Central currently operates in **Lagos only**, cooked to order, reflecting the operational realities of same-day, perishable food delivery.

**Business model:** One company, two product lines, no third-party vendors. All inventory (liquor, wine, and food) is company-owned. All delivery is fulfilled by company-owned riders for Food Central — not a gig-economy logistics marketplace. Customers can check out as guests, must confirm legal drinking age before browsing alcohol, and can choose between same-day delivery, scheduled delivery, or pickup depending on product line and location.

**Current project phase:** Product Definition — documentation established, **awaiting Paul's review and approval** of `PRODUCT_BLUEPRINT.md` v1, `BRAND_IDENTITY.md` v1, and a substantial list of other open questions (payment provider, delivery mechanics, and more — see Section 6). No implementation code, UI, wireframe, or mockup work has begun anywhere in this project. The next phase is **Design System** (see Section 7) — explicitly gated on `BRAND_IDENTITY.md`'s approval, not yet underway.

**Product vision:** LiquorCentral is the platform Nigerians trust to deliver a bottle of wine and a home-cooked meal with the same care — curated, fast, and confident enough to buy on impulse. Every part of the product, from search to checkout, should reduce friction and increase the customer's confidence that they are buying the right product from a legitimate, premium operator.

---

## 2. Current Technology

| Technology | Role | Why it was chosen |
|---|---|---|
| **Medusa** (v2, vendored as a git submodule at `./medusa`) | Headless commerce engine — carts, checkout, orders, inventory, product catalog, customers | Open-source, self-hostable, modular by design (no core-editing required to extend it). Provides commerce fundamentals out of the box while remaining fully extensible via custom modules — necessary because the business has requirements a closed SaaS platform would make difficult or expensive: age verification, two product lines with different attribute schemas, and company-owned delivery logistics. See `ARCHITECTURE.md` and `MEDUSA_EXTENSIONS.md`. |
| **Next.js** (Medusa's official Next.js Starter, recommended — not yet formally approved) | Customer-facing storefront | Ships with cart, checkout, region/tax handling, and payment integration already wired against Medusa's API, avoiding a from-scratch reimplementation with no maintained upgrade path. SSR/SEO supports organic product discovery. See `TECH_STACK.md`. |
| **Sanity** (recommended, not urgent, not yet formally approved) | Content management (marketing/editorial content) | Kept strictly separate from commerce data, synced one-way from Medusa. Real-time collaborative editing, strong localization, official Medusa integration pattern. See `MEDUSA_EXTENSIONS.md` #7. |
| **Meilisearch** (recommended, not yet formally approved) | Product search and discovery | Open-source, officially documented Medusa integration, strong faceting for wine/food attribute filtering — the lowest-integration-risk option versus Algolia/Elasticsearch/Typesense. See `MEDUSA_EXTENSIONS.md` #6. |
| **PostgreSQL** | Primary relational database (via Medusa) | Medusa's own requirement; ACID-compliant and battle-tested for transactional integrity of orders, payments, and inventory. |
| **Redis** | Caching, session storage, background jobs/event queues | Required for production Medusa (its in-memory dev mode is explicitly not production-appropriate). Keeps checkout, search, and session operations fast under load. |

Payment provider and delivery-notification channel are **not yet decided** — see Section 6 and `MEDUSA_EXTENSIONS.md` #4–#5.

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
- **Company-owned riders** fulfill all Food Central delivery — no third-party courier/dispatch platform. (Wine & Spirits' nationwide delivery mechanism — in-house fleet vs. courier partner — is still open; see Section 6.)
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

## 5. Documentation Guide

`/docs` contains 19 documents. `README.md` (inside `/docs`) is the detailed document map with cross-links; this table adds ownership and update cadence for each.

| Document | Purpose | Owner | Update when |
|---|---|---|---|
| `AI_HANDOFF.md` (this file, repo root) | Project-level onboarding; single source of truth entry point | Paul (final approver); maintained by whichever session makes the last approved change | Immediately on any business, architecture, tech-stack, or phase change |
| `docs/README.md` | Documentation index, reading order, continuity rules | Same | Whenever a document is added/removed/restructured |
| `docs/PROJECT_STATUS.md` | Current phase, completed/in-progress/blocked work, open questions | Whoever is actively working; approved by Paul | Every session — "an out-of-date status is a bug" |
| `docs/PRODUCT_BLUEPRINT.md` | Product vision, positioning, and 18 strategic pillars (with reasoning + Medusa impact per pillar) | Paul (approval pending on v1) | When a strategic/product decision changes |
| `docs/BUSINESS_RULES.md` | Finalized, non-negotiable business decisions | Paul | Only when Paul explicitly revisits a rule |
| `docs/ARCHITECTURE.md` | How the vendored Medusa codebase is structured, and the module-isolation rule | Engineering | When the Medusa version changes materially, or conventions change |
| `docs/MEDUSA_EXTENSIONS.md` | Authoritative catalog of every custom module/extension needed, with risk and approval status | Engineering; per-item approval from Paul | Before building anything not already listed here |
| `docs/API_DECISIONS.md` | Native vs. custom API routes, and why | Engineering | Whenever a new route is anticipated or built |
| `docs/TECH_STACK.md` | Full technology stack end to end, confirmed vs. recommended | Engineering; sign-off from Paul | Any stack component change, logged in `DECISION_LOG.md` |
| `docs/INFORMATION_ARCHITECTURE.md` | Site/navigation structure for both product lines | Product; merchandising input from Paul | When IA/category structure changes |
| `docs/PRODUCT_CATALOG.md` | How Wine & Spirits and Food Central products are modeled; proposed attribute field lists | Paul/merchandising (field lists); engineering (structure) | When attribute field lists are finalized or changed |
| `docs/DELIVERY_MODEL.md` | Delivery/pickup/scheduling strategy for both product lines | Paul (ops decisions); engineering (mechanics) | When delivery/ops decisions change |
| `docs/USER_FLOWS.md` | Step-by-step customer journeys (no visuals) | Product | When a flow's steps change |
| `docs/DESIGN_SYSTEM.md` | Design *principles* (spacing, type scale, accessibility, grid, motion) — no visual tokens yet | Design/Paul | When principles change, or once visual tokens are ready to be added |
| `docs/BRAND_IDENTITY.md` | Brand personality, philosophy, emotional direction, and visual/verbal *principles* (v1 drafted) — the durable strategic layer | Paul (approval pending on v1) | When a personality, voice, or principle-level decision changes; new entries logged in `DECISION_LOG.md` |
| `docs/BRAND_GUIDELINES.md` | **Partially populated.** Asset-level execution (logo, chosen typeface, finished photography library, tone-of-voice example bank) not yet produced — see `BRAND_IDENTITY.md`'s reconciliation note for the full division of responsibility | Paul / a designer, once engaged | As each concrete asset is produced |
| `docs/ROADMAP.md` | Phased build sequence (no dates) | Paul/engineering | When sequencing or phase scope changes |
| `docs/DECISION_LOG.md` | Append-only record of every material decision: what, why, when, impact, status | Whoever makes/logs the decision | Every material decision — append a new entry, never edit an old one |
| `docs/CHANGELOG.md` | Changelog of the documentation set itself (not the product) | Whoever adds/removes/restructures a document | Whenever `/docs` itself changes |

---

## 6. Current Project State

*(Condensed from `docs/PROJECT_STATUS.md` — that file is the detailed, always-current version. If the two ever disagree, `docs/PROJECT_STATUS.md` wins and this section should be updated to match.)*

**Completed**
- Business model finalized: single company, no marketplace, no vendors.
- `PRODUCT_BLUEPRINT.md` v1 drafted (18 sections, each with reasoning, business benefit, and Medusa impact).
- Full architecture research of the vendored Medusa codebase, distilled into `ARCHITECTURE.md`.
- Technology recommendations researched (storefront, search, CMS, auth), distilled into `TECH_STACK.md` and `MEDUSA_EXTENSIONS.md`.
- UX/product research (premium commerce, wine retail, food ordering, Nigerian-market conventions), distilled into `PRODUCT_BLUEPRINT.md`, `USER_FLOWS.md`, `DELIVERY_MODEL.md`.
- Medusa v2 vendored as a git submodule.
- Full `/docs` documentation system established and, as of the 2026-07-18 audit, consolidated onto one working branch (see the provenance note at the top of this document).
- **Brand Identity v1 drafted** (`BRAND_IDENTITY.md`) — personality, mission, values, voice/tone, emotional and perception goals, positioning, and visual/verbal principles (including usage guidance for the four approved brand colors). Awaiting Paul's review and approval.

**In Progress**
- Nothing actively in progress. The next step is Paul's review of `BRAND_IDENTITY.md` (below).

**Not Started**
- Any implementation code, UI design, or wireframes — none have been produced anywhere in this project.
- The Design System's visual tokens (typeface selection, finalized component library) — see Section 7; blocked until `BRAND_IDENTITY.md` is approved.
- Asset-level brand execution (logo, finished photography library, tone-of-voice example bank — tracked in `BRAND_GUIDELINES.md`).
- All custom Medusa modules listed in `MEDUSA_EXTENSIONS.md` (wine-details, food-details, delivery-slot scheduling, payment provider, notification provider), and the search/CMS integrations.

**Blocked**
- **Design System visual-token work** is blocked until `BRAND_IDENTITY.md` v1 is reviewed and approved by Paul — this is an explicit instruction, not an inferred one.
- **Payment provider is undecided**, which blocks the start of `ROADMAP.md` Phase 1 (a launch blocker).

**Awaiting Paul's Approval** (full list with document references in `docs/PROJECT_STATUS.md`)
- **`BRAND_IDENTITY.md` v1 as a whole** — required before the Design System phase may begin.
- Wine & Spirits' nationwide delivery mechanism (in-house fleet vs. courier partner) and whether cash-on-delivery is offered at all.
- Local payment provider choice (e.g. Paystack, Flutterwave) — **launch-blocking**.
- Delivery-update channel(s) (WhatsApp Business API and/or SMS).
- Exact age-gate mechanics (session duration; site-wide vs. alcohol-section-only) and whether a hard compliance re-check happens at order confirmation.
- Alcohol return/refund policy.
- Final field lists for the wine-attributes and food-attributes modules, and who owns allergen/ingredient data accuracy operationally.
- Delivery-slot operational parameters (slot length, cutoff times, capacity).
- Exact curated/occasion collections for Wine & Spirits (a merchandising decision).
- Formal sign-off on the Next.js Starter, Meilisearch, and Sanity recommendations (currently "recommended," not "confirmed").
- The real brand story (`BRAND_IDENTITY.md` §9) and the remaining asset-level brand items in `BRAND_GUIDELINES.md`.

---

## 7. Immediate Next Step

The next phase is **Design System** — but it has not started, and **must not start until `BRAND_IDENTITY.md` v1 is reviewed and approved by Paul.** This is now an explicit instruction (given when `BRAND_IDENTITY.md` was commissioned), not an inference.

The tension this document previously flagged (Design System vs. undefined brand identity) is now partially resolved: `BRAND_IDENTITY.md` v1 exists and defines the personality, voice, emotional direction, and visual/verbal *principles* the Design System phase must be consistent with — including usage guidance for the four approved brand colors (`BRAND_IDENTITY.md` §13). What it does not yet provide is the specific typeface, finished photography, or a logo — those remain open, asset-level items in `BRAND_GUIDELINES.md`.

**This is explicitly not:** implementation, coding, UI design, mockups, or wireframing, at any point in this sequence. Design System work, once it may begin, is still a foundations-first step — spacing scale, type scale, accessibility baseline, grid, and motion principles applied concretely — not screens.

**Sequence, in order:**
1. Paul reviews and approves `BRAND_IDENTITY.md` v1. **Do not proceed past this step without that approval.**
2. Only then does the Design System phase begin: applying `BRAND_IDENTITY.md`'s principles and `DESIGN_SYSTEM.md`'s structural rules into concrete visual tokens (typeface selection, spacing/type scale applied, iconography, component library groundwork).
3. UI design, wireframes, and implementation follow later, per `ROADMAP.md`.

Do not skip step 1 by assuming Paul's approval, and do not treat `BRAND_IDENTITY.md`'s existence as itself sufficient to begin visual token work.

---

## 8. Rules for Future AI Sessions

Every future AI assistant working on this project must:

1. **Read `AI_HANDOFF.md` first** (this document).
2. **Read `docs/PROJECT_STATUS.md` second** — it is the detailed, always-current status; this document's Section 6 is a condensed mirror of it.
3. **Consult the relevant documentation** in `/docs` before answering questions or making changes, rather than guessing.
4. **Treat the documentation as the single source of truth** — not memory, not assumption, not inference from the codebase alone.
5. **Never rely on previous chat history.** Assume no prior conversation exists or is accessible. If something a user describes as "already created" or "already decided" doesn't appear in `/docs` on the current branch, check `git log --all` / `git branch -r` before concluding it doesn't exist — it may be sitting on an unmerged branch, as happened here (see the provenance note at the top of this document and `DECISION_LOG.md`). Do not fabricate content to fill the gap either way.
6. **Never contradict approved business decisions** (Section 3) or architecture decisions (Section 4).
7. **Never introduce marketplace concepts** — multi-vendor support, seller onboarding, vendor modules, commission/payout logic — unless Paul explicitly changes the business model. If asked to build something that resembles a marketplace feature, stop and confirm with Paul rather than proceeding.
8. **Never invent business or brand decisions.** Where a document has a placeholder or an open question (Section 6), leave it open and flag it for Paul rather than assuming an answer.
9. **Log every material decision** in `docs/DECISION_LOG.md` (append, don't edit old entries) and keep `docs/PROJECT_STATUS.md` current in the same change.

---

## 9. Project Principles

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

## 10. Versioning

| Field | Value |
|---|---|
| Document Version | 2.1 |
| Last Updated | 2026-07-18 |
| Project Phase | Product Definition — documentation consolidated; `BRAND_IDENTITY.md` v1 drafted; awaiting Paul's review and approval of both, plus other open questions (Section 6) |
| Next Planned Milestone | Design System phase — gated on `BRAND_IDENTITY.md` approval; do not begin visual-token work before then (Section 7) |
