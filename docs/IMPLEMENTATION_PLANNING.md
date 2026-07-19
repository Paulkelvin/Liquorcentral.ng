# Implementation Planning

**Status:** Approved
**Version:** 1.0
**Owner:** Engineering
**Last Updated:** 2026-07-18
**Phase:** Phase 2 — Implementation Planning

This document is the governing standard for Phase 2 of the LiquorCentral project — the phase between "what the product must do" (Phase 1 — Product Specifications, complete and frozen) and "the code that does it." It plays the same role for engineering/implementation documents that `DOCUMENTATION_GOVERNANCE.md` plays for the documentation system as a whole: it defines how implementation documents are organized, what must exist, who owns each one, how they're approved and versioned, how they change, and the architectural philosophy every one of them must follow. Where any future implementation document's practice conflicts with this one, this document wins unless a `DECISION_LOG.md` entry explicitly says otherwise — the identical rule `DOCUMENTATION_GOVERNANCE.md` sets for itself, applied one tier down.

**This document does not itself contain any implementation code, database schema, API design, frontend component, or wireframe.** Its entire purpose is to define *how* those things will eventually be planned and documented — never to produce them directly. Nothing in this document should be read as a decision about a table structure, a route signature, a component's markup, or a specific line of code; those are the explicit responsibility of the sixteen future documents this one defines (§6), each written and approved in its own turn.

---

## 1. Purpose

Phase 1 — Product Specifications answered *what* the platform must do, for whom, in enough behavioral detail to design, build, and test it — without ever specifying *how*. Phase 2 — Implementation Planning exists to close that gap deliberately and in writing, the same way Phase 1 closed the gap between brand/business decisions and product behavior: by producing a complete, approved, internally consistent set of engineering-architecture documents *before* a single line of implementation code, a database table, an API route, or a frontend component is written.

This document's own purpose is narrower than that: it does not do the architecture work itself. It defines the *structure* that work will take — which documents must exist, in what order, owned by whom, dependent on what, and governed by what shared philosophy — so that when engineering-architecture work actually begins, it proceeds with the same discipline `DOCUMENTATION_GOVERNANCE.md` already established for product documentation, rather than being invented ad hoc as implementation pressure mounts.

## 2. Scope

**In scope:** the organization, hierarchy, ownership, approval workflow, versioning, change management, and cross-reference discipline for every Phase 2 implementation document; the architectural philosophies (§14–§29) those documents must be consistent with; and the exit criteria that define when Phase 2 is complete and Phase 3 (actual implementation) may begin.

**Explicitly out of scope, per direct instruction:**
- No implementation code of any kind.
- No database schema (table structures, column definitions, migrations) — that is `02_DATABASE_ARCHITECTURE.md`'s future job, once approved and authored.
- No API design (route signatures, request/response contracts) — that is `04_API_SPECIFICATION.md`'s future job.
- No frontend components — that is `06_COMPONENT_ARCHITECTURE.md`'s future job, and depends on Phase 0c (component specification) as well.
- No wireframes or visual design of any kind — visual design remains `DESIGN_SYSTEM.md`'s and Phase 0c's domain, not this document's or any Phase 2 implementation document's.
- No new product or business decisions — every behavioral requirement Phase 2 documents implement already exists in `docs/specifications/*`; this phase does not reopen or reinterpret any of it (§4).

## 3. Objectives of Phase 2

- **Translate approved behavior into concrete engineering architecture** — how Medusa is extended, how the storefront is structured, how integrations are wired — without inventing new product or business decisions along the way.
- **Produce a complete, internally consistent set of architecture documents before any code exists**, mirroring `AI_HANDOFF.md` §12's "documentation before implementation" principle at the engineering tier specifically.
- **Surface every genuine open technical or business decision explicitly**, rather than letting an implementation document silently assume an answer to a question Phase 0/1 already left open (payment provider, delivery mechanism, media hosting, search/CMS formal sign-off) or a question this phase newly discovers (§31).
- **Establish shared philosophy before shared code exists** — so that when multiple implementation documents (and eventually multiple engineers) build against Medusa, Next.js, and the rest of the stack, they do so consistently rather than each re-deriving conventions independently.
- **Keep Phase 2 proportionate to the company's actual stage** — restating `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §1/§2's proportionality principle at the engineering-planning tier: this phase plans for what the business has actually approved building, not a hypothetical larger operation.

## 4. Relationship to Phase 0 and Phase 1

- **This document does not sit above, beside, or in competition with `DOCUMENTATION_GOVERNANCE.md`'s existing hierarchy** (`DOCUMENTATION_GOVERNANCE.md` §3: Business Decisions → Brand & Experience → Design System → Product Specifications → Implementation Planning → Code) — it *is* the governing document for that hierarchy's "Implementation Planning" tier, made explicit and detailed for the first time. `ROADMAP.md`, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, and `TECH_STACK.md` — the five documents that tier already names — remain the foundational strategic-level references; the sixteen documents this one defines (§6) deepen them into concrete engineering architecture. This is an extension, not a replacement: no Phase 2 document may contradict any of those five.
- **A Phase 2 document may narrow or implement a Phase 0 or Phase 1 decision, but may never contradict one** — restating `DOCUMENTATION_GOVERNANCE.md` §3's rule directly, one tier down. An implementation document cannot introduce a database structure that requires a business rule `BUSINESS_RULES.md` doesn't establish, and it cannot specify frontend behavior that contradicts a frozen Product Specification.
- **Every implementation document must trace its requirements back to a specific Product Specification, frozen Phase 0 document, or an already-logged `DECISION_LOG.md` entry** — never to an assumption about what the business "probably wants." Where no such source exists, the requirement is either out of scope for Phase 2 or a genuinely new open question to flag (§31), not something to invent.
- **Naming note, extending `ROADMAP.md`'s own naming note:** "Phase 2" as used in this document refers to **Implementation Planning** — the engineering-architecture-definition phase in the same lineage as Phase 0 (Brand & Design Foundation) and Phase 0d (Product Specifications). This is **not** the same "Phase 2" `ROADMAP.md` uses internally for its own backend-build sequencing track ("Phase 2 — Product data foundation," within `ROADMAP.md`'s Phase 1–9 backend-implementation numbering). The two numbering tracks are independent, for the identical reason `ROADMAP.md` already gives for its own Phase 1 naming collision — this avoids two unrelated efforts sharing the same phase number under a different guise.

## 5. Implementation Document Hierarchy

Within the "Implementation Planning" tier `DOCUMENTATION_GOVERNANCE.md` §3 already names, the sixteen documents this specification defines (§6) form their own internal hierarchy — a lower document may depend on and build from a higher one, but never contradict it:

```
Product Specifications (docs/specifications/*, Approved — Frozen)
        ↓
System & Data Foundation        (01_SYSTEM_ARCHITECTURE, 02_DATABASE_ARCHITECTURE, 03_MEDUSA_ARCHITECTURE)
        ↓
API Layer                        (04_API_SPECIFICATION)
        ↓
Frontend Foundation               (05_FRONTEND_ARCHITECTURE, 06_COMPONENT_ARCHITECTURE, 07_PAGE_ARCHITECTURE)
        ↓
Integration Architecture            (08_SANITY_ARCHITECTURE, 09_SEARCH_ARCHITECTURE, 10_MEDIA_ARCHITECTURE,
                                      11_AUTHENTICATION_ARCHITECTURE, 12_PAYMENT_ARCHITECTURE, 13_NOTIFICATION_ARCHITECTURE)
        ↓
Delivery & Verification              (14_DEPLOYMENT_ARCHITECTURE, 15_IMPLEMENTATION_SEQUENCING, 16_TESTING_STRATEGY)
        ↓
Code
```

**Rules that follow, mirroring `DOCUMENTATION_GOVERNANCE.md` §3 exactly one tier down:**
- A document in a lower band may depend on and must be consistent with every document in a band above it, but may never contradict one — an API decision (`04`) cannot invent a data shape `03_MEDUSA_ARCHITECTURE.md` didn't establish; a page-level decision (`07`) cannot require a component `06_COMPONENT_ARCHITECTURE.md` doesn't define.
- Documents within the same band (e.g., the six Integration Architecture documents) are largely independent of each other and may be authored in any order or in parallel (§8), since each integrates a different, mostly-orthogonal third-party concern.
- Code, once it exists, must conform to every document above it in this hierarchy — restating `DOCUMENTATION_GOVERNANCE.md` §3's closing rule directly: code is never itself the source of truth for an architecture decision.

## 6. Required Implementation Documents

Sixteen documents are required before Phase 2 is considered complete (§34), living in a new `docs/implementation/` directory — mirroring the `docs/specifications/` pattern already established for Phase 1, rather than adding sixteen more flat files to an already-large `/docs` root. **None of these documents exists yet; none is created by this document; none begins without Paul's explicit direction (§8, and per direct instruction closing this round of work).**

**A note on two names, changed from the proposed list, with reasoning stated rather than silent:**
- **`10_MEDIA_ARCHITECTURE.md`**, not `10_CLOUDINARY_ARCHITECTURE.md` — no document anywhere in `/docs` has ever named Cloudinary, or any other media-hosting provider, as a recommendation (unlike Sanity and Meilisearch, both already named specifically in `TECH_STACK.md` and `MEDUSA_EXTENSIONS.md` as recommended-but-not-approved). Naming this document after an unapproved, never-before-mentioned vendor would silently introduce a technology choice this document has no authority to make. This is a genuinely new gap (§31), flagged here and in `PROJECT_STATUS.md`, not resolved by picking a name that presumes an answer.
- **`15_IMPLEMENTATION_SEQUENCING.md`**, not `15_DEVELOPMENT_ROADMAP.md` — `ROADMAP.md` already exists, already means "phased build sequence," and is already cross-referenced by name throughout `/docs`. A second document called a "roadmap" risks exactly the kind of naming collision this project has deliberately avoided elsewhere (`09_FOOD_ORDERING_SPECIFICATION.md`'s "Kitchen Operational Considerations" vs. `04`/`06`'s "Operational Behaviour"; `10_DELIVERY_SPECIFICATION.md`'s "Delivery Operations Considerations" vs. both). "Implementation Sequencing" names the same content — the engineering-task-level order Phase 2's own documents and, later, actual build work should proceed in — without colliding with `ROADMAP.md`'s existing, higher-level phase sequencing.

Every other proposed name is kept as given, since each names a concern either already discussed by name elsewhere (`08_SANITY_ARCHITECTURE.md`, `09_SEARCH_ARCHITECTURE.md` — Sanity and Meilisearch are already named recommendations) or a genuinely new, self-evidently-scoped engineering concern (`01`–`07`, `11`–`14`, `16`) that doesn't risk the same ambiguity.

### 01. System Architecture

- **Purpose:** The single, top-level engineering architecture document — how Medusa, the Next.js storefront, and every integration fit together as one system, and how they're deployed relative to one another.
- **Scope:** System topology, service boundaries, environment structure (dev/staging/production), and how this document's own scope differs from `ARCHITECTURE.md`'s (which describes the vendored Medusa codebase itself, not the full system built around it).
- **Dependencies:** `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `TECH_STACK.md`, all 11 Product Specifications (as the behavioral requirements the system must support).
- **Deliverables:** A system-level architecture description every other Phase 2 document builds from.
- **Required approvals:** Paul (architecture sign-off); no business decision is made here that isn't already established.
- **Frozen or Living:** Frozen once approved — every other Phase 2 document depends on it directly.

### 02. Database Architecture

- **Purpose:** How data is organized across Medusa's native modules and the custom modules `MEDUSA_EXTENSIONS.md` names — *architecturally*, not as literal schema (no table/column definitions belong here or in this document).
- **Scope:** Module boundaries, module-link relationships (per `ARCHITECTURE.md`'s module-isolation rule), and which data lives natively vs. in a new custom module.
- **Dependencies:** `01_SYSTEM_ARCHITECTURE.md`, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_CATALOG.md`.
- **Deliverables:** An architectural map of data ownership and relationships — the literal schema remains a later, code-adjacent artifact outside this document's or any Phase 2 document's scope.
- **Required approvals:** Paul (where a new module's data ownership touches an open business decision, e.g., allergen-data responsibility); Engineering otherwise.
- **Frozen or Living:** Frozen once approved.

### 03. Medusa Architecture

- **Purpose:** How every custom module named in `MEDUSA_EXTENSIONS.md` (wine-attributes, food-attributes, delivery-slot scheduling, local payment provider, notification provider) is structured as a Medusa extension — modules, module links, workflow hooks, admin widgets/routes.
- **Scope:** Extension-point-level architecture only — restating `ARCHITECTURE.md`'s "never modify core" rule as a hard constraint, not re-deciding it.
- **Dependencies:** `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `02_DATABASE_ARCHITECTURE.md`.
- **Deliverables:** A per-module extension architecture, consistent with every risk/assumption `MEDUSA_EXTENSIONS.md` already names for each module.
- **Required approvals:** Engineering; Paul where a module's behavior touches an open business decision already flagged in `PROJECT_STATUS.md`.
- **Frozen or Living:** Frozen once approved.

### 04. API Specification

- **Purpose:** Which capabilities are served by Medusa's native Store/Admin APIs as-is, and which require a custom route — extending `API_DECISIONS.md`'s existing native-vs-custom framework into a concrete map, without yet writing route signatures or contracts (that is implementation work, not this document's or this phase's job per the direct "no API design" instruction).
- **Scope:** Which specification behaviors (across all 11 frozen specs) require which kind of API support; where a custom route is genuinely necessary vs. where native Medusa already suffices.
- **Dependencies:** `API_DECISIONS.md`, `03_MEDUSA_ARCHITECTURE.md`, all 11 Product Specifications.
- **Deliverables:** A capability-to-API-approach map — not a contract specification.
- **Required approvals:** Engineering.
- **Frozen or Living:** Frozen once approved.

### 05. Frontend Architecture

- **Purpose:** How the Next.js storefront is structured at the application level — rendering strategy (SSR/SSG/client), routing conventions, state management approach, and how it consumes `04_API_SPECIFICATION.md`'s API map.
- **Scope:** Application-level architecture only; no specific component or page belongs here (see `06`, `07`).
- **Dependencies:** `01_SYSTEM_ARCHITECTURE.md`, `04_API_SPECIFICATION.md`, `TECH_STACK.md` (Next.js Starter recommendation, not yet formally approved), `DESIGN_SYSTEM.md`.
- **Deliverables:** A frontend application architecture every page- and component-level document builds from.
- **Required approvals:** Paul (formal sign-off on the Next.js Starter recommendation, already flagged as open in `PROJECT_STATUS.md`); Engineering otherwise.
- **Frozen or Living:** Frozen once approved.

### 06. Component Architecture

- **Purpose:** How the storefront's component library is structured against `DESIGN_SYSTEM.md`'s tokens and principles — component composition patterns, not visual design itself.
- **Scope:** Structural/architectural component conventions; explicitly does not include actual component markup, styling implementation, or wireframes.
- **Dependencies:** `05_FRONTEND_ARCHITECTURE.md`, `DESIGN_SYSTEM.md` (especially its Component Philosophy and Design Quality Checklist), and Phase 0c (component specification), which this document depends on having begun.
- **Deliverables:** A component architecture and composition philosophy.
- **Required approvals:** Engineering; Design input given `DESIGN_SYSTEM.md`'s ownership.
- **Frozen or Living:** Frozen once approved.

### 07. Page Architecture

- **Purpose:** How each of the 11 frozen Product Specifications maps onto actual storefront pages/routes and admin surfaces — page-level composition of the components `06` defines.
- **Scope:** Page/route-level architecture; explicitly does not include wireframes or visual layout.
- **Dependencies:** `05_FRONTEND_ARCHITECTURE.md`, `06_COMPONENT_ARCHITECTURE.md`, all 11 Product Specifications (especially `01_NAVIGATION_SPECIFICATION.md`'s information architecture).
- **Deliverables:** A specification-to-page/route map.
- **Required approvals:** Engineering.
- **Frozen or Living:** Frozen once approved.

### 08. Sanity Architecture

- **Purpose:** The CMS integration architecture, per `MEDUSA_EXTENSIONS.md` #7's not-yet-urgent, not-yet-formally-approved Sanity recommendation.
- **Scope:** One-way sync architecture (Medusa → Sanity, never back), content-vs-commerce data separation.
- **Dependencies:** `MEDUSA_EXTENSIONS.md` #7, `04_API_SPECIFICATION.md`, `PRODUCT_BLUEPRINT.md` §12 (Content Strategy).
- **Deliverables:** A CMS integration architecture, ready to build once Sanity is formally approved and once the business priority to build it exists (it remains explicitly low-urgency, per `ROADMAP.md` Phase 7).
- **Required approvals:** Paul (formal Sanity sign-off, already flagged as open).
- **Frozen or Living:** Frozen once approved; low priority to even begin (§8).

### 09. Search Architecture

- **Purpose:** The Meilisearch integration architecture, per `MEDUSA_EXTENSIONS.md` #6's recommendation and `03_SEARCH_SPECIFICATION.md`'s complete behavioral requirements (ranking philosophy, typo tolerance, faceting, merchandising rules).
- **Scope:** Integration/indexing architecture; explicitly does not redefine `03_SEARCH_SPECIFICATION.md`'s ranking philosophy or merchandising rules, only implements them.
- **Dependencies:** `MEDUSA_EXTENSIONS.md` #6, `03_SEARCH_SPECIFICATION.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §17 (Search Merchandising Workflow).
- **Deliverables:** A search-integration architecture.
- **Required approvals:** Paul (formal Meilisearch sign-off, already flagged as open).
- **Frozen or Living:** Frozen once approved.

### 10. Media Architecture

- **Purpose:** How product photography, brand imagery, and any future editorial media are hosted, transformed, and delivered — a genuinely new architectural concern with no prior recommendation anywhere in `/docs` (see the naming note above).
- **Scope:** Media hosting/delivery architecture only; governed by `BRAND_IDENTITY.md`'s photography principles (authenticity, freshness, craftsmanship, quality) regardless of which specific provider is eventually chosen.
- **Dependencies:** `BRAND_IDENTITY.md`, `DESIGN_SYSTEM.md`, `05_FRONTEND_ARCHITECTURE.md`.
- **Deliverables:** A media architecture, once a provider is chosen.
- **Required approvals:** Paul (provider choice — a genuinely new open decision this document surfaces, not yet flagged anywhere in `/docs` before now; see `PROJECT_STATUS.md`).
- **Frozen or Living:** Frozen once approved; cannot meaningfully begin until the provider decision is made.

### 11. Authentication Architecture

- **Purpose:** How Medusa's native customer and admin-user authentication is implemented for both the storefront and the admin surface.
- **Scope:** Authentication/session architecture only; no third-party identity provider, restating `TECH_STACK.md`'s confirmed decision directly.
- **Dependencies:** `TECH_STACK.md` (Authentication section), `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` (Session & Security Behaviour), `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §15/§21 (Staff Roles & Permissions, Security).
- **Deliverables:** An authentication/session architecture for both actor types.
- **Required approvals:** Engineering; Paul if the still-open staff-permissions-granularity decision (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §15) resolves in a way that changes this document's scope.
- **Frozen or Living:** Frozen once approved.

### 12. Payment Architecture

- **Purpose:** How the chosen local payment provider is integrated as a custom Medusa Payment Provider module, per `MEDUSA_EXTENSIONS.md` #4 and `07_CHECKOUT_SPECIFICATION.md`'s complete, provider-agnostic Payment State Behaviour (pending/failed/cancelled/expired/retry).
- **Scope:** Integration architecture only; does not redefine the already-specified payment behavioral states, only implements them against a real provider.
- **Dependencies:** `MEDUSA_EXTENSIONS.md` #4, `07_CHECKOUT_SPECIFICATION.md` (Payment Behaviour, Payment State Behaviour), `10_DELIVERY_SPECIFICATION.md` §16 (Delivery Fees).
- **Deliverables:** A payment-provider integration architecture.
- **Required approvals:** Paul — **launch-blocking**; the provider choice itself (`MEDUSA_EXTENSIONS.md` #4) remains the project's most launch-critical open decision, and this document cannot be meaningfully authored until it resolves.
- **Frozen or Living:** Frozen once approved.

### 13. Notification Architecture

- **Purpose:** How the chosen notification channel(s) (WhatsApp Business API and/or SMS) are integrated as a custom Medusa Notification Provider module, per `MEDUSA_EXTENSIONS.md` #5.
- **Scope:** Integration architecture for order/delivery status messaging already specified in `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16, `09_FOOD_ORDERING_SPECIFICATION.md` §12, and `10_DELIVERY_SPECIFICATION.md` §18/Customer Communication.
- **Dependencies:** `MEDUSA_EXTENSIONS.md` #5, and each of the three specifications above.
- **Deliverables:** A notification-provider integration architecture.
- **Required approvals:** Paul (channel choice, already flagged as open, with direct cost/approval implications).
- **Frozen or Living:** Frozen once approved; cannot meaningfully begin until the channel decision is made.

### 14. Deployment Architecture

- **Purpose:** Hosting topology, environment structure, and CI/CD approach for both the Medusa backend and the Next.js storefront.
- **Scope:** Deployment/infrastructure architecture; no specific hosting provider is named anywhere in `/docs` today, and this document is where that gap gets resolved, not this one.
- **Dependencies:** `01_SYSTEM_ARCHITECTURE.md`, `TECH_STACK.md` (Postgres/Redis production requirements).
- **Deliverables:** A deployment architecture.
- **Required approvals:** Paul (hosting-provider choice, a newly-surfaced open item, §31); Engineering otherwise.
- **Frozen or Living:** Frozen once approved.

### 15. Implementation Sequencing

- **Purpose:** The engineering-task-level order in which Phase 2's own documents, and later actual build work, should proceed — distinct from `ROADMAP.md`'s existing phase-level sequencing (see the naming note above).
- **Scope:** Sequencing and dependency tracking across all sixteen Phase 2 documents and into early build work; no dates, mirroring `ROADMAP.md`'s own no-dates convention.
- **Dependencies:** All fifteen other Phase 2 documents, `ROADMAP.md`.
- **Deliverables:** A living sequencing document, updated as Phase 2 documents are actually authored and as build priorities shift.
- **Required approvals:** Engineering; Paul for any sequencing change that affects launch-critical timing.
- **Frozen or Living:** **Living** — like `ROADMAP.md` itself, this document is expected to change as reality unfolds, never frozen.

### 16. Testing Strategy

- **Purpose:** How every Product Specification's acceptance criteria (`DOCUMENTATION_GOVERNANCE.md` §11) become actual test cases, and what testing approach/tooling/coverage standard applies across the codebase once it exists.
- **Scope:** Testing philosophy and approach; specific test cases are written against code, not specified in this document.
- **Dependencies:** All 11 Product Specifications' acceptance criteria, all other Phase 2 documents (each defines what needs testing).
- **Deliverables:** A testing strategy and standard.
- **Required approvals:** Engineering.
- **Frozen or Living:** **Living** — expected to be refined as the codebase and its real failure modes become known, though its core philosophy (§28) should not change without a logged reason.

## 7. Dependencies Between Implementation Documents

| Document | Depends on |
|---|---|
| 01 System Architecture | `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `TECH_STACK.md`, all 11 specifications |
| 02 Database Architecture | 01, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_CATALOG.md` |
| 03 Medusa Architecture | 01, 02, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md` |
| 04 API Specification | 03, `API_DECISIONS.md`, all 11 specifications |
| 05 Frontend Architecture | 01, 04, `TECH_STACK.md`, `DESIGN_SYSTEM.md` |
| 06 Component Architecture | 05, `DESIGN_SYSTEM.md`, Phase 0c |
| 07 Page Architecture | 05, 06, all 11 specifications |
| 08 Sanity Architecture | 04, `MEDUSA_EXTENSIONS.md` #7 |
| 09 Search Architecture | 04, `03_SEARCH_SPECIFICATION.md`, `MEDUSA_EXTENSIONS.md` #6 |
| 10 Media Architecture | 05, `BRAND_IDENTITY.md`, `DESIGN_SYSTEM.md` |
| 11 Authentication Architecture | 03, `TECH_STACK.md`, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` |
| 12 Payment Architecture | 03, 04, `MEDUSA_EXTENSIONS.md` #4, `07_CHECKOUT_SPECIFICATION.md`, `10_DELIVERY_SPECIFICATION.md` |
| 13 Notification Architecture | 03, `MEDUSA_EXTENSIONS.md` #5, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, `09_FOOD_ORDERING_SPECIFICATION.md`, `10_DELIVERY_SPECIFICATION.md` |
| 14 Deployment Architecture | 01, `TECH_STACK.md` |
| 15 Implementation Sequencing | 01–14, `ROADMAP.md` |
| 16 Testing Strategy | All 11 specifications' acceptance criteria, 01–14 |

No document depends on 15 or 16 — both are cross-cutting and depend on everything above them, never the reverse.

## 8. Recommended Creation Order

A recommended order, not a rigid schedule — several documents can run in parallel once their own dependencies are satisfied, mirroring `ROADMAP.md`'s existing precedent of parallel-but-not-independent tracks:

1. **`01_SYSTEM_ARCHITECTURE.md`** — the necessary starting point; every other document depends on it.
2. **`02_DATABASE_ARCHITECTURE.md`**, then **`03_MEDUSA_ARCHITECTURE.md`** — the backend data/extension foundation.
3. **`04_API_SPECIFICATION.md`** — once the backend foundation exists.
4. **`05_FRONTEND_ARCHITECTURE.md`**, then **`06_COMPONENT_ARCHITECTURE.md`** and **`07_PAGE_ARCHITECTURE.md`** (06 and 07 can run in parallel once 05 exists, since components and page composition are largely independent concerns until they meet in implementation).
5. **`11_AUTHENTICATION_ARCHITECTURE.md`** — early, since both storefront and admin authentication are foundational to almost everything downstream.
6. **`08_SANITY_ARCHITECTURE.md`, `09_SEARCH_ARCHITECTURE.md`, `10_MEDIA_ARCHITECTURE.md`** — can run in parallel with each other and with the frontend documents above, but each is gated on its own open decision (Sanity/Meilisearch formal sign-off, media-provider choice) and is not launch-critical.
7. **`12_PAYMENT_ARCHITECTURE.md`** — gated on the payment-provider decision; author as soon as that decision lands, since it is launch-blocking.
8. **`13_NOTIFICATION_ARCHITECTURE.md`** — gated on the notification-channel decision; not launch-blocking, can trail 12.
9. **`14_DEPLOYMENT_ARCHITECTURE.md`** — once the system shape (01–07) is settled enough to know what's actually being deployed.
10. **`15_IMPLEMENTATION_SEQUENCING.md`** — begun early as a skeleton, refined continuously as 01–14 are actually authored, since its whole job is tracking the real state of the other fifteen.
11. **`16_TESTING_STRATEGY.md`** — begun once enough of 01–14 exists to know what there is to test, refined continuously thereafter.

**No document in this list begins without Paul's explicit direction to start that specific one** — restating the identical discipline `DOCUMENTATION_GOVERNANCE.md` §5 and §8 already established for placeholder Product Specifications, applied here to Phase 2 documents from the outset rather than only after a placeholder-skeleton stage.

## 9. Document Ownership

| Document category | Primary owner | Paul's approval required for |
|---|---|---|
| System/Data/Medusa/API foundation (01–04) | Engineering | Any decision touching an open business/operational item already flagged in `PROJECT_STATUS.md` |
| Frontend foundation (05–07) | Engineering, with Design input on `06` given `DESIGN_SYSTEM.md`'s ownership | Formal sign-off on the Next.js Starter recommendation (05) |
| Integration architecture (08–13) | Engineering | Formal sign-off on each underlying technology/provider choice (Sanity, Meilisearch, media provider, payment provider, notification channel) — each already an open item except media, newly surfaced here |
| Deployment (14) | Engineering | Hosting-provider choice (newly surfaced, §31) |
| Sequencing (15) | Engineering | Any change affecting launch-critical timing |
| Testing (16) | Engineering | None beyond ordinary review — testing approach is not typically a business decision |

This mirrors `AI_HANDOFF.md`'s existing per-document ownership table exactly, extended to the sixteen new documents rather than inventing a different ownership model for them.

## 10. Document Approval Workflow

Every Phase 2 implementation document follows the identical nine-status lifecycle `DOCUMENTATION_GOVERNANCE.md` §4 already establishes for all documentation, and the identical two-phase discipline Product Specifications used in Phase 1:

1. **Not Started** — named and scoped in this document (§6), no content written.
2. **In Progress (v0.x)** — full first draft, following this document's philosophies (§14–§29) and cross-referencing its stated dependencies (§7).
3. **Under Review** — handed to Paul for explicit approval, exactly as each Product Specification was.
4. **Approved (v1.0)** — either directly, or via a refinement pass mirroring the pattern every Product Specification's freeze used (review against all upstream documents, add only genuinely necessary refinements, no unnecessary rewriting).
5. **Frozen** — for the fourteen architecture-defining documents (01–14); `15_IMPLEMENTATION_SEQUENCING.md` and `16_TESTING_STRATEGY.md` remain Living per §6's designation for each, since a build-sequencing document and a testing standard are both expected to evolve as real implementation experience accumulates, unlike an architecture decision that downstream code will be built directly against.

**No document advances to In Progress without Paul's explicit direction to begin that specific one** — restating §8's rule directly. This is not a stylistic preference; it is the same discipline that kept Phase 1's eleven specifications from being invented ahead of sequencing, applied here so Phase 2 does not quietly become sixteen simultaneous, uncoordinated drafts.

## 11. Versioning Rules

Every Phase 2 implementation document uses the identical `major.minor` scheme `DOCUMENTATION_GOVERNANCE.md` §7 already establishes, with no changes:

- **Major bump:** substantive content change — new architectural decision, a restructure, a materially different approach.
- **Minor bump:** a smaller but real change — a cross-reference fix, a section added without changing existing conclusions, absorbing a `DECISION_LOG.md`-logged decision into the document's own text.
- **No bump:** typos, formatting, anything that changes no meaning.
- Each document uses the same `0.x` pre-release convention while In Progress, moving to `1.0` on first approval — identical to every Product Specification's convention.
- This document (`IMPLEMENTATION_PLANNING.md` itself) is approved directly at v1.0, per direct instruction, rather than following the draft-then-freeze two-step — the same single-pass approval precedent `03_SEARCH_SPECIFICATION.md` and `05_PRODUCT_DETAILS_SPECIFICATION.md` each already used in Phase 1 when Paul explicitly directed it.

## 12. Change Management

Restating `DOCUMENTATION_GOVERNANCE.md` §5's change rules, applied to Phase 2 implementation documents specifically:

- **A Frozen implementation document (01–14) may only change in response to an explicit new architecture or business decision, logged in `DECISION_LOG.md` in the same change** — never as a silent side effect of a later document, or of implementation work revealing a better approach. If code genuinely reveals that a Frozen implementation document was wrong in a detail, that is itself grounds for a logged, explicit revision — not a silent one, and not a reason to treat the document as advisory.
- **`15_IMPLEMENTATION_SEQUENCING.md` and `16_TESTING_STRATEGY.md`, being Living, may be edited more freely** as part of normal work, provided every material change is still logged — the identical treatment `DOCUMENTATION_GOVERNANCE.md` §5 already gives `PROJECT_STATUS.md`, `CHANGELOG.md`, and `DECISION_LOG.md`.
- **Never silently recreate an implementation document that already exists** because a second version was found elsewhere — restating `DOCUMENTATION_GOVERNANCE.md` §5's "reconcile, don't recreate" rule directly, given this project's own precedent of exactly that situation occurring with its documentation branches.
- **This document itself (`IMPLEMENTATION_PLANNING.md`) follows the same change rule as any Approved document**: substantive changes require Paul's approval; non-substantive maintenance (cross-reference fixes, status-header corrections) does not require a fresh approval round.

## 13. Cross-Reference Rules

Restating `DOCUMENTATION_GOVERNANCE.md` §6, applied to Phase 2 implementation documents specifically:

- **Every implementation document must name every Product Specification, frozen Phase 0 document, and prior implementation document it depends on** (§7), either in its own "Dependencies" section or inline where a claim rests on one of them.
- **No implementation document may silently contradict a frozen Product Specification, `BUSINESS_RULES.md`, or `PRODUCT_BLUEPRINT.md`.** If implementation planning reveals a genuine inconsistency in an upstream document, the fix has the same two required parts `DOCUMENTATION_GOVERNANCE.md` §6 already names: correct the actual error, and log it in `DECISION_LOG.md` if it reflects a real decision change, or in `CHANGELOG.md` if it's a pure bookkeeping correction.
- **Links must resolve** — a markdown link from any Phase 2 document to another `/docs` or `docs/implementation/` file must point to a file that actually exists.
- **`docs/README.md`'s document map is the canonical index** — every Phase 2 document, once created, must appear there, exactly as every Product Specification does today.
- **Status claims must agree across documents** — if `PROJECT_STATUS.md` describes an implementation document as Approved or Frozen, that document's own header must say the same, the identical class of check `DOCUMENTATION_GOVERNANCE.md` §6 already requires platform-wide.

## 14. Medusa Implementation Philosophy

- **Medusa core (`medusa/`) is never modified, without exception** — restating `ARCHITECTURE.md`'s rule directly as a hard constraint every Phase 2 document and every future line of code must honor, not a preference to be weighed against convenience.
- **Every new business capability is a new module, a module link, a workflow hook, or an admin widget/route — never an edit to an existing module's own files.** This is the mechanism `ARCHITECTURE.md` already documents as what makes safe customization possible, and Phase 2 documents (`02`, `03`) exist specifically to plan how each already-identified custom module (`MEDUSA_EXTENSIONS.md`) fits this pattern.
- **Module isolation is preserved** — no direct foreign keys between a custom module's tables and a native module's tables; cross-module relationships are always expressed as module links, read back out via Medusa's cross-module Query engine, restating `ARCHITECTURE.md` directly.

## 15. Next.js Implementation Philosophy

- **The storefront consumes Medusa exclusively through its Store API** (native or custom routes per `04_API_SPECIFICATION.md`) — never direct database access, preserving the same backend/frontend separation Medusa's headless architecture is built around.
- **Server-rendering supports every customer-facing, indexable page's SEO requirements** already specified across `01`–`10`'s SEO Considerations sections — restating those requirements' implicit rendering-strategy consequence directly, not inventing a new one.
- **The Next.js Starter remains a recommendation, not yet formally approved** (`TECH_STACK.md`) — `05_FRONTEND_ARCHITECTURE.md` is where that formal sign-off is sought, not assumed here.

## 16. Backend Architecture Philosophy

- **One Medusa instance, one store, serving both product lines** — restating `PRODUCT_BLUEPRINT.md` §9 directly: no separate backend per business line, no order-splitting workflow.
- **Every real business operation is expressed as a workflow** — a resumable, compensable step sequence, restating `ARCHITECTURE.md`'s workflow-engine description directly — never a plain, unrecoverable service call for anything checkout-, payment-, or fulfillment-adjacent.
- **Custom modules stay small and focused on the one concern they exist for** (wine attributes, food attributes, delivery-slot scheduling) — restating `MEDUSA_EXTENSIONS.md`'s existing module-by-module scoping directly, not consolidating them into a larger, less isolated module for implementation convenience.

## 17. Frontend Architecture Philosophy

- **One storefront, one shared shell, over two internally distinct catalog sections** — restating `01_NAVIGATION_SPECIFICATION.md` §1's foundational structure directly: Wine & Spirits and Food Central are never two microsites.
- **Mobile-first, with a stricter bar for Food Central specifically** — restating `EXPERIENCE_PRINCIPLES.md`'s and `09_FOOD_ORDERING_SPECIFICATION.md` §26's identical performance framing directly.
- **Component architecture builds strictly on `DESIGN_SYSTEM.md`'s existing tokens** — no Phase 2 document or future component introduces a new visual primitive (a color, a spacing value, a motion timing) outside that system; a genuine gap in the token set is a `DESIGN_SYSTEM.md` change, not a one-off exception.

## 18. Database Philosophy

- **PostgreSQL via Medusa, with module isolation as the organizing principle** — restating `ARCHITECTURE.md` directly: no foreign keys connect one module's tables to another's; relationships are module links.
- **This document, and Phase 2 generally, does not specify literal schema** — table structures, column types, and migrations are `02_DATABASE_ARCHITECTURE.md`'s eventual job at a level of detail this document explicitly does not reach, per direct instruction.
- **Data ownership follows product-line configuration, not a universal schema** — restating `PRODUCT_CATALOG.md`'s and `PRODUCT_BLUEPRINT.md` §6's finding directly: two focused attribute modules, not one universal one.

## 19. API Philosophy

- **Native Medusa Store/Admin APIs are used as-is wherever they already suffice** — restating `API_DECISIONS.md`'s existing native-vs-custom framework directly; a custom route is built only where a genuine gap exists (delivery-slot booking, wine/food attribute data, a local payment provider's specific needs).
- **No API contract redefines a Product Specification's behavior — it only implements it.** If an API-level constraint appears to require a behavior change, that is a signal to revisit the specification through `DOCUMENTATION_GOVERNANCE.md`'s change process, not to quietly diverge from it at the API layer.
- **This document does not specify request/response contracts** — that is `04_API_SPECIFICATION.md`'s eventual job, and even that document stops short of literal API design per this document's own scope boundary (§2).

## 20. Search Architecture Philosophy

- **Meilisearch remains a recommendation pending formal sign-off** (`MEDUSA_EXTENSIONS.md` #6) — `09_SEARCH_ARCHITECTURE.md` is where that sign-off is sought, not assumed.
- **`03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy and Merchandising Rules are binding constraints on any search implementation, not open for reinterpretation** — relevance, then availability, then business merchandising, in that exact order, with no promotional signal ever outranking genuine relevance.
- **Synonym and merchandising content remain data staff manage** (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §17) — the search implementation's job is to make that staff workflow real, not to hardcode content that should be data.

## 21. CMS Philosophy

- **Sanity remains a recommendation, not urgent, not yet formally approved** (`MEDUSA_EXTENSIONS.md` #7) — restating directly, not elevating its priority beyond what `ROADMAP.md` already assigns it (Phase 7).
- **Commerce data flows one way, Medusa to CMS, never back** — restating `MEDUSA_EXTENSIONS.md` #7's documented integration pattern directly; no Phase 2 document treats the CMS as a second source of truth for pricing, inventory, or order data.
- **Content and commerce data remain structurally separate**, restating `PRODUCT_BLUEPRINT.md` §12's Content Strategy directly.

## 22. Media Management Philosophy

- **Photography and imagery are governed by `BRAND_IDENTITY.md`'s photography principles regardless of which hosting/delivery technology is eventually chosen** — authenticity, freshness, craftsmanship, and quality are brand requirements, not properties of any specific vendor.
- **No media-hosting provider is named or approved anywhere in `/docs` as of this document** — a genuinely new gap this document surfaces (§6, §31), not silently resolved by naming a specific service in this philosophy statement.
- **Image delivery performance is a conversion-relevant concern**, restating `AI_HANDOFF.md` §12's "performance matters" principle directly — whatever provider is chosen, `10_MEDIA_ARCHITECTURE.md` must hold it to the same performance bar `02_HOMEPAGE_SPECIFICATION.md` §17 and the other specifications' Performance Expectations sections already set.

## 23. Authentication Philosophy

- **Medusa's native auth (customer + admin-user actor types) is the system of record — no third-party identity provider for v1**, restating `TECH_STACK.md`'s confirmed decision directly.
- **No granular, role-differentiated staff permission system is approved today** — restating `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §15's open item directly; `11_AUTHENTICATION_ARCHITECTURE.md` does not invent one, only implements the single flat admin-user model until and unless that decision changes.
- **Session-security baselines already specified for customers** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Session & Security Behaviour) **and for staff** (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §21) **are implementation requirements, not aspirational** — rate-limiting, session invalidation on password change, and step-up reauthentication for sensitive actions all apply identically to whichever actor type they were specified for.

## 24. Payment Philosophy

- **Payment behavior is fully specified, provider-agnostically, in `07_CHECKOUT_SPECIFICATION.md`'s Payment Behaviour and Payment State Behaviour sections** — pending, failed, cancelled, expired, and retry are the states any provider must support; `12_PAYMENT_ARCHITECTURE.md`'s job is implementing that contract against a real provider, not reopening it.
- **The provider choice itself remains the project's most launch-critical open decision** (`MEDUSA_EXTENSIONS.md` #4) — restating directly, not narrowed or resolved by this document.
- **Whatever provider is chosen integrates through Medusa's documented Payment Provider interface**, restating `ARCHITECTURE.md`'s extension-point discipline directly — never through a core modification.

## 25. Security Philosophy

- **Never modify Medusa core** — restating §14 directly as this apply equally to security-motivated changes; a security requirement is never grounds for an exception to the core-modification rule.
- **Every security baseline already established for customers and staff is a floor, not a ceiling** — restating `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §21's requirements directly; no Phase 2 document may specify an implementation that weakens any of them for convenience.
- **Payment and personal data handling follow whatever compliance requirement the eventual provider/legal review imposes** — this document does not invent a compliance standard; `12_PAYMENT_ARCHITECTURE.md` and the still-open data-retention/NDPR decision (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §17/§18) govern that ground, not this one.

## 26. Performance Philosophy

- **Mobile-first is the default test condition for every implementation document, not an afterthought** — restating the platform-wide principle directly.
- **The customer-facing performance bar is whatever each frozen specification already sets** (e.g., `02_HOMEPAGE_SPECIFICATION.md` §17's LCP target) — this document does not invent a new number, only requires every future implementation document to honor the ones that already exist.
- **Food Central is held to the platform's strictest performance bar**, restating `09_FOOD_ORDERING_SPECIFICATION.md` §26 directly, and the admin surface is held to its own, more lenient but still real bar, restating `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §26 directly — this document does not blur that distinction.

## 27. Accessibility Philosophy

- **`DESIGN_SYSTEM.md` §B9 and §B11's tokens (contrast, touch targets, form behavior) are binding on every future frontend implementation document**, not a checklist item to satisfy after the fact.
- **The never-color-alone rule and the live-region pattern for dynamic updates, established consistently across every one of the 11 Product Specifications, are implementation requirements** — `06_COMPONENT_ARCHITECTURE.md` and `07_PAGE_ARCHITECTURE.md` must build them in from the start, restating `AI_HANDOFF.md` §12's "accessibility by default... not retrofitted" principle directly.
- **Medusa's own native admin UI is Medusa's accessibility responsibility, not this project's** — restating `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §24's scoping directly: `DESIGN_SYSTEM.md`'s tokens govern custom admin extensions this project builds, not Medusa's unmodified core admin interface.

## 28. Testing Philosophy

- **Every Product Specification's acceptance criteria are the source of truth for what must be tested** — restating `DOCUMENTATION_GOVERNANCE.md` §11's existing quality-checklist requirement directly: a specification without testable acceptance criteria would be incomplete, and every one of the 11 frozen specifications already has them.
- **`16_TESTING_STRATEGY.md` defines the exact tooling, coverage standard, and test-case-derivation process** — this document does not invent that standard prematurely, consistent with `DOCUMENTATION_GOVERNANCE.md` §12's own guidance to add a testing convention "when Phase 1 backend work is far enough along to know what's actually needed," not speculatively now.
- **A behavior is not considered implemented until its corresponding acceptance criterion passes** — restating the implicit contract every specification's Acceptance Criteria section already establishes, made an explicit implementation-phase requirement here.

## 29. Deployment Philosophy

- **PostgreSQL and Redis in production-appropriate configurations are non-negotiable**, restating `TECH_STACK.md`'s explicit finding that Medusa's in-memory dev mode is not production-appropriate.
- **No specific hosting provider is named or approved anywhere in `/docs` today** — a genuinely new gap this document surfaces (§31), resolved by `14_DEPLOYMENT_ARCHITECTURE.md` once Paul decides, not assumed here.
- **Deployment architecture follows the system architecture, never the reverse** — restating §5's hierarchy directly: `14_DEPLOYMENT_ARCHITECTURE.md` depends on `01_SYSTEM_ARCHITECTURE.md`, not the other way around.

## 30. Coding Standards

- **TypeScript throughout**, restating `TECH_STACK.md`'s confirmed backend language choice directly, extended to the storefront as Next.js's own natural convention.
- **Yarn workspaces and Turborepo**, restating `TECH_STACK.md`'s confirmed tooling choice directly, inherited from Medusa's own monorepo conventions.
- **This document sets the philosophy of consistency — one shared set of conventions across every module and the storefront, no ad hoc per-module tooling choices — not the literal lint/format/naming ruleset itself**, which belongs to `01_SYSTEM_ARCHITECTURE.md` or a later, code-adjacent artifact once real implementation work begins, consistent with this document's own scope boundary (§2) against writing implementation code.

## 31. Risks

- **Authoring implementation documents before every dependent business/technology decision lands risks rework** — `12_PAYMENT_ARCHITECTURE.md` and `13_NOTIFICATION_ARCHITECTURE.md` specifically cannot be meaningfully completed until the payment-provider and notification-channel decisions resolve; authoring them prematurely against a guessed provider would violate this document's own "never invent a business decision" discipline.
- **A newly-discovered gap: no media/image-hosting provider has ever been named or approved anywhere in `/docs`.** This was surfaced only while scoping `10_MEDIA_ARCHITECTURE.md` against the proposed Phase 2 document list — flagged in `PROJECT_STATUS.md`, not resolved here.
- **A newly-discovered gap: no hosting/infrastructure provider has ever been named or approved anywhere in `/docs`.** Surfaced while scoping `14_DEPLOYMENT_ARCHITECTURE.md` — flagged in `PROJECT_STATUS.md`, not resolved here.
- **Cross-reference discipline lapsing risks a Phase 2 document silently contradicting a frozen Product Specification** — the same risk `DOCUMENTATION_GOVERNANCE.md` §6 already names platform-wide, restated here because Phase 2's sixteen documents multiply the number of places such a contradiction could quietly enter.
- **Over-specifying Phase 2 for a scale the business hasn't asked for** — restating `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §1/§2's proportionality principle directly: this document's own sixteen-document structure should not be treated as a floor that must grow further without a genuine need driving it.
- **Sixteen documents authored by potentially different contributors over time risks philosophical drift** — the very reason §14–§29 exist: to give every future Phase 2 document a shared standard to check itself against, reducing but not eliminating this risk.

## 32. Quality Checklist

Mirroring `DOCUMENTATION_GOVERNANCE.md` §11's checklist, adapted for Phase 2 implementation documents:

- [ ] Has the standard header (`Status`, `Version`, `Owner`, `Last Updated`) per `README.md`'s convention, plus a `Phase` field identifying it as Phase 2.
- [ ] Status accurately reflects reality — cross-checked against `PROJECT_STATUS.md`.
- [ ] States its dependencies on other documents (§7), and does not contradict any of them.
- [ ] Every internal link resolves to a file that actually exists.
- [ ] Distinguishes decided facts from open questions/recommendations — nothing is quietly assumed.
- [ ] Is indexed in `docs/README.md`'s document map.
- [ ] If it records a decision: that decision also has a `DECISION_LOG.md` entry.
- [ ] If it changed materially: `PROJECT_STATUS.md` and, if relevant, `CHANGELOG.md` were updated in the same change.
- [ ] Contains no implementation code, database schema, API design, frontend component, or wireframe.
- [ ] Uses terminology consistent with the rest of `/docs`.

## 33. Acceptance Criteria

- [ ] This document defines all sixteen required Phase 2 implementation documents, each with a Purpose, Scope, Dependencies, Deliverables, Required approvals, and Frozen-or-Living designation.
- [ ] This document contains no implementation code, database schema, API design, frontend component, or wireframe anywhere.
- [ ] Every philosophy section (§14–§29) traces its requirements to an already-approved frozen document or an explicitly flagged open decision — none invents a new business or technical decision.
- [ ] Every genuinely new dependency or open question this document surfaces (media-hosting provider, hosting/infrastructure provider) is flagged in `PROJECT_STATUS.md`, not resolved here.
- [ ] No frozen Phase 0 or Phase 1 document is contradicted anywhere in this document.
- [ ] The hierarchy (§5) and dependency map (§7) are internally consistent — no document depends on one that in turn depends back on it.
- [ ] This document is indexed in `docs/README.md` and cross-referenced from `PROJECT_STATUS.md`, `ROADMAP.md`, and `DECISION_LOG.md`.

## 34. Exit Criteria for Phase 2

Phase 2 — Implementation Planning is complete when, and only when:

- [ ] All sixteen implementation documents named in §6 exist, have been reviewed, and are either **Frozen** (for the fourteen architecture-defining documents, §10) or genuinely **Living** by design (`15_IMPLEMENTATION_SEQUENCING.md`, `16_TESTING_STRATEGY.md`).
- [ ] Every genuinely open business/technology decision each document depends on (payment provider, notification channel, media-hosting provider, hosting/infrastructure provider, formal Sanity/Meilisearch/Next.js Starter sign-off) has either been resolved by Paul or is explicitly and currently tracked in `PROJECT_STATUS.md` — Phase 3 (actual implementation) may begin on the documents whose dependencies are resolved without waiting for every open item to close, consistent with `ROADMAP.md`'s existing parallel-track precedent.
- [ ] No Phase 2 document contradicts any frozen Phase 0 or Phase 1 document, verified by the same cross-reference and status-consistency validation used throughout this project.
- [ ] `docs/README.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `DECISION_LOG.md`, and `CHANGELOG.md` all reflect Phase 2's completion in the same change that declares it complete — the identical discipline applied to Phase 1's own completion.
- **Only once these criteria are met does implementation code, database schema, API design, or frontend component work begin** — restating this document's own scope boundary (§2) as the final gate, not a suggestion.

---

**Document status:** Approved (v1.0). This document is the governing reference for Phase 2 — Implementation Planning, in the same relationship to Phase 2's future documents that `DOCUMENTATION_GOVERNANCE.md` holds to `/docs` as a whole. Per its own change-management rules (§12), substantive changes require Paul's approval; non-substantive maintenance does not. No individual Phase 2 implementation document (§6) begins without Paul's explicit direction to start that specific one.
