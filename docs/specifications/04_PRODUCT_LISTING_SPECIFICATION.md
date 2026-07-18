# Product Listing Specification

**Status:** Approved — Frozen (2026-07-18)
**Version:** 1.0
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for all product listing and browsing experiences across LiquorCentral — every page a customer reaches by clicking a category, a collection, or a "see more" link, rather than by typing a search query. It defines *product behavior, customer experience, business objectives, backend requirements, accessibility, and scalability* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §6 (Product Catalog Strategy), `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0, `INFORMATION_ARCHITECTURE.md`, and `PRODUCT_CATALOG.md`, and none of it contradicts them. It integrates directly with the two already-frozen specifications it sits beside: `01_NAVIGATION_SPECIFICATION.md` (Approved — Frozen) defines how a customer *reaches* a listing (category/collection navigation, §11–§12) — this document does not redefine that. `03_SEARCH_SPECIFICATION.md` (Approved — Frozen) owns query-driven results — this document explicitly does not cover search result pages, though it shares the same product card component (§9) that search results also use. `02_HOMEPAGE_SPECIFICATION.md` (Approved — Frozen) owns the homepage's own curated shelves, which link into the listing pages this document specifies.

Where a decision is grounded in external UX, accessibility, or performance research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Product Listing Philosophy

A listing page has one job to do without contradicting itself: **let a customer scan quickly and decide confidently, at the same time.** Efficient shopping and premium discovery are not in tension here — they are two names for the same standard. This follows directly from `EXPERIENCE_PRINCIPLES.md` #2 (Simplicity Before Features), #3 (Premium Through Discipline), and #12 (Reduce Cognitive Load): a listing earns trust by showing exactly enough, not everything possible.

Three commitments follow, and nothing below may violate them:

1. **Filtering, sorting, and merchandising assist — they never intrude.** A facet narrows a customer's own choice; it never makes a choice for them. A promotional badge informs; it never pressures. The moment any of these three starts to feel like it's working against the customer rather than for them, it has failed this document's standard (§16, §17).
2. **The listing experience is one shared pattern serving two different pacing needs**, per `01_NAVIGATION_SPECIFICATION.md` §1's asymmetric-within-one-shell principle: Wine & Spirits listings are browse-oriented (richer facets, editorial context), Food Central listings are decision-oriented (fast scan, quick action) — the same grid and card component (§9) flexes to serve both, rather than two different systems existing side by side.
3. **A listing must never leave a customer stuck.** Current research on ecommerce product lists is direct: the majority of sites still have real usability gaps in this exact surface — filters that overwhelm, pagination patterns that lose the customer's place, cards that bury the one fact that mattered. Every section below exists to name and close a specific version of that gap for this platform.

## 2. Business Objectives

- **Reduce drop-off between a category/collection entry and a product-detail click-through** — a listing's core conversion metric, directly serving `PRODUCT_BLUEPRINT.md` §1's "confident enough to purchase immediately" vision.
- **Present the catalog at a density and quality that reinforces premium positioning**, not a discount-bin grid — `EXPERIENCE_PRINCIPLES.md` #3 applies as much to a listing page as to a hero section.
- **Serve both catalogs' opposite pacing needs from one shared listing system**, avoiding the cost (in consistency and engineering effort) of building two separate listing architectures for what is structurally the same page type.
- **Protect equal prominence between Wine & Spirits and Food Central** at the listing level, consistent with `PRODUCT_BLUEPRINT.md` §2 and every prior specification's own commitment to this.
- **Make merchandising effective without making it feel manipulative** — capped, honest promotional treatment (§16, §17) is a business objective in its own right, not a constraint fought against; `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions) applies directly to a listing page's badges and default sort order.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents into listing pages specifically:

| Customer type | Listing objective |
|---|---|
| Confident Buyer | Scan a grid fast, compare a small number of real candidates, and reach the product detail page (or add to cart directly, where appropriate — §9) with minimal friction. |
| Guided Browser | Use facets and editorial context (collection framing, badges) to narrow a large, unfamiliar set into a confident shortlist — served without expertise assumed. |
| Repeat Household | Recognize familiar products quickly in a Food Central listing, and reach a fast reorder-equivalent action without re-reading a full grid. |
| Gifter | Land on a Gifting-collection listing (`01_NAVIGATION_SPECIFICATION.md` §12) that reads as curated for the occasion, not just the general catalog with a different title. |

Every customer type additionally needs: to trust that "no results" or "nothing available" genuinely means that (§21), to filter and sort with full confidence in what each control does (§10, §11), and to never lose their place when loading more results (§13).

## 4. Entry Points

The *navigation* mechanics that lead to a listing page are fully specified elsewhere and are not redefined here:

- **Category and Collection links** in the primary navigation and mega menu (`01_NAVIGATION_SPECIFICATION.md` §11, §12) — the primary entry point.
- **Curated shelves on the homepage** (`02_HOMEPAGE_SPECIFICATION.md` §8.4) — link directly into a Collection listing.
- **A "closest matching category or collection" recovery link from a zero-result search** (`03_SEARCH_SPECIFICATION.md` §18) — lands the customer on an ordinary listing page, indistinguishable in behavior from any other entry.
- **Breadcrumbs** (`01_NAVIGATION_SPECIFICATION.md` §18) — moving up a level from a product detail or deeper category page.

Regardless of entry point, the listing page itself behaves identically — this document does not vary listing behavior by how the customer arrived, only by *what* they arrived at (§5).

## 5. Listing Types

Three listing types share one underlying grid and card pattern (§9), differing only in their data source and default framing:

1. **Category listings** (§6) — the formal taxonomy, data-driven per `01_NAVIGATION_SPECIFICATION.md` §11.
2. **Collection listings** (§7) — curated/occasion groupings, data-driven per `01_NAVIGATION_SPECIFICATION.md` §12.
3. **Food Central menu listings** — structurally a Category listing (§6) but with Food Central's distinct facet set, pacing, and card emphasis (§19).

**Explicitly excluded from this document's scope:** search result listings, which use the same card component (§9) but are otherwise fully specified in `03_SEARCH_SPECIFICATION.md` — this document does not redefine ranking, query handling, or search-specific empty states.

## 6. Category Listings

- Category listings are rendered from live Product Category data (`01_NAVIGATION_SPECIFICATION.md` §11) — the listing page has no independent product list of its own to maintain; it is a view over the same category tree the navigation shell already renders.
- For Wine & Spirits, a category listing is where the second discovery layer (varietal/style facets, `01_NAVIGATION_SPECIFICATION.md` §13) becomes actionable — a customer narrows *within* the category they've already entered, per §10 below.
- A category with child categories (e.g. "Spirits" over "Whisky," "Cognac," etc.) surfaces those children as an in-page sub-navigation, mirroring `01_NAVIGATION_SPECIFICATION.md` §11's existing rule for exactly this case — not re-specified differently here.

## 7. Collection Listings

- Collection listings are rendered from live Product Collection data (`01_NAVIGATION_SPECIFICATION.md` §12) — a Collection is a curated cross-cut of the catalog (a product may belong to one category and several collections at once), and its listing page uses the identical grid/card pattern as a category listing (§9), not a visually distinct "special" page type.
- **Evergreen collections** (e.g. "Sommelier's Picks") behave exactly like a category listing in every respect below.
- **Promotional collections** (seasonal, limited-time — per `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy) inherit that same capped, auto-expiring discipline here: a listing page for an expired promotional collection is not reachable once its end date passes, rather than showing a stale or empty promotional page.

## 8. Search Result Listings

Not specified here — see `03_SEARCH_SPECIFICATION.md`. The only fact this document asserts about search results is the one that matters for consistency: **search results render using the same product card component (§9) as category and collection listings**, so a product looks and behaves identically whether a customer found it by browsing or by searching. This is a deliberate consistency requirement (`EXPERIENCE_PRINCIPLES.md` #11, Consistency Creates Confidence), not an accident of shared code.

## 9. Product Card Behaviour

The product card is the single most-repeated component on the platform, appearing in every listing type (§5), on the homepage (`02_HOMEPAGE_SPECIFICATION.md` §8.4–§8.6, §8.8), and in search results (`03_SEARCH_SPECIFICATION.md`). Its behavior is specified once, here, and referenced everywhere else — no page redefines it independently.

*See "Product Card Information Hierarchy" near the end of this document for the explicit always-visible/conditionally-visible/never-shown priority order this section's "at most one supporting fact" rule implements.*

**Available information.** A card shows, at minimum: product image, name, and current price. Current research on card design is specific and worth taking seriously here: reducing a card to its essential elements (image, name, price) rather than crowding it with every available fact measurably improves click-through to the detail page — a card's job is to earn the click, not to replace the product detail page's structured fact sheet (`PRODUCT_BLUEPRINT.md` §3). Beyond the three essentials, a card may show **at most one** supporting fact appropriate to context (e.g. a Food Central card's prep-time/availability indicator, or a single promotional badge, §17) — never both at once, to preserve the restraint this research and `EXPERIENCE_PRINCIPLES.md` #3 both call for.

**Interaction behaviour.** The card's primary action is navigation to the product detail page, and the entire card surface (image, name) is that one primary link. Where a secondary action exists (a quick-add, §9's "quick actions" below), it is implemented as a separate, sibling control outside the primary link — never a second link nested inside the first, which is both invalid markup and a documented screen-reader confusion source. This is a deliberate, research-grounded accessibility decision, not an implementation detail left open (§24).

**Availability handling.** An unavailable product (sold out, or a Food Central item the kitchen can't currently fulfill) remains in the grid, clearly labeled, never silently removed — the same rule already established in `01_NAVIGATION_SPECIFICATION.md` §24 and `03_SEARCH_SPECIFICATION.md` §12, applied here to the card component that renders in all three contexts. An unavailable card's quick-add action (where one would otherwise exist) is disabled with a clear reason, not hidden.

**Pricing behaviour.** Price is always shown in full, in the platform's currency, with no obscured or "starting from" pricing that turns out to be misleading on the detail page. Where a genuine promotional price exists, both the original and current price are shown together, honestly — a promotional price is never fabricated or exaggerated (`EXPERIENCE_PRINCIPLES.md` #15), and follows the same start/end-date, auto-expiring discipline already established for promotional content elsewhere (§16, §17).

**Promotional indicators.** At most one badge per card (e.g. "New," "Limited," "Gift-Ready" — merchandising-controlled content, §16), positioned so it never obscures the product image. No badge asserts urgency that isn't real (no fabricated "X left" without a genuine, accurate stock count behind it) — the same non-manipulation rule already established in `01_NAVIGATION_SPECIFICATION.md`'s and `03_SEARCH_SPECIFICATION.md`'s Merchandising Strategy/Rules sections.

**Trust indicators.** The platform-wide trust claims ("sold and delivered by us directly," `PRODUCT_BLUEPRINT.md` §11) are established once, in the Trust & Delivery Band (`02_HOMEPAGE_SPECIFICATION.md` §8.7) and footer — a card does not repeat them. A card's own trust contribution is narrower and more concrete: honest pricing (above), honest availability (above), and image quality that matches what arrives (`PRODUCT_CATALOG.md`'s photography standard) — trust at the card level is earned through accuracy, not through added trust badges competing with the one fact (price) and one action (view/add) the card exists to deliver.

**Quick actions.** Whether a card offers a quick-add-to-cart action (bypassing the product detail page) is decided per catalog, not uniformly:
- **Food Central cards default to offering quick-add** — consistent with `BUSINESS_RULES.md`'s speed-first requirement and current research finding quick-add works best for lower-complexity, higher-frequency purchases, which describes most Food Central ordering.
- **Wine & Spirits cards treat quick-add as a secondary, lower-visual-weight action, present but not primary** — because `PRODUCT_BLUEPRINT.md` §3's Product Philosophy holds that a wine purchase is usually made with more confidence after the structured fact sheet (vintage, ABV, tasting notes) on the detail page, not from a card alone. A Confident Buyer who already knows exactly what they want may still use it; it is not removed, only visually secondary to the card's primary click-through action.
- Quick-add, where present, provides immediate, persistent confirmation (a cart-count update, per current cart-feedback research finding unclear feedback erodes trust) — never a silent action a customer has to double-check.

**Accessibility.** Covered in full in §24; summarized here as a card-level commitment: proper list semantics, one real link per card (not a link nested inside another), descriptive alt text on every product image (never a generic filename), and no information conveyed by badge/availability color alone.

## 10. Filtering

Listing-page filtering reuses `03_SEARCH_SPECIFICATION.md` §13's facet system in full — the same facet definitions, the same combinable AND/OR logic, the same mobile bottom-sheet-with-explicit-apply pattern, and the same desktop live-apply pattern — applied to a category/collection's product set instead of a query's result set. This document does not re-specify that mechanism; it confirms it is the same one.

- **Facet lists remain prioritized, not exhaustive, per category** (`03_SEARCH_SPECIFICATION.md` §13's Baymard-derived finding, reused directly): a few well-chosen filters outperform a long list customers must scan past.
- **Wine & Spirits listings** carry the fuller facet set (varietal/style, region, vintage, price, ABV); **Food Central listings** carry the narrower, safety-relevant set (dietary/allergen flags, spice level, prep time/availability) — the same per-catalog facet split already established in `03_SEARCH_SPECIFICATION.md` §13.
- **Allergen filtering carries the same safety-criticality already established** in `03_SEARCH_SPECIFICATION.md` §13/§16 — this document does not weaken or restate that guarantee differently for listings.

## 11. Sorting

- **Default sort order is "Featured"** — a merchandising-curated position (the same Category/Collection position field `01_NAVIGATION_SPECIFICATION.md` §11 already establishes for navigation ordering), not "Relevance," which only has meaning against a query and does not apply to a query-less listing page. This is a deliberate distinction from `03_SEARCH_SPECIFICATION.md` §14's default, made explicit so the two are never confused.
- **Additional sort options:** Price (low-to-high, high-to-low), Newest — the same options `03_SEARCH_SPECIFICATION.md` §14 offers for search results, for consistency across both contexts.
- **Popularity/Best-selling is deferred**, for the identical reason `03_SEARCH_SPECIFICATION.md` §10/§14 and `02_HOMEPAGE_SPECIFICATION.md` §14 already defer it platform-wide: no real usage data exists yet to sort by.
- Sorting and filtering (§10) are independent and composable, both reflected in the URL (§13, §26).

## 12. Active Filter Behaviour

Reuses `03_SEARCH_SPECIFICATION.md` §6/§13's existing rules in full: selected filters remain visible as removable chips regardless of device; mobile filter changes apply only via an explicit "Show N results" action within the filter panel, never live-updating mid-panel; desktop filter changes may apply immediately, since a discrete facet toggle is not the same "avoid interrupting continuous input" case `DESIGN_SYSTEM.md` §B9 addresses for text fields. This document does not restate the reasoning already given there — only confirms it governs listing pages identically to search results.

## 13. Pagination vs Infinite Scroll

- **Pure infinite scroll is rejected.** Current usability research (Baymard Institute, Nielsen Norman Group) is consistent: uncontrolled infinite scroll creates real friction for goal-driven shopping — customers lose their place, can't easily return to an earlier item, and can't compare products across a stable, referenceable page. This directly conflicts with the Confident Buyer's and Guided Browser's needs (§3).
- **Pure classic pagination (page-number-only navigation) is also not the primary pattern**, though it remains a reasonable fallback for very deep catalogs.
- **The adopted default pattern is "Load More" with lazy-loading** — a customer explicitly requests more results (rather than results appearing automatically as they approach the bottom of the page), and newly-loaded items append to the existing grid without losing scroll position or previously-seen items. This is the pattern current research specifically recommends over both alternatives for task-driven product lists, balancing continuous browsing with the customer staying in control and able to backtrack.
- **Every "page" of loaded results is still reflected in the URL** (an offset or page parameter), per `01_NAVIGATION_SPECIFICATION.md` §20's deep-linking principle — Load More is a UX pattern, not an excuse to trap listing state in client memory alone. A shared or reloaded URL restores the same set of loaded results, not just the first page.
- **The Load More action itself is a real, keyboard-operable control**, not a scroll-triggered side effect — consistent with §24's accessibility requirements.

## 14. Mobile Behaviour

- **Grid columns:** one or two columns depending on viewport width, per current card-design research recommending mobile-first, single-to-two-column layouts over a cramped multi-column grid that would force product images too small to serve `EXPERIENCE_PRINCIPLES.md` #4 (Photography Sells First).
- **Filter and sort controls are reachable via a sticky bar** that remains visible while scrolling the grid, opening the same bottom-sheet pattern already established in `03_SEARCH_SPECIFICATION.md` §23 — not redefined differently here.
- **Load More (§13) is a full-width, clearly-labeled control** at the bottom of the currently-loaded results, meeting the 44×44px minimum touch target (`DESIGN_SYSTEM.md` §B11).
- **Quick-add actions (§9) meet the same touch-target minimum**, positioned so they cannot be mistaken for the card's primary tap target.

## 15. Desktop Behaviour

- **Grid columns:** three to five, depending on viewport width — enough to support fast scanning without shrinking product imagery below what `EXPERIENCE_PRINCIPLES.md` #4 requires.
- **Filters render as a left-hand sidebar**, chosen deliberately over a horizontal-toolbar alternative: a persistent sidebar keeps the fuller Wine & Spirits facet set (§10) visible without needing to open and close a panel repeatedly, and preserves more horizontal width for larger product imagery than a toolbar-plus-dropdown pattern would. Sort remains a simple control near the top of the results, not folded into the sidebar.
- **Hover states may surface a lightweight secondary affordance** (e.g. revealing the quick-add action, §9, only on hover) on pointer-capable devices — never the *only* way to reach that action, since touch and keyboard users have no hover state to rely on (§24).

## 16. Merchandising Rules

*See "Merchandising Governance" near the end of this document for the full statement of what merchandising can and cannot influence, promotional limits, expiry behavior, and trust requirements — this section's rules are that governance model's application to listing pages specifically.*

Listing pages inherit the same merchandising discipline already established for navigation and search, rather than defining a parallel set of rules:

- **Default order is Featured** (§11), driven by the same Category/Collection position field merchandising already controls without developer involvement, per `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance model.
- **No fake urgency or fabricated scarcity** anywhere on a listing page or card (§9, §17) — the same rule stated in `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy and `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy, extended here to listings.
- **Unavailable products are labeled, never hidden** (§9) — consistent across all three specifications now.
- **Promotional collections and badges are capped and auto-expiring** (§7, §17), reusing the exact mechanism already built for navigation's promotional layer — no separate listing-specific promotional system exists.

## 17. Promotional Content

- **At most one badge per card** (§9) — the listing-level expression of the restraint principle already applied platform-wide.
- **A listing page may host at most one promotional banner/module** (e.g. a seasonal callout at the top of a category listing), never a promotional element repeated per card beyond the single badge — stacking promotional content at both the page level and the per-card level would violate the same restraint standard `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy already sets for navigation.
- **All promotional content is time-bound where campaign-driven**, using the same start/end-date, auto-expiring data pattern already established — no manual cleanup step, no stale promotional content persisting past its window.

## 18. Cross-selling Opportunities

- **Listing pages do not surface a "pairs with" suggestion on every card** — doing so across a full grid would clutter every card and contradict §9's one-supporting-fact-per-card discipline.
- **A Wine & Spirits category or collection listing may host a single, page-level cross-sell moment** (e.g. a light callout linking to a relevant Food Central pairing context), mirroring the scale and restraint of `02_HOMEPAGE_SPECIFICATION.md` §8.6's single "Wine & Food, Connected" moment — not a heavier, per-product mechanism.
- **This still depends on the same "pairs with" relationship data** already flagged as unscoped in `MEDUSA_EXTENSIONS.md` by both prior specifications (`02_HOMEPAGE_SPECIFICATION.md` §24, `01_NAVIGATION_SPECIFICATION.md` §29, `03_SEARCH_SPECIFICATION.md` §29) — repeated here as a fourth surface depending on the same unresolved gap, not a new one.

## 19. Food Central Listings

- **Today's Menu is the default Food Central listing**, structured as a Category listing (§6) with Food Central's narrower facet set (§10: dietary/allergen, spice level, prep time/availability).
- **Availability and same-day-cutoff information is visible at the card level** (§9's one-supporting-fact allowance), not only after a dish is selected — the same requirement already established in `01_NAVIGATION_SPECIFICATION.md` §14 and `02_HOMEPAGE_SPECIFICATION.md` §8.5, applied here to the full menu listing rather than just the homepage spotlight.
- **Quick-add is the default card behavior** (§9), matching the speed-first pacing this catalog is built around throughout every prior specification.
- **Default sort remains Featured** (§11) rather than Price — a craving-driven purchase is rarely price-led first, though Price sort remains available for a customer who wants it.

## 20. Wine & Spirits Listings

- **The primary discovery surface for the three-layer system** (`01_NAVIGATION_SPECIFICATION.md` §13): formal taxonomy brought the customer here (§6); varietal/style facets (§10) narrow within it; occasion/curation (§7) offers a parallel entry path via Collections.
- **Cards favor click-through over quick-add** (§9) — the fact sheet on the product detail page carries real weight for this catalog's purchase confidence, per `PRODUCT_BLUEPRINT.md` §3.
- **Richer facet sets are expected and supported** (§10) — a Wine & Spirits listing is where the platform's discovery-oriented pacing is most fully expressed, in contrast to Food Central's speed-oriented listings (§19).

## 21. Empty States

*See "Operational Behaviour" near the end of this document for how listings handle the full catalog-state lifecycle (unavailable, low stock, price changes, promotion expiry, hidden, discontinued) — this section covers the empty-page cases specifically; that section covers state transitions within an otherwise-populated listing.*

- **A category or collection with zero currently-available products** does not disappear from navigation (`01_NAVIGATION_SPECIFICATION.md` §24 already covers this) and, when reached, shows a clear "nothing available right now" message with a link to a sibling category or collection — the same graceful-fallback discipline `02_HOMEPAGE_SPECIFICATION.md` §19 and `03_SEARCH_SPECIFICATION.md` §18 already apply elsewhere, not restated with different wording here.
- **A facet combination reducing an otherwise-nonempty listing to zero** reuses `03_SEARCH_SPECIFICATION.md` §19's exact treatment: indicate which filter is responsible and offer to remove the most restrictive one, distinct from a genuinely empty category.
- **Food Central listing when the kitchen is fully closed** reuses the same "not currently taking orders, here's the next opening time" state already specified in `01_NAVIGATION_SPECIFICATION.md` §24 and `02_HOMEPAGE_SPECIFICATION.md` §19 — not a listing-specific variant.

## 22. Loading States

- **Skeleton cards are preferred over a spinner** for the initial grid load, matching the platform-wide "skeletons communicate structure and are perceived as faster" discipline (`02_HOMEPAGE_SPECIFICATION.md` §20, `03_SEARCH_SPECIFICATION.md` §20).
- **Load More's own loading state is a lightweight, inline indicator appended below the existing grid** — never a full-page reload or a state that hides already-loaded results while more load.
- **Filter panel and grid loading are independent** (§10, §23) — a slow facet-count calculation does not block the grid from rendering, and vice versa, the same independence discipline already established in `02_HOMEPAGE_SPECIFICATION.md` §21 and `03_SEARCH_SPECIFICATION.md` §20/§21.

## 23. Error States

- **The grid and the filter panel fail independently** — a facet-list fetch failure does not block the product grid from rendering, and a Load More failure does not discard results already loaded.
- **A failed Load More request offers a clear retry action**, without losing scroll position or previously-loaded items — a customer should never have to reload the whole page to recover from one failed "load more" attempt.
- **No blank white space or broken layout is an acceptable failure mode for any part of a listing page** — the same standard `02_HOMEPAGE_SPECIFICATION.md` §21 already sets platform-wide.

## 24. Accessibility

- **The product grid uses real list semantics** (e.g. a list of list items), so assistive technology can announce the total count and a customer's position within it — current accessibility research on card-based grids is specific that flat, div-only markup breaks this for screen-reader and keyboard-only users.
- **Each card has exactly one primary link wrapping its clickable surface; a quick-add action (§9), where present, is a separate sibling control, never nested inside that link** — invalid markup and a documented screen-reader confusion source otherwise (§9 restates this as a card-level commitment; this is its full specification).
- **Every product image carries descriptive, non-generic alt text** — the same requirement already established in `02_HOMEPAGE_SPECIFICATION.md` §16 and `03_SEARCH_SPECIFICATION.md` §22, applied here to every card in every listing.
- **Filters, sorting, and Load More are fully keyboard-operable**, with a visible focus state at every step (`DESIGN_SYSTEM.md`'s Focus token) — no exceptions.
- **Newly-loaded results (§13) are announced to assistive technology via a polite live region** (e.g. "12 more results loaded"), the same `role="status"`/`aria-live="polite"` pattern `03_SEARCH_SPECIFICATION.md` §22 already establishes for result-count announcements, reused here for Load More specifically.
- **No availability, badge, or promotional state is conveyed by color alone** — text-labeled in every case, consistent with `BRAND_IDENTITY.md`'s Do's and Don'ts and every prior specification's identical rule.
- **All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly**, with no listing-specific exception.

## 25. Analytics

- `listing_viewed` (value: category/collection id, listing type)
- `product_card_clicked` (value: product id, position in grid, listing type)
- `quick_add_to_cart_clicked` (value: product id, listing type) — distinguished from an add-to-cart event fired from the product detail page
- `filter_applied` / `filter_removed` (reused from `03_SEARCH_SPECIFICATION.md` §24, not a duplicate event)
- `sort_changed` (value: sort order selected)
- `load_more_clicked` (value: resulting item count)
- `listing_empty_state_shown` (value: category/collection id, cause — no products vs. filter-induced)

Each ties back to §2's business objectives — drop-off between `listing_viewed` and either `product_card_clicked` or `quick_add_to_cart_clicked` is the primary signal for the listing's own conversion health.

## 26. SEO Considerations

- **Category and collection listing pages are the platform's primary indexable, crawlable surface** — per `01_NAVIGATION_SPECIFICATION.md` §26, this is a deliberate contrast with `03_SEARCH_SPECIFICATION.md` §25's `noindex, follow` search-results pages. A listing page's first-loaded state must be complete, meaningful, server-rendered content — never a shell that only populates after a Load More interaction (§13).
- **Facet-combination URLs reachable from a listing inherit `01_NAVIGATION_SPECIFICATION.md` §26's existing canonicalization requirement** — not a separate, listing-specific answer to the same combinatorial-duplicate-content risk already named there.
- **Load More's URL-reflected state (§13) supports deep linking without requiring a separate, fully-paginated URL structure to be crawlable** — the first page's content remains the primary indexable target; the specific mechanism for exposing deeper loaded state to crawlers (e.g. a `rel="next"`-style hint or a server-rendered paginated fallback) is an implementation decision, not fixed here.

## 27. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Category product membership | Native Product Category | `01_NAVIGATION_SPECIFICATION.md` §11 | Scoped, native |
| Collection product membership | Native Product Collection | `01_NAVIGATION_SPECIFICATION.md` §12 | Scoped, native |
| Featured/default order | Category/Collection position field | `01_NAVIGATION_SPECIFICATION.md` §11 | Scoped, native |
| Wine & food facets | `wine-details`/`food-details` module fields | `MEDUSA_EXTENSIONS.md` #1, #2 | Field lists not finalized (`PRODUCT_CATALOG.md`) |
| Promotional badges/collections | Start/end-dated Collection data, reused mechanism | `01_NAVIGATION_SPECIFICATION.md` Merchandising Strategy | Mechanism scoped |
| "Pairs with" cross-sell (§18) | Product-to-product relationship, not yet modeled | Flagged in three prior specifications | **Not yet scoped in `MEDUSA_EXTENSIONS.md`** |
| Cart state for quick-add (§9) | Native Cart (Store API) | Platform-wide | Native |
| Analytics events (§25) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 28. Performance Expectations

- **A listing page's initial load is held to the platform-wide LCP target** already established in `02_HOMEPAGE_SPECIFICATION.md` §17 and reused in `01_NAVIGATION_SPECIFICATION.md` §27 and `03_SEARCH_SPECIFICATION.md` §27 — under 2.5 seconds at the 75th percentile on mobile — no separate, looser budget for listing pages.
- **Below-the-fold and not-yet-loaded (Load More, §13) card images lazy-load**, the same discipline already applied to homepage sections and search results.
- **Load More's own interaction targets the same "feels instant" latency window** (~300ms to begin appending results) already established in `01_NAVIGATION_SPECIFICATION.md` §27 and `03_SEARCH_SPECIFICATION.md` §27, reused rather than re-derived here.
- **The grid reserves layout space for each card's image before it loads**, preventing Cumulative Layout Shift as images resolve — a listing page is especially exposed to this failure mode given how many images load on one page.
- **Filter-panel and grid rendering are performance-independent** (§22), so a slow facet computation never delays the grid customers came to see.

## 29. Future Expansion

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, the same way `DESIGN_SYSTEM.md`'s "Future Theme Support," `01_NAVIGATION_SPECIFICATION.md` §28's Scalability table, and `03_SEARCH_SPECIFICATION.md` §28 all document capability without committing to a roadmap item:

- **Recommendations** — an algorithmic "customers who viewed this also viewed" module, once real usage data exists to power it responsibly — the same personalization-deferral condition already applied throughout every prior specification.
- **AI ranking** — replacing or augmenting the Featured default order (§11) with a learned ranking signal, deferred for the identical reason popularity-based ranking is deferred in `03_SEARCH_SPECIFICATION.md` §10/§28: no data exists yet, and this document does not design against speculative data.
- **Personalization** — customer-specific default sort, filter defaults, or card emphasis, explicitly not v1, matching the platform-wide deferral already established everywhere else.
- **Editorial collections** — a richer, CMS-driven version of collection framing (seasonal stories, curated write-ups above a listing grid) once `MEDUSA_EXTENSIONS.md` #7 (Sanity) is approved — not built now, and not urgent.
- **Dynamic merchandising** — an automated (rather than manually curated) Featured order responsive to real-time signals (stock levels, margin, demand) — a plausible evolution of §16's merchandising rules once operational data exists to justify it, explicitly deferred rather than assumed.
- **A grid/list view toggle** was considered and deliberately not adopted for v1 — `EXPERIENCE_PRINCIPLES.md` #3's restraint principle and the platform's photography-first positioning (`EXPERIENCE_PRINCIPLES.md` #4) favor one well-executed grid over a second, list-style layout to build and maintain; this remains a plausible, low-risk future addition if real customer demand for it emerges, not a gap in this specification.

None of the above is authorized or scoped work — `PRODUCT_BLUEPRINT.md` and `MEDUSA_EXTENSIONS.md` name none of it as committed. This section exists solely to confirm the architecture chosen for v1 does not foreclose it.

## 30. Acceptance Criteria

- [ ] A category listing renders its live Product Category membership with no hardcoded product list, and a collection listing renders its live Product Collection membership the same way.
- [ ] The product card component behaves identically across category listings, collection listings, and search results.
- [ ] No product card is implemented as a link nested inside another link; any quick-add action is a separate, sibling control.
- [ ] An out-of-stock Wine & Spirits product or an unavailable Food Central item remains visible in its listing, clearly labeled, never silently removed.
- [ ] No listing page or card displays fabricated urgency or a promotional price without a genuine original price behind it.
- [ ] At most one promotional badge appears per card, and at most one promotional module appears per listing page.
- [ ] Facet application and active-filter-chip behavior on listing pages match `03_SEARCH_SPECIFICATION.md`'s existing mobile/desktop patterns exactly, with no divergence.
- [ ] The default sort order for any listing page is Featured, never Relevance.
- [ ] No listing page implements pure infinite scroll; Load More appends results without losing scroll position or previously-loaded items, and the loaded state is reflected in the URL.
- [ ] A facet combination reducing results to zero is visually distinguished from a genuinely empty category/collection.
- [ ] Every product image on every listing has descriptive, non-generic alt text.
- [ ] The product grid uses real list semantics announced correctly to assistive technology, including newly-loaded results via a live region.
- [ ] Listing page loads meet the platform's LCP target under the same test conditions already used for the homepage, navigation, and search specifications, with no measurable Cumulative Layout Shift from loading card images.
- [ ] All analytics events listed in §25 fire correctly and exactly once per corresponding user action.

---

# Listing Intent

Everything above specifies *mechanisms* (facets, sorting, cards, Load More). This section maps those mechanisms onto named customer browsing intentions, so listing behavior can be checked against real scenarios — the listing-page counterpart to `03_SEARCH_SPECIFICATION.md`'s "Search Intent" section. **Every adaptation below is achieved through mechanisms already specified elsewhere in this document — none of it introduces AI, machine learning, or personalization into Version 1.** Intent is inferred only from which listing a customer entered and what they do within it (facets applied, sort chosen), never from browsing history, account data, or an inferred profile.

| Browsing intent | Typical signal | How listing behavior supports it | Mechanism |
|---|---|---|---|
| Browsing for inspiration | Entering a broad category or an editorial Collection with no facets applied | A scannable grid at Featured order (§11) surfaces merchandising-curated context first; the restrained card (§9, Product Card Information Hierarchy below) keeps browsing low-pressure | §6, §7, §9, §11 |
| Buying a known product | Arriving via a specific category, or a search-result "closest matching category" link (`03_SEARCH_SPECIFICATION.md` §18) | Fast-scan grid, click-through (or quick-add, §9) reaches the product with minimal steps | §9, §13 |
| Comparing similar products | Applying one or more facets within a category (§10) | Facets narrow to genuinely comparable items; Load More (§13) keeps every compared item on one stable, referenceable page rather than scattering them across auto-loading content | §10, §12, §13 |
| Shopping within a budget | Applying the Price facet or the Price sort (§10, §11) | Price is always shown in full and honestly (§9) so a budget-driven comparison is trustworthy at a glance; no query-free-text budget parsing exists in v1 — the same deliberate limitation `03_SEARCH_SPECIFICATION.md`'s Search Intent section already states for search, extended here | §9, §10, §11 |
| Premium/luxury exploration | Entering a premium-framed Collection (e.g. "Sommelier's Picks") | Featured order (§11) and the restrained, one-badge-maximum card (§9) protect a premium feel rather than a discount-grid one — the listing-level expression of `EXPERIENCE_PRINCIPLES.md` #3 | §7, §9, §11 |
| Gift shopping | Entering the Gifting Collection (`01_NAVIGATION_SPECIFICATION.md` §12) | The same Collection-listing pattern as any other, framed by curated membership rather than a gift-specific listing mode | §7 |
| Pairing wine with food | Entering a Wine & Spirits listing already primed by a cross-sell moment (§18), or a Food Central listing considering the reverse | Served by the single page-level cross-sell moment (§18), not a per-card mechanism — consistent with the restraint already established there | §18, §20 |

No intent above requires new backend infrastructure beyond what §6–§17 already specify — this section is a map of existing mechanisms onto named customer scenarios, not a new system. If a future intent genuinely cannot be served this way, that is a trigger to consider the personalization or AI-ranking work already named in §29 (Future Expansion) — not a reason to force a workaround into v1's deterministic model.

# Product Card Information Hierarchy

This section states, explicitly and in priority order, what appears on a product card — extending §9's "at most one supporting fact" rule into a complete, checkable hierarchy. The objective is consistency across both catalogs while still respecting their different shopping patterns (§19, §20).

**Always visible, on every card, in every context (§9):**
- Product image
- Product name
- Current price, in full, in the platform's currency

**Conditionally visible — at most one of the following per card, never more than one at a time (§9):**
- A single promotional badge (§17), when a genuine, active promotion applies
- A catalog-specific supporting fact: for Food Central, prep-time or availability/cutoff information (`01_NAVIGATION_SPECIFICATION.md` §14, `02_HOMEPAGE_SPECIFICATION.md` §8.5); for Wine & Spirits, this slot is more often left empty than used, consistent with §20's click-through-first pacing — a badge (when genuinely warranted) is the more common occupant of this single slot on a wine card
- A quick-add control (§9) — present or absent per catalog (§9's Quick Actions rule), and visually and structurally separate from the one-fact slot above, not competing with it for the same space

**Never shown on a listing card, regardless of catalog:**
- Full tasting notes, full ingredient lists, or full product descriptions — these belong to the product detail page's structured fact sheet (`PRODUCT_BLUEPRINT.md` §3) and repeating them on a card would directly contradict the card-simplification research already cited in §9
- Multiple simultaneous badges or supporting facts — the one-slot rule above has no exception for "important" information; if something feels important enough to break the rule, that is a signal it belongs on the product detail page, not a reason to add a second slot
- Any customer-specific or personalized content (a "recommended for you" label, a browsing-history-based note) — out of scope for v1 per §29 and Listing Intent's own explicit boundary above
- Fabricated or unverifiable claims (invented scarcity, unverified "best-seller" labels not backed by real data) — the same non-manipulation standard §16/§17 and Merchandising Governance below already establish

This hierarchy applies identically whether the card renders in a category listing, a collection listing, a homepage shelf, or a search result (§9) — one card specification, not a per-surface variation.

# Merchandising Governance

Extends §16's rules into a complete statement of merchandising's authority over listing pages — what it can influence, what it cannot, and the limits that keep the difference enforceable rather than aspirational. This is the listing-page instance of the same governance model `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance and `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy already establish for their own domains.

**What merchandising can influence, without developer involvement, once the mechanism is built:**
- The Featured default order (§11), via the same Category/Collection position field navigation already uses.
- Which products carry the single promotional badge slot (§9, Product Card Information Hierarchy) and its content ("New," "Limited," "Gift-Ready," etc.).
- Which Collections exist and which products belong to them (§7), including time-boxed promotional Collections.
- The single page-level cross-sell moment's placement and content, where the underlying "pairs with" data exists (§18).

**What merchandising cannot influence, under any circumstance:**
- **Relevance or ranking established by Search.** A listing's Featured order (§11) is a distinct, browsing-context concept from `03_SEARCH_SPECIFICATION.md`'s Ranking Philosophy — the two are not in conflict because they answer different questions (curated position for a query-less listing vs. genuine relevance for a typed query), but neither may be used to quietly override the other. Featured order never leaks into or substitutes for search ranking, and search relevance is never treated as if it were a merchandising-controlled listing order.
- **Availability facts.** Whether a product is in stock, low-stock, or unavailable (§21, Operational Behaviour below) is a state fact, not a merchandising choice — merchandising can decide to *hide* a product (a deliberate visibility decision, Operational Behaviour below) but cannot present an unavailable product as available, or vice versa.
- **Pricing beyond a genuine, dated promotion.** Price itself is a catalog fact; a promotional price requires a real original price and a real active promotion behind it (§9) — merchandising cannot fabricate either.
- **The one-slot-per-card and one-promotional-module-per-page caps** (§9, §17, Product Card Information Hierarchy above) — these are architectural restraint limits, not merchandising defaults that can be raised for a campaign.
- **Card structure or the accessibility/interaction rules governing it** (§9, §24) — content within the governed slots is merchandising's domain; the slots and their behavior are not.

**Promotional limits** (restated from §17 as the governance-level rule, not a duplicate mechanism): at most one badge per card, at most one promotional module per listing page, every promotional Collection or badge time-boxed where campaign-driven.

**Expiry behaviour:** every promotional Collection and badge carries a start/end date enforced by data — the same auto-expiring mechanism `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy already established for navigation, reused here without a separate listing-specific expiry system. No manual cleanup step exists or is required.

**Trust requirements:** no fabricated urgency or scarcity (§9, §16); every promotional price shown alongside its genuine original price; no badge or supporting-fact claim that cannot be verified against real catalog data. **Merchandising must never mislead a customer, and must never override the relevance and ranking authority `01_NAVIGATION_SPECIFICATION.md` and `03_SEARCH_SPECIFICATION.md` already establish for their own domains** — this is the listing specification's explicit, standalone statement of that boundary, not left to inference from the individual rules above.

# Operational Behaviour

Extends §21's empty-state handling into the full catalog-state lifecycle a populated listing must handle predictably:

- **Products becoming unavailable** (sold out, or a Food Central item the kitchen can no longer fulfill): labeled in place per §9's availability handling, never silently removed — reusing the same rule and the same index-freshness expectations `03_SEARCH_SPECIFICATION.md`'s Operational Considerations already establishes, not a separate listing-specific mechanism.
- **Low stock** (a new state beyond simple available/unavailable): where shown at all, a low-stock indicator occupies the same single conditional-fact slot (Product Card Information Hierarchy, above) as any other supporting fact — never stacked alongside a badge — and states a factual, verifiable condition ("Limited stock") rather than a manufactured countdown or a specific unverified number, consistent with §16's no-fake-urgency rule. Showing a low-stock indicator at all is optional per product line; it is never fabricated where genuine stock levels don't warrant it.
- **Price changes:** reflected at the next data sync, the same freshness expectation already established in `03_SEARCH_SPECIFICATION.md`'s Operational Considerations — a listing sorted by price (§11) is only ever as stale as the underlying data, with no separate listing-specific price cache to reason about.
- **Promotions expiring:** reuses §17's and Merchandising Governance's existing start/end-date, auto-expiring mechanism — no manual cleanup, no separate expiry logic for listings specifically.
- **Products deliberately hidden** by a merchandising decision are fully excluded from listings and their parent category/collection counts, not shown-with-a-label — the same "hidden" vs. "unavailable" distinction `03_SEARCH_SPECIFICATION.md`'s Operational Considerations already draws, reused here rather than redefined: hiding is an intentional visibility decision, unavailability is a stock/capacity fact, and the two must not be conflated.
- **Products being discontinued** is a third, distinct state from both of the above: a discontinued product is permanently retired from sale (not a temporary stock or visibility state) and is removed from all listings promptly once discontinued, the same "never surface a broken/dead result" principle `03_SEARCH_SPECIFICATION.md`'s Operational Considerations applies to deleted search-index entries, applied here to the listing context. "Unavailable" (temporary, stock-driven), "hidden" (temporary, a deliberate visibility choice), and "discontinued" (permanent) are three different states and must not be handled as if they were one.

None of the above introduces a new backend mechanism beyond the index/data-freshness sync pattern already required by `03_SEARCH_SPECIFICATION.md` §26 and reused throughout this document (§27) — this section makes explicit what customer-facing guarantee that sync pattern must deliver specifically for listing pages.

# Listing Quality Checklist

Every future change to a listing page — a new facet, a new card element, a new promotional mechanism, a sort-order change — must be able to answer **yes** to all of the following before it's considered complete, the same discipline `DESIGN_SYSTEM.md`, `01_NAVIGATION_SPECIFICATION.md`, and `03_SEARCH_SPECIFICATION.md` already apply to their own domains:

- [ ] **Are listings easy to scan?** Checked against §1's philosophy and §9/Product Card Information Hierarchy's restraint limits — nothing crowds a card or a grid beyond what those sections allow.
- [ ] **Is product information consistent?** The same card hierarchy (Product Card Information Hierarchy, above) holds across category listings, collection listings, the homepage, and search results (§9) — no surface-specific variation.
- [ ] **Are unavailable products handled correctly?** Labeled, not hidden, for genuine stock/capacity states — and correctly distinguished from a deliberately hidden or permanently discontinued product (Operational Behaviour, above).
- [ ] **Are promotions honest?** Capped, time-bound, genuinely priced, and never asserting fabricated urgency (§16, §17, Merchandising Governance).
- [ ] **Does the experience remain accessible?** Real list semantics, no link nested inside a link, full keyboard operability, and live-region announcements for Load More all hold with no exceptions (§24).
- [ ] **Does it perform well on mobile?** The mobile grid, sticky filter/sort bar, and Load More pattern are a deliberate design, not a reduced version of desktop (§14, §15).
- [ ] **Does it support both business lines equally?** Wine & Spirits' discovery pacing and Food Central's speed pacing are both served by one shared pattern without either reading as an afterthought (§19, §20).
- [ ] **Does it preserve customer trust?** Honest pricing, honest availability, no manipulated ranking or fabricated scarcity, and merchandising kept within the bounds Merchandising Governance sets — checked together, not assumed from any single rule in isolation.
- [ ] **Does it stay within v1's deterministic, non-AI intent model**, or does it actually require personalization or machine learning — in which case it belongs in §29 (Future Expansion), not smuggled into v1 (Listing Intent, above)?
- [ ] **Does it preserve the allergen-filtering trust guarantee without exception?** (§10, referencing `03_SEARCH_SPECIFICATION.md` §13/§16) — a safety commitment, not an ordinary UX preference.

This document is now **Version 1.0 — Approved and Frozen — the authoritative Product Listing Specification** for all future listing and browsing implementation.

---

**Document status:** Approved — Frozen (v1.0, approved by Paul 2026-07-18). This is the authoritative reference for all product listing and browsing implementation platform-wide, integrating directly with `01_NAVIGATION_SPECIFICATION.md` (entry points), `02_HOMEPAGE_SPECIFICATION.md` (curated shelf links), and `03_SEARCH_SPECIFICATION.md` (the shared product card component) without redefining any of them. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, a Frozen document may only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md` — not as a side effect of downstream specification or implementation work.

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary designs were referenced or copied):

- [E-Commerce Product Lists & Filtering UX — Baymard Institute](https://baymard.com/research/ecommerce-product-lists)
- [External Article: Testing Pagination Against Infinite Scrolling and 'Load More' Buttons — Baymard Institute](https://baymard.com/blog/external-load-more-vs-pagination-vs-infinite-scrolling)
- [Infinite Scrolling, Pagination Or "Load More" Buttons? Usability Findings In eCommerce — Smashing Magazine](https://www.smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons/)
- [A Comprehensive Study on Product Card Design Strategies: Optimizing the User Experience](https://j2zerozone.medium.com/a-comprehensive-study-on-product-card-design-strategies-optimizing-the-user-experience-437f6561c50b)
- [Product Page UX Best Practices 2026 — Baymard Institute](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
- [Ecommerce Category Page Design: Best Practices, Examples, and Tests That Work in 2026 — Invesp](https://www.invespcro.com/blog/ecommerce-category-page-design/)
- [Adding an Item to a Shopping Cart: Provide Clear, Persistent Feedback — Nielsen Norman Group](https://www.nngroup.com/articles/cart-feedback/)
- [Accessible Cards — Kitty Giraudel](https://kittygiraudel.com/2022/04/02/accessible-cards/)
- [Accessibility Dos and Don'ts for Interactive Cards — Livefront](https://livefront.com/writing/accessibility-dos-and-donts-for-interactive-cards/)
