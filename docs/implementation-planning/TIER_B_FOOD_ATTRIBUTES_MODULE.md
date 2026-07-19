# Tier B — Food Attributes Module

**Status:** Draft
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-19

This document is a Tier B (Module Data Planning) deliverable, per `IMPLEMENTATION_PLANNING.md` §4 and §6, defining the architecture of the `food-details` module (`MEDUSA_EXTENSIONS.md` #2) — the structured attribute module for every Food Central dish on the platform. Selection reasoning is recorded in `DECISION_LOG.md`; in summary: `IMPLEMENTATION_PLANNING.md` §6 explicitly sequences "the wine-details and food-details attribute modules first," in that order, immediately after Tier A — with `wine-details` now Approved (`TIER_B_WINE_ATTRIBUTES_MODULE.md` v1.0), `food-details` is the next module in that already-established sequence, not a fresh choice among equals. A re-verification against the six standing selection criteria (frozen-specification dependency count, launch criticality, architectural centrality, dependency ordering, Tier A findings, and whether later implementation-planning work depends on it) confirms this and surfaces a genuine correction to the dependency count itself (§1).

**This document is purely architectural.** It defines the module's responsibilities, ownership, boundaries, business purpose, and integration points — nothing else. **It is not a database design, not an API specification, not implementation code, and not a UI component definition.** No table is named, no field is typed, no endpoint is shaped, no component is designed. No Approved — Frozen document is modified by this document.

---

## 0. Module Selection Verification

Before drafting, the six criteria established for prior Tier B selections were re-applied to every remaining candidate in `MODULE_INVENTORY.md` — `food-details`, delivery-slot scheduling, the local payment provider, the notification provider, and Saved-for-Later — rather than assuming `IMPLEMENTATION_PLANNING.md` §6's original ordering or `ROADMAP.md`'s phase sequencing is automatically still correct.

| Criterion | `food-details` | Next-closest candidate |
|---|---|---|
| Frozen specifications depending on it | **Seven** — `01`, `02`, `03`, `04`, `05`, `09`, `11` (corrected; see §1) | Delivery-slot scheduling: four (`06`, `07`, `09`, `10`) |
| Launch criticality | Yes — `MODULE_INVENTORY.md` marks it launch-critical for Food Central | Delivery-slot: also Yes, but for Food Central's scheduling specifically, not its catalog data |
| Architectural centrality | High — the sole structured-data source for Food Central's catalog, search, listing, and PDP surfaces | Delivery-slot: high, but scoped to scheduling/checkout, not catalog description |
| Dependency ordering (`IMPLEMENTATION_PLANNING.md` §6) | Named second, immediately after `wine-details`, before delivery-slot | Delivery-slot: named third, explicitly after both attribute modules |
| Tier A findings | Two open items already flagged (`TIER_A_FOUNDATIONAL_RECONCILIATION.md` §6/§14 row 2): field list, allergen-accuracy ownership | Delivery-slot: operational parameters open (row 3) — a different, later-stage kind of gap |
| Later implementation-planning work depending on it | Meilisearch facet design (Tier D) and the Search/Listing/Product-Details/Navigation/Homepage API contracts (Tier C) all name `food-details`' field list as a precondition, per `MEDUSA_EXTENSIONS.md` #6's own "indexing a still-changing schema wastes rework" reasoning | Delivery-slot: blocks Checkout/Food-Ordering API contracts specifically, a narrower set |

**Conclusion: `food-details` remains the correct next Tier B module, and by a wider margin than the pre-existing documents recorded.** No candidate outranks it on any criterion. This confirms rather than merely repeats the prior recommendation — the dependency count itself was undercounted before this review (§1).

---

## 1. Why This Module Exists

**Seven frozen Product Specifications depend on `food-details`** — a wider dependency footprint than any other Tier B module drafted so far, including `wine-details` (five) and the Product Relationship Module (six, per its own document's Navigation completeness correction). This is a genuine correction to the baseline `TIER_A_FOUNDATIONAL_RECONCILIATION.md` and `MODULE_INVENTORY.md` currently record (`03`, `04`, `05`, `09`, `11` — five), discovered by verifying each specification's own stated backend dependency directly rather than reasoning from the existing count, per the lesson already logged from `wine-details`' own dependency-list correction:

- `03_SEARCH_SPECIFICATION.md` §5, §13, §16, §26 — full-text ingredient matching, allergen/dietary/spice-level/prep-time facets.
- `04_PRODUCT_LISTING_SPECIFICATION.md` §10, §19, §27 — Food Central's narrower, safety-relevant facet set, and the card's single conditional-fact slot.
- `05_PRODUCT_DETAILS_SPECIFICATION.md` §11, §12, §28 — the Food Product Experience's ingredient, allergen, spice-level, and portion facts.
- `09_FOOD_ORDERING_SPECIFICATION.md` §5, §14, §25 — catalog structure and Ingredient Transparency & Allergen Information.
- `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6, §25 — the staff data-entry workflow.
- **`01_NAVIGATION_SPECIFICATION.md`'s Backend Data Requirements table (§4)** — "Food Central menu structure (§14) | Available items, prep time/availability | `food-details` module (#2) + delivery-slot module (#3)." This dependency was not previously reflected in `TIER_A_FOUNDATIONAL_RECONCILIATION.md`'s or `MODULE_INVENTORY.md`'s `food-details` row.
- **`02_HOMEPAGE_SPECIFICATION.md` §8.5 and its Backend Data Requirements table (§9)** — "Food Central Spotlight | Available menu items, prep-time/availability, same-day cutoff | Food-attributes module (`MEDUSA_EXTENSIONS.md` #2) + delivery-slot module (#3)." Also not previously reflected.

Both omissions are corrected in this document's own dependency statement and flagged for a bookkeeping correction to `TIER_A_FOUNDATIONAL_RECONCILIATION.md` and `MODULE_INVENTORY.md` (§21), following the identical precedent `TIER_B_WINE_ATTRIBUTES_MODULE.md`'s own review established for its own dependency-list correction. This is the direct, evidenced result of this document's §0 instruction not to assume the existing baseline is correct — it is not: `food-details` was already the right next module, but for a stronger reason than previously recorded.

No prior document defines this module's architecture — its boundaries, its relationship to the presentation layer, its relationship to Food Central's live operational-availability mechanism (a materially more consequential boundary for this module than for `wine-details`, §5), or how it integrates with the seven specifications that depend on it. `PRODUCT_CATALOG.md` already proposes a starting field list (Ingredients, Allergens, Spice level, Prep time, Dietary flags) and the same two-tier data strategy `wine-details` implements — but, as with wine, proposes it explicitly as "not finalized."

This module exists to hold that architecture — the third attribute/relationship module (after the Product Relationship Module and `wine-details`) this project's Phase 2 work formalizes.

## 2. Business Justification

- **Directly implements `PRODUCT_BLUEPRINT.md` §6's Product Catalog Strategy and §13's Product Data Strategy** — structured, filterable, compliance-sensitive Food Central data belongs in a dedicated module, the same two-tier strategy `wine-details` already realizes for its own catalog, applied here to the symmetrical case `PRODUCT_CATALOG.md` names directly: "a wine has no spice level, a dish has no vintage."
- **Directly implements `BUSINESS_RULES.md`'s speed-first requirement for Food Central** — `09_FOOD_ORDERING_SPECIFICATION.md` §1 states plainly that "speed is never achieved by hiding a real constraint"; this module is the data foundation that makes prep-time honesty and ingredient/allergen transparency possible at all, not an optional enhancement layered on top of a functioning catalog.
- **Protects customer safety, not only customer trust** — `09_FOOD_ORDERING_SPECIFICATION.md` §2 states directly that "an inaccurate cutoff or a missing allergen warning is a genuine operational and safety failure, not a UX nicety." This is the single sharpest distinction between this module's business stakes and `wine-details`': a wine attribute error is a trust/accuracy problem (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §16); a food allergen error is a safety problem. Nothing in this document may treat the two as equivalent in severity.
- **Serves the Confident Buyer and Guided Browser customer intents specifically for Food Central** (`09_FOOD_ORDERING_SPECIFICATION.md` §3) — a craving-driven customer who wants the fastest honest path to checkout, and a browsing customer who wants to understand dietary fit and spice level at a glance, both depend on this module's data being complete and accurate before either can act confidently.
- **Is the direct data foundation for Food Central's discovery, listing, and detail surfaces** — without this module, the ingredient full-text search `03_SEARCH_SPECIFICATION.md` §16 requires, the allergen/dietary/spice-level facets `04_PRODUCT_LISTING_SPECIFICATION.md` §10 requires, and the Food Product Experience `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 requires cannot exist as specified.

## 3. Responsibilities

- **Hold structured, validated, per-dish attribute data for every Food Central product** — the module is linked 1:1 to the native Product module (`MEDUSA_EXTENSIONS.md` #2) and exists specifically for data that is filterable, facetable, or safety-relevant enough that Medusa's native `metadata` mechanism would be insufficient (`PRODUCT_CATALOG.md`'s two-tier data strategy).
- **Serve as the single authoritative source for Food Central structured facts**, consumed identically by Search, Listing, Product Details, Navigation's Food Central menu structure, Homepage's Food Central Spotlight, and Admin product management — no consuming surface maintains its own copy or redefines what a given attribute means.
- **Hold the full ingredient list for every dish, complete and unabbreviated** — `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 and `09_FOOD_ORDERING_SPECIFICATION.md` §14 both state this as a specific, non-negotiable requirement, not a general "descriptive content" allowance the way wine's tasting notes are.
- **Hold allergen and dietary-flag data to a completeness standard higher than ordinary descriptive attributes** — `09_FOOD_ORDERING_SPECIFICATION.md` §14 cites allergen filters as used roughly ten times more often than any other digital-menu filter; this module's responsibility is not merely to hold this data but to hold it as something every dish genuinely has an answer for (§6), not a field that may simply be absent.
- **Hold a dish-specific prep-time estimate** — `09_FOOD_ORDERING_SPECIFICATION.md` §8 requires this to be dish-specific, not a single platform-wide figure, and explicitly honest about being an estimate, not a guarantee.
- **Remain the raw data layer only** — structured facts, never their presentation, and never Food Central's live operational-availability state (§5).

## 4. Explicit Non-Responsibilities

- **This module does not define how attributes are presented to a customer.** `05_PRODUCT_DETAILS_SPECIFICATION.md` §12 (Product Attributes, this module's exact responsibility) and §13 (Product Facts, the structured presentation layer) draw the identical boundary already established for `wine-details` (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §4) — this module owns the data, not its wording, grouping, or progressive disclosure.
- **This module does not hold, compute, or influence Food Central's live availability state.** This is the single most consequential non-responsibility this document states, and has no equivalent risk in `wine-details`' own scope (§5 elaborates in full). `09_FOOD_ORDERING_SPECIFICATION.md` §25's own Backend Requirements table lists "Ingredients, allergens, spice level, prep time, dietary flags" as this module's fields on one row, and "Availability states... Kitchen-capacity/time-based availability flag, not inventory count" as a separate row with a separate, native mechanism — this module supplies a prep-time *estimate*, never the live available-now/schedulable/unavailable determination that estimate feeds into.
- **This module does not hold the "pairs with" relationship.** Identical reasoning to `TIER_B_WINE_ATTRIBUTES_MODULE.md` §4: `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` already establishes cross-catalog pairing as a general, separate module. This document confirms it and remains consistent with it (§9).
- **This module does not hold kitchen operating hours, capacity limits, or early-closure triggers.** `09_FOOD_ORDERING_SPECIFICATION.md` §22 and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §8 both name this as a distinct, not-yet-scoped operational-configuration surface (`MODULE_INVENTORY.md`'s "Kitchen operating-hours configuration" row) — a dish's prep-time estimate (this module) and the kitchen's operating hours (a separate configuration mechanism) answer genuinely different questions and must not be merged into one module for convenience.
- **This module does not perform search ranking, relevance scoring, or facet-value computation.** Identical to `TIER_B_WINE_ATTRIBUTES_MODULE.md` §4 — `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy remains the sole authority on relevance.
- **This module does not determine inventory or stock.** Food Central inventory tracking is off entirely (`PRODUCT_BLUEPRINT.md` §6, `PRODUCT_CATALOG.md`) — unlike `wine-details`, which coexists with an active native Inventory module for its catalog, this module has no inventory counterpart to coexist with at all. There is no stock count for this module to avoid duplicating; there simply is none for Food Central.
- **This module does not hold Wine & Spirits data of any kind.** `wine-details` (`MEDUSA_EXTENSIONS.md` #1) is the separate, symmetrical module for exactly the reason `PRODUCT_CATALOG.md` already gives. This document does not propose merging the two.
- **This module does not hold customer or expert reviews, ratings, or scores.** `05_PRODUCT_DETAILS_SPECIFICATION.md` §22 confirms no review system exists in v1, restated here identically to `TIER_B_WINE_ATTRIBUTES_MODULE.md` §4's own equivalent statement — Food Central's Freshness & Quality Philosophy (`09_FOOD_ORDERING_SPECIFICATION.md`) is communicated through accurate attribute data, never a numeric score.
- **This module does not hold dish customization, modifier, or substitution options.** `09_FOOD_ORDERING_SPECIFICATION.md` §15 explicitly excludes any modifier/substitution system from v1 — this module's attribute values describe a dish exactly as menu-described, not a range of configurable variants of it.
- **This module is not a database design, an API specification, implementation code, or a UI component definition**, per this document's explicit scope. It does not finalize, add, or remove any specific field from `PRODUCT_CATALOG.md`'s existing proposal, and it does not resolve who is operationally responsible for allergen/ingredient data accuracy — both remain open business decisions (§18, §20).

## 5. Attributes, Presentation, Operational Status, Inventory, and Customer-Facing Facts — Five Distinct Concepts

Per direct instruction, this section states explicitly, in one place, a distinction this document must hold throughout rather than allow to blur anywhere else in it. Food Central's data model genuinely has one more axis of complexity than `wine-details`' did, because a dish's real-time orderability depends on more than its own descriptive data:

1. **Attributes** (this module) — static-to-slow-changing descriptive data about a dish: ingredients, allergens, dietary flags, spice level, and a prep-time *estimate*. This data changes when a recipe changes, not multiple times a day.
2. **Presentation** (`05_PRODUCT_DETAILS_SPECIFICATION.md` §13, "Product Facts") — the labeled, grouped, scannable rendering of this module's data (e.g. facts grouped under "Ingredients & Allergens" and "Preparation"). This module supplies the data; it has no opinion on wording, grouping, or icon pairing.
3. **Operational status** (`09_FOOD_ORDERING_SPECIFICATION.md` §6, §22, Availability Transition Behaviour) — the live available-now / available-to-schedule / unavailable state, driven by the same-day cutoff, ingredient shortages ("86'd"), and kitchen operating hours. This is a fast-changing, event-driven state with its own native mechanism (a flag, not a stock count) and its own not-yet-built capacity logic — explicitly **not** held by this module (§4). A prep-time *estimate* (attribute) and a dish's current *availability* (operational status) are answers to two different questions, evaluated at two different speeds, by two different mechanisms.
4. **Inventory** — does not apply to Food Central at all (`PRODUCT_BLUEPRINT.md` §6). Unlike `wine-details`, which coexists beside an active native Inventory module, this module has no inventory concept to stay distinct from; Food Central's made-to-order model means there is no stock count anywhere in this catalog's data model.
5. **Customer-facing facts** — used synonymously with "Presentation" (2) above, per `05_PRODUCT_DETAILS_SPECIFICATION.md`'s own terminology (its §13 is literally titled "Product Facts"); listed separately here only because the instruction that produced this document named it as its own item, and because it is worth stating once, explicitly, that "Facts" and "Presentation" are the same concept under two names already used interchangeably across `/docs`, not two different things this module must additionally track.

Every section below that describes this module's scope, integrations, or non-responsibilities is checked against this five-way distinction, most consequentially item 3 — the operational-status boundary is this module's single most important non-responsibility (§4) and its single most important integration precondition (§10, §13).

## 6. Attribute Categories

`PRODUCT_CATALOG.md` already proposes a starting field list for this module (Ingredients, Allergens, Spice level, Prep time, Dietary flags) — explicitly marked "proposed, not finalized," and not finalized by this document either. As with `TIER_B_WINE_ATTRIBUTES_MODULE.md` §5, this document organizes the *kind* of information the module holds into conceptual categories rather than adding to that field list:

- **Composition** — what a dish is made of (ingredients), the foundation every other safety- and dietary-relevant fact is derived from.
- **Safety-critical / compliance-adjacent** — allergen information and dietary flags (e.g. halal, vegan), held to a completeness standard the rest of this catalog's descriptive data is not (§3, §18) — the direct food-specific counterpart to `TIER_B_WINE_ATTRIBUTES_MODULE.md` §5's "compliance-adjacent" category, but with materially higher stakes (§2).
- **Sensory** — spice level, on a single consistent scale reused identically across facets, listing cards, and the product detail page (`09_FOOD_ORDERING_SPECIFICATION.md` §14, `05_PRODUCT_DETAILS_SPECIFICATION.md` §11).
- **Preparation-adjacent** — a dish-specific prep-time estimate (§3), explicitly a static or slow-changing figure describing a *typical* preparation duration, never the live, event-driven availability state built partly from it (§5).

**A genuine gap discovered during this review, recorded not resolved:** `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 requires "Portion information: a factual serving/portion-size description, set here rather than left for the customer to guess" as part of the Food Product Experience — but `PRODUCT_CATALOG.md`'s proposed Food Central attribute list (§27 above) does not name a portion/serving-size field. This is a real, specific gap between a frozen specification's stated requirement and the pre-existing field-list proposal, distinct in kind from the general "field list not finalized" open item (§18) — it is not merely unfinalized, it is currently absent from the proposal entirely. Flagged here and in `PROJECT_STATUS.md` (§21), not resolved: whoever finalizes the field list should treat portion/serving-size as a named candidate, not rediscover the gap from scratch.

These categories are a conceptual organizing device for this document only — they do not imply a data-model grouping, and the exact field list within each category is the open business decision named in §18, not resolved here.

## 7. Scope Within Food Central

- **This module covers the entire Food Central catalog** — every dish, regardless of meal type or category chip (`09_FOOD_ORDERING_SPECIFICATION.md` §5) — not a subset.
- **Unlike `wine-details`' "tolerate genuine inapplicability" default (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §3), this module's safety-critical fields carry a stricter completeness expectation.** A wine's vintage may be genuinely inapplicable to a non-vintage spirit and simply omitted. An allergen field is different in kind: every dish has a true, verifiable allergen answer (which may genuinely be "none of the declared allergens are present"), and this module's responsibility is to hold that true answer, not to treat a missing allergen entry as an equally legitimate "not applicable" case the way a missing vintage is. This distinction matters architecturally, not just operationally: a field left blank because no one has verified it yet is a data-completeness failure this module's design should make visible, not a silent, acceptable absence.
- **Composition and sensory attributes (ingredients, spice level) may genuinely vary in relevance by dish** (a plain dessert may have no meaningful spice level) — this ordinary, non-safety-critical inapplicability is tolerated exactly as `wine-details`' own attributes tolerate it (§6 above).
- **This document assumes attribute data varies at the Product level, not the Product Variant level — and, unlike `wine-details` (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §6, §18), this is not an open question for this module.** `09_FOOD_ORDERING_SPECIFICATION.md` §15 explicitly excludes any dish customization, modifier, or portion-choice/variant system from v1 — no frozen specification describes a Food Central product with meaningful variants at all. This document states this explicitly, as a confirmed non-issue, rather than leaving it to be silently assumed.

## 8. Ownership

This module's governance is a **four-way** split — one dimension more than `wine-details`' three-way model (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §7), because `MEDUSA_EXTENSIONS.md` #2 itself already separates the field-list decision from the accuracy-ownership decision, rather than this document introducing a fourth party unprompted:

- **The module's existence, architecture, and mechanism (this document) are an engineering/architecture decision.**
- **The exact field list is a business/merchandising decision requiring Paul's explicit approval** — `MEDUSA_EXTENSIONS.md` #2 already states this directly ("Paul's approval required: Yes — final field list"); this document does not narrow or resolve it (§18).
- **Day-to-day attribute *values* for a specific dish are staff data entry, not merchandising curation** — `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6 already establishes this identically to `wine-details`' equivalent staff workflow: "staff enter structured data into defined fields, not free-text descriptions standing in for structured facts."
- **Who is operationally responsible for verifying allergen and ingredient data accuracy is a fourth, distinct, and explicitly still-open decision — not folded into the field-list approval above.** `MEDUSA_EXTENSIONS.md` #2 states this as its own named approval item ("and who is operationally responsible for keeping allergen/ingredient data accurate"), and `09_FOOD_ORDERING_SPECIFICATION.md` §14/§28 and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6/§28 all restate it as unresolved. This document elevates and consolidates that already-flagged gap rather than discovering it new (§20), and does not invent an answer.

## 9. Integration with Product Module

- **Every attribute record anchors to exactly one Food Central Product record**, linked via the identical `defineLink` pattern `ARCHITECTURE.md` establishes platform-wide and `wine-details` already implements for its own catalog.
- **This module never duplicates or shadows core product facts** (name, price, primary image) — those remain the Product and Pricing modules' responsibility.
- **This module's data is read alongside, never merged with, the Product Relationship Module's data** — identical reasoning to `TIER_B_WINE_ATTRIBUTES_MODULE.md` §8: a dish may simultaneously have its own structured attributes (this module) and a curated pairing to a Wine & Spirits product (`TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`), composed at the presentation layer, not combined into one record.
- **This module's data is read alongside, never merged with, Food Central's live availability-state mechanism** — the single distinction this module's integration story requires that `wine-details`' does not (§5). A consuming surface displaying a dish typically reads this module's prep-time estimate and the separate availability flag together, but they remain two independently-queried, independently-updated data sources composed at the presentation layer, exactly as this module's data and the Product Relationship Module's data are composed rather than merged.

## 10. Integration with Navigation

`01_NAVIGATION_SPECIFICATION.md` §14 (Food Central Navigation) and its Backend Data Requirements table (§4) name this module directly as a data source for "available items, prep time/availability" within Food Central's flat menu structure — a dependency this document's own review (§1) corrects into the baseline, since it was not previously reflected in `TIER_A_FOUNDATIONAL_RECONCILIATION.md` or `MODULE_INVENTORY.md`. Consistent with §5's operational-status distinction, this module supplies the prep-time estimate; "available items" itself is jointly determined by Food Central category membership (native) and the separate live-availability mechanism, not by this module alone. No navigation-specific behavior is defined here; `01_NAVIGATION_SPECIFICATION.md` §14 remains the sole authority on how Food Central's navigation itself behaves.

## 11. Integration with Homepage

**A genuine, confirmed integration point — unlike `wine-details`, for which `02_HOMEPAGE_SPECIFICATION.md` was confirmed as a non-dependency (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §14).** This asymmetry is itself worth stating explicitly rather than assuming this module's homepage relationship mirrors wine's: `02_HOMEPAGE_SPECIFICATION.md` §8.4 (Curated Collections, Wine & Spirits) is Category/Collection-driven only, with no attribute-module dependency; §8.5 (Food Central Spotlight) is different in kind, because a "spotlight" of *today's available menu* is meaningless without the prep-time/availability data this module (jointly with the live-availability mechanism, §5, §9) supplies. `02_HOMEPAGE_SPECIFICATION.md`'s own Backend Data Requirements table (§9) names this directly: "Food Central Spotlight | Available menu items, prep-time/availability, same-day cutoff | Food-attributes module (`MEDUSA_EXTENSIONS.md` #2) + delivery-slot module (#3)." This document does not redefine the Spotlight's own behavior, layout, or pacing — `02_HOMEPAGE_SPECIFICATION.md` §8.5 remains the sole authority on that; this module's role is limited to supplying the prep-time attribute data that section consumes.

## 12. Integration with Search

`03_SEARCH_SPECIFICATION.md` §5 (Search Scope), §13 (Filtering Strategy), §16 (Food Discovery), and its Backend Requirements section (§26) all name this module's fields as the source for Food Central's full-text ingredient search and its dietary/allergen/spice-level/prep-time facets. `03_SEARCH_SPECIFICATION.md` §13 states directly that "allergen filtering is safety-relevant, not a convenience feature" and that this depends on "the food-attributes module's data being operationally accurate" — the identical accuracy dependency this document names in §18/§20, now doubly confirmed by both the module's own scoping document and its most safety-sensitive consuming surface. This module supplies raw attribute values; it does not participate in ranking (§4) — `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy governs that in full, identically to `wine-details`' relationship with Search.

## 13. Integration with Product Listing

`04_PRODUCT_LISTING_SPECIFICATION.md` §10 (Filtering) names this module's fields as the source for Food Central's "narrower, safety-relevant" facet set (dietary/allergen flags, spice level, prep time/availability), and §19 (Food Central Listings) confirms availability and same-day-cutoff information must be visible at the card level. Consistent with §5's distinction, the card's single conditional-fact slot (`04_PRODUCT_LISTING_SPECIFICATION.md` §9, Product Card Information Hierarchy) combines this module's prep-time attribute with the separate live-availability flag — this module supplies one half of what that slot displays, not the whole of it. This module supplies the underlying data; the card's own one-supporting-fact rule remains `04_PRODUCT_LISTING_SPECIFICATION.md`'s presentation-layer decision, not something this module enforces.

## 14. Integration with Product Details

This is this module's most direct and detailed consumer, mirroring `wine-details`' relationship with `05_PRODUCT_DETAILS_SPECIFICATION.md` §10. `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 (Food Product Experience) specifies preparation expectations, full ingredient transparency, prominent non-color-alone allergen information, spice level on a consistent scale, portion information (§6's discovered gap), and availability-window/same-day messaging drawn partly from this module. `05_PRODUCT_DETAILS_SPECIFICATION.md` §12 (Product Attributes) and §13 (Product Facts) state the same Attributes-vs-Facts boundary this document restates in §5: this module is the Attributes layer; Facts is `05_PRODUCT_DETAILS_SPECIFICATION.md`'s own presentation-layer responsibility, not this document's.

## 15. Integration with Admin Workflows

`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6 (Product Management) already specifies that staff enter this module's attribute values through defined fields on the product record, linked via the pattern `MEDUSA_EXTENSIONS.md` #2 establishes — an integration already as complete, at the "structured fields, not free text" level, as `wine-details`' own (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §13). §6 additionally states directly: "Allergen and ingredient data accuracy is a staff responsibility with real safety consequences, not a cosmetic data-entry task... exactly who on staff is operationally responsible for verifying it remains an open business decision" — restating, from the staff-workflow side, the same ownership gap named in §8/§18/§20. This document does not add to or redefine that workflow; it confirms this module is what §6 already assumes exists, and that the accuracy-ownership question it flags is the same one this document elevates.

## 16. Non-Integrations (confirmed, not assumed)

Reviewed against every frozen specification; the following have **no dependency** on this module, stated explicitly so a future contributor does not assume one that was never specified:

- **Cart (`06_CART_SPECIFICATION.md`) and Checkout (`07_CHECKOUT_SPECIFICATION.md`)** — both operate at the catalog level (is this line item Wine & Spirits or Food Central) rather than the attribute level, identical reasoning to `wine-details`' equivalent non-integration (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §14).
- **Customer Account (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`)** — order history and reordering (§15) re-validate price and availability via native mechanisms, not structured attribute data, restating the identical reasoning already established for `wine-details`.
- **Wine & Spirits Attributes (`wine-details`, `MEDUSA_EXTENSIONS.md` #1)** — the confirming counterexample already stated in `TIER_B_WINE_ATTRIBUTES_MODULE.md` §1/§14: `wine-details`' own five dependent specifications name that module specifically, never this one.
- **Delivery (`10_DELIVERY_SPECIFICATION.md`)** — delivery status, address handling, and fulfillment logistics have no dependency on a dish's descriptive attributes; this module supplies no data `10_DELIVERY_SPECIFICATION.md` consumes.
- **Kitchen operating-hours configuration** (`09_FOOD_ORDERING_SPECIFICATION.md` §22, `MODULE_INVENTORY.md`'s own not-yet-scoped row) — a distinct, separate operational-configuration surface this module does not hold (§4).
- **Food Central's live availability-state mechanism** (`09_FOOD_ORDERING_SPECIFICATION.md` §6, §22) — restated here as a non-integration, not merely a non-responsibility (§4), because it is the one relationship most likely to be mistakenly assumed: this module and the availability mechanism are read together by several consuming surfaces (§9–§13) but remain architecturally separate, with no data flow from one into the other's own storage.

## 17. CMS Responsibilities

- **The authoritative structured attribute data lives in this module, inside Medusa** — not in a future CMS, consistent with `MEDUSA_EXTENSIONS.md` #7's one-way-sync pattern and `wine-details`' identical treatment (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §15).
- **A future CMS (Sanity, recommended but not approved) may host richer editorial content about a dish** — recipe or editorial storytelling content, explicitly named as a plausible future capability in `09_FOOD_ORDERING_SPECIFICATION.md` §27 ("Recipe or editorial content... a plausible future CMS-driven addition... not established or built here") — but this is optional, future, and never a substitute for or source of truth for this module's structured, safety-relevant facts.

## 18. Data Accuracy & Verification Ownership (Allergen Safety)

- **This is not a newly discovered gap — it is an already-flagged, safety-critical open decision this document elevates and consolidates, not resolves.** `MEDUSA_EXTENSIONS.md` #2 names it directly ("who is operationally responsible for keeping allergen/ingredient data accurate"); `09_FOOD_ORDERING_SPECIFICATION.md` §14 and §28 restate it; `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6 and §28 restate it a third time; `03_SEARCH_SPECIFICATION.md` §13 and §29 name it a fourth time specifically because allergen filtering depends on it. This document is the fifth place this same open decision is named, and the first Tier B document for which it is the module's *own* central risk rather than a downstream consumer's.
- **This gap is categorically more severe than `wine-details`' equivalent, already-flagged gap** (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §16, wine attribute accuracy) — a wine attribute error is a trust/accuracy concern; an allergen data error is, per `09_FOOD_ORDERING_SPECIFICATION.md` §2, a genuine customer-safety failure. This document does not treat the two as equivalent severity anywhere, and neither should any future document that references both.
- **No prior document assigns this operational responsibility to a specific role or process** — this document does not invent one. Whatever the eventual answer, `05_PRODUCT_DETAILS_SPECIFICATION.md` §19's Trust Signals principle and `09_FOOD_ORDERING_SPECIFICATION.md` §18's Food-Specific Trust Considerations already govern the standard the eventual verification process must meet: allergen and ingredient information is "never abbreviated for the sake of a cleaner-looking menu" and trust here is "inseparable from customer safety, a stronger standard than ordinary product-description trust."

## 19. Future Extensibility

Nothing in this section is built now — it documents capability this module's shape already leaves room for:

- **Additional attribute categories** (§6) as the menu's descriptive needs grow, without requiring a structural redesign, the same extensibility principle `TIER_B_WINE_ATTRIBUTES_MODULE.md` §17 already applies to its own catalog.
- **A future portion/customization system**, if dish modifiers or substitutions are ever approved as a business decision (`09_FOOD_ORDERING_SPECIFICATION.md` §27 names this explicitly as out of scope for v1, requiring its own specification work if ever adopted) — this module's architecture does not foreclose it, but does not design against it either.
- **Reuse of this module's architectural pattern (a small, linked, category-organized attribute module, kept strictly separate from live operational state) for a future business line**, per `PRODUCT_BLUEPRINT.md` §17's general future-expansion framing — a capability observation, not a proposal.

## 20. Risks

- **The field list is still open, and this module's seven dependent specifications are all, to varying degrees, waiting on it** — a wider blast radius than `wine-details`' own five-specification wait (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §18). `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Food Product Experience, `04_PRODUCT_LISTING_SPECIFICATION.md`'s facet set and card slot, `03_SEARCH_SPECIFICATION.md`'s facets and full-text fields, `01_NAVIGATION_SPECIFICATION.md`'s Food Central menu structure, `02_HOMEPAGE_SPECIFICATION.md`'s Spotlight, and `11_ADMIN_WORKFLOWS_SPECIFICATION.md`'s data-entry workflow all describe behavior shaped by this module without depending on its exact fields — but none can be fully implemented until the field list is approved.
- **Allergen-data accuracy is safety-critical and operationally unresolved** (§18) — the single highest-severity risk this document names, restated here as a risk (not only a dependency, §21) because it is the one gap in this document with a real customer-harm consequence if it remains unresolved into implementation without deliberate attention.
- **The Attributes-vs-Operational-Status boundary (§4, §5) is the risk most specific to this module and without precedent in `wine-details`' own review** — a future contributor could plausibly, but incorrectly, store a live availability flag inside this module for convenience (since both are "about the dish"), which would conflate a slow-changing descriptive fact with a fast-changing, event-driven state and risk exactly the kind of stale-or-dishonest availability data `09_FOOD_ORDERING_SPECIFICATION.md` §1 and §17 explicitly warn against. This document names the risk explicitly so it is caught rather than discovered later.
- **The portion/serving-size gap (§6) risks being rediscovered from scratch** if not carried forward into the eventual field-list decision, since it is currently absent from `PRODUCT_CATALOG.md`'s proposed list despite being a named requirement in `05_PRODUCT_DETAILS_SPECIFICATION.md` §11.
- **`MEDUSA_EXTENSIONS.md` #2 already names a migration risk** if the field list changes after launch — identical to `wine-details`' equivalent, already-tracked risk, sharpened here by the wider dependency count (§1).
- **Indexing this module into search before its shape stabilizes wastes rework**, per `MEDUSA_EXTENSIONS.md` #6's explicit reasoning, identical to `wine-details`' own sequencing risk.

## 21. Dependencies

- **Depends on the Product module**, already native and unaffected by this document.
- **Depends on Paul's explicit approval of the final field list**, including the portion/serving-size candidate this review discovered (§6) — an already-tracked open business decision (`PROJECT_STATUS.md`, `MEDUSA_EXTENSIONS.md` #2); this document does not propose, narrow, or invent one.
- **Depends on Paul's explicit decision on who is operationally responsible for allergen/ingredient data accuracy** (§8, §18, §20) — a second, distinct open business decision `MEDUSA_EXTENSIONS.md` #2 already names, not resolved here.
- **Blocks Tier D's Meilisearch integration planning and Tier C's Search/Listing/Product-Details/Navigation/Homepage API contract planning** — a wider set of blocked Tier C work than `wine-details`' own equivalent (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §19), reflecting this module's own wider dependency count (§1).
- **Depends on a future decision or mechanism defining Food Central's live availability-state logic** (`09_FOOD_ORDERING_SPECIFICATION.md` §6, §25 — "exact capacity logic... not yet built") — a dependency in the sense that this module's prep-time estimate is only useful once that separate mechanism exists to consume it alongside, not a dependency this module's own architecture requires to be internally complete.
- **Recommends a bookkeeping correction to `TIER_A_FOUNDATIONAL_RECONCILIATION.md`'s §6/§14 baseline table and `MODULE_INVENTORY.md`'s `food-details` row**, correcting the dependent-specification list from `03,04,05,09,11` to `01,02,03,04,05,09,11` (§1) — applied in this document's own tracking-document updates (§22, `TIER_A_FOUNDATIONAL_RECONCILIATION.md` v1.2), following the identical precedent `TIER_B_WINE_ATTRIBUTES_MODULE.md`'s own review established for `wine-details`' dependency-list correction.
- **Depends on Paul's explicit confirmation that this module proceeds toward finalization**, per `IMPLEMENTATION_PLANNING.md` §2 principle 4 — this document does not assume approval, and remains Draft (v1.0) rather than Approved, per direct instruction.

## 22. Quality Checklist

Every future addition to this module's planning must be able to answer **yes** to all of the following:

- [ ] **Does it stay in the Attributes layer, never the Presentation/Facts layer, and never the live operational-status layer?** Checked against §4, §5, §12, §14.
- [ ] **Does it avoid reintroducing "pairs with" as a field on this module?** Checked against §4, §9 — that decision belongs to `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`.
- [ ] **Does it hold safety-critical fields (allergens, dietary flags) to a stricter completeness standard than ordinary descriptive attributes**, rather than treating an unverified field as equivalent to a genuinely inapplicable one? Checked against §7.
- [ ] **Does it avoid finalizing, adding, or removing a specific field**, leaving that to the still-open business decision, while still carrying forward the portion/serving-size candidate this review surfaced? Checked against §6, §21.
- [ ] **Does it avoid duplicating Wine & Spirits' `wine-details` module or merging the two?** Checked against §4.
- [ ] **Does it avoid inventing an answer to the allergen/ingredient-accuracy-ownership gap** rather than recording it? Checked against §18, §21.
- [ ] **Does it avoid conflating attribute data with a review/rating system?** Checked against §4 — no review system exists in v1.
- [ ] **Does it avoid introducing dish customization, modifiers, or a portion-choice/variant system** not already established elsewhere? Checked against §4, §7, §19.
- [ ] **Does it stay purely architectural**, introducing no table, field type, endpoint, or code? Checked against this document's own scope statement.

## 23. Acceptance Criteria

- [ ] Every Food Central dish's structured attribute data is linked to exactly one Product record, via the same pattern `ARCHITECTURE.md` establishes platform-wide.
- [ ] No attribute record from this module ever stores or computes a live availability state — that remains the separate, native availability-flag mechanism's exclusive responsibility.
- [ ] Every dish has a genuine, verified allergen and dietary-flag answer — never a field silently left blank as if it were an ordinary case of inapplicability.
- [ ] No attribute record from this module ever includes a "pairs with" or cross-catalog relationship field.
- [ ] No attribute record from this module ever includes kitchen operating hours, capacity limits, or early-closure configuration.
- [ ] Search, Listing, Navigation, Homepage, Product Details, and Admin Workflows all consume the same underlying attribute data — no surface maintains a divergent copy.
- [ ] No presentation-layer formatting, grouping, or plain-language phrasing logic is defined within this module's own architecture — that remains `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Facts-layer responsibility.
- [ ] This document introduces no database table, field type, API endpoint, or UI component definition anywhere within it.
- [ ] No field list is finalized, added to, or removed from `PRODUCT_CATALOG.md`'s existing proposal by this document, though the portion/serving-size gap is recorded as a candidate for that eventual decision.
- [ ] No attribute record from this module is presented as, or confused with, a customer or expert review.
- [ ] The allergen/ingredient-accuracy-ownership decision remains explicitly open in every tracking document that references it, not silently assumed or resolved.

---

**Document status:** Draft (v1.0). This document has been reconciled against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, `TIER_B_WINE_ATTRIBUTES_MODULE.md`, `MODULE_INVENTORY.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `MEDUSA_EXTENSIONS.md`, `DELIVERY_MODEL.md`, `PRODUCT_CATALOG.md`, and all 11 frozen Product Specifications, per direct instruction. It surfaces one corrected dependency count (§1), one newly discovered field-list gap (portion/serving-size, §6), and elevates one already-flagged, safety-critical open decision (allergen-accuracy ownership, §18) without resolving any of them. Per `IMPLEMENTATION_PLANNING.md` §7, this document awaits Paul's review before any refinement-and-freeze or direct-freeze pass. Per `DOCUMENTATION_GOVERNANCE.md` §5 and §8 (rule 8), no further Tier B document begins until Paul explicitly approves the next one.
