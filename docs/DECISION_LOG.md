# Decision Log

**Status:** Approved (living, authoritative record)
**Version:** 1.0
**Owner:** Program
**Last Updated:** 2026-07-18

**Purpose:** A running, append-only record of every material business or architecture decision made on this project — what was decided, why, when, and what it affects. This is the authoritative history; chat conversations are not. When a decision changes, add a new entry rather than editing an old one, so the history of *why* things changed is preserved.

**Format:** newest entries at the top. Each entry: Decision → Reasoning → Date → Impact → Status.

---

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
