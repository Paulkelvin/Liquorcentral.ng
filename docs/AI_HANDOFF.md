# AI Handoff Document — LiquorCentral.ng

**This is the primary onboarding document for this project.** If you are a new developer or a new AI session, read this document in full before touching code, writing content, or answering questions about the project. Do not rely on prior chat history — none is available to you, and none should be assumed to exist. This document, and the rest of `/docs`, is the single source of truth.

> **Repository note (as of this writing):** `/docs` currently contains only this file. There is no `PROJECT_STATUS.md` or any other document in the repository yet — the project's business and architecture decisions have, until now, existed only in conversation and are being formalized here for the first time. Section 5 explains what this means for future sessions, and Section 6 stands in for a `PROJECT_STATUS.md` until one is created.

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

**Food Central** is a food delivery subsidiary of the same company. It is not a separate business, a spin-off, or a marketplace of independent restaurants — it is a second product line operated by LiquorCentral under the same corporate structure, same storefront, and same underlying commerce platform. Unlike liquor and wine (nationwide), Food Central currently operates in **Lagos only**, reflecting the operational realities of same-day, perishable food delivery.

**Business model:** One company, two product lines, no third-party vendors. All inventory (liquor, wine, and food) is company-owned. All delivery is fulfilled by company-owned riders — not a gig-economy logistics marketplace. Customers can check out as guests, must confirm legal drinking age before purchasing alcohol, and can choose between same-day delivery, scheduled delivery, or pickup depending on product line and location.

**Current project phase:** Documentation. All core business and architecture decisions have been finalized and are recorded in this document. No implementation, UI, or wireframe work has begun. The project is about to transition into the **Design System** phase (see Section 7).

**Product vision:** Become Nigeria's most trusted premium destination for buying liquor and wine online, with food delivery as a complementary, same-day convenience offering in Lagos. Every part of the product — from search to checkout — should reduce friction and increase the customer's confidence that they are buying the right product from a legitimate, premium operator.

---

## 2. Current Technology

| Technology | Role | Why it was chosen |
|---|---|---|
| **Medusa** | Headless commerce engine — carts, checkout, orders, inventory, product catalog, customers | Open-source, self-hostable, and built on Node.js/TypeScript. Provides commerce fundamentals out of the box while remaining fully extensible via custom modules — necessary because the business has requirements a closed SaaS platform (e.g., Shopify) would make difficult or expensive: age verification, two product lines with different attribute schemas, and company-owned delivery logistics. Avoids vendor lock-in and per-transaction platform fees at scale. |
| **Next.js** | Customer-facing storefront | Industry-standard React framework. Server-side rendering and static generation deliver fast page loads and strong SEO — important for organic discovery of liquor, wine, and food products. Supports the fast, polished, premium-feeling experience the brand requires on both mobile and desktop. |
| **Sanity** | Content management (marketing pages, banners, editorial/brand content) | Headless CMS that keeps structured marketing and editorial content separate from transactional commerce data in Medusa. Real-time collaborative editing lets non-technical team members update content without engineering involvement or deploys. |
| **Meilisearch** | Product search and discovery | Lightweight, self-hostable, typo-tolerant search engine that returns instant, relevant results. Chosen over heavier options (e.g., Elasticsearch) for simpler operations and faster relevance tuning — important given the catalog spans two distinct product lines with different attributes. |
| **PostgreSQL** | Primary relational database (via Medusa) | ACID-compliant and battle-tested for transactional integrity of orders, payments, and inventory. Non-negotiable for a commerce platform handling real money and real stock. It is also Medusa's default and best-supported database. |
| **Redis** | Caching, session storage, background jobs/event queues | Keeps checkout, search, and session operations fast under concurrent load and reduces pressure on PostgreSQL. Used by Medusa's event bus and job queue infrastructure. |

---

## 3. Business Decisions

The following business decisions are **finalized and approved**. Do not contradict, re-litigate, or silently revise any of these without Paul's explicit sign-off.

- **Single company.** LiquorCentral is one company operating its own product lines — not a federation of independent sellers or brands.
- **Not a marketplace.** No third-party vendors sell through the platform. There is no vendor onboarding, no seller storefronts, and no commission model.
- **Food Central is a subsidiary product line, not a separate business.** It shares the same company, same storefront, and same commerce platform as LiquorCentral.
- **Wine (and liquor) ships nationwide** across Nigeria.
- **Food is Lagos-only.** Food Central's delivery service does not currently extend beyond Lagos, due to the operational demands of same-day, perishable delivery.
- **Same-day food delivery** is a core Food Central offering.
- **Scheduled delivery** is supported — customers can choose a future date/time window rather than immediate delivery.
- **Pickup** is supported as an alternative to delivery.
- **Company-owned riders.** Delivery is fulfilled by riders employed or contracted directly by the company — not by a third-party gig-logistics marketplace.
- **Guest checkout** is supported — customers can complete a purchase without creating an account.
- **Age confirmation** is required before any alcohol purchase can be completed.
- **Premium positioning.** The brand is positioned as a premium, trustworthy retailer — not a discount or bargain-driven platform. This informs tone, visual design, and product presentation across the entire product.

---

## 4. Major Architecture Decisions

### Approved

- **One Medusa instance.** A single backend serves both product lines (liquor/wine and food) rather than separate backend deployments per business line.
- **One storefront.** A single Next.js application serves both the LiquorCentral and Food Central customer experiences — there is no separate app or subdomain-as-a-separate-product split.
- **Two product lines.** Liquor/wine and food are modeled as two distinct product lines within the shared catalog, reflecting their different regulatory, fulfillment, and geographic constraints.
- **Two attribute modules.** Each product line has its own product attribute schema — e.g., ABV, volume, and vintage for liquor/wine; perishability, prep time, and dietary tags for food — because the two product lines have fundamentally different data needs. Both live inside the single Medusa instance.

### Rejected / Superseded

These are recorded intentionally, not deleted, so future sessions understand what was considered and explicitly ruled out. **Do not reintroduce these unless Paul explicitly changes the business model.**

- **Marketplace architecture — REJECTED.** A multi-vendor marketplace model was considered and formally rejected in favor of the single-company, company-owned-inventory model described in Section 3.
- **Vendor modules — REJECTED.** No seller onboarding, vendor storefronts, split payments, or commission/payout logic will be built. Any Medusa vendor/marketplace modules or plugins are explicitly out of scope.

---

## 5. Documentation Guide

At the time of writing, `docs/AI_HANDOFF.md` is the **only** document in `/docs`. There is nothing else to reconcile it against yet.

| Document | Purpose | Owner | Update when |
|---|---|---|---|
| `docs/AI_HANDOFF.md` (this file) | Primary onboarding document and single source of truth for business decisions, architecture decisions, and project state. First document any developer or AI session should read. | Paul (final approver of content); updated by whichever developer or AI session makes the last approved change | Immediately, whenever a business decision, architecture decision, technology choice, or project phase changes. Never let this file go stale — a stale handoff doc is worse than no handoff doc. |

**As the project grows, expect additional documents to be added here** — for example, a dedicated `PROJECT_STATUS.md` for granular task-level status, an architecture reference, or a design system specification once that phase begins. Each new document added to `/docs` should get its own row in this table describing its purpose, owner, and update cadence. Until such documents exist, do not assume them — this table is the accurate record of what actually exists in the repository.

---

## 6. Current Project State

*(This section is the current source of truth for project status. A dedicated `PROJECT_STATUS.md` does not yet exist — if one is created later, keep it in sync with this section, or replace this section with a pointer to it.)*

**Completed**
- Core business model decisions finalized (Section 3).
- Core architecture decisions finalized, including explicit rejection of the marketplace model (Section 4).
- Technology stack selected (Section 2).
- This handoff document created as the project's foundational documentation artifact.

**In Progress**
- Nothing is actively in progress at the time of writing. This documentation task is the most recent completed work.

**Not Started**
- Design System (visual identity, color, typography, spacing/grid, component tokens).
- UI/UX design and wireframes.
- Implementation of Medusa modules (product attribute modules for the two product lines, age-verification logic, rider/fulfillment logic).
- Sanity schema design.
- Meilisearch index configuration.
- Infrastructure/deployment setup.

**Blocked**
- Nothing is currently blocked.

**Awaiting Paul's Approval**
- The Design System direction (visual identity, palette, typography) once that phase begins.
- Any future decision that would alter, extend, or contradict the business or architecture decisions recorded in Sections 3 and 4.

---

## 7. Immediate Next Step

The next phase of this project is the **Design System** phase.

This means: establishing the visual and structural foundations the product will be built on — a color palette, typography scale, spacing/grid system, and premium-appropriate design tokens — grounded in the premium positioning described in Section 3.

**The Design System phase is explicitly not:**
- Implementation or coding.
- UI design.
- Wireframing.

It is a foundations-first step that precedes all of the above. No implementation, UI, or wireframe work should begin until the Design System phase is complete and approved by Paul.

---

## 8. Rules for Future AI Sessions

Every future AI assistant working on this project must:

1. **Read `docs/AI_HANDOFF.md` first.**
2. **Read `docs/PROJECT_STATUS.md` second** — if it exists. As of this writing it does not; until it is created, use Section 6 of this document as the current project state.
3. **Consult the relevant documentation** in `/docs` before answering questions or making changes, rather than guessing.
4. **Treat the documentation as the single source of truth** — not memory, not assumption, not inference from the codebase alone.
5. **Never rely on previous chat history.** Assume no prior conversation exists or is accessible.
6. **Never contradict approved business decisions** (Section 3) or architecture decisions (Section 4).
7. **Never introduce marketplace concepts** — multi-vendor support, seller onboarding, vendor modules, commission/payout logic — unless Paul explicitly changes the business model. If asked to build something that resembles a marketplace feature, stop and confirm with Paul rather than proceeding.

---

## 9. Project Principles

These principles guide every future decision on this project, from design through implementation:

- **Premium over flashy.** Restraint and quality signal trust; novelty for its own sake does not.
- **Simplicity over feature bloat.** Ship what customers need to buy with confidence, not everything that's technically possible.
- **Documentation before implementation.** Decisions get written down and approved before code gets written.
- **Extend Medusa, never modify its core.** Custom logic lives in extensions and modules, not in forked core code, to keep the platform upgradeable.
- **Research principles, never copy competitors.** Design and product decisions should be grounded in what works for customers, not in mimicking other retailers.
- **Every page should reduce friction and increase purchase confidence.** This is the standard every screen and flow is judged against.
- **Mobile-first.** Design and build for mobile as the primary experience, not an afterthought.
- **Accessibility by default.** Accessibility is a baseline requirement, not a later pass.
- **Performance matters.** Speed is part of the premium experience, not a separate concern from it.

---

## 10. Versioning

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Last Updated | 2026-07-18 |
| Project Phase | Documentation complete → entering Design System |
| Next Planned Milestone | Design System foundations (color, typography, spacing/grid, design tokens) |
