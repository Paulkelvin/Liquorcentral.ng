# Decision Log

**Status:** Approved (living, authoritative record)
**Version:** 1.0
**Owner:** Program
**Last Updated:** 2026-07-18

**Purpose:** A running, append-only record of every material business or architecture decision made on this project — what was decided, why, when, and what it affects. This is the authoritative history; chat conversations are not. When a decision changes, add a new entry rather than editing an old one, so the history of *why* things changed is preserved.

**Format:** newest entries at the top. Each entry: Decision → Reasoning → Date → Impact → Status.

---

### Repository reconciliation: two unmerged documentation branches merged into one authoritative branch

- **Decision:** Paul directed a full repository reconciliation as the project's highest priority, ahead of any further Product Specification work. An audit (prompted by a new session finding no `/docs` directory at all on its assigned working branch, which had forked from `main` before any documentation existed) found two independently-authored git branches, both containing real, committed project documentation, neither merged into `main`: `claude/medusa-repo-clone-ut5dl5` (containing the full `/docs` set through Phase 0's completion and Phase 1's opening — the more current of the two) and `claude/ai-handoff-docs-ufdn5t` (containing `docs/AI_HANDOFF.md`, plus older copies of the shared documents frozen at the point the two branches' common ancestor diverged). Each branch's own `PROJECT_STATUS.md` was unaware the other branch existed; `claude/medusa-repo-clone-ut5dl5`'s copy specifically reported the `AI_HANDOFF.md` work as lost, which was inaccurate — it was simply on a branch that had not been checked. `claude/medusa-repo-clone-ut5dl5` was merged into the working branch first (a fast-forward, since the working branch had no commits of its own yet), then `claude/ai-handoff-docs-ufdn5t` was merged on top using a merge strategy that kept `claude/medusa-repo-clone-ut5dl5`'s versions of every document both branches had modified (the more current work), while cleanly picking up `docs/AI_HANDOFF.md` — the one file genuinely unique to the other branch. No document was rewritten from scratch; existing content was merged, not recreated.
- **Reasoning:** Documentation is this project's single source of truth (see `README.md`'s continuity rules); a source of truth split across two divergent, unmerged branches — each unaware of the other — defeats that purpose and risks future sessions duplicating or contradicting work that already exists. Reconciling onto one branch, while preserving full history from both, restores a genuine single source of truth without losing any prior work.
- **Date:** 2026-07-18
- **Impact:** The working branch now contains the full `/docs` set (20 files plus the 11-file `specifications/` directory) and the `medusa` git submodule, all with intact commit history from both source branches. `docs/AI_HANDOFF.md` was recovered and substantially rewritten (v3.0) to reflect the reconciled, current project state — it no longer describes the pre-Phase-0 "Product Definition" phase, and its provenance note now accurately describes this reconciliation rather than the earlier (incomplete) one a prior session believed had already happened. `docs/README.md` was corrected: its `AI_HANDOFF.md` link pointed to a nonexistent root-level file (`../AI_HANDOFF.md`) instead of the actual location (`docs/AI_HANDOFF.md`), and its "Start here" reading order had not been updated to list `AI_HANDOFF.md` first despite the document map already doing so. `docs/PRODUCT_BLUEPRINT.md`'s status header — a separate inconsistency this audit surfaced, unrelated to the branch merge itself — was corrected from "Draft — pending Paul's review and approval" to "Approved — Frozen as Phase 0 foundation," matching `PROJECT_STATUS.md` and this log's own prior entries, which had already been describing it as approved and frozen alongside `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md`. `docs/PROJECT_STATUS.md`'s "lost work" blocker was corrected and moved to Completed work.
- **Status:** Final. This branch is now the single authoritative documentation branch. Per Paul's explicit instruction, no further Product Specification work (Navigation or otherwise) begins until this reconciliation itself is reviewed and approved.

### Phase 0 declared complete and frozen; Phase 1 — Product Specifications opened

- **Decision:** Paul declared Phase 0 complete, naming `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0 as the authoritative foundation of the project, **not to be modified unless a business decision changes**. He opened a new phase — Product Specifications — directing creation of a `/docs/specifications/` directory with 11 numbered specification files, of which only `02_HOMEPAGE_SPECIFICATION.md` should be fully developed in this round; the other 10 (`01`, `03`–`11`) should be created as approved placeholders (Document Purpose, Scope, Dependencies, Planned Sections, Status = Not Started) with their detailed content explicitly not invented yet. Limited research into modern e-commerce UX patterns and usability evidence was authorized to strengthen reasoning, with an explicit instruction not to copy layouts, branding, UI components, or proprietary visual designs from that research.
- **Reasoning:** With brand, experience, and design-token foundations settled, the project needs implementation-ready behavioral specifications — detailed enough for a UX designer to design, a frontend developer to build, a backend developer to understand data needs, and a QA engineer to derive test cases — before component or page-level design work begins. Freezing the four Phase 0 documents prevents scope drift: specifications must derive from settled decisions, not renegotiate them.
- **Date:** 2026-07-18
- **Impact:** New `/docs/specifications/` directory with 11 files. `02_HOMEPAGE_SPECIFICATION.md` drafted in full (v0.1): 9 homepage sections (Persistent Header/Shell, Age Verification Gate, Hero, Curated Collections, Food Central Spotlight, Wine & Food Connected, Trust & Delivery Band, Returning Customer Strip, Footer), each broken into a 9-part behavior structure; an explicit no-auto-rotating-carousel decision grounded in cited research (near-zero engagement, accessibility risk, LCP harm); an explicit surfacing of the nationwide-Wine-vs-Lagos-only-Food-Central distinction directly on the homepage; a concrete LCP-under-2.5s-at-p75-mobile performance target; 8 named analytics events; and a flagged gap that the "Wine & Food, Connected" section's backend product-relationship data does not yet exist in `MEDUSA_EXTENSIONS.md`. The other 10 files created as placeholders only. `README.md`, `PROJECT_STATUS.md`, and `ROADMAP.md` (new Phase 0d) updated to reflect the new phase and each specification's status.
- **Status:** Final on Phase 0's closure and the four documents' frozen status. `02_HOMEPAGE_SPECIFICATION.md` itself is in progress (v0.1, drafted, not yet approved by Paul).

### `DESIGN_SYSTEM.md` v2.0 finalized and frozen — authoritative Design System foundation

- **Decision:** Following approval of the Color Architecture and its WCAG validation, Paul requested one final refinement before freezing the document: (1) reorganize color tokens around **semantic intent** as the system's canonical language — Primary, Secondary, Accent, Surface, Surface Elevated, Text Primary, Text Secondary, Border, Divider, Focus, Interactive/Interactive Hover/Interactive Active, Disabled, Success, Warning, Danger, Information — rather than literal or purely functional naming; (2) design the token architecture so future themes (dark mode, seasonal themes, brand refreshes, accessibility themes) can be introduced without changing component code, documented even though only the default theme exists today; (3) add a **Component Philosophy** section before any component specification begins; (4) conclude with a **Design Quality Checklist** every future component must satisfy.
- **Reasoning:** Semantic-intent naming (not "the red button" but "Primary") is what lets designers and developers share one vocabulary and lets the underlying colors change without changing what anyone calls them. A theme-ready architecture and an explicit component philosophy are what make this document a genuine long-term foundation rather than a one-time color spec.
- **Date:** 2026-07-18
- **Impact:** `DESIGN_SYSTEM.md` §B6 Tier 3 rewritten around the canonical semantic names above (dot-notation tokens kept as the implementation-layer reference beneath each name). New **Surface Elevated** (`#FFFFFF`, paired with the existing elevation shadows) and **Interactive States** (hover/active as percentage-based overlays applied to whichever base color is in use, rather than fixed per-color hex values — chosen specifically because it generalizes automatically to any future theme) added to close gaps in the prior draft. New **Future Theme Support**, **Component Philosophy**, and **Design Quality Checklist** sections added. Document status updated to **Approved — Authoritative Foundation (frozen)**, version bumped to **2.0**. `PROJECT_STATUS.md` and `ROADMAP.md` updated to reflect Phase 0 (Brand & Design Foundation) as fully complete with no open items, and a new Phase 0c (component specification, not yet started) named as the next frontend-track step.
- **Status:** Final. `DESIGN_SYSTEM.md` v2.0 is the authoritative foundation for all future UI and component work; any future change to it should be a new, dated entry here, not a silent edit.

### Design System Foundations approved overall; Color Architecture refined into three explicit tiers

- **Decision:** Paul approved the overall Design System Foundations direction, and requested one specific refinement: `DESIGN_SYSTEM.md` §B6 restructured to explicitly separate **Tier 1 (Brand Colors — fixed, unchanged)**, **Tier 2 (Functional UI Colors — Success/Warning/Danger/Info, independent of brand meaning)**, and **Tier 3 (Semantic Design Tokens — `color.primary`, `color.text.primary`, `color.danger`, etc., the only thing components reference)**. Gold's role is now explicitly restricted to premium/curation contexts only, never a functional state (errors, warnings, success, info, validation). Danger uses a distinct deep red (`#B3261E`) rather than reusing Primary Red, so "buy now" and "something's wrong" are never the same color. A full Neutral System (7 grayscale steps) was documented for typography, borders, dividers, disabled states, cards, backgrounds, and overlays, with every text-bearing step verified to pass WCAG AA on the Off White base.
- **Reasoning:** Paul's feedback identified that the prior draft's functional-color reasoning was too loosely connected to Gold (describing Warning as a "family member" of Gold risked exactly the conflation he wanted avoided) and that color roles needed a clearer architecture (raw brand colors vs. functional colors vs. the tokens components actually reference) so the brand can evolve without rewriting components.
- **Date:** 2026-07-18
- **Impact:** `DESIGN_SYSTEM.md` §B6 rewritten in full (v2.1) as "Color Architecture," including a full token-reference table and an explicit "Consistency check" confirming every recommendation traces back to `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `PRODUCT_BLUEPRINT.md` rather than redefining them. `PROJECT_STATUS.md` and `ROADMAP.md` updated to narrow the remaining open item to the four specific Tier 2 hex values (Warning `#B45309`, Danger `#B3261E`, Info `#2B6CB0`) plus the Neutral System's general approach.
- **Status:** Overall direction and architecture approved. The four specific Tier 2 color values remain pending Paul's confirmation before shipping in UI.

### Design System Foundations v1 drafted (`DESIGN_SYSTEM.md` Part B)

- **Decision:** `DESIGN_SYSTEM.md` restructured into Part A (Principles, already approved) and Part B (Foundations v1, new): concrete typography scale, spacing scale, grid system, elevation/shadows, border radius, semantic color roles, motion timing, breakpoints, icon sizing, form behaviors, and accessibility tokens.
- **Reasoning:** Direct continuation of the agreed Design System Foundations approach (previous entry below), now with actual proposed values rather than a plan to make them.
- **Date:** 2026-07-18
- **Impact:** `DESIGN_SYSTEM.md` rewritten (v2.0). One new item introduced and flagged for approval: five functional colors not among the four originally approved brand colors — a neutral grayscale (`color-text`/`color-text-muted`/`color-border`) plus distinct `color-danger`, `color-warning`, `color-info`, and `color-focus-ring` colors, needed because the four approved brand colors don't safely cover neutral text/border use or distinguishable warning/danger/info states without either failing WCAG contrast or overloading an existing role's meaning (e.g. reusing Primary Red for both "buy now" and "error"). **The four originally approved brand colors are unchanged** — this proposes additions, not modifications. See `DESIGN_SYSTEM.md` §B6 for full reasoning and proposed hex values.
- **Status:** Draft. Everything in Part B except §B6's five new colors can be treated as settled; §B6 awaits Paul's confirmation or adjustment before shipping in UI.

### Brand Identity and Experience Principles approved in full

- **Decision:** Paul confirmed both `BRAND_IDENTITY.md` v1 and `EXPERIENCE_PRINCIPLES.md` v1.0 as approved in full, lifting the Phase 0 gate on Design System/UI work.
- **Reasoning:** Following the finalized positioning statement/category definition and the Design System Foundations recommendation, Paul confirmed (via direct question) that this constituted full approval of both documents rather than a partial/in-progress review.
- **Date:** 2026-07-18
- **Impact:** Both documents' status headers updated to Approved. `PROJECT_STATUS.md` and `ROADMAP.md` Phase 0 updated to reflect completion. Cleared the way for `DESIGN_SYSTEM.md` Part B (next entry above/below, chronologically the next thing built).
- **Status:** Final.

### Document status convention adopted across `/docs`

- **Decision:** Every document in `/docs` now carries a standard metadata header directly under its title: `Status` (Draft | Under Review | Approved | Superseded), `Version`, `Owner`, `Last Updated`.
- **Reasoning:** Paul proposed this as a way for anyone joining the project to instantly see which documents are still being discussed vs. authoritative, without reading the whole file or asking in chat — a natural extension of the existing "documentation is the project's memory" discipline.
- **Date:** 2026-07-18
- **Impact:** All 19 files in `/docs` updated with the new header. The convention itself is documented in `README.md` → "Document status convention." Current status assignments: `BUSINESS_RULES.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `CHANGELOG.md`, `README.md`, and `PROJECT_STATUS.md` are Approved; `BRAND_IDENTITY.md` and `EXPERIENCE_PRINCIPLES.md` are Under Review (partially finalized — see below); everything else is Draft.
- **Status:** In effect.

### Positioning Statement and Category Definition finalized by Paul

- **Decision:** `BRAND_IDENTITY.md` §10's Positioning Statement and `EXPERIENCE_PRINCIPLES.md`'s Category Definition were both rewritten in Paul's own words: "LiquorCentral is Nigeria's premium destination for curated wines, spirits, and complementary culinary experiences — bringing exceptional products, trusted service, and effortless commerce together in one unified brand" (positioning), and "LiquorCentral operates as a Premium Lifestyle Commerce Platform, combining premium beverages and complementary Nigerian cuisine within one seamless customer experience" (category).
- **Reasoning:** Resolves the reconciliation flagged in the prior entry below and in `PROJECT_STATUS.md` — the two statements now read consistently, one naming the audience/promise/differentiator, the other naming the market category.
- **Date:** 2026-07-18
- **Impact:** `BRAND_IDENTITY.md` §10 (plus new §10a cross-reference) and `EXPERIENCE_PRINCIPLES.md`'s Competitive Positioning section updated with the final text. The corresponding open item removed from `PROJECT_STATUS.md`.
- **Status:** Final for these two statements specifically. The surrounding documents (`BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`) remain Under Review in full — see `PROJECT_STATUS.md` for the specific confirmation still needed from Paul.

### Design System Foundations approach agreed (pending gate confirmation)

- **Decision:** The next phase, once `BRAND_IDENTITY.md`/`EXPERIENCE_PRINCIPLES.md` approval is confirmed, is to define concrete Design System Foundations — typography scale, spacing scale, grid system, elevation/shadows, border radius, semantic color roles, motion timing, breakpoints, icon sizing, form behaviors, and accessibility tokens — rather than jumping directly to page-level UI design.
- **Reasoning:** Paul's recommendation: foundational rules, agreed once, make every subsequent component and screen consistent by construction, rather than requiring ad hoc decisions repeatedly.
- **Date:** 2026-07-18
- **Impact:** Documented as `ROADMAP.md` Phase 0b. `DESIGN_SYSTEM.md` is the document that will hold these foundations once written.
- **Status:** Agreed as the plan. Not yet started — blocked on the Phase 0 approval-gate confirmation noted in `PROJECT_STATUS.md`.

### Experience Principles v1.0 drafted

- **Decision:** `EXPERIENCE_PRINCIPLES.md` created as a third foundational document, distinct from `BRAND_IDENTITY.md`: 15 principles governing how customers should experience every screen, feature, and interaction (e.g. Confidence Before Complexity, Simplicity Before Features, Premium Through Discipline, Guide Without Intimidating, Accessibility Is Premium), plus a product vision, a "Premium Lifestyle Commerce Platform" competitive-positioning frame, and a single success-metric test for design decisions.
- **Reasoning:** Paul supplied this document directly to establish the qualitative UX bar every future feature/screen/interaction/workflow must be evaluated against, complementing (not duplicating) `BRAND_IDENTITY.md`'s identity/personality focus and `PRODUCT_BLUEPRINT.md`'s strategic-decision focus.
- **Date:** 2026-07-18
- **Impact:** New `docs/EXPERIENCE_PRINCIPLES.md`. Added to the `DESIGN_SYSTEM.md`/UI approval gate alongside `BRAND_IDENTITY.md` in `PROJECT_STATUS.md` and `ROADMAP.md` Phase 0. Flagged one open reconciliation: this document's "Premium Lifestyle Commerce Platform" category framing and `BRAND_IDENTITY.md` §10's formal Positioning Statement describe the same thing from different angles and should be reconciled into one consistent external description before either is used in customer-facing copy.
- **Status:** Drafted — awaiting Paul's approval. Not yet a final decision.

### Brand Identity v1 drafted, with four brand colors approved as fixed inputs

- **Decision:** `BRAND_IDENTITY.md` v1 created as the strategic/emotional brand foundation (vision, mission, values, personality, voice, tone, positioning, and visual/color/typography/photography/motion principles). Four brand colors — Primary Red `#EC2D07`, Green `#1A9902`, Gold `#CFCA43`, Off White `#F3F5F0` — are confirmed as approved and fixed; this document defines how they're used, not what they are. `BRAND_GUIDELINES.md` is reconciled to a narrower, non-overlapping scope: tactical asset execution (logo, exact typefaces, exact color tokens) built on top of `BRAND_IDENTITY.md`, rather than duplicating it.
- **Reasoning:** The project moved from product definition into brand definition as its own phase, per Paul's explicit instruction, ahead of any design-system or visual work. A computed WCAG contrast analysis of the four approved colors (not assumed) found that gold fails contrast against the off-white base at every text size, informing a recommended usage hierarchy (off-white dominant, green as primary accent, red reserved for calls-to-action, gold reserved for dark-ground/accent use) rather than an even application of all four.
- **Date:** 2026-07-18
- **Impact:** New `docs/BRAND_IDENTITY.md`. `docs/BRAND_GUIDELINES.md` rewritten to reference it rather than duplicate it. `PROJECT_STATUS.md` and `ROADMAP.md` updated to reflect a new Phase 0 (Brand & Design Foundation) and a hard gate: `DESIGN_SYSTEM.md` visual-token work and all UI design are blocked until `BRAND_IDENTITY.md` is approved.
- **Status:** Drafted — awaiting Paul's approval. Not yet a final decision.

### Documentation system established as the project's single source of truth

- **Decision:** All project knowledge (product definition, architecture, business rules, decisions, status) now lives in `/docs` as versioned Markdown, not in chat history.
- **Reasoning:** Chat history is not durable, not searchable by future contributors, and not guaranteed to be available to whoever continues the project next — human or AI. A written record is required for continuity.
- **Date:** 2026-07-18
- **Impact:** Creation of `/docs` with 17 documents (see `README.md` for the index). All future decisions must be logged here going forward.
- **Status:** In effect.

### LiquorCentral finalized as a single-company retailer — no marketplace

- **Decision:** LiquorCentral is one company owning and managing all products, inventory, pricing, orders, deliveries, and operations. There are no vendors, no vendor onboarding, no vendor dashboard, no vendor payouts, and no marketplace commissions.
- **Reasoning:** Business decision made by Paul, superseding an earlier multi-vendor marketplace architecture that had been researched as one possible direction.
- **Date:** 2026-07-18
- **Impact:** Retires the previously-researched Vendor module, VendorStaff entity, order-splitting checkout workflow, and per-vendor payout module in their entirety. Significantly simplifies checkout (`PRODUCT_BLUEPRINT.md` §9), the customer/actor-type model (`PRODUCT_BLUEPRINT.md` §4), and the API surface (`API_DECISIONS.md`). Food Central is confirmed as a subsidiary brand under LiquorCentral, not an independent vendor.
- **Status:** Final — reflected throughout `/docs`.

### Delivery model finalized

- **Decision:** Wine & Spirits delivers nationwide. Food Central delivers Lagos only, is cooked on demand, and supports same-day delivery, scheduled delivery, and pickup. All deliveries use company-owned riders — no third-party courier platform for Food Central.
- **Reasoning:** Business decision made by Paul, reflecting the operational reality of a single-city, made-to-order food operation versus a nationwide stocked-goods operation.
- **Date:** 2026-07-18
- **Impact:** `DELIVERY_MODEL.md` and `BUSINESS_RULES.md`. Confirms no third-party carrier API integration is required for v1 (`MEDUSA_EXTENSIONS.md`), and that a delivery-slot scheduling module is required (native Medusa has no time-slot concept).
- **Status:** Final.

### Guest checkout and pre-browse age verification confirmed as requirements

- **Decision:** Guest checkout must be supported throughout. An age-confirmation popup is required before browsing alcohol content.
- **Reasoning:** Business decisions made by Paul — guest checkout reduces purchase friction; the age gate is a compliance requirement for alcohol sales.
- **Date:** 2026-07-18
- **Impact:** `BUSINESS_RULES.md`, `PRODUCT_BLUEPRINT.md` §9 and §11, `USER_FLOWS.md` (Flows 1 and 6). Exact age-gate mechanics (session duration, whether it's site-wide or alcohol-section-only) remain open — see `PROJECT_STATUS.md`.
- **Status:** Final on the requirement; mechanics still open.

### Two focused product-attribute modules, not one universal module

- **Decision:** Wine attributes and food attributes are modeled as two separate custom modules (`wine-details`, `food-details`), each linked 1:1 to the native Product module, rather than one shared module covering both.
- **Reasoning:** A wine has no spice level; a dish has no vintage. One shared module would accumulate irrelevant nullable fields per product and complicate validation.
- **Date:** 2026-07-18
- **Impact:** `PRODUCT_CATALOG.md`, `MEDUSA_EXTENSIONS.md` #1 and #2.
- **Status:** Approved as an architecture pattern; exact field lists per module still open.

### Storefront: Next.js Starter recommended over a from-scratch build

- **Decision:** Build on Medusa's official Next.js Starter ("DTC Starter") rather than a fully custom React application.
- **Reasoning:** The starter already has cart, checkout, region/tax handling, and payment integration wired and tested against Medusa's API; a from-scratch build would re-implement the same logic with no maintained baseline to diff against on upgrade. Its App Router/SSR foundation also directly supports organic product-page discovery.
- **Date:** 2026-07-18
- **Impact:** `TECH_STACK.md`.
- **Status:** Recommended — not yet formally approved by Paul.

### Search: Meilisearch recommended over Algolia, Elasticsearch, and Typesense

- **Decision:** Use Meilisearch as the search/facet engine.
- **Reasoning:** The only option that is both open-source (cost and data control) and officially documented for Medusa integration (lowest integration risk); its faceting fits the wine/food attribute filtering this project needs. Elasticsearch and Typesense have no official Medusa integration guide; Algolia is hosted-only with usage-based pricing that scales unfavorably at marketplace-adjacent scale.
- **Date:** 2026-07-18
- **Impact:** `MEDUSA_EXTENSIONS.md` #6, `TECH_STACK.md`, `ROADMAP.md` Phase 6.
- **Status:** Recommended — not yet formally approved by Paul.

### CMS: Sanity recommended over Contentful, Strapi, and Payload

- **Decision:** Use Sanity for editorial/marketing content, kept strictly separate from commerce data (which stays in Medusa), synced one-way (Medusa → Sanity only).
- **Reasoning:** Real-time collaborative editing, strong localization support, structured content that pairs well with the Next.js storefront, and an official Medusa integration guide built around exactly this use case.
- **Date:** 2026-07-18
- **Impact:** `MEDUSA_EXTENSIONS.md` #7, `PRODUCT_BLUEPRINT.md` §12.
- **Status:** Recommended, low urgency — not yet formally approved.

### Authentication: Medusa Auth confirmed as the required system of record

- **Decision:** All authentication (customer and admin) uses Medusa's native auth system. Third-party identity providers (e.g. Clerk, Auth.js) are not used for v1, and would only ever act as a bridge into Medusa Auth if ever needed, never a replacement.
- **Reasoning:** Every protected Medusa route and its RBAC system are built directly on Medusa's own identity model — there is no way to substitute it wholesale without breaking the rest of the framework.
- **Date:** 2026-07-18
- **Impact:** `TECH_STACK.md`.
- **Status:** Final (architectural constraint, not a preference).

### Medusa vendored as a git submodule

- **Decision:** The `medusajs/medusa` repository is included in this project as a git submodule at `./medusa`, rather than a subtree merge or a vendored source copy.
- **Reasoning:** Keeps Medusa's full history and easy upstream updates available, without bloating this repository's own history or blurring the line between "our code" and "Medusa's code."
- **Date:** 2026-07-18
- **Impact:** `.gitmodules`, `medusa/` directory. Establishes the hard rule that Medusa core is never edited directly — see `ARCHITECTURE.md`.
- **Status:** Final.
