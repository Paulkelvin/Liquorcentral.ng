# Admin Workflows Specification

**Status:** Approved — Frozen
**Version:** 1.0
**Owner:** Operations
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for LiquorCentral's internal, staff-facing operational experience — everything a staff member does inside the Medusa Admin (native or extended) to run the business day to day, across both Wine & Spirits and Food Central. It defines *staff behavior, operational logic, business rules, accountability, accessibility, and backend requirements* — no UI mockups, no wireframes, no implementation code, no database schema, and no API design appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier and per direct instruction.

Every recommendation below derives from `ARCHITECTURE.md` (Medusa Admin's extensibility model), `MEDUSA_EXTENSIONS.md` (every custom module staff will manage data for), `API_DECISIONS.md`, `PRODUCT_CATALOG.md`, `BUSINESS_RULES.md` (the single-company, no-vendor operating model), `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md`, and none of it contradicts them. It integrates directly with the ten already-frozen specifications it sits beside, none of which it redefines: `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance table already assigns category/collection content control to "Merchandising, via the Medusa admin" — this document specifies what that admin workflow actually is; `03_SEARCH_SPECIFICATION.md`'s Merchandising Rules and Ranking Philosophy already establish what editorial boosting and synonym content are allowed to do — this document specifies the staff workflow for doing it; `04_PRODUCT_LISTING_SPECIFICATION.md`'s Merchandising Governance already establishes the caps and rules promotional content operates under — this document specifies how staff apply them; `06_CART_SPECIFICATION.md` through `10_DELIVERY_SPECIFICATION.md` each specify customer-facing commerce, ordering, and delivery behavior — this document specifies the internal counterpart staff use to make that behavior true (fulfilling an order, updating a delivery status, managing kitchen availability, resolving a failed delivery). **This document does not reopen or redefine any customer-facing behavior already specified elsewhere** — it is the staff-facing mirror of decisions those documents have already made, not a second opinion on them.

**Scope boundary:** this document covers only what a LiquorCentral staff member does *inside* the admin surface. It does not cover anything a customer sees or does (every other specification in this directory), and it does not specify database schema, API contracts, or implementation code — those are engineering's job once this behavioral specification is approved, per `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier and per direct instruction.

**Where this document depends on a business or operational decision that has not yet been made** (whether granular, role-differentiated staff permissions are needed for v1 or a single flat admin-user role is sufficient; exact audit-log retention and granularity; exact report definitions; alert thresholds), **it says so explicitly rather than inventing an answer**, and any newly discovered question is flagged in `PROJECT_STATUS.md`'s "Decisions Awaiting Paul's Approval" rather than resolved here.

A backend/operations lead should understand exactly what staff need to be able to do, a frontend developer building the admin extension should be able to build from it, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Admin Workflows Philosophy

**The admin experience exists to make every promise this platform makes to a customer actually true — it is where honesty, freshness, accuracy, and trust (already required everywhere else in `/docs`) are made or broken operationally, one staff action at a time.** Three commitments follow:

1. **The admin surface is a tool for a single accountable company, never a marketplace back-office.** Restating `BUSINESS_RULES.md` directly: there is no vendor actor-type, no per-vendor dashboard, no vendor payouts — every workflow below assumes one company's own staff acting on one company's own catalog, orders, and deliveries.
2. **Nothing customer-facing is promised without an equivalent, honest staff-side mechanism to keep that promise.** A same-day cutoff (`09_FOOD_ORDERING_SPECIFICATION.md` §9), a delivery status (`10_DELIVERY_SPECIFICATION.md` §10), or an allergen listing (`05_PRODUCT_DETAILS_SPECIFICATION.md` §11) is only ever as honest as the staff workflow that maintains it — this document's job is specifying that workflow, not assuming it exists.
3. **Operational realism over invented tooling.** This document specifies what staff genuinely need at the company's actual current scale (a small, focused admin team; manual rider coordination; no dedicated business-intelligence tooling yet) — it does not invent capability the business has not approved, consistent with every prior specification's identical discipline.

## 2. Business Objectives

- **Make every customer-facing commitment operationally true** — accurate stock levels, honest kitchen availability, correct pricing, and honest delivery status all depend on staff having a workflow that lets them keep the platform accurate, not just the intention to.
- **Protect trust through accountability, not just customer-facing honesty** — `PRODUCT_BLUEPRINT.md` §11's "sold and delivered by us directly" claim depends on knowing, internally, who changed what and when (§22), not only on what the customer sees.
- **Minimize the operational cost of running two structurally different catalogs** — a warehouse-dispatched, nationwide Wine & Spirits catalog and a cooked-to-order, Lagos-only Food Central catalog have genuinely different day-to-day staff workflows (§6–§14), and this document does not force them into one undifferentiated tool where doing so would misrepresent either.
- **Keep the admin experience proportionate to the company's actual size and stage** — this document specifies a focused, staff-appropriate tool, not an enterprise back-office with capability the business has not asked for (§27).

## 3. Operational Objectives

Extending the customer-objective framing every prior specification uses (`PRODUCT_BLUEPRINT.md` §4) to the internal staff audience this document serves:

| Staff role (illustrative, not a commitment — see §15) | Operational objective |
|---|---|
| General/store operations staff | See the current state of the business (orders, inventory, promotions) at a glance (§5) without needing to check multiple disconnected views. |
| Kitchen staff | Know exactly what to prepare, in what order, and update status honestly as they go (§12), without administrative overhead slowing down service. |
| Delivery/dispatch coordinator | Assign and track riders, and resolve a failed or ambiguous delivery quickly (§13), without guessing at what the customer was told. |
| Merchandising/marketing staff | Manage categories, collections, promotions, and search boosting (§7, §10, §17) within the caps and rules already established elsewhere in `/docs`, without needing engineering involvement for routine content changes. |
| Customer support staff | Look up a customer's order and account context quickly (§14) to resolve a query, without editing data outside what support is meant to touch. |

Every staff user additionally needs: to trust that what the admin shows is current, not stale (§24); to be told plainly when an action can't proceed and why (§24); and to never be able to take an action that would misrepresent something already promised to a customer (§1).

## 4. Entry Points & Scope Boundary

- **The Medusa Admin dashboard itself** (`ARCHITECTURE.md`) is this document's sole entry point — a React admin application, extensible via widgets and routes, not a separate application this document specifies from scratch.
- **This document does not specify authentication mechanics beyond what `TECH_STACK.md` already establishes** — Medusa's native auth system, with a distinct admin-user actor type from the customer actor type (`BUSINESS_RULES.md`, `ARCHITECTURE.md`), is the system of record; no third-party identity provider is introduced here.
- **This document does not introduce a customer-facing entry point of any kind** — every other specification in this directory owns the customer-facing side of the same business processes this document covers internally.
- **Where this document's workflow is the internal mirror of a customer-facing decision** (e.g., a delivery-slot capacity limit a customer books against), it references the customer-facing specification by section number rather than restating or reinterpreting the underlying rule.

## 5. Dashboard

- **The dashboard is an at-a-glance operational overview, not a full workflow surface** — order volume and status mix (§11), the food-order queue (§12), delivery status summary (§13), and any near-threshold alerts (§19) are surfaced here; the detailed workflow for acting on any of them lives in its own section below, not duplicated on the dashboard itself.
- **Built as Medusa Admin widgets and routes, not a bespoke application** — restating `ARCHITECTURE.md` directly: new admin pages/data are added via Medusa's documented widget/route extension points, never by editing the dashboard's own source.
- **The dashboard reflects genuinely current state** — restating the same honesty discipline every customer-facing specification already applies (`10_DELIVERY_SPECIFICATION.md` §1): a stale count or status shown to staff risks the same downstream dishonesty to a customer that this whole document exists to prevent.
- **Exact dashboard composition (which metrics, in what arrangement) is an operational/design decision, not fixed by this document** — this document specifies that an at-a-glance overview exists and what categories of information it must be able to show, not its exact layout (which belongs to implementation, not this behavioral specification).
- **Both catalogs' operational state is surfaced with equal prominence** — restating the Cross-Catalog Operational Parity principle (below) directly: the dashboard never implicitly reads as Wine-&-Spirits-first with Food Central as an afterthought, or vice versa.

## 6. Product Management

- **Staff manage products (dishes and bottles alike) as ordinary Medusa Products**, distinguished by configuration rather than a separate system — restating `PRODUCT_BLUEPRINT.md` §6 and `PRODUCT_CATALOG.md` directly, not redefining either.
- **Wine & Spirits attribute data (region, producer, vintage, ABV, pairing, storage) and Food Central attribute data (ingredients, allergens, spice level, prep time, dietary flags) are entered and maintained through their respective attribute modules**, linked to the Product record (`MEDUSA_EXTENSIONS.md` #1, #2) — staff enter structured data into defined fields, not free-text descriptions standing in for structured facts.
- **Allergen and ingredient data accuracy is a staff responsibility with real safety consequences, not a cosmetic data-entry task** — restating `05_PRODUCT_DETAILS_SPECIFICATION.md` §11's and `09_FOOD_ORDERING_SPECIFICATION.md` §14's framing directly: this document specifies that the workflow for entering and updating this data exists and is treated with that seriousness; **exactly who on staff is operationally responsible for verifying it remains an open business decision**, already flagged by `09_FOOD_ORDERING_SPECIFICATION.md` §14/§28 and not resolved here.
- **Product-level pricing and promotional pricing are managed here but specified in full in §9/§10** — this section covers only the product-record workflow (creating, editing, discontinuing a product), not pricing mechanics.
- **A product's Wine & Spirits vs. Food Central classification determines which attribute module and inventory behavior apply (§8)** — staff do not manually toggle inventory tracking per product outside of that classification; it follows from which catalog the product belongs to (`PRODUCT_BLUEPRINT.md` §6).

## 7. Category & Collection Management

- **This section specifies the admin workflow for the content-control responsibility `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance table already assigns to "Merchandising, via the Medusa admin" — it does not redefine who controls what, only how they do it.**
- **Category tree contents (which categories exist, their names, nesting, order) are fully data-driven and staff-editable**, requiring no developer involvement for a routine change — restating `01_NAVIGATION_SPECIFICATION.md`'s Governance table directly. Category *grouping* within the mega menu's link budget is likewise staff-editable within that existing budget; changing the budget itself is an engineering/architecture change outside this document's scope.
- **Evergreen collections** (e.g., "Sommelier's Picks") **are created and curated by staff with no expiry mechanism required** — restating `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy directly.
- **Promotional/time-boxed collections require a start and end date, enforced by data, and are capped at 3–4 simultaneously featured entries** — restating `01_NAVIGATION_SPECIFICATION.md`'s and `04_PRODUCT_LISTING_SPECIFICATION.md`'s Merchandising Governance rules directly; this document specifies that staff set the dates and that the cap is enforced, not a new cap or a different number.
- **No fake urgency is ever staff-configurable** — restating the platform-wide rule directly: the admin interface does not offer a "countdown" or "only X left" field for navigation/listing promotional content, since no prior document authorizes that device (`EXPERIENCE_PRINCIPLES.md` #15).
- **"New Arrivals"-style automatic collections are configured once (the underlying query) and require no ongoing staff curation afterward** — restating `01_NAVIGATION_SPECIFICATION.md`'s Governance table directly.

## 8. Inventory Management

- **Wine & Spirits inventory is stock-tracked; Food Central inventory tracking is off**, per `PRODUCT_BLUEPRINT.md` §6 — this document does not redefine which catalog uses which model, only the staff workflow within each.
- **For Wine & Spirits, staff maintain accurate stock counts per stock location** (`ARCHITECTURE.md`'s Stock Location concept) — an inaccurate count risks exactly the out-of-stock/quantity-adjustment scenarios `06_CART_SPECIFICATION.md` §13 already specifies as a customer-facing consequence of stale inventory data.
- **For Food Central, "inventory" in the conventional sense does not apply — staff instead manage availability state directly**: marking a dish Unavailable due to an ingredient shortage (an "86'd" dish, `09_FOOD_ORDERING_SPECIFICATION.md` §16), and reflecting kitchen operating hours and capacity-driven early closure (`09_FOOD_ORDERING_SPECIFICATION.md` §22). This is a staff action with an immediate customer-facing consequence (the Availability Transition Behaviour already specified in `09_FOOD_ORDERING_SPECIFICATION.md`), not a passive data field.
- **An availability change staff make is reflected to customers the moment it is saved** — restating `09_FOOD_ORDERING_SPECIFICATION.md`'s Availability Transition Behaviour directly: this document does not introduce a delay, approval step, or batching mechanism between a staff action and its customer-facing effect, since either would misrepresent the honesty this document exists to protect (§1).
- **Exact kitchen operating hours, capacity limits, and early-closure triggers remain operational parameters staff configure, not fixed by this document** — restating `09_FOOD_ORDERING_SPECIFICATION.md` §22's and §28's open item directly; this document specifies that a staff-facing control for these parameters exists, not what the parameters themselves are.

## 9. Pricing Management

- **Staff set base product pricing per the Pricing module** (`ARCHITECTURE.md`) — currency, quantity-based pricing, and standard price-record maintenance, native Medusa capability.
- **Staff set promotional pricing at the product level**, reusing the exact promotional-pricing mechanism `04_PRODUCT_LISTING_SPECIFICATION.md` §16/§17 and `06_CART_SPECIFICATION.md` §9 already establish (original price and promotional price both genuinely shown, never a fabricated "original" price) — this document does not introduce a different pricing mechanism for staff to manage.
- **No cart-wide promo/discount-code system is established anywhere in `/docs`** — restating `06_CART_SPECIFICATION.md` §9 directly: this document does not give staff a coupon-code management workflow, since no prior document establishes that feature exists. If ever approved, it is new business/product decision requiring its own specification work.
- **A price change staff make is reflected honestly, never silently, to a customer who already has the item in their cart** — restating `06_CART_SPECIFICATION.md` §8/§12's existing customer-facing consequence directly; this document does not add a staff-side override for that customer-facing honesty requirement.
- **Delivery fees (`10_DELIVERY_SPECIFICATION.md` §16) and the exact fee schedule remain an open operational/business parameter** — this document specifies that staff need a way to configure whatever fee schedule is eventually decided, not what that schedule is.

## 10. Promotions Management

- **This section covers the staff workflow for applying the promotional rules already established elsewhere** (`01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy, `04_PRODUCT_LISTING_SPECIFICATION.md` §16/§17) — it does not introduce a new promotional mechanism.
- **Every promotional collection or featured placement staff create requires a start and end date** — enforced by data, automatically expiring without a manual cleanup step, restating the governance rule directly (§7).
- **The simultaneous-promotion cap (3–4 entries) is enforced by the system, not left to staff discipline alone** — a staff member attempting to feature a fifth entry is shown a blocking condition (§24) requiring them to retire an existing one first, consistent with the "not negotiable per-campaign" rule already established in `01_NAVIGATION_SPECIFICATION.md`.
- **Editorial/curated promotional content (e.g., a gifting occasion, a seasonal campaign) is staff-authored within the same Collection mechanism** — no separate campaign-management tool is introduced.
- **This document does not give staff a mechanism for fabricating urgency** (a countdown, an "only X left" indicator) on any promotional placement — restating the platform-wide no-fake-urgency rule directly.

## 11. Order Management

- **Staff see one unified order view spanning both catalogs**, restating `PRODUCT_BLUEPRINT.md` §9's one-cart-one-checkout decision directly: a mixed order is one order record with two fulfillment legs, never two separate order records staff must reconcile manually.
- **A mixed order's two fulfillment legs (`06_CART_SPECIFICATION.md` §6, `07_CHECKOUT_SPECIFICATION.md` §8) are shown to staff exactly as distinctly as they are shown to the customer** — restating the platform-wide "never merged" discipline directly: a staff member managing a mixed order sees the Wine & Spirits leg and the Food Central leg as clearly separate, since conflating them internally would risk exactly the confusion those specifications exist to prevent externally.
- **Staff can update a Wine & Spirits order's fulfillment status through its own progression** (Order Placed → Dispatched → In Transit → Delivered, `10_DELIVERY_SPECIFICATION.md` §10) — this document does not redefine that progression, only specifies that staff have a workflow to advance it honestly, per §1's "a status is only shown once it is genuinely true" rule.
- **A failed delivery, a rescheduling request, or a cancellation (`10_DELIVERY_SPECIFICATION.md` §13/§14) is actioned by staff through this same order view** — this document does not introduce a separate tool for exception handling; it is part of ordinary order management.
- **The alcohol return/refund policy remains an open business decision** (`PRODUCT_BLUEPRINT.md` §9, `07_CHECKOUT_SPECIFICATION.md` §15, `PROJECT_STATUS.md`) — this document specifies that staff need a workflow to process a return/refund once that policy is decided, not what the policy is.

## 12. Food Order Workflow (Kitchen & Staff-Facing)

- **This section is the kitchen-facing counterpart to `09_FOOD_ORDERING_SPECIFICATION.md` §7's customer-facing cook-to-order progression** — kitchen staff advance an order through Order Received → Preparing → Ready (pickup) or Out for Delivery → Completed by taking the corresponding real action, not by an automated or estimated trigger. **This document does not redefine that progression**, only specifies that staff genuinely drive it.
- **A stage is only ever advanced once it is genuinely true**, restating `09_FOOD_ORDERING_SPECIFICATION.md` §7's and §1's identical rule directly — kitchen staff mark "Preparing" when preparation genuinely begins, not when the order is merely queued, since a dishonest internal status produces an equally dishonest customer-facing one.
- **Marking a dish Unavailable (86'd) due to an ingredient shortage is a kitchen-staff action with an immediate customer-facing effect** (§8, `09_FOOD_ORDERING_SPECIFICATION.md` §16) — this document specifies that this action exists and takes effect immediately, not a specific interface for taking it.
- **The same-day cutoff, kitchen operating hours, and capacity parameters that govern customer-facing ordering** (`09_FOOD_ORDERING_SPECIFICATION.md` §9, §22) **are configured by staff, not fixed in code** — this document specifies that a staff-facing configuration workflow exists for these operational parameters, without fixing what the parameters themselves are, consistent with the open items already flagged there.
- **A scheduled order's kitchen-capacity conflict discovered after booking** (`09_FOOD_ORDERING_SPECIFICATION.md` §9, `10_DELIVERY_SPECIFICATION.md` §9) **is surfaced to staff as an operational alert requiring action** (§19), not silently absorbed — the exact resolution policy (renegotiating the slot) remains an open business decision already flagged in `10_DELIVERY_SPECIFICATION.md` §28, not resolved here.

## 13. Delivery Management (Staff-Facing)

- **This section is the staff-facing counterpart to `10_DELIVERY_SPECIFICATION.md`'s customer-facing delivery specification** — it does not redefine delivery coverage, status vocabulary, fees, or policy, only the workflow staff use to operate it.
- **Rider assignment and dispatch remain a manual, staff-coordinated process for v1**, restating `10_DELIVERY_SPECIFICATION.md` §7's and `DELIVERY_MODEL.md`'s "Rider dispatch" finding directly — this document specifies that staff have a workflow to record which rider is assigned to which order and to advance that order's delivery status accordingly, not a dispatch-optimization or live-GPS tooling layer (explicitly out of scope, §27).
- **Delivery-slot capacity is managed by staff as an operational parameter** (`MEDUSA_EXTENSIONS.md` #3) — slot length, cutoff times, and capacity per slot are staff-configurable, restating the open-parameter treatment already established in `07_CHECKOUT_SPECIFICATION.md` §10 and `09_FOOD_ORDERING_SPECIFICATION.md` §9/§10 directly, not invented here.
- **A failed delivery, a customer-unavailable scenario, or an address ambiguity requiring direct contact** (`10_DELIVERY_SPECIFICATION.md` §12, §13, Delivery Recovery) **is worked through this same staff-facing view** — this document specifies that staff can see the scenario, contact the customer, and record the outcome, not a separate incident-management tool.
- **Proof of delivery is captured by staff (or the rider, via a staff-facing mechanism) before an order is marked Completed** — restating `10_DELIVERY_SPECIFICATION.md` §17 directly; the exact capture mechanism (manual confirmation, photograph, signature) remains an operational/backend detail not fixed here.
- **Whether age is physically re-verified at the point of hand-off remains an open business/legal decision** (`10_DELIVERY_SPECIFICATION.md` §17, `07_CHECKOUT_SPECIFICATION.md` §15) — this document specifies that, if adopted, the natural place for staff or rider to record it is within this same proof-of-delivery step, not that the check itself exists today.

## 14. Customer Management (Staff-Facing)

- **This section is the staff-facing counterpart to `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s customer-facing account specification** — it does not redefine account behavior, privacy rules, or data ownership, only what staff can see and do in service of supporting a customer.
- **Staff can look up a customer's order history and account context to resolve a support query** — restating `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14's unified, cross-catalog order history directly, viewed here from the staff side.
- **Staff-initiated changes to customer data are limited to the support-assisted cases `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` already names as requiring support** (e.g., a customer who has lost access to the email address that is their sole identity anchor, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Account Recovery) — staff do not otherwise edit a customer's profile, saved addresses, or preferences on their behalf, since that would undermine the customer-controlled data-ownership principle `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §17 already establishes.
- **The data-retention/NDPR-compliance specifics and the account deletion-vs-deactivation policy remain open business/legal decisions** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §17/§18, `PROJECT_STATUS.md`) — this document specifies that staff need a workflow to action a deletion/deactivation request once that policy is decided, not what the policy is.
- **No staff workflow in this document introduces a customer-facing capability not already established elsewhere** (e.g., staff cannot grant a loyalty benefit or a discount mechanism that does not otherwise exist in `/docs`) — restating the platform-wide "do not invent business capability" discipline directly.

## 15. Staff Roles & Permissions

- **Medusa's native actor-type model distinguishes only customer and admin-user** — restating `BUSINESS_RULES.md`'s and `ARCHITECTURE.md`'s explicit finding directly: there is no vendor actor-type, and no granular, role-differentiated permission tiering (e.g., "kitchen staff can update order status but not pricing") is established anywhere in `/docs` today.
- **Whether granular, role-based staff permissions are needed for v1, or whether a single flat admin-user role is sufficient at the company's current operating scale, is a genuine open business and technical decision, not resolved here.** This document does not invent a role taxonomy (kitchen staff, dispatch coordinator, merchandising, support, management) as an implemented permission system — the roles named illustratively in §3 describe *who does what*, not an approved permissions model.
- **If granular permissions are ever adopted, the workflows specified in §5–§14 are the natural boundary lines a future permission model would draw around** — this document names that possibility (§27) without committing to it or inventing its specifics.
- **Every staff action of consequence is attributable to the individual admin-user who took it**, regardless of whether roles are ever differentiated — this is the minimum accountability baseline this document requires (§22), not contingent on the open role-permission decision above.

## 16. Content Management

- **Product descriptions and core commerce content are authored directly in the Medusa Admin**, alongside the product record itself (§6) — no separate content system is required for this baseline content.
- **Richer editorial/marketing content (tasting stories, seasonal campaigns, richer dish storytelling) is a future capability dependent on a CMS integration**, restating `MEDUSA_EXTENSIONS.md` #7's "not urgent" Sanity recommendation directly — this document does not specify a content-authoring workflow for a system that is not yet approved or built.
- **Commerce data flows one way, from Medusa to any future CMS, never back** — restating `MEDUSA_EXTENSIONS.md` #7's documented integration pattern directly; staff do not manage core commerce data (pricing, inventory, order status) from within a future CMS.
- **Legal/compliance content** (footer legal links, `01_NAVIGATION_SPECIFICATION.md` §8) **is staff-editable but requires Legal/Compliance sign-off**, restating `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance table directly — this document does not loosen that sign-off requirement for the sake of workflow convenience.

## 17. Search Merchandising Workflow

- **This section specifies the staff workflow for the editorial and merchandising rules `03_SEARCH_SPECIFICATION.md` already establishes** — it does not redefine ranking philosophy, typo tolerance, or synonym mechanics, all of which remain `03_SEARCH_SPECIFICATION.md`'s authoritative domain.
- **Editorial boosting is staff-configurable within the caps and rules `03_SEARCH_SPECIFICATION.md`'s Merchandising Rules and Ranking Philosophy already set** — restating directly: no promotional, business, or availability signal may ever outrank genuine relevance or insert an irrelevant product, and this document does not give staff a control that would violate that rule.
- **Synonym content is merchandising-owned and staff-editable**, restating `03_SEARCH_SPECIFICATION.md`'s existing governance model directly (the same data-vs-structure distinction `01_NAVIGATION_SPECIFICATION.md`'s Governance table applies elsewhere) — the underlying typo-tolerance/synonym *mechanism* itself (Meilisearch-native) is not staff-configurable, only the synonym content within it.
- **Staff cannot configure a ranking behavior that contradicts `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy** (relevance, then availability, then business merchandising, in that order) — this document does not introduce a staff override for that hierarchy.

## 18. Reports & Analytics

- **Staff need visibility into sales, order volume, delivery performance, and kitchen-capacity utilization** to run the business day to day (§2) — this document specifies that such reporting capability exists, not the exact set of reports or their precise definitions, which are operational parameters not invented here.
- **Reporting data is sourced from the same native Medusa commerce data and the custom modules this project adds** (`ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`) — this document does not introduce a separate business-intelligence data pipeline; a dedicated BI tool is a plausible future capability (§27), not built now.
- **Analytics events already specified as customer-facing tracking throughout `01`–`10`** (e.g., `06_CART_SPECIFICATION.md` §24, `10_DELIVERY_SPECIFICATION.md` §23) **are a data source for staff-facing reporting, not redefined here** — this document does not introduce a second, competing analytics-event taxonomy.
- **Exact report cadence, format, and distribution (e.g., a daily summary vs. an on-demand dashboard) are operational/implementation parameters**, not fixed by this document.

## 19. Notifications (Staff-Facing)

- **This section is distinct from the customer-facing communication `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 and `10_DELIVERY_SPECIFICATION.md` §18 already specify** — staff-facing notifications alert staff to something requiring their attention; they are never the mechanism for customer communication, which those documents already own.
- **Staff are alerted to operationally significant events**: a new order (§11), a food order entering the kitchen queue (§12), a delivery-slot nearing capacity (§13), a low Wine & Spirits stock level (§8), a promotional collection nearing its simultaneous-cap limit (§10), and a delivery exception requiring resolution (§13) — this document specifies that these categories of alert exist, not their exact thresholds or delivery mechanism.
- **Exact alert thresholds (e.g., what stock level counts as "low") are operational parameters staff configure**, not fixed by this document, consistent with every other operational-parameter treatment already established throughout `/docs`.
- **No staff-facing alert fabricates urgency beyond what is genuinely true** — restating the platform-wide no-fake-urgency principle directly, applied here to the internal audience as much as the customer-facing one: a false "urgent" alert erodes staff trust in the system the same way a fabricated customer-facing urgency device erodes customer trust.

## 20. Audit Logging

- **Every consequential staff action — a price change, an inventory or availability update, a promotion created or expired, an order status change, a customer-data edit — is attributable to the specific admin-user who took it and when.** This is the direct accountability mechanism `PRODUCT_BLUEPRINT.md` §11's "sold and delivered by us directly" trust claim depends on internally, not only externally.
- **An audit record is never editable or deletable by the staff whose action it records** — a basic integrity requirement for the log to be trustworthy at all; this document does not specify who (if anyone) can ever amend a historical record, since no prior document establishes that capability and this document does not invent one.
- **Exact audit-log retention duration and the precise granularity of what is logged are operational parameters, not fixed by this document** — flagged as open (§28), consistent with the treatment already given to other operational parameters throughout `/docs`.
- **Audit logging is a baseline requirement, not contingent on the open staff-permissions decision** (§15) — attributability to an individual admin-user is required whether or not roles are ever formally differentiated.
- **This mechanism exists for accountability and troubleshooting, not staff performance evaluation** — restating the governing principle named directly in Operational Trust & Accountability (below); this document does not introduce a staff scoring, ranking, or performance-review mechanism, which is an HR/management matter outside this document's scope.

## 21. Security

- **Staff authentication uses Medusa's native admin-user auth**, restating `TECH_STACK.md`'s and `ARCHITECTURE.md`'s explicit finding directly — no third-party identity provider is introduced for staff any more than for customers.
- **Baseline security expectations apply regardless of the open staff-permissions decision** (§15): repeated failed login attempts are rate-limited, and a locked-out staff member is told plainly rather than left guessing — restating the identical security-baseline treatment `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Session & Security Behaviour already establishes for the customer-facing equivalent, applied here to staff.
- **A sensitive, hard-to-reverse action** (e.g., permanently deleting a product record, processing a refund) **requires re-confirmation before it completes** — restating the identical "step-up" pattern `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Session & Security Behaviour already establishes for the customer-facing equivalent, applied here to consequential staff actions.
- **No staff credential or session mechanic beyond what is already established platform-wide is introduced here** — this document does not specify a different security model for staff than the baseline `TECH_STACK.md` and `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` already establish.

## 22. Operational Decision States

This document reuses the same five-state taxonomy already established in `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, `09_FOOD_ORDERING_SPECIFICATION.md`, and `10_DELIVERY_SPECIFICATION.md` — informational, recommendation, warning, blocking condition, recoverable error — instantiated with staff-facing triggers, rather than inventing a new vocabulary:

| State | Staff-facing trigger | Staff impact | Expected staff action |
|---|---|---|---|
| **Informational** | An order count, a kitchen-queue length, a delivery-status summary shown on the dashboard (§5). | None. | None required. |
| **Recommendation** | Not currently used in the admin experience — no automated merchandising or operational suggestion is introduced, consistent with the platform-wide restraint principle. | N/A | N/A |
| **Warning** | A delivery slot or promotional-collection cap nearing its limit (§10, §13, §19); a stock level nearing low (§8). | Staff should notice before the limit is actually reached. | Review and act proactively if desired; the current state still functions. |
| **Blocking condition** | An attempt to feature a fifth promotional entry past the 3–4 cap (§10); an attempt to delete a category or collection still in active use (§7). | Cannot proceed until resolved. | Resolve the specific condition (retire an existing entry, reassign affected products) before proceeding. |
| **Recoverable error** | A failed status update, a failed save, a failed proof-of-delivery capture. | Temporary — the affected action did not complete. | Retry; other completed work is preserved. |

## 23. Empty, Loading & Error States

- **An empty state (no orders yet, no products in a new category) is shown as a clear, honest state**, never a blank screen implying something is broken — restating the platform-wide discipline every customer-facing specification already applies.
- **Loading states use skeleton placeholders, not spinners**, consistent with the platform-wide discipline already established in every prior specification, applied here to the admin surface as well.
- **A failed save or update is shown honestly and specifically** (e.g., which field or record failed to save), never a generic error that leaves staff unsure whether their change took effect.
- **No blank white space or broken layout is an acceptable failure mode anywhere in the admin experience** — the same standard already set platform-wide for the customer-facing surfaces.

## 24. Accessibility

- **Any custom widget or route this project adds to the Medusa Admin follows `DESIGN_SYSTEM.md`'s accessibility tokens** (contrast, touch targets, form behavior, `DESIGN_SYSTEM.md` §B9/§B11) where it introduces new interface elements — this document does not carve out an accessibility exception for internal tooling.
- **The native Medusa Admin dashboard's own accessibility characteristics are Medusa's responsibility, not `DESIGN_SYSTEM.md`'s** — `DESIGN_SYSTEM.md` governs LiquorCentral's customer-facing brand experience and any custom admin extension this project builds; it does not retroactively govern Medusa's own unmodified admin UI, consistent with `ARCHITECTURE.md`'s "never modify Medusa core" rule.
- **Every consequential action (a save, a status change, a deletion) provides clear, non-color-alone confirmation or error feedback** — restating the platform-wide never-color-alone rule directly, applied here to the staff audience as much as the customer-facing one.
- **Every interactive control in a custom admin extension is fully keyboard-operable**, consistent with the platform-wide accessibility baseline — staff are not assumed to exclusively use a mouse any more than customers are assumed to exclusively use one.
- **Focus is placed on the relevant confirmation, error, or recovered-state message after a save, a recovered interruption (Admin Workflow Recovery, below), or an exception-handling action completes** — reusing the identical focus-management discipline already established in `07_CHECKOUT_SPECIFICATION.md` §22, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §22, and `10_DELIVERY_SPECIFICATION.md` §21 for their own post-action moments, applied here to the staff audience.

## 25. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Product/attribute management (§6) | Native Product module + wine/food attribute modules | `MEDUSA_EXTENSIONS.md` #1, #2 | Attribute modules **not yet built** |
| Category/collection management (§7) | Native Product Category/Collection, start/end-dated Collection support | `01_NAVIGATION_SPECIFICATION.md` Governance table | Native, with promotional expiry logic to confirm |
| Inventory/availability management (§8) | Native Inventory module (Wine & Spirits); availability-flag mechanism (Food Central) | `PRODUCT_BLUEPRINT.md` §6 | Native mechanism; Food Central capacity logic **not yet built** |
| Pricing/promotions (§9, §10) | Native Pricing/Promotion modules | `ARCHITECTURE.md` | Native |
| Order management (§11) | Native Order module, multi-fulfillment-leg support | `PRODUCT_BLUEPRINT.md` §9 | Native |
| Food order/kitchen workflow (§12) | Order status field/workflow, Food Central vocabulary | `09_FOOD_ORDERING_SPECIFICATION.md` §7 | Native mechanism; staff-facing workflow **not yet built** |
| Delivery management (§13) | Delivery-slot module, rider-assignment record-keeping | `MEDUSA_EXTENSIONS.md` #3 | Delivery-slot module **not yet built**; rider assignment is operational, no dedicated module planned |
| Customer support view (§14) | Native Customer/Order query access | `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14 | Native |
| Staff roles/permissions (§15) | Native admin-user actor type; granular RBAC not yet decided | `BUSINESS_RULES.md`, `ARCHITECTURE.md` | Native single-role mechanism; granular permissions **not yet scoped** |
| Reports/analytics (§18) | Native commerce data + custom module data, aggregation mechanism | `ARCHITECTURE.md` | **Not yet built** |
| Staff notifications (§19) | Internal alerting mechanism, distinct from the customer notification provider | `MEDUSA_EXTENSIONS.md` #5 (customer-facing, for contrast) | **Not yet scoped** |
| Audit logging (§20) | Action/change history mechanism | Not yet established | **Not yet scoped** |

## 26. Performance Expectations

- **The admin experience must not become a bottleneck during peak order volume** — a slow save or a slow-loading order queue during a genuine rush (e.g., a same-day Food Central peak, `09_FOOD_ORDERING_SPECIFICATION.md` §22) has a direct, real operational cost, not just an inconvenience.
- **This document does not adopt the customer-facing LCP/performance targets** (`02_HOMEPAGE_SPECIFICATION.md` §17) **wholesale, since the admin audience and usage pattern are genuinely different** — it specifies a reasonable, staff-appropriate responsiveness standard instead: routine actions (a save, a status update) complete without a staff member reasonably wondering whether the action registered.
- **Exact performance budgets/targets for the admin surface are an implementation parameter**, not fixed numerically by this document.

## 27. Future Expansion & Explicitly Out of Scope

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, and explicitly names what this document deliberately does not introduce:

**Explicitly out of scope for v1, not established elsewhere in `/docs`:**

- **Granular, role-differentiated staff permissions** — a plausible future need (§15), not committed or built for v1; a single flat admin-user role is the current baseline.
- **A dedicated rider-dispatch/route-optimization module** — restating `10_DELIVERY_SPECIFICATION.md` §27 and `PRODUCT_BLUEPRINT.md` §17 directly: rider assignment remains manual/operational for v1.
- **A dedicated business-intelligence/reporting platform** — reporting for v1 is specified at the level of "this capability must exist" (§18), not a specific BI tool.
- **A vendor-facing dashboard or vendor actor-type of any kind** — directly contradicts the single-company, no-marketplace model (`BUSINESS_RULES.md`); not introduced here or anywhere in `/docs`.
- **AI-assisted merchandising, ranking, or dispatch decisions** — not established anywhere in `/docs`; every workflow in this document remains staff-driven.
- **A separate content-authoring/CMS workflow** — dependent on the not-yet-urgent Sanity integration (`MEDUSA_EXTENSIONS.md` #7); not built now.

**Plausible future capability, not built now:**

- Role-differentiated permissions, once the business genuinely needs to restrict which staff can take which actions (§15, §27).
- A formal audit-log retention and reporting policy, once genuinely scoped (§20).
- Richer reporting/analytics tooling, once operational data volume justifies the investment (§18).

None of the above is authorized or scoped work — this section exists solely to confirm the architecture chosen for v1 does not foreclose any of it, and to make the deliberate exclusions explicit rather than silent.

## 28. Risks & Assumptions

**Risks:**

- **A single flat admin-user role, if it remains the model as the team grows, risks a staff member taking an action outside their intended responsibility** (e.g., kitchen staff editing pricing) with no system-level prevention — this document names the risk without inventing a permissions system to solve it prematurely (§15, §27).
- **Several genuine open operational and business decisions this document depends on, none resolved here**: exact allergen/ingredient data-verification responsibility (shared with `09_FOOD_ORDERING_SPECIFICATION.md` §14/§28); audit-log retention and granularity (§20); exact report definitions (§18); staff-facing alert thresholds (§19); and whether granular staff permissions are needed (§15). None block this document's own behavioral scope, but each will directly shape implementation once resolved.
- **The delivery-slot module, food/wine attribute modules, and any dedicated reporting/audit mechanism are not yet built** (`MEDUSA_EXTENSIONS.md` #1–#3) — this document's behavioral requirements assume they exist; their absence is a backend dependency, not a specification gap.
- **A dishonest or stale admin view carries a direct downstream cost** — since this document's whole purpose is making customer-facing promises operationally true, a staff-side inaccuracy (§1, §5) is never merely an internal inconvenience.

**Assumptions:**

- Medusa Admin's native widget/route extensibility (`ARCHITECTURE.md`) is sufficient for this document's behavioral requirements (§25) — no separate internal application is assumed necessary.
- Every customer-facing specification (`01`–`10`) is the correct foundation this document mirrors internally, not something this document should be read as re-deciding.
- A single, focused admin team, appropriate to the company's current operating scale, is the correct assumption for v1 — this document does not size itself for a much larger operation it has not been asked to plan for.

## 29. Admin Workflows Quality Checklist

Every future change to the admin experience — a new workflow, a new report, a new staff-facing control — must be able to answer **yes** to all of the following before it's considered complete, the same discipline every prior frozen specification already applies to its own domain:

- [ ] **Does it make a customer-facing promise operationally true**, rather than leaving a gap between what's promised and what staff can actually keep accurate? Checked against §1, §2.
- [ ] **Does it avoid redefining any customer-facing behavior already specified in `01`–`10`**, serving only as that behavior's internal counterpart?
- [ ] **Does a mixed order's two fulfillment legs remain distinctly presented to staff**, never merged into one confusing view? (§11)
- [ ] **Does it avoid inventing a business or operational decision** (§6, §14, §15, §18, §19, §20, §28) that hasn't actually been made, instead of flagging it explicitly?
- [ ] **Is every consequential staff action attributable to an individual, auditable, and never silently reversible without a record?** (§20)
- [ ] **Does it remain accessible?** Any custom admin extension meets §24's requirements with no exceptions.
- [ ] **Does it avoid introducing role-based permissions, a dispatch/route-optimization tool, a BI platform, a vendor-facing capability, or AI-assisted decision-making** not already established elsewhere? (§27)
- [ ] **Is the staff decision-state vocabulary reused, not reinvented?** (§22)
- [ ] **Does it stay proportionate to the company's current operating scale**, rather than over-building for a size or complexity the business has not asked for? (§1, §2)
- [ ] **Does it preserve no mockups, no wireframes, no implementation code, no database schema, and no API design** — this document's own governing constraint?
- [ ] **Does it treat Wine & Spirits and Food Central with equal operational rigor**, never implicitly prioritizing one catalog's tooling over the other's? (Cross-Catalog Operational Parity)
- [ ] **Does it avoid turning accountability tooling into a staff-performance-scoring mechanism?** (Operational Trust & Accountability)
- [ ] **Does an interrupted staff action preserve as much completed work as is still genuinely valid?** (Admin Workflow Recovery)

## 30. Acceptance Criteria

- [ ] Every workflow specified in §5–§14 exists as a genuine staff capability, not merely implied by a customer-facing specification.
- [ ] A mixed order's two fulfillment legs are always presented to staff as distinctly as they are presented to the customer, never merged.
- [ ] An availability, price, or promotional change staff make is reflected to customers immediately upon saving, with no undocumented delay or approval step.
- [ ] The promotional-collection simultaneous cap (3–4 entries) is enforced by the system as a blocking condition, not left to staff discipline alone.
- [ ] Every consequential staff action (pricing, inventory/availability, promotions, order status, customer data) is attributable to a specific admin-user and timestamped.
- [ ] No feature named as explicitly out of scope in §27 (granular role-based permissions, dispatch/route optimization, a BI platform, a vendor-facing capability, AI-assisted decision-making) appears anywhere in the admin experience.
- [ ] No business or operational decision named as open in §6, §14, §15, §18, §19, §20, §28 (allergen-data-verification responsibility, staff-permission granularity, audit retention, report definitions, alert thresholds) is silently assumed or resolved by this document or its implementation.
- [ ] Every custom admin extension this project builds meets §24's accessibility requirements, with no exception carved out for internal tooling.
- [ ] No customer-facing capability not already established elsewhere in `/docs` (e.g., a loyalty benefit, a discount mechanism) is introduced through a staff-facing workflow.
- [ ] This document itself contains no UI mockup, wireframe, implementation code, database schema, or API design, consistent with its own governing constraint.
- [ ] Wine & Spirits and Food Central are represented with equal prominence across the dashboard, reporting, and notification surfaces, never one implicitly read as primary.
- [ ] An interrupted staff action (a session expiring mid-edit, a partially completed multi-step action, a failed save during peak load) preserves as much completed work as is still genuinely valid, per Admin Workflow Recovery.

## Admin Workflow Intent

Every staff workflow specified in §5–§21 serves a small number of recognizable staff intents. Naming them here does not introduce a new mechanism — it confirms that the sections already specified serve each of these intents, mirroring the same "Intent" pattern already established in `07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent, `09_FOOD_ORDERING_SPECIFICATION.md`'s Food Ordering Intent, and `10_DELIVERY_SPECIFICATION.md`'s Delivery Intent:

| Intent | What the staff member wants | Where this document already serves it |
|---|---|---|
| Keep the catalog accurate | Update pricing, availability, or attribute data so the customer-facing experience stays honest. | §6 Product Management, §8 Inventory Management, §9 Pricing Management. |
| Run a promotion within the rules | Feature a collection or promotional price without needing to ask engineering, and without breaching an established cap. | §7 Category & Collection Management, §10 Promotions Management. |
| Fulfill and resolve an order | Advance an order or food-order/kitchen stage honestly, and resolve a delivery exception. | §11 Order Management, §12 Food Order Workflow, §13 Delivery Management. |
| Support a customer | Look up order/account context to resolve a query without overstepping into customer-owned data. | §14 Customer Management. |
| Recover from an interruption | Get back to where they were after a session expiry, a failed save, or a partially completed action, with minimal redone work. | Admin Workflow Recovery, below. |

No new mechanism is introduced by this section — it is a mapping of existing behavior onto recognizable staff intent, consistent with every prior specification's identical treatment for its own customer-facing audience.

## Operational Trust & Accountability

*Extends §1 (Admin Workflows Philosophy), §2 (Business Objectives), and §20 (Audit Logging) — names the connective principle directly, mirroring `10_DELIVERY_SPECIFICATION.md`'s Delivery Trust & Professionalism section's naming of the connection between a customer-facing trust claim and the operational mechanism that makes it real.*

- **Staff accountability is the internal twin of `PRODUCT_BLUEPRINT.md` §11's "sold and delivered by us directly" claim** — a customer-facing trust statement is only as true as the internal discipline behind it; §20's attributability requirement is how that discipline is made real, not a bureaucratic add-on.
- **An admin action of consequence is never anonymous, regardless of the open staff-permissions decision (§15)** — restating §20 directly as a matter of principle, not only mechanism.
- **This document does not use audit logging as a staff-performance-scoring, ranking, or surveillance mechanism** — its purpose is accountability and troubleshooting (§20), and any future use of this data for staff evaluation is an HR/management decision entirely outside this document's scope, not an extension of what this specification establishes.
- **Trust, in the admin context, is built the same way it is built for customers** (`EXPERIENCE_PRINCIPLES.md` #6, Speed Builds Trust; #3, Premium Through Discipline) — honest, current, attributable information, not a rating or scoring device layered on top of it.

## Cross-Catalog Operational Parity

*Extends §2 (Business Objectives) — restates `BUSINESS_RULES.md`'s and `01_NAVIGATION_SPECIFICATION.md`'s "equal prominence" principle, established for the customer-facing experience, applied here to internal tooling investment for the first time.*

- **Wine & Spirits and Food Central receive equal operational seriousness in this document's tooling, never one treated as the primary business and the other as a secondary feature** — restating `BUSINESS_RULES.md`'s customer-experience rule ("the experience must feel like one premium LiquorCentral ecosystem") applied here to the internal side of that same ecosystem.
- **Equal seriousness does not mean identical workflows** — restating §8's own finding directly: Wine & Spirits' stock-count model and Food Central's availability-state model are genuinely different operational realities, and treating them with equal rigor means each gets a workflow suited to its own reality, not a forced shared mechanism that fits neither well.
- **Dashboard, reporting, and notification surfaces (§5, §18, §19) reflect both catalogs' operational state without implicit prioritization** — restating the new §5 bullet directly: neither catalog's queue, alert, or summary is positioned or weighted as more important by default.
- **This section does not change any workflow already specified in §6–§14** — it names the standing principle those sections already follow, so a future contributor understands why neither catalog's tooling was ever treated as secondary, rather than leaving it as an unstated assumption.

## Admin Workflow Recovery

*Extends §23 (Empty, Loading & Error States) — governed by the same intent-preservation principle already established in `06_CART_SPECIFICATION.md`'s Cart Recovery, `07_CHECKOUT_SPECIFICATION.md`'s Checkout Recovery, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Account Recovery, `09_FOOD_ORDERING_SPECIFICATION.md`'s Food Ordering Recovery, and `10_DELIVERY_SPECIFICATION.md`'s Delivery Recovery sections, adapted here to staff-side interruptions rather than customer-side ones.*

The governing principle: **an interrupted staff action preserves as much completed work as is still genuinely valid, and clearly communicates the one part that had to be redone — it never silently discards more than the interrupting event actually requires.**

| Scenario | Admin behaviour | How staff progress is preserved |
|---|---|---|
| A staff session expires mid-edit (a product, category, or promotion) | The staff member is told plainly their session ended and prompted to log in again; work already saved before expiry remains saved. | As much in-progress work as is genuinely possible is preserved; nothing is silently discarded, and nothing is silently saved on the staff member's behalf either. |
| A multi-step action partially completes then fails (e.g., a promotional collection created but its end date fails to save) | The staff member is told specifically what succeeded and what did not — never a generic failure that leaves them unsure what state the record is in. | The successfully completed portion is not rolled back or lost; only the failed step needs to be retried. |
| A save fails during peak load | The staff member is told the save failed and is offered a retry, consistent with §23's honest-error-messaging requirement. | The staff member's input is not silently cleared, so a retry does not require re-entering everything from scratch, wherever technically possible. |
| A network interruption occurs during an order-status or food-order-stage update (§11, §12) | The staff member is never left uncertain whether the update registered — the interface confirms the actual current state once connectivity is restored, mirroring `10_DELIVERY_SPECIFICATION.md` §21's identical requirement for the customer-facing equivalent. | The order's true state is never ambiguous to the staff member acting on it, since an ambiguous internal state risks an equally ambiguous customer-facing one (§1). |

**Nothing in this section authorizes silently discarding a staff member's in-progress work for implementation convenience.** Where a scenario cannot be resolved automatically, the admin experience is honest that it cannot, rather than presenting an unexplained empty or broken state.

---

**Document status:** Approved — Frozen (v1.0). This is now the authoritative reference for all internal/staff-facing admin implementation platform-wide — the internal-operations counterpart to all ten customer-facing specifications (`01_NAVIGATION_SPECIFICATION.md` through `10_DELIVERY_SPECIFICATION.md`), each of which it mirrors operationally without redefining. With this freeze, all 11 planned Phase 1 specifications are complete. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, it may now only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md`.
