# Tier B — Wine & Spirits Attributes Module

**Status:** Draft
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-18

This document is a Tier B (Module Data Planning) deliverable, per `IMPLEMENTATION_PLANNING.md` §4 and §6, defining the architecture of the `wine-details` module (`MEDUSA_EXTENSIONS.md` #1) — the structured attribute module for every Wine & Spirits product on the platform. Selection reasoning is recorded in `DECISION_LOG.md`; in summary: this module is tied with `food-details` for the most frozen-specification dependencies (five each), but is architecturally prior — `ROADMAP.md`'s own backend build sequence places the wine-attributes module (Phase 2) immediately after Wine & Spirits' end-to-end launch (Phase 1) and explicitly before the food-attributes module (Phase 3), since Phase 1 is scoped to Wine & Spirits only. It also blocks the most other Phase 2 work: Meilisearch's facet design (Tier D) and the search/listing/product-details API contracts (Tier C) all depend on this module's shape being stable first, per `ROADMAP.md`'s own explicit "indexing a still-changing schema wastes rework" reasoning.

**This document is purely architectural.** It defines the module's responsibilities, ownership, boundaries, business purpose, and integration points — nothing else. **It is not a database design, not an API specification, not implementation code, and not a UI component definition.** No table is named, no field is typed, no endpoint is shaped, no component is designed. No Approved — Frozen document is modified by this document.

---

## 1. Why This Module Exists

Five frozen Product Specifications — `01_NAVIGATION_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, `04_PRODUCT_LISTING_SPECIFICATION.md`, `05_PRODUCT_DETAILS_SPECIFICATION.md`, and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — each depend on structured, filterable, queryable data about a Wine & Spirits product beyond what the native Product module's core fields (name, price, images, description) provide: vintage, ABV, region, producer, tasting notes, and similar facts. `09_FOOD_ORDERING_SPECIFICATION.md`, by contrast, depends on the symmetrical `food-details` module instead — a confirming counterexample of this module's catalog boundary, not a sixth dependent (see §14). `PRODUCT_CATALOG.md` already proposes a starting field list and the two-tier data strategy this module implements (structured/filterable data belongs in a dedicated module; simple/rarely-filtered data can use Medusa's native metadata mechanism instead) — but no document defines this module's architecture: its boundaries, its relationship to the presentation layer, or how it integrates with the five specifications that depend on it.

This module exists to hold that architecture — the second attribute module (alongside the Product Relationship Module) this project's Phase 2 work formalizes, and, per `ROADMAP.md`'s own sequencing, the one whose absence blocks the most other backend work.

## 2. Business Justification

- **Directly implements `PRODUCT_BLUEPRINT.md` §3's Product Philosophy** — "fewer, completely-described products beat many thinly-described ones," grounded in the finding that most wine buyers choose by label/suggestion rather than expertise, meaning structured, trustworthy product data converts uncertainty into confidence far more than catalog breadth does.
- **Directly implements `PRODUCT_BLUEPRINT.md` §13's Product Data Strategy** — two focused, linked attribute modules rather than one universal module, because a wine has no spice level and a dish has no vintage; this document is the architectural realization of that already-approved decision for the wine side specifically.
- **Serves both the Guided Browser and Confident Buyer customer intents** (`PRODUCT_BLUEPRINT.md` §4) — structured facts support a novice browsing by region/vintage/style and an expert verifying a specific bottle's details, the same dual audience `05_PRODUCT_DETAILS_SPECIFICATION.md` §10's Wine Product Experience is built to serve.
- **Is the direct data foundation for Wine & Spirits' three-layer navigation system** (`INFORMATION_ARCHITECTURE.md`, `01_NAVIGATION_SPECIFICATION.md` §13) — the varietal/style discovery layer has no other data source; without this module, that layer cannot exist as specified.

## 3. Responsibilities

- **Hold structured, validated, per-product attribute data for every Wine & Spirits product** — the module is linked 1:1 to the native Product module (`MEDUSA_EXTENSIONS.md` #1) and exists specifically for data that is filterable, facetable, or otherwise structured enough that Medusa's native `metadata` mechanism would be insufficient (`PRODUCT_CATALOG.md`'s two-tier data strategy).
- **Serve as the single authoritative source for Wine & Spirits structured facts**, consumed identically by Search facets, Listing cards, Product Details, Navigation's varietal/style layer, and Admin product management — no consuming surface maintains its own copy or redefines what a given attribute means.
- **Tolerate genuine inapplicability per product** — a non-vintage spirit has no vintage; a gin has little region-driven narrative the way a wine does. The module's responsibility is to hold whichever attributes genuinely apply to a given product, never to require every field for every product, directly implementing `05_PRODUCT_DETAILS_SPECIFICATION.md` §10's "each field shown only where applicable" principle at the data layer, not only the presentation layer.
- **Remain the raw data layer only** — structured facts, not their presentation. See §4 for the explicit boundary this implies.

## 4. Explicit Non-Responsibilities

- **This module does not define how attributes are presented to a customer.** `05_PRODUCT_DETAILS_SPECIFICATION.md` already draws a deliberate, named distinction between **Product Attributes** (§12 — the data model, this module's exact responsibility) and **Product Facts** (§13 — the structured, plain-language presentation layer built from that data). This module owns the former only; how a fact is worded, grouped, or progressively disclosed on a page is presentation work this document does not touch.
- **This module does not hold the "pairs with" relationship.** `PRODUCT_CATALOG.md`'s original proposal listed "pairs with" among wine attributes; `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` has since established, as an approved architectural decision, that cross-catalog pairing is a general, separate module, not a field on this one. This document does not reopen that decision — it confirms and depends on it (§8, §17).
- **This module does not perform search ranking, relevance scoring, or facet-value computation.** `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy remains the sole authority on relevance; this module supplies raw attribute values that Search's own indexing and faceting logic consumes, exactly as `03_SEARCH_SPECIFICATION.md` §26 already anticipates.
- **This module does not determine availability, stock, or pricing.** Inventory, availability state, and price remain the native Product, Inventory, and Pricing modules' responsibility (§8) — this module holds descriptive facts about a product, never whether or for how much it can be bought.
- **This module does not hold Food Central data of any kind.** `food-details` (`MEDUSA_EXTENSIONS.md` #2) is a separate, symmetrical module for exactly the same architectural reason `PRODUCT_CATALOG.md` already gives: a wine has no spice level, a dish has no vintage. This document does not propose merging the two.
- **This module is not a database design, an API specification, implementation code, or a UI component definition**, per this document's explicit scope (see the introduction above). It does not finalize, add, or remove any specific field from the list `PRODUCT_CATALOG.md` already proposes — that remains an open business decision (§19).

## 5. Attribute Categories

`PRODUCT_CATALOG.md` already proposes a starting field list for this module (vintage, ABV, bottle size, winery/producer, country of origin/region, tasting notes, serving temperature) — explicitly marked "proposed, not finalized," and not finalized by this document either. This document does not add, remove, rename, or type any of those fields; it organizes the *kind* of information the module holds into conceptual categories, so the module's shape is legible without depending on a still-open field list:

- **Identity and provenance** — facts identifying what the product fundamentally is and where it comes from (e.g., producer, region, vintage where applicable).
- **Sensory and educational** — facts helping a customer understand what the product tastes or feels like without having tried it (e.g., tasting notes).
- **Serving and storage guidance** — practical facts supporting confident use after purchase (e.g., serving temperature).
- **Compliance-adjacent facts** — facts with a regulatory or trust dimension beyond pure description (e.g., alcohol percentage), handled with the same accuracy discipline `05_PRODUCT_DETAILS_SPECIFICATION.md` §19's Trust Signals already establishes platform-wide.

These categories are a conceptual organizing device for this document only — they do not imply a data-model grouping, and the exact field list within each category is the open business decision named in §19, not resolved here.

## 6. Scope Within Wine & Spirits

- **This module covers the entire Wine & Spirits catalog** — wine, champagne, whisky, cognac, vodka, gin, rum, tequila, liqueurs, and any future spirit type `01_NAVIGATION_SPECIFICATION.md` §28's scalable category architecture accommodates — not wine specifically. `MEDUSA_EXTENSIONS.md` #1 already scopes it this way ("structured wine/spirit attributes").
- **Not every attribute applies to every sub-type**, per §3's tolerance-for-inapplicability principle — a whisky's "vintage" concept differs from a wine's, and some spirit types (e.g., gin) may have little meaningful region/vintage narrative at all. This document does not resolve which specific attributes apply to which sub-types; it establishes that the module's architecture must not assume uniform applicability across the whole catalog.
- **Bottle size and comparable physical-format facts** are within this module's scope as identity-adjacent data (§5), distinct from Pricing's own quantity-based pricing mechanics (native, §8).

## 7. Ownership

This module's governance is a three-way split, distinct from the two-way (engineering/merchandising) split `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §7 established for curated relationships:

- **The module's existence, architecture, and mechanism (this document) are an engineering/architecture decision.**
- **The exact field list is a business/merchandising decision requiring Paul's explicit approval** — `MEDUSA_EXTENSIONS.md` #1 already states this ("Paul's approval required: Yes — final field list"); this document does not narrow or resolve that requirement, only reaffirms it (§19).
- **Day-to-day attribute *values* for a specific product are staff data entry, not merchandising curation** — `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6 already establishes that staff "enter structured data into defined fields, not free-text descriptions standing in for structured facts." This is a meaningfully different governance model from the Product Relationship Module's editorial curation (§17) — attribute values are intended to be factual and verifiable, not a matter of editorial judgment.

## 8. Integration with Product Module

- **Every attribute record anchors to exactly one Wine & Spirits Product record**, linked via the same `defineLink` pattern `ARCHITECTURE.md` establishes as the rule for this project — new data as a new, small module, linked to Product, never editing Product's own tables.
- **This module never duplicates or shadows core product facts** (name, price, primary image) — those remain the Product and Pricing modules' responsibility; this module holds only the structured facts beyond that core.
- **This module's data is read alongside the Product Relationship Module's data, not merged with it** — a wine product may simultaneously have its own structured attributes (this module) and a curated pairing to a Food Central dish (`TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`); the two are separate, linked modules, each queried independently and composed at the presentation layer, not combined into one record.

## 9. Integration with Navigation

`01_NAVIGATION_SPECIFICATION.md` §13 (Wine Discovery Navigation) specifies a three-layer navigation system — formal taxonomy, varietal/style, and occasion/curation — and `INFORMATION_ARCHITECTURE.md` states directly that the varietal/style layer is "implemented via the wine-attributes module... and search facets, not a separate navigation tree." This module is therefore not merely consumed by navigation — it is the structural data source for one of Navigation's three named layers. No navigation-specific behavior is defined here; `01_NAVIGATION_SPECIFICATION.md` §13 remains the sole authority on how that layer behaves.

## 10. Integration with Search

`03_SEARCH_SPECIFICATION.md` §15 (Wine Discovery) and its Backend Requirements section (§26) both name this module's fields as the source for Wine facets and full-text search fields, synced into Meilisearch via the standard event-subscriber pattern `MEDUSA_EXTENSIONS.md` #6 already establishes. This module supplies raw attribute values; it does not participate in ranking (§4) — `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy governs that in full. **This is the module's most consequential sequencing dependency**: `ROADMAP.md` already sequences the wine-attributes module (Phase 2) before search integration (Phase 6) specifically because "indexing a still-changing schema wastes rework" — this document does not change that sequencing, it explains why this module's stability matters for the phase after it.

## 11. Integration with Product Listing

`04_PRODUCT_LISTING_SPECIFICATION.md` §9 (Product Card Behaviour) and its Product Card Information Hierarchy (added in that specification's own refinement pass) draw on this module's fields for the single conditionally-visible "supporting fact" a Wine & Spirits card may show beyond image/name/price, and for filter facets alongside Search's own faceting. This module supplies the underlying data; the card's own rule of showing at most one supporting fact remains `04_PRODUCT_LISTING_SPECIFICATION.md`'s presentation-layer decision, not something this module enforces.

## 12. Integration with Product Details

This is this module's most direct and detailed consumer. `05_PRODUCT_DETAILS_SPECIFICATION.md` §10 (Wine Product Experience) specifies plain-language guidance shown above structured facts drawn from this module, each shown only where applicable (§3). `05_PRODUCT_DETAILS_SPECIFICATION.md` §12 (Product Attributes) and §13 (Product Facts) are the specification's own explicit statement of the boundary this document restates in §4: this module is the Attributes layer; Facts is a distinct, presentation-layer concept `05_PRODUCT_DETAILS_SPECIFICATION.md` owns, not this document.

## 13. Integration with Admin Workflows

`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §6 (Product Management) already specifies that staff enter this module's attribute values through defined fields on the product record, linked via the pattern `MEDUSA_EXTENSIONS.md` #1 establishes — a materially more complete integration than the Product Relationship Module had at its own drafting (`TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §15 found no staff workflow specified at all; this module already has one, at least at the level of "structured fields, not free text"). This document does not add to or redefine that workflow; it confirms this module is what §6 already assumes exists.

## 14. Non-Integrations (confirmed, not assumed)

Reviewed against every frozen specification; the following have **no dependency** on this module, stated explicitly so a future contributor does not assume one that was never specified:

- **Cart (`06_CART_SPECIFICATION.md`) and Checkout (`07_CHECKOUT_SPECIFICATION.md`)** — both operate at the catalog level (is this line item Wine & Spirits or Food Central — e.g., for gift-wrap eligibility, §15, or the age-verification reminder, §19) rather than the attribute level; neither needs a specific product's vintage, ABV, or region to function.
- **Customer Account (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`)** — order history and reordering re-validate price and availability (native mechanisms), not structured attribute data.
- **Food Ordering (`09_FOOD_ORDERING_SPECIFICATION.md`)** — explicitly Food Central-scoped; consumes `food-details`, not this module. Its Backend Requirements section names the food-attributes module specifically, never this one — the confirming counterexample referenced in §1.
- **Delivery (`10_DELIVERY_SPECIFICATION.md`)** — delivery status, address handling, and fulfillment logistics have no dependency on a product's descriptive attributes.
- **Homepage (`02_HOMEPAGE_SPECIFICATION.md`)** — curated collections and the hero are Category/Collection-driven (native), not attribute-driven; the homepage does not display structured wine facts directly.

## 15. CMS Responsibilities

- **The authoritative structured attribute data lives in this module, inside Medusa** — not in a future CMS, consistent with `MEDUSA_EXTENSIONS.md` #7's one-way-sync pattern (commerce data flows to a CMS, never back).
- **A future CMS (Sanity, recommended but not approved) may host richer editorial content about a wine or region** — a producer profile, a region guide, a tasting story — but this is optional, future, and never a substitute for or source of truth for this module's structured facts, the same boundary `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §16 already establishes for its own domain.

## 16. Data Accuracy & Verification Ownership

- **No prior document assigns operational responsibility for verifying wine attribute accuracy** (correct vintage, correct ABV, correct region) once entered. This is a genuine documentation gap this review discovered, distinct from — and less severe than — `food-details`' already-flagged allergen-accuracy-ownership gap (`MEDUSA_EXTENSIONS.md` #2), since a wine attribute error is a trust/accuracy concern rather than a safety one, but it is not resolved by any existing document and is not resolved here. Recorded in `PROJECT_STATUS.md`, not invented.
- **Whatever the answer, `05_PRODUCT_DETAILS_SPECIFICATION.md` §19's Trust Signals principle already governs the standard**: authenticity and pricing/availability accuracy are named trust mechanisms, and attribute accuracy is the same kind of commitment applied to descriptive facts specifically.

## 17. Future Extensibility

Nothing in this section is built now — it documents capability this module's shape already leaves room for:

- **Additional attribute categories** (§5) as the catalog's descriptive needs grow, without requiring a structural redesign, the same extensibility principle `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §18 already applies to relationship kinds.
- **A future "verified" or "expert-annotated" tier of attribute data**, connecting to `05_PRODUCT_DETAILS_SPECIFICATION.md` §29's already-named Future Expansion capability (expert reviews, sommelier ratings) — not committed, not designed here.
- **Reuse of this module's architectural pattern (a small, linked, category-organized attribute module) for a future business line**, per `PRODUCT_BLUEPRINT.md` §17's general future-expansion framing — a capability observation, not a proposal for a specific new module.

## 18. Risks

- **The field list is still open, and this module's five dependent specifications are all, to varying degrees, waiting on it** — `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Wine Product Experience, `04_PRODUCT_LISTING_SPECIFICATION.md`'s card fact slot, `03_SEARCH_SPECIFICATION.md`'s facets, `01_NAVIGATION_SPECIFICATION.md`'s varietal/style layer, and `11_ADMIN_WORKFLOWS_SPECIFICATION.md`'s data-entry workflow all describe behavior *shaped by* this module without depending on its exact fields — but none can be fully implemented until the field list is approved. This document does not resolve that; it makes the scope of what's waiting explicit.
- **`MEDUSA_EXTENSIONS.md` #1 already names a migration risk** if the field list changes after launch — this document does not add a new risk here, only confirms it remains live and is sharpened by how many specifications now depend on this module's stability.
- **Indexing this module into search before its shape stabilizes wastes rework**, per `ROADMAP.md`'s own explicit reasoning (§10) — a sequencing risk, not an architectural one, but one this module's own instability would directly cause downstream.
- **The Attributes-vs-Facts boundary (§4, §12) is easy to blur in practice** — a future contributor could reasonably but incorrectly add presentation logic (formatting, grouping, plain-language phrasing) into this module instead of keeping it in `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Facts layer; this document names the risk explicitly so it is caught rather than discovered later.

## 19. Dependencies

- **Depends on the Product module**, already native and unaffected by this document.
- **Depends on Paul's explicit approval of the final field list** — an already-tracked open business decision (`PROJECT_STATUS.md`, `MEDUSA_EXTENSIONS.md` #1); this document does not propose, narrow, or invent one.
- **Blocks Tier D's Meilisearch integration planning and Tier C's Search/Listing/Product-Details API contract planning** — both should sequence after this module's field list is approved, mirroring `ROADMAP.md`'s own backend-phase ordering (§10, §18).
- **Depends on a future document or decision assigning wine attribute accuracy/verification ownership** (§16) — a newly discovered gap, recorded here and in `PROJECT_STATUS.md`, not resolved.
- **Depends on Paul's explicit confirmation that this module proceeds into further Tier B/C planning**, per `IMPLEMENTATION_PLANNING.md` §2 principle 4 — this document does not assume approval.

## 20. Quality Checklist

Every future addition to this module's planning must be able to answer **yes** to all of the following:

- [ ] **Does it stay in the Attributes layer, never the Facts (presentation) layer?** Checked against §4, §12.
- [ ] **Does it avoid reintroducing "pairs with" as a field on this module?** Checked against §4 — that decision belongs to `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, not here.
- [ ] **Does it tolerate genuine inapplicability per product/sub-type**, rather than assuming every Wine & Spirits product needs every attribute? Checked against §3, §6.
- [ ] **Does it avoid finalizing, adding, or removing a specific field**, leaving that to the still-open business decision? Checked against §5, §19.
- [ ] **Does it avoid duplicating Food Central's `food-details` module or merging the two?** Checked against §4.
- [ ] **Does it avoid inventing an answer to the attribute-accuracy-ownership gap** (§16) rather than recording it? Checked against §19.
- [ ] **Does it stay purely architectural**, introducing no table, field type, endpoint, or code? Checked against this document's own scope statement.

## 21. Acceptance Criteria

- [ ] Every Wine & Spirits product's structured attribute data is linked to exactly one Product record, via the same pattern `ARCHITECTURE.md` establishes platform-wide.
- [ ] A product with an inapplicable attribute (e.g., a non-vintage spirit) is represented without that attribute being treated as an error or forced placeholder.
- [ ] No attribute record from this module ever includes a "pairs with" or cross-catalog relationship field.
- [ ] Search, Listing, Navigation, Product Details, and Admin Workflows all consume the same underlying attribute data — no surface maintains a divergent copy.
- [ ] No presentation-layer formatting, grouping, or plain-language phrasing logic is defined within this module's own architecture — that remains `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Facts-layer responsibility.
- [ ] This document introduces no database table, field type, API endpoint, or UI component definition anywhere within it.
- [ ] No field list is finalized, added to, or removed from `PRODUCT_CATALOG.md`'s existing proposal by this document.

---

**Document status:** Draft (v1.0). This is the first full draft of the Wine & Spirits Attributes Module's architectural plan — ready for review, not yet approved. Per `IMPLEMENTATION_PLANNING.md` §7, it may proceed to a refinement pass or a direct approval once Paul reviews it. Upon approval, this document becomes the architectural reference Tier C (API Contract Planning) and any future field-list/data-model decision must build against without contradicting.
