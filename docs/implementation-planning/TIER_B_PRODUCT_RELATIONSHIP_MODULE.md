# Tier B — Product Relationship Module

**Status:** Approved
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-18

This document is a Tier B (Module Data Planning) deliverable, per `IMPLEMENTATION_PLANNING.md` §4 and §6, addressing the highest-priority gap `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` identified: a product-to-product relationship mechanism ("pairs with") depended on by six frozen Product Specifications with no existing entry in `MEDUSA_EXTENSIONS.md`.

**This document is purely architectural.** It defines the module's responsibilities, ownership, boundaries, business purpose, and integration points — nothing else. **It is not a database design, not an API specification, and not implementation code.** No table is named, no field is typed, no endpoint is shaped. No Frozen document is modified by this document. Where this document's conclusions imply a correction to a pre-existing document (see §4), that correction is named as a dependency, not made here.

---

## 1. Why This Module Exists

Six frozen Product Specifications — `01_NAVIGATION_SPECIFICATION.md`, `02_HOMEPAGE_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, `04_PRODUCT_LISTING_SPECIFICATION.md`, `05_PRODUCT_DETAILS_SPECIFICATION.md`, and `06_CART_SPECIFICATION.md` — each independently name a requirement to represent that a specific product is curated as meaningfully associated with another specific product, most consequentially across catalog lines (a wine paired with a dish). `09_FOOD_ORDERING_SPECIFICATION.md` reuses the identical mechanism rather than inventing a second one. No prior document defines what holds this association, how it is represented, or who governs it — `PRODUCT_CATALOG.md`'s only mention of it is a narrower, single-directional field proposal that predates every specification now depending on it (§4). *(Navigation's own dependency, distinct in kind from the other five, is treated separately — see Integration with Navigation, below.)*

This module exists to close that gap: a single, general mechanism for representing curated product-to-product relationships, built once, referenced consistently by every surface that needs it, rather than reinvented per-surface or bolted onto an unrelated module.

## 2. Business Justification

- **Directly implements `PRODUCT_BLUEPRINT.md`'s core vision** — a platform Nigerians trust to deliver "a bottle of wine and a home-cooked meal with the same care," and `EXPERIENCE_PRINCIPLES.md` #10 ("Food and Wine Should Feel Connected") specifically. Without this module, that connection exists only as a written intention with no mechanism to realize it consistently.
- **Reinforces the "one cohesive brand" business rule (`BUSINESS_RULES.md`) at the data layer**, not only in presentation — every specification that references pairing treats it as proof the platform is one ecosystem, not two catalogs sharing a checkout.
- **Serves the Guided Browser customer intent** (`PRODUCT_BLUEPRINT.md` §4) specifically — a customer who wants curated suggestions, not just a search box — while remaining a restrained, editorial mechanism rather than a conversion-pressure device, consistent with the no-fake-urgency principle (`EXPERIENCE_PRINCIPLES.md` #15) every specification that touches this restates.
- **Increases discovery and per-order value through curation, not manipulation** — every specification describing this mechanism is explicit that it is editorial and restrained, never algorithmic, never fabricated, and never allowed to override relevance, ranking, or availability honesty established elsewhere.

## 3. Responsibilities

- **Hold curated associations between two products**, such that a product's curated relationships can be looked up starting from either product in the pair (a wine's page can show its paired dishes; a dish's page can show its paired wines) — every specification that references this mechanism assumes it is discoverable from either originating product, not one-directional.
- **Serve as the single authoritative source for this specific kind of relationship**, so that navigation, homepage, search, listings, product details, cart, and food ordering all reference the same underlying data rather than each surface maintaining its own copy or inventing its own logic.
- **Remain general enough in concept to represent a curated association between any two products the business chooses to pair**, with cross-catalog (wine ↔ dish) as the originating and currently only required case (§5) — not hardcoded exclusively to that one case, since `PRODUCT_BLUEPRINT.md` §17 and `06_CART_SPECIFICATION.md` §6 both already describe the architecture's obligation to accommodate a future business line without a redesign.
- **Resolve, at read time, back to live Product data** (name, price, image, availability) rather than storing a duplicated snapshot — so a pairing never shows stale or dishonest information about the paired product (§8).

## 4. Explicit Non-Responsibilities

- **This module does not replace or absorb "Related Products."** `05_PRODUCT_DETAILS_SPECIFICATION.md` §15 already defines Related Products as a same-catalog mechanism, built natively from existing Category/Collection membership — a deliberately distinct, already-solved concept this module does not redefine, duplicate, or subsume.
- **This module does not perform ranking, relevance scoring, or search result ordering.** `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy remains the sole authority on relevance; this module supplies curated pairing data as an input where a surface explicitly chooses to display it, and never silently influences ranking.
- **This module does not compute algorithmic or AI-generated recommendations.** Every specification that references pairing explicitly excludes personalization, AI-assisted recommendation, and "frequently bought together"-style computed suggestions from v1, deferring them to each document's own Future Expansion section. This module holds only editorially curated associations.
- **This module does not set or apply pricing, discounts, or promotional logic.** A pairing suggestion is never itself a discount mechanism, and is a distinct concept from the priced Gift Wrap add-on `05_PRODUCT_DETAILS_SPECIFICATION.md` §16 and `06_CART_SPECIFICATION.md` §15 already define.
- **This module does not determine product availability, stock, or visibility.** Availability, the unavailable/hidden/discontinued distinction, and stock levels remain entirely the Product module's and its linked attribute modules' responsibility (§8) — this module only says a relationship exists, never whether either product in it is currently purchasable.
- **This module does not enforce how many pairings a given surface displays, or in what layout.** `06_CART_SPECIFICATION.md` §18's "one restrained suggestion, single-catalog carts only" rule, and any similar per-surface display cap, is that surface's own presentation logic, not a rule this module imposes.
- **This module is not a database design, an API specification, or implementation code**, per this document's explicit scope (see the introduction above).

## 5. Relationship Types

The module's data model should hold the *concept* of a relationship type (a "kind" of curated association), so that a future kind can be introduced without restructuring the module — but only one kind is required for v1, and none beyond it is designed here:

- **Cross-catalog pairing (Wine & Spirits ↔ Food Central)** — the originating, currently only required kind. This is the mechanism every one of the six specifications (§1) describes, in every case as a curated, editorial association between one wine/spirit product and one food product.

No same-catalog relationship kind (wine ↔ wine, dish ↔ dish) is required by any frozen specification — that discovery pattern is already served by Related Products (§4) and by the existing category/varietal/occasion navigation layers (`INFORMATION_ARCHITECTURE.md`). Introducing a same-catalog "kind" here would be scope not asked for by any specification, and is explicitly not proposed.

## 6. Supported Catalogs

Wine & Spirits and Food Central, in both directions, per §3. No third catalog or vendor-scoped variant exists today, and none is proposed — but per `PRODUCT_BLUEPRINT.md` §17's and `06_CART_SPECIFICATION.md` §6's already-established future-expansion framing, this module's concept of "two products, associated by a kind of relationship" does not architecturally preclude a future business line joining the same mechanism. This is a capability observation, not a commitment — no third catalog is authorized or scheduled by any document.

## 7. Ownership

- **The module's existence, general shape, and governing rules (this document) are an engineering/architecture decision.** Which specific pairings exist — that a particular wine is curated as pairing with a particular dish — is a **merchandising decision**, made by the same content-governed process `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance table already establishes for every other piece of editorial content on the platform: structure is developer-governed, content is data/merchandising-governed.
- **Curation is editorial, not customer-generated and not algorithmically generated.** No specification that references this mechanism describes customers submitting or voting on pairings, and every specification explicitly excludes computed/AI-driven pairing from v1 (§4).
- **The staff-facing workflow for creating, editing, or retiring a curated pairing is not yet specified anywhere**, including in `11_ADMIN_WORKFLOWS_SPECIFICATION.md`, which specifies an equivalent staff-editable, no-developer-involvement pattern for Category & Collection content (§7) but does not yet extend that pattern explicitly to this module. This is a genuine, named dependency (§20), not resolved by this document.

## 8. Integration with Product Module

- **Every relationship anchors to two existing Product records** — one per side of the pairing. This module has no meaning independent of Product; it is additive data linked to products that already exist, following the same "new data as a new, small module, linked to Product, never editing Product's own tables" pattern `ARCHITECTURE.md` already establishes as the rule for this project.
- **The module never duplicates or shadows core product facts** (name, price, primary image) — every surface that displays a pairing resolves those facts live from the Product module (and, where relevant, the linked wine/food attribute modules) at the moment of display, so a price change or a newly-hidden product is reflected immediately and honestly, consistent with the "nothing changes silently" principle every frozen specification already applies to its own domain.
- **A pairing to a product that is currently unavailable, hidden, or discontinued** (the three-way distinction `04_PRODUCT_LISTING_SPECIFICATION.md` already establishes) **is never surfaced to a customer as an active suggestion** — the relationship *record* may continue to exist, but display logic on every consuming surface must respect the paired product's current state, the same way any other product reference on the platform already must.

## 9. Integration with Search

`03_SEARCH_SPECIFICATION.md` §17 names this relationship as a cross-selling opportunity, not yet modeled. This module's role in search is limited to **supplying curated pairing data as an input to a restrained cross-sell moment**, if and where Search chooses to surface one — it never becomes a ranking signal. `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy (relevance first; no promotional, business, or availability signal may ever outrank genuine relevance or insert an irrelevant product) governs search results in full; this module supplies data, it does not participate in ranking decisions.

## 10. Integration with Homepage

`02_HOMEPAGE_SPECIFICATION.md` §8.6 ("Wine & Food, Connected") is the primary, named homepage moment this module serves — the section's layout, pacing, and presentation are already fully specified and frozen in `02_HOMEPAGE_SPECIFICATION.md` itself; this module's only role is to supply the curated pairing(s) that section displays.

## 11. Integration with Product Details

`05_PRODUCT_DETAILS_SPECIFICATION.md` §14 (Pairing Recommendations) is this module's most direct consumer — cross-catalog, editorial, exactly the relationship this module holds. `05_PRODUCT_DETAILS_SPECIFICATION.md` §15 (Related Products, same-catalog, native) and §16 (Cross-selling / Gift Wrap, a priced add-on) are both explicitly distinct, already-frozen mechanisms this module does not touch, redefine, or absorb (§4).

## 12. Integration with Cart

`06_CART_SPECIFICATION.md` §18 (Cross-selling) is this module's consumer at the cart stage — a single, restrained suggestion, shown only when the cart contains exactly one catalog, never once the cart is already mixed (since the cross-catalog connection is, at that point, "already realized"). This module supplies the pairing data the cart's own display rule then applies; the one-suggestion, single-catalog-only cap is the cart's own presentation logic (§4), not something this module enforces.

## 13. Integration with Checkout

**No integration exists, and none is proposed.** `07_CHECKOUT_SPECIFICATION.md` does not reference pairing or cross-selling anywhere, consistent with checkout's own Trust Signals principle that no new merchandising moment is introduced at the point of highest commitment. This is stated explicitly here so a future contributor does not assume a dependency that was never specified.

## 14. Integration with Food Ordering

`09_FOOD_ORDERING_SPECIFICATION.md` §13 and §18 explicitly reuse the identical "Wine & Food, Connected" pairing moment already established in `02_HOMEPAGE_SPECIFICATION.md` and `05_PRODUCT_DETAILS_SPECIFICATION.md` as the primary mechanism by which a Food Central-only visit turns into a mixed order, and states directly that it "does not introduce a second, competing cross-sell mechanism for Food Central specifically." This module's integration with Food Ordering is therefore pure reuse — no new requirement beyond what §10 and §11 already describe.

## 15. Integration with Admin Workflows

`11_ADMIN_WORKFLOWS_SPECIFICATION.md` does not currently specify a staff workflow for managing this module's data, though it establishes the exact governance pattern (data-driven, staff-editable, no developer involvement for routine content changes, per its Category & Collection Management section) that curated pairing content should logically follow, per §7's ownership principle above. **This module must be administrable by staff without engineering involvement for routine curation** — that is a requirement this document places on any future implementation — but the specific staff-facing workflow (how a pairing is created, reviewed, or retired) is not designed here and remains a named dependency (§20).

## 16. CMS Responsibilities

- **The authoritative relationship data — that product A is curated as paired with product B — is commerce data and lives with this module, inside Medusa**, not in a CMS, consistent with `MEDUSA_EXTENSIONS.md` #7's established one-way-sync pattern (commerce data flows to a CMS, never back) and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §16's restatement of it.
- **A future CMS (Sanity, recommended but not approved) may host richer editorial content *about* a pairing** — a tasting-and-pairing story, an occasion-based article referencing the pairing — but this is optional, future, and not required for the module's own function. No specification requires CMS-authored content for the pairing mechanism to work.

## 17. Merchandising Responsibilities

- **Curating which pairings exist, and keeping them accurate and genuinely relevant** — not exhaustive coverage of every possible product combination, consistent with the restrained, editorial framing every consuming specification already establishes.
- **Respecting each consuming surface's own display rules** (§9–§14) — merchandising curates the underlying relationships; it does not override a surface's own cap or placement rule (e.g., cart's single-suggestion-only rule, §12).
- **Never fabricating a pairing to create urgency or pressure** — the platform-wide no-fake-urgency rule (`EXPERIENCE_PRINCIPLES.md` #15) applies to this content exactly as it applies to every other merchandising surface already specified.

## 18. Future Extensibility

Nothing in this section is built now — it documents the *capability* this module's general shape already leaves room for, the same discipline every frozen specification's own Future Expansion section already applies:

- **Additional relationship kinds** beyond cross-catalog pairing (§5), should the business ever curate a different kind of association — the concept of a "kind" (§5) exists specifically so this does not require a structural redesign.
- **A third catalog or future business line** joining the relationship graph (§6), consistent with `PRODUCT_BLUEPRINT.md` §17's already-named future-expansion considerations — not authorized or scheduled by any document today.
- **Algorithmic or personalized pairing suggestions**, explicitly deferred by every consuming specification's Future Expansion section — this module's editorial, curated nature (§4, §7) is a deliberate v1 boundary, not a permanent architectural ceiling; a future algorithmic layer, if ever approved, would be a new capability built alongside this module, not a replacement for it.

## 19. Risks

- **Six specifications already assume this module's existence with zero prior architecture** — if a future implementation reverts to `PRODUCT_CATALOG.md`'s original narrow, wine-side-field framing instead of the general module this document describes, every one of those six integrations (§9–§12, §14) would require rework. This document exists specifically to prevent that outcome, but the risk remains live until Tier C (API Contract Planning) and actual implementation follow this document's framing rather than the older, conflicting one.
- **No staff curation workflow exists yet** (§7, §15, §20) — a technically complete module with no way for merchandising to populate it is not actually useful; this risk is named, not resolved, here.
- **Scope creep toward algorithmic recommendation** is a standing risk given how naturally "pairing" invites a "customers who bought X also bought Y" extension — every consuming specification's explicit v1 exclusion of AI/personalization (§4, §18) is the guardrail; this document restates it deliberately rather than assuming it will hold on its own.
- **Curation is an ongoing content-operations cost, not a one-time build** — mirroring the same risk `PRODUCT_BLUEPRINT.md` §18 already names generally for product content quality, applied here specifically to relationship data, which degrades in relevance as the catalog changes if not actively maintained.

## 20. Dependencies

- **Depends on the Product module for both catalogs**, already native and unaffected by this document.
- **Soft dependency on the wine-details and food-details attribute modules' field lists being finalized** — not blocking (a pairing can reference a product regardless of that product's attribute completeness), but curation quality improves once structured attributes (e.g., tasting notes, spice level) are available to inform *why* a pairing makes sense.
- **Depends on a future implementation-planning or Admin-Workflows-adjacent document to define the staff curation workflow** (§7, §15) — a dependency this document creates and names, not one it resolves.
- **Depends on Paul's explicit confirmation that this module proceeds into further Tier B/C planning** — per `IMPLEMENTATION_PLANNING.md` §2 principle 4, this document does not assume approval; it documents the architecture so that confirmation, when given, has something concrete to approve.
- **Depends on a future `MEDUSA_EXTENSIONS.md` entry formally registering this module**, numbered alongside the platform's other custom modules, once Tier C or a data-model follow-on document is ready to specify it concretely — this document's approval is the architectural basis for that entry, not the entry itself; `MEDUSA_EXTENSIONS.md` remains unmodified by this document, per `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §4's original recommendation that the correction happen when this module's planning work reaches that point, not before.

## 21. Quality Checklist

Every future addition to this module's planning — a new relationship kind, a new consuming surface, a change to its governance — must be able to answer **yes** to all of the following:

- [ ] **Does it stay editorial and curated, not algorithmic or personalized?** Checked against §4, §18 — v1's boundary is deliberate, not accidental.
- [ ] **Does it avoid duplicating or redefining Related Products, Cross-selling/Gift Wrap, or Search's Ranking Philosophy?** Checked against §4, §9, §11, §12 — this module supplies one specific kind of data, it does not absorb adjacent, already-solved concepts.
- [ ] **Does it resolve live from the Product module rather than storing a stale snapshot?** Checked against §3, §8.
- [ ] **Does it respect the unavailable/hidden/discontinued distinction** rather than surfacing a pairing to a product that isn't genuinely purchasable? Checked against §8.
- [ ] **Does it remain administrable by staff without engineering involvement for routine curation**, consistent with the governance pattern `01_NAVIGATION_SPECIFICATION.md` and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` already establish for equivalent content? Checked against §7, §15.
- [ ] **Does it avoid inventing a business decision** — a staff workflow, a relationship kind, a third catalog — that hasn't actually been asked for? Checked against §5, §6, §15, §20.
- [ ] **Does it stay purely architectural**, introducing no table, field, endpoint, or code? Checked against this document's own scope statement.

## 22. Acceptance Criteria

- [ ] A curated relationship between two products is discoverable starting from either product in the pair.
- [ ] Every surface that displays a pairing (homepage, product details, search, listings, cart, food ordering) resolves the paired product's name, price, image, and availability live, never from a stored snapshot.
- [ ] A pairing referencing a product that is currently unavailable, hidden, or discontinued is never presented to a customer as an active suggestion.
- [ ] No relationship data from this module ever influences search relevance or ranking order.
- [ ] No surface introduces a pricing, discount, or promotional mechanism through this module — a pairing is never itself an offer.
- [ ] Related Products (`05_PRODUCT_DETAILS_SPECIFICATION.md` §15) and Cross-selling/Gift Wrap (`05` §16, `06` §15) remain entirely unaffected by, and unduplicated within, this module.
- [ ] No surface beyond those named in the Integration sections above (§8–§15 and Integration with Navigation) depends on this module without a corresponding update to this document.
- [ ] Checkout (`07_CHECKOUT_SPECIFICATION.md`) continues to have zero dependency on this module unless a future business decision changes that.
- [ ] The module's conceptual shape (§5) accommodates a second relationship kind or a third catalog being added later without requiring this document to be rewritten, only extended.
- [ ] This document introduces no database table, field, or API endpoint definition anywhere within it.

---

## Integration with Navigation

Added during review for cross-reference completeness: `01_NAVIGATION_SPECIFICATION.md` references this relationship in three places — its Wine Discovery Navigation (§13), Food Central Navigation (§14), and Deep Linking (§19) sections, and its own consolidated Backend Data Requirements table names "'pairs with' cross-links" explicitly, flagging the same not-yet-modeled gap `02_HOMEPAGE_SPECIFICATION.md` first surfaced. Navigation's dependency is distinct in kind from §9–§14's: those sections consume this module to **display a specific curated pairing suggestion**; Navigation instead uses the same underlying relationship data to inform **cross-linking and wayfinding** — for example, a wine category page offering a wayfinding link into Food Central grounded in a real curated pairing, rather than an arbitrary or unrelated cross-link. This is the same data (§3), consumed for a different purpose (discovery/wayfinding rather than a merchandising suggestion), and is subject to the identical rules already established: it must resolve live from Product data (§8), must never surface a pairing to an unavailable/hidden/discontinued product (§8), and must never be used to fabricate a cross-link that isn't genuinely curated (§17).

No new module responsibility is created by this section — it is a completeness correction, not a scope change. `01_NAVIGATION_SPECIFICATION.md` itself remains untouched by this document.

---

**Document status:** Approved (v1.0). This is the architectural reference for the Product Relationship Module, reviewed against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `MEDUSA_EXTENSIONS.md`, and all 11 frozen Product Specifications, with one completeness correction added (Integration with Navigation, above) and no existing section rewritten. Per `DOCUMENTATION_GOVERNANCE.md` §5, it may now only be modified in response to an explicit new business or architecture decision, logged in `DECISION_LOG.md`. It is the architectural reference Tier C (API Contract Planning) and any future data-model follow-on document must build against without contradicting.
