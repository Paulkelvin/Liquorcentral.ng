# Decision Log

**Purpose:** A running, append-only record of every material business or architecture decision made on this project — what was decided, why, when, and what it affects. This is the authoritative history; chat conversations are not. When a decision changes, add a new entry rather than editing an old one, so the history of *why* things changed is preserved.

**Format:** newest entries at the top. Each entry: Decision → Reasoning → Date → Impact → Status.

---

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
