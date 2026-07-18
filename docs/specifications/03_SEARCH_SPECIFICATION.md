# Search Specification

**Status:** Approved — Frozen (2026-07-18)
**Version:** 1.0
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for search and product discovery across LiquorCentral — how a query is entered, interpreted, matched, ranked, filtered, and presented, and how a search that fails is recovered gracefully, across both Wine & Spirits and Food Central. It defines *product behavior, customer experience, information retrieval, business objectives, and backend requirements* — no UI mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §8 (Search Strategy), `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0, `INFORMATION_ARCHITECTURE.md`, `PRODUCT_CATALOG.md`, and `MEDUSA_EXTENSIONS.md` #6, and none of it contradicts them. It integrates directly with the two already-approved specifications it depends on: `01_NAVIGATION_SPECIFICATION.md` (Approved — Frozen) already defines the search *entry point* — a visible, prominent field, never icon-only, reachable in one action from anywhere, with search-within-category support (§15 of that document) — this document does not redefine that entry point, only what happens once a query reaches it. `02_HOMEPAGE_SPECIFICATION.md` already establishes that the homepage itself hosts no search results of its own (§10) and that the header search bar is the platform's single entry point; this document is the results/behavior layer that entry point leads to.

Where a decision is grounded in external UX, accessibility, or search-engineering research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No search interface, layout, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data and Meilisearch configuration it depends on, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Search Philosophy

Search exists to serve two customers who want opposite things from the same box: **someone who already knows what they want, and someone who doesn't yet — and neither should be made to feel like search wasn't built for them.** This is the direct extension of `01_NAVIGATION_SPECIFICATION.md` §1's "browsing and searching are equally first-class" commitment into the results experience itself, and it is the standard every section below is checked against.

Three commitments follow, and nothing below may violate them:

1. **Search must resolve a known-item query almost instantly**, serving the Confident Buyer with minimal friction between typing and finding — this is the platform's fastest path to a product.
2. **Search must also work when the customer doesn't know the exact word for what they want.** A Guided Browser typing "something fruity" or "light red" should get a useful result, not an instruction to browse categories instead — search that only rewards a customer for already knowing the catalog's vocabulary has failed half its job.
3. **A failed search is never a dead end.** Baymard-adjacent industry data places the typical ecommerce zero-result rate at 10–15%, with high-performing stores holding it under 5%; every zero-result and near-miss query is an opportunity to recover the visit, not lose it (§18).

**Wine and food are searched with different intents, and search must respect that without becoming two different search boxes.** A wine query is frequently exploratory ("something to go with steak"); a Food Central query is frequently transactional ("jollof rice," said once, meant literally). One shared search mechanism serves both — per `PRODUCT_BLUEPRINT.md` §8 — but ranking, facets, and result presentation are tuned per catalog context (§10, §15, §16), the same asymmetric-within-one-shell pattern `01_NAVIGATION_SPECIFICATION.md` already establishes for browsing.

## 2. Business Objectives

- **Hold the zero-result rate below the 5% high-performer benchmark** once real query volume exists to measure it against — not a launch-day guarantee, but the explicit target search quality work is judged against (§18, §29).
- **Reduce time-to-product for a known-item query and time-to-decision for an exploratory one**, both direct levers on `PRODUCT_BLUEPRINT.md` §1's "confident enough to purchase immediately" vision.
- **Protect equal prominence between Wine & Spirits and Food Central** in any result set that plausibly spans both (`PRODUCT_BLUEPRINT.md` §2, §8) — search must never structurally favor one catalog's results over the other's for a genuinely ambiguous query.
- **Make search a trust signal, not just a utility.** A search that returns confused, mislabeled, or manipulated-feeling results actively works against `EXPERIENCE_PRINCIPLES.md` #9 (Trust Must Be Visible) — search quality is a trust question as much as a findability one.
- **Never let merchandising or promotional interests degrade relevance.** Editorial boosting and merchandising rules (§11, §12) exist to help discovery, and are explicitly bounded so they can never override genuine relevance to the point of feeling manipulative — directly serving `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions).

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents into search specifically:

| Customer type | Search objective |
|---|---|
| Confident Buyer | Type a known product/dish name and reach it in as few characters and as little scanning as possible — autocomplete (§7) should let them stop typing before finishing the word. |
| Guided Browser | Use vague, descriptive, or occasion-based language ("light red," "gift for a birthday," "spicy") and still get a useful, narrowable result set — not redirected to "please use navigation instead." |
| Repeat Household | Search across both catalogs in one query without needing to specify which — cross-catalog labeling (existing `PRODUCT_BLUEPRINT.md` §8 requirement) keeps a mixed result set legible. |
| Gifter | Reach gifting-relevant results via a natural query ("gift," "gift set") as easily as via the dedicated Gifting collection in navigation — search and browse should agree, not diverge, on what counts as a gifting result. |

Every customer type additionally needs: to trust that "no results" genuinely means nothing matches, not that search is broken (§18); to filter and sort with full confidence in what each control does (§13, §14); and to reach search from anywhere, per `01_NAVIGATION_SPECIFICATION.md` §15.

## 4. Search Entry Points

The entry point *mechanics* (field prominence, mobile reachability, search-within-category) are fully specified in `01_NAVIGATION_SPECIFICATION.md` §15 and are not redefined here — this section instead confirms every point at which a query can be submitted into the system this document governs, so nothing is accidentally left inconsistent between the two documents:

- **The persistent header search field** (`01_NAVIGATION_SPECIFICATION.md` §6, §7, §15) — the primary entry point, available on every page.
- **Search-within-current-category** (`01_NAVIGATION_SPECIFICATION.md` §15) — the same mechanism, scoped to the category/collection context the customer is already in; this document's ranking and facet behavior (§10, §13) applies identically whether scoped or unscoped.
- **A "did you mean" or suggested-query link from a zero-result or near-miss result** (§18) — a re-submission of a *different* query through the same entry point, not a separate mechanism.
- **A future homepage popular-query shortcut**, already named as a deferred, not-v1 idea in `02_HOMEPAGE_SPECIFICATION.md` §10 and §14 — not built now, and not designed against here beyond confirming it would submit through this same entry point when it exists.

No page in the platform introduces a second, independent search mechanism outside this one — a product-listing "search within results" or any future page-specific search box is out of scope unless it reuses this same entry point and behavior.

## 5. Search Scope

- **One unified index spans both product lines**, per `PRODUCT_BLUEPRINT.md` §8 — not two separate indexes a query has to be routed between.
- **Searchable fields:** product name, description, category and collection names, and the catalog-specific structured fields each product line's attribute module contributes — for Wine & Spirits: producer/winery, region, tasting notes (`wine-details` module, `MEDUSA_EXTENSIONS.md` #1); for Food Central: ingredients (`food-details` module, #2). A tasting-note or ingredient match is a real search hit, not just a filter — a customer typing "citrus" or "spicy" should be able to reach relevant products through full-text matching alone, not only through facets (§15, §16).
- **Filterable-but-not-full-text fields:** price, ABV, vintage, allergen/dietary flags, prep time — these participate in filtering (§13) and, where numeric, sorting (§14), but are not meaningfully full-text-searchable in themselves.
- **Explicitly out of scope for the index:** internal/administrative fields (cost price, supplier references, inventory-management metadata), and any content that is not customer-facing product data — search indexes what a customer is meant to find, nothing else.
- **Availability is part of the index, not a post-filter afterthought** — an out-of-stock wine or a currently-unavailable Food Central item remains searchable and findable (§12), consistent with `01_NAVIGATION_SPECIFICATION.md` §24's rule that unavailable content is never simply hidden.

## 6. Search Behaviour

- **Search begins responding after a minimum query length (2 characters)**, debounced (§27) rather than firing on every keystroke, to avoid noisy partial-word queries dominating both the backend and the customer's own attention.
- **Autocomplete suggestions (§7) appear as the customer types; full results render on explicit submission** (Enter, tap on a suggestion, or tap a submit affordance) — the two are related but distinct states, not the same UI treated inconsistently.
- **Query normalization** is applied before matching: case-insensitivity and diacritic-insensitivity at minimum, so capitalization or accent marks never cause an otherwise-correct query to under-match.
- **Every applied query, filter, and sort order is reflected in the URL**, per `01_NAVIGATION_SPECIFICATION.md` §20 — a search result set is shareable, bookmarkable, and reloadable exactly as filtered, with no exception carved out for search specifically.
- **Facet application behaves differently by device, per current filter-UX research**: on desktop, applying a facet may update results immediately (`DESIGN_SYSTEM.md` §B9's "confirm, don't live-update on every keystroke" principle applies to text *fields*; a facet toggle is a discrete action, not continuous typing, so immediate application is appropriate there). On mobile, facets apply via an explicit "Show N results" action inside the filter panel (§13, §23) rather than live-updating mid-interaction — current mobile filter research finds live updates mid-panel are disorienting on small screens, since the customer can't see both the panel and the changing result count at once.
- **Result count is always visible** once a search or filter state resolves, and is announced to assistive technology (§22).

## 7. Autocomplete Strategy

- **Purpose:** reduce the distance between "starts typing" and "finds it," directly serving the Confident Buyer (§3) and reducing query abandonment — industry research associates well-implemented autocomplete with materially fewer abandoned, never-submitted searches.
- **Suggestions appear after the minimum query length (§6)**, capped at a small number (roughly 5–8) — an unbounded suggestion list defeats the purpose of a shortcut, and directly conflicts with the restraint principle already established in `01_NAVIGATION_SPECIFICATION.md` §1 and `EXPERIENCE_PRINCIPLES.md` #3.
- **Suggestion types, in priority order:** direct product-name matches; category/collection name matches (letting a customer reach "Whisky" via autocomplete as easily as via navigation); a typo-corrected variant of the query itself, when the raw query would otherwise under-match (§8).
- **Suggestions are clearly distinguishable by type** (a product suggestion reads differently from a category suggestion) so a customer isn't confused about what selecting one will do — matching a product suggestion takes them to that product; matching a category suggestion takes them to that category, not a search-results page filtered to one term.
- **Keyboard and screen-reader behavior follows the WAI-ARIA combobox pattern** — this is a genuinely different case from `01_NAVIGATION_SPECIFICATION.md` §22's rejection of ARIA `menu` semantics for site navigation: autocomplete suggestions over a text input are exactly the scenario the ARIA combobox/listbox pattern is designed for, unlike ordinary site links. Arrow keys move through suggestions, `Enter` selects the highlighted one, `Escape` closes the list without submitting, and the input's `aria-expanded`/`aria-activedescendant` state is kept accurate throughout (§22).
- **No autocomplete suggestion is a paid or promotional placement** — the list reflects genuine textual relevance to the typed characters, never a merchandising slot (§11, §12 govern *results*, not autocomplete).

## 8. Typo Tolerance

- **Typo tolerance is a baseline requirement, not an enhancement** — industry data places typo-containing queries at over 20% of all ecommerce searches; a platform without tolerance for common misspellings routes a meaningful share of genuine intent straight to a zero-result dead end (§18).
- **Meilisearch provides this natively** (`MEDUSA_EXTENSIONS.md` #6) — by default, one typo is tolerated in shorter words and two in longer ones, with exact/typo-free matches still ranked above corrected ones (§10), which is the correct default behavior for this platform and is not overridden without a specific, evidenced reason.
- **A well-known product, producer, or category name should not return zero results for a single-character typo or a common misspelling** — this is treated as an acceptance-testable requirement (§30), not just a configuration default to trust blindly.
- **Typo tolerance and autocomplete's "did you mean" suggestion (§7) work together**: when tolerance alone still produces a weak or empty result set, the zero-result recovery path (§18) is what engages, not a silent, unexplained substitution of the customer's query.

## 9. Synonym Strategy

- **A curated synonym dictionary is required from launch**, not deferred — synonym gaps are one of the most common causes of an avoidable zero-result search, per current ecommerce search research, and this platform's two catalogs each have their own vocabulary risk: regional spelling variants in Wine & Spirits (e.g. "whisky"/"whiskey"), and colloquial or alternate names for dishes and ingredients in Food Central, where a customer may search using an everyday term that differs from the exact menu name.
- **Synonyms are additive, never substitutive** — a synonym match supplements the literal-term result set, it does not silently replace what the customer typed with something else without their query still being honored.
- **The synonym dictionary is merchandising-owned content, not a developer-owned artifact**, once the mechanism is built — this mirrors `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance model directly: Meilisearch's synonym configuration (`MEDUSA_EXTENSIONS.md` #6) is the developer-built mechanism; which terms are synonymous is a content decision, added and edited without a code deploy.
- **The dictionary should be seeded from an initial reasonable set at launch and actively grown from real zero-result query logs afterward** (§18, §29) — a synonym list is never treated as finished; a recurring zero-result query that a human can see is a synonym gap is the platform's own signal to add one.
- **This platform does not assert specific wine/spirit domain synonym pairs as settled fact in this document** (e.g. whether two spirit categories are close enough to synonym or must stay distinct) — that judgment belongs to whoever owns the wine-attributes data (`PRODUCT_CATALOG.md`), not to this specification, which defines the mechanism only.

## 10. Product Ranking

*See the "Ranking Philosophy" section near the end of this document for the umbrella priority order across relevance, availability, merchandising, popularity, and freshness, and the explicit rule on what may never override relevance — this section specifies the mechanics that philosophy governs.*

- **Baseline relevance** follows Meilisearch's default ranking behavior — typo-distance and textual match quality first, consistent with §8's typo-tolerance requirements — which is a reasonable, evidence-backed default and is not overridden without a specific reason logged as a decision.
- **Availability is a ranking factor, not a visibility gate** — an available Wine & Spirits or Food Central item ranks above an otherwise-equivalent unavailable one for the same query, but an unavailable item still appears, clearly labeled (§12), rather than disappearing from results entirely (§5, and consistent with `01_NAVIGATION_SPECIFICATION.md` §24's "never simply hidden" rule).
- **No sales-velocity or popularity signal exists at launch**, because no real usage data exists yet to rank by — this is the same personalization-deferral discipline `02_HOMEPAGE_SPECIFICATION.md` §14 already applies platform-wide, extended here to ranking specifically. In its absence, ranking falls back to textual relevance plus the deterministic tie-breakers below.
- **A deterministic, explainable tie-break order** is required for otherwise-equal relevance (e.g. alphabetical by product name, or another stated, non-arbitrary rule) — an unstated or effectively-random tie-break makes results feel inconsistent between visits, which is itself a small trust cost (`EXPERIENCE_PRINCIPLES.md` #9, #11).
- **Editorial boosts and merchandising rules (§11, §12) apply on top of this baseline, within bounded limits** — they are never allowed to be the *entire* ranking signal for a query where genuine relevance exists.

## 11. Editorial Boosting

- **Purpose:** let merchandising surface a specific product higher for a genuinely relevant query — a curated call, not an arbitrary override — the search-results equivalent of `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy for navigation, and governed by the same discipline.
- **Boosting only applies to queries the boosted product is already relevant to** — a boost changes *position within* a relevant result set, it never inserts an irrelevant product into results for a query it has no genuine connection to. A boosted product appearing for a query it has no relationship to would read as manipulated results, directly against `EXPERIENCE_PRINCIPLES.md` #15.
- **A capped number of boosted/pinned results per query context**, mirroring the 3–4-item discipline `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy already applies to promotional navigation entries — boosting is a light touch on top of relevance, not a mechanism for rearranging an entire results page.
- **Boosts are time-bound where they're campaign-driven** (e.g. a seasonal push), using the same start/end-date, auto-expiring data pattern already established for navigation's promotional Collections — no manual cleanup step required, and no stale boost silently persisting past its intended window.
- **Boosting is merchandising-controlled, not developer-controlled**, once the mechanism (Meilisearch's ranking-rule/pinning configuration) is built — consistent with §9's synonym-ownership model and `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance table.

## 12. Merchandising Rules

Beyond boosting (§11), a small set of rules govern how merchandising and catalog state interact with results, all in service of `EXPERIENCE_PRINCIPLES.md` #9 (Trust Must Be Visible) and #15 (no manipulative patterns):

- **Unavailable items are labeled, never hidden.** A sold-out wine or a Food Central item the kitchen can't currently fulfill remains a findable, clearly-labeled result (§5, §10) — hiding it would make a customer who remembers seeing a product feel like the platform is unreliable, which is a worse trust outcome than an honest "currently unavailable."
- **No fake scarcity or urgency language is generated from search or ranking signals** (e.g. a manufactured "only 2 left" not grounded in a real, accurate stock count) — the same rule `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy already states for navigation, restated here because ranking/results is an equally plausible place for the anti-pattern to creep in.
- **Cross-catalog result balance is not manipulated for business reasons** — if a query genuinely matches more Wine & Spirits products than Food Central ones (or vice versa), the result set reflects that honestly rather than being artificially rebalanced to look "fair," which would itself be a subtle form of misleading results.
- **Merchandising can configure which fields are searchable/facetable within the schema engineering provides (§26), but cannot alter matching/ranking logic outside the bounded mechanisms (synonyms §9, boosting §11) without a developer change** — this is the search-specific instance of `01_NAVIGATION_SPECIFICATION.md`'s Navigation Governance principle: content is data-governed, mechanism is developer-governed.

## 13. Filtering Strategy

- **Facets are combinable (AND across distinct facet types, OR within a single facet's values)** — the standard, expected faceted-search interaction model, e.g. Region = "any of [X, Y]" AND Price = "under a set amount."
- **Wine & Spirits facets** (from `wine-details`, `MEDUSA_EXTENSIONS.md` #1, final field list pending per `PRODUCT_CATALOG.md`): varietal/style, region, vintage, price, ABV, and occasion (surfaced via Collection membership, not a separate facet system — consistent with `01_NAVIGATION_SPECIFICATION.md` §12's Collections-are-parallel-to-categories model).
- **Food Central facets** (from `food-details`, #2): dietary/allergen flags, spice level, prep time/availability. **Allergen filtering is safety-relevant, not a convenience feature** — a customer filtering to exclude an allergen must be able to trust that result completely; this depends on the food-attributes module's data being operationally accurate, a dependency already flagged as a risk in `MEDUSA_EXTENSIONS.md` #2 and repeated here because search/filtering is where that data's accuracy is actually load-bearing for customer safety (§29).
- **Facet lists are prioritized, not exhaustive, per category** — current faceted-search research is direct on this point: only a minority of ecommerce sites implement faceted search well, and the common failure is too many, unprioritized filters rather than too few; a few well-chosen filters per context outperform a long list customers must scan past. Which facets are prioritized per category is a merchandising decision within the schema engineering provides (§12).
- **Desktop:** facets are visible alongside results (sidebar or equivalent), applying immediately on selection (§6). **Mobile:** facets open in a bottom-sheet-style panel, apply via an explicit "Show N results" action rather than live-updating, and selected filters remain visible as removable chips once the panel closes (§23) — both patterns are current, evidence-backed mobile filter conventions, not this specification inventing a new one.
- **The impact of a filter choice is visible before commitment** — the mobile apply action's own label reflects the resulting count (e.g. showing how many results a selection would return) so a customer isn't guessing whether their combination will return anything before tapping through (§18 covers the case where it doesn't).

## 14. Sorting Strategy

- **Available sort orders at launch:** Relevance (default, and the only order applied automatically), Price (low-to-high, high-to-low), Newest. **Deferred:** a Popularity/Best-selling sort, which requires real usage data this platform doesn't have yet — the same deferral already applied to ranking (§10) and platform-wide personalization (`02_HOMEPAGE_SPECIFICATION.md` §14).
- **Sorting and filtering are independent and composable** — applying a sort order never resets active facets, and vice versa; both are reflected together in the URL (§6, §20).
- **Relevance remains the default even when facets are applied** — narrowing by facet does not silently switch the sort order away from relevance unless the customer explicitly chooses to.

## 15. Wine Discovery

Search is the second of the three discovery layers `INFORMATION_ARCHITECTURE.md` and `01_NAVIGATION_SPECIFICATION.md` §13 already establish for Wine & Spirits (formal taxonomy, varietal/style facets, occasion/curation) — this section is where search specifically fulfills the Guided Browser's needs (§3):

- **Full-text tasting-note and descriptive matching** (§5) lets an exploratory query ("citrus," "full-bodied," "food-friendly") return relevant wines even when the customer doesn't know a formal category or varietal name — this is the concrete mechanism behind §1's "search must also work when the customer doesn't know the exact word."
- **Facets (§13) narrow within a search the same way they narrow within category browsing** — a wine search and a wine category page share one filtering system, not two.
- **Occasion queries** ("gift," "celebration") are expected to surface Collection-tagged products (§12's Collections-as-parallel-layer model), so a search-first Gifter (§3) reaches the same results a navigation-first one would via the Gifting collection.
- **"Pairs with" cross-links** (§17) surface on wine search results the same way they would on a product detail page, once the underlying relationship data exists (§26, §29) — search is one more surface this recurring dependency serves, not a new one.

## 16. Food Discovery

Food Central's discovery need is speed and accuracy, per `BUSINESS_RULES.md` and `01_NAVIGATION_SPECIFICATION.md` §14 — search reinforces, rather than works against, that pacing:

- **Dish-name search resolves fast and exactly**, serving the transactional, "I know what I want" majority of Food Central queries (§1).
- **Ingredient search is a genuine discovery path**, not just a filter — a customer searching "shrimp" should find dishes containing it (§5's full-text scope), while a customer filtering *out* an allergen via facets (§13) must be able to trust that exclusion completely, given the safety stakes already named there.
- **Availability is surfaced at the result level, not only after selection** — a currently-unfulfillable item appears labeled accordingly (§10, §12), matching the same rule `01_NAVIGATION_SPECIFICATION.md` §14 and `02_HOMEPAGE_SPECIFICATION.md` §8.5 already apply to Food Central browsing.
- **Search-within-Today's-Menu** (via `01_NAVIGATION_SPECIFICATION.md` §15's search-within-category mechanism) is a first-class path for a customer already inside Food Central narrowing a specific craving, not a lesser or secondary search mode.

## 17. Cross-selling Opportunities

- **The "pairs with" relationship** (already flagged as a not-yet-built backend dependency in `02_HOMEPAGE_SPECIFICATION.md` §8.6/§24 and `01_NAVIGATION_SPECIFICATION.md` §4/§13/§14/§29) is the sanctioned cross-sell mechanism for search results too — a wine search result may surface a "pairs with" food suggestion and vice versa, using the same relationship data every other surface will eventually use, not a search-specific mechanism invented independently.
- **Cross-sell suggestions are visually and structurally distinct from the actual result set** — a "pairs with" suggestion attached to a result is clearly a suggestion, never presented as if it matched the customer's query itself, protecting the clarity that §1 and `EXPERIENCE_PRINCIPLES.md` #9 both require.
- **Cross-sell suggestions are editorial, not algorithmic, in v1** — consistent with `02_HOMEPAGE_SPECIFICATION.md` §8.6's explainable, non-black-box pairing approach; an algorithmic "customers who searched X also bought Y" mechanism is explicitly deferred (§28), not assumed.
- **No cross-sell suggestion is manufactured for a query with no genuine pairing relevance** — the same non-manipulation principle already stated for editorial boosting (§11) applies here.

## 18. Zero Results Behaviour

- **A zero-result page is never a dead end** — industry research is consistent that an unrecovered zero-result search drives near-total abandonment of that visit; this platform treats every zero-result event as a recovery opportunity, not an acceptable stopping point.
- **Recovery, in priority order:**
  1. **A typo-corrected re-query**, if the original query is a plausible near-miss even after Meilisearch's built-in tolerance (§8) fails to surface anything — an explicit "did you mean [X]?" prompt, not a silent substitution.
  2. **The closest matching category or collection**, linking the customer back into browsing (`01_NAVIGATION_SPECIFICATION.md` §11, §12) rather than leaving them stranded in search alone.
  3. **A curated fallback** (e.g. a relevant Collection, or the homepage's curated shelves per `02_HOMEPAGE_SPECIFICATION.md` §8.4) when neither of the above applies — never a literally blank page.
- **The zero-result state is honest, not disguised** — the customer is told plainly that their exact query returned nothing, with the recovery options presented as help, not as if they were the original results (the same clarity principle as §17's cross-sell distinction).
- **Every zero-result query is logged** (§24) specifically so it can inform the synonym dictionary (§9) and merchandising review over time — the target zero-result rate (§2, §29) is only achievable by treating these logs as an ongoing input, not a one-time launch configuration.
- **A facet combination that reduces an otherwise-nonempty result set to zero is a distinct case from a zero-result query** (§19) — different cause, different recovery path.

## 19. Empty States

Distinct from Zero Results (§18, specifically a query with no matches):

- **Before any query is typed:** the search field/autocomplete surface has no results panel to show at all — an empty search experience with nothing typed is not an error state, it simply hasn't been asked anything yet. A future "recent searches" or "popular searches" prompt in this pre-query state is a plausible enhancement, explicitly deferred (§28), not assumed here.
- **A facet combination filtering an otherwise-nonempty result set down to zero:** the recovery is different from §18's — the interface should indicate *which* applied filter is responsible (or the combination generally) and offer to remove the most restrictive one, rather than repeating §18's query-level recovery options, which don't apply here (the query itself has real matches; the filters are the constraint).
- **Food Central search when the kitchen is fully closed:** reuses the same "not currently taking orders, here's the next opening time" state already specified in `02_HOMEPAGE_SPECIFICATION.md` §19 and `01_NAVIGATION_SPECIFICATION.md` §24 — search does not invent a separate message for the same underlying condition.
- **A category or collection with zero currently-available products, reached via search-within-category:** reuses `01_NAVIGATION_SPECIFICATION.md` §24's existing rule directly, rather than restating it with different wording.

## 20. Loading States

- **Skeleton result cards are preferred over a spinner** while a search resolves, matching the "skeletons communicate structure and are perceived as faster" discipline already established in `02_HOMEPAGE_SPECIFICATION.md` §20, directly serving `EXPERIENCE_PRINCIPLES.md` #6 (Speed Builds Trust).
- **The facet panel and the result grid load and skeleton independently** — a slow facet-count calculation must not block the result cards from appearing, and vice versa, consistent with the independent-failure discipline in §21 and `02_HOMEPAGE_SPECIFICATION.md` §21.
- **Autocomplete suggestions (§7) show a lightweight, near-instant loading indication only if the debounced response genuinely takes long enough to need one** (§27's latency target) — a suggestion list that flickers a loading state for a sub-300ms response would be worse than showing nothing until it's ready.

## 21. Error States

- **If the search backend (Meilisearch) is unreachable, the search field remains visible and submittable** — never hidden or disabled, which would silently break the equal-prominence-with-browsing commitment in §1 and `01_NAVIGATION_SPECIFICATION.md` §24. A failed query shows a plain-language message and a path back into category navigation, never a blank page or a raw error.
- **A facet-count or facet-list fetch failure does not block the result grid from rendering** — facets degrade to their last-known state or a simplified set rather than taking the whole results page down with them (§20's independence principle applied to failure, not just loading).
- **Autocomplete failing to load** degrades silently to "no suggestions, but the query can still be submitted normally" — a broken autocomplete must never prevent a customer from completing and submitting their typed query.

## 22. Accessibility

Search is a high-stakes accessibility surface — it is frequently how a screen-reader user or keyboard-only user reaches a product fastest, since it can bypass deep navigational structure entirely:

- **The search input is a properly labeled text input**, associated with a visible label (not a placeholder-only label, per `DESIGN_SYSTEM.md` §B9's existing form-behavior rule, applied here to the search field specifically).
- **Autocomplete follows the WAI-ARIA combobox pattern** (§7) — `aria-expanded`, `aria-activedescendant`, and a properly-roled suggestion list, distinct from the disclosure-pattern rationale `01_NAVIGATION_SPECIFICATION.md` §22 uses for the mega menu, because this genuinely is the ARIA Authoring Practices' intended combobox use case.
- **Result count is announced to assistive technology after a search completes**, using a polite live region (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) — a sighted customer sees "24 results" update visually; a screen-reader user needs the equivalent announced, not left to discover by re-reading the page. The region is present but empty on initial load and updated only once results resolve, per standard ARIA live-region practice.
- **Filter/facet controls are properly labeled form controls** (checkboxes, radio groups, or range inputs as appropriate to the facet type — no fake, `<div>`-based controls), with their applied state reflected both visually and programmatically (§6, §13).
- **The mobile filter panel traps focus while open and returns it to its trigger on close**, following the exact same discipline `01_NAVIGATION_SPECIFICATION.md` §7/§22 already applies to the mobile drawer and mega menu.
- **Availability and other state information is never color-only** (an unavailable item is labeled in text, not just greyed out) — the same rule already established in `02_HOMEPAGE_SPECIFICATION.md` §16 and `01_NAVIGATION_SPECIFICATION.md` §21.
- **All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly**, with no search-specific exception.

## 23. Mobile Search

- **The search field is reachable in one tap from anywhere**, per `01_NAVIGATION_SPECIFICATION.md` §7/§15 — not redefined here, only relied upon.
- **Filters open in a bottom-sheet-style panel**, apply via an explicit "Show N results" action, and leave selected filters visible as removable chips once closed (§13) — the current, evidence-backed mobile filter pattern, chosen specifically because live-updating results while a filter panel is still open is a documented source of disorientation on small screens.
- **A sticky "Filter & Sort" control remains reachable while scrolling through results**, never requiring a scroll back to the top of the page to adjust — the same persistent-access principle `01_NAVIGATION_SPECIFICATION.md` §9 already applies to the header itself.
- **Autocomplete suggestions on mobile occupy the full available viewport** below the input once active, rather than a cramped inline dropdown, given the reduced screen real estate — consistent with `01_NAVIGATION_SPECIFICATION.md` §7's general mobile-affordance sizing discipline and `DESIGN_SYSTEM.md` §B11's 44×44px touch-target minimum for every suggestion row.

## 24. Analytics

- `search_performed` (value: normalized query, result count)
- `search_zero_results` (value: query) — the direct data source for §18's recovery-quality tracking and §9's synonym-dictionary growth
- `search_within_category_used` (already defined in `01_NAVIGATION_SPECIFICATION.md` §25; search results confirm the same event, not a duplicate)
- `autocomplete_suggestion_shown` / `autocomplete_suggestion_clicked` (value: suggestion type — product, category, typo-correction)
- `search_abandoned` (a query typed, suggestions shown, but neither a suggestion clicked nor the query submitted) — directly measures the autocomplete-abandonment-reduction goal named in §7's research basis
- `facet_applied` / `facet_removed` (value: facet type + value)
- `sort_changed` (value: sort order selected)
- `search_result_clicked` (value: product/category id, position in result set) — the primary signal for future ranking-quality review (§28)
- `pairs_with_suggestion_clicked` (already defined in `01_NAVIGATION_SPECIFICATION.md` §25; reused here for search-result-attached suggestions)
- `zero_results_recovery_clicked` (value: recovery type — typo correction, category link, curated fallback)

Each ties back to §2's business objectives — the zero-result rate itself (§2, §18) is computed directly from `search_zero_results` as a share of `search_performed`.

## 25. SEO Considerations

- **Internal search-results pages are `noindex, follow` by default** — a standard, deliberate ecommerce SEO practice: indexing an unbounded space of query-string result pages produces thin, near-duplicate content that dilutes rather than helps search visibility, and query-string URLs are rarely what an external searcher would land on directly in any case.
- **The `follow` half of that directive matters** — search-result pages still link out to real, indexable category, collection, and product pages (`01_NAVIGATION_SPECIFICATION.md` §26 already establishes those as the platform's actual SEO-facing surfaces), so search itself is never a dead end for crawlers even while its own result pages aren't indexed.
- **Search is not the platform's primary organic-acquisition channel — categories and collections are** (`01_NAVIGATION_SPECIFICATION.md` §26) — this section exists to state that explicitly, so search implementation is not mistakenly held to an SEO bar it was never meant to carry.
- **Faceted combinations reached via search-within-category inherit `01_NAVIGATION_SPECIFICATION.md` §26's existing canonicalization requirement** rather than needing a second, search-specific answer to the same combinatorial-duplicate-content risk.

## 26. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Unified searchable index, both product lines | Meilisearch index over Product + linked attribute modules | `MEDUSA_EXTENSIONS.md` #6 | Scoped, not yet formally approved |
| Wine facets/full-text fields | `wine-details` module fields (§5, §13) | `MEDUSA_EXTENSIONS.md` #1 | Field list not finalized (`PRODUCT_CATALOG.md`) |
| Food facets/full-text fields, incl. allergen data | `food-details` module fields (§5, §13, §16) | `MEDUSA_EXTENSIONS.md` #2 | Field list not finalized; allergen-accuracy ownership also open |
| Index freshness | Event-subscriber sync pattern keeping the index current as products/availability change | `MEDUSA_EXTENSIONS.md` #6 | Scoped |
| Synonym dictionary | Meilisearch synonym configuration (§9), merchandising-editable | `MEDUSA_EXTENSIONS.md` #6 | Mechanism scoped; content not yet seeded |
| Editorial boosting/pinning | Meilisearch ranking-rule or pinning configuration (§11), time-bound where campaign-driven | `MEDUSA_EXTENSIONS.md` #6 | Mechanism scoped; not yet built |
| "Pairs with" cross-sell data (§17) | Product-to-product relationship, not yet modeled | Flagged in `02_HOMEPAGE_SPECIFICATION.md` and `01_NAVIGATION_SPECIFICATION.md`, repeated here | **Not yet scoped in `MEDUSA_EXTENSIONS.md`** |
| Analytics events (§24) | Standard client/event-tracking pipeline | Platform-wide, not search-specific | Not this document's scope to build |

## 27. Performance Expectations

- **Query response time targets Meilisearch's own documented sub-50ms backend performance characteristic** as the engine-level budget — this is a property of the chosen technology (`MEDUSA_EXTENSIONS.md` #6), not a number this specification invents.
- **Perceived end-to-end latency for autocomplete suggestions targets under 300ms** from the debounced query firing to suggestions rendering — the same "still reads as instant" threshold `01_NAVIGATION_SPECIFICATION.md` §27 already sets for its own search-suggestion mention, reused here rather than re-derived.
- **Queries are debounced (§6), not fired on every keystroke** — reduces backend load and avoids a flickering, laggy-feeling suggestion list, consistent with `01_NAVIGATION_SPECIFICATION.md` §27's existing debounce rule.
- **A full search-results page load is held to the platform-wide LCP target** already established in `02_HOMEPAGE_SPECIFICATION.md` §17 and reused in `01_NAVIGATION_SPECIFICATION.md` §27 — under 2.5 seconds at the 75th percentile on mobile — search results get no separate, looser budget.
- **The facet panel does not block the result grid's render**, and vice versa (§20, §21) — independence in loading is also a performance requirement, not only a resilience one.
- **Result imagery lazy-loads below the initially-visible set**, the same discipline `02_HOMEPAGE_SPECIFICATION.md` §17 already applies to below-the-fold homepage sections.

## 28. Future Expansion

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, the same way `DESIGN_SYSTEM.md`'s "Future Theme Support" and `01_NAVIGATION_SPECIFICATION.md` §28's Scalability table document capability without committing to a roadmap item:

- **Recommendations** — an algorithmic (not purely editorial) "customers who searched/bought X also liked Y" layer, extending §17's editorial cross-sell once real usage data exists to power it responsibly (the same personalization-deferral condition already applied throughout `02_HOMEPAGE_SPECIFICATION.md` §14 and this document's §10, §14).
- **Semantic and natural-language search** — matching customer *intent* rather than only literal keyword/typo-distance matching (e.g. correctly serving "a light wine to go with fish" as a meaning-based query, not a literal string match). Current search-engineering research reports meaningful zero-result-rate reductions from semantic search adoption industry-wide, which is directly relevant to this document's own zero-result target (§2, §18). Meilisearch's own product direction already documents hybrid (keyword-plus-vector) search capability, meaning this capability is a configuration/model layer added to the existing engine, not a wholesale search-platform migration when the time comes.
- **AI-assisted / conversational discovery** — a chat-style or guided-question discovery mode (e.g. helping a Guided Browser articulate what they want through a short dialogue rather than a single query box) — a plausible extension of the Guided Browser support already central to this document's philosophy (§1), not a redesign of it.
- **Personalization** — query and browsing-history-informed ranking, deferred for the same reason as §10 and `02_HOMEPAGE_SPECIFICATION.md` §14: it requires real usage data this platform does not have at launch, and is not assumed or designed against here.
- **Natural-language, compound queries** (e.g. "a red wine under a set price that pairs with jollof rice") — sits at the intersection of semantic search and the cross-sell relationship data already flagged as a dependency (§17, §26); explicitly not v1, and named here only to confirm the architecture (a unified index, a real synonym/relevance layer, and eventually a real pairing dataset) does not need to be rebuilt to eventually support it.

None of the above is authorized or scoped work — `PRODUCT_BLUEPRINT.md` and `MEDUSA_EXTENSIONS.md` name none of it as committed. This section exists solely to confirm the architecture chosen for v1 does not foreclose it.

## 29. Risks & Assumptions

**Risks:**

- **The "pairs with" cross-sell relationship (§17) does not yet exist as backend data**, and is not yet even listed in `MEDUSA_EXTENSIONS.md` — this is the same recurring gap flagged in both prior specifications, now confirmed as unscoped rather than merely unbuilt; it should be added to `MEDUSA_EXTENSIONS.md` before any implementation depending on it begins.
- **Meilisearch itself is not yet formally approved by Paul** (`MEDUSA_EXTENSIONS.md` #6, `PROJECT_STATUS.md`) — this entire specification assumes it as the implementation target; a different search engine choice would require revisiting several sections' specific mechanism references (synonyms, ranking rules, hybrid-search future path in §28), though not the product-level behavior requirements themselves.
- **Wine and food attribute field lists are not finalized** (`PRODUCT_CATALOG.md`) — the exact facet set (§13) cannot be fully finalized until they are; this document specifies the *behavior* facets must exhibit, not a final field-by-field list.
- **Allergen-data accuracy is safety-critical and operationally unresolved** — §13 and §16 depend on the food-attributes module's allergen fields being accurate, and `MEDUSA_EXTENSIONS.md` #2 already flags that operational ownership of that accuracy is an open question; this document cannot resolve that dependency, only name how much weight search filtering places on it.
- **The under-5%-zero-result target (§2, §18) is aspirational until real query volume exists** — synonym coverage (§9) and typo tolerance (§8) reduce the risk, but the target itself cannot be validated pre-launch, and should be tracked from day one rather than assumed met.

**Assumptions:**

- Meilisearch (`MEDUSA_EXTENSIONS.md` #6) is the implementation target, providing native typo tolerance, faceting, synonyms, and ranking-rule configuration as described throughout.
- The Next.js Starter storefront (`TECH_STACK.md`) is the implementation target, making server-rendered, URL-reflected search state (§6, §20, §25) achievable as described.
- `01_NAVIGATION_SPECIFICATION.md`'s entry-point mechanics and `02_HOMEPAGE_SPECIFICATION.md`'s "no results hosted on the homepage" decision remain as specified — this document does not re-litigate either.
- No real usage/query data exists pre-launch, which is why personalization, popularity-based ranking, and algorithmic recommendations (§10, §14, §28) are uniformly deferred rather than designed against speculative data.

## 30. Acceptance Criteria

- [ ] A single-character typo on a well-known product, producer, or category name still returns relevant results (no false zero-result).
- [ ] Autocomplete suggestions appear after the minimum query length, are capped in count, are distinguishable by type, and are fully operable by keyboard via the ARIA combobox pattern.
- [ ] A genuinely zero-match query never renders a blank page — it shows at least one of: a typo-corrected suggestion, a related category/collection link, or a curated fallback.
- [ ] A facet combination that reduces results to zero is visually and behaviorally distinguished from a query-level zero-result state, and indicates which filter is responsible.
- [ ] Every applied query, facet, and sort order is reflected in the URL and restores the identical state on reload or share.
- [ ] On mobile, facet changes apply only via an explicit "Show N results" action, never live-updating mid-panel; applied filters remain visible as removable chips after the panel closes.
- [ ] Result count is announced via an ARIA live region after each search or filter change, without requiring the customer to already have focus on the results themselves.
- [ ] An out-of-stock Wine & Spirits product or an unavailable Food Central item still appears in relevant search results, clearly labeled, never silently hidden.
- [ ] No editorial boost or cross-sell suggestion appears attached to a query it has no genuine relevance to.
- [ ] Search remains fully functional (field visible, query submittable) when the search backend is simulated as unreachable, degrading to a plain-language message rather than a blank or broken page.
- [ ] Search-results pages are served with a `noindex, follow` directive.
- [ ] All analytics events listed in §24 fire correctly and exactly once per corresponding user action, including `search_zero_results` for every query with no matches.
- [ ] Search-result page loads meet the platform's LCP target under the same test conditions already used for the homepage and navigation specifications.

---

# Search Intent

Everything above specifies *mechanisms* (facets, synonyms, ranking, boosting). This section maps those mechanisms onto named customer intents, so search behavior can be checked against real scenarios rather than only against isolated features. **Every adaptation below is achieved through mechanisms already specified elsewhere in this document — none of it introduces AI, machine learning, or personalization into Version 1.** Intent here is inferred deterministically from the query text and any facets/context already applied, never from browsing history, account data, or an inferred customer profile. If a future intent genuinely cannot be served this way, that is a trigger to consider AI-assisted discovery or personalization (§28) — it is not a reason to force a workaround into v1's deterministic model.

| Customer intent | Typical signal | How search behavior adapts | Mechanism |
|---|---|---|---|
| Exact product lookup | A specific, well-formed product or producer name | Autocomplete prioritizes direct name matches; typo tolerance minimizes friction on a near-exact query | §7, §8, §10 |
| Category exploration | A category/type term ("whisky," "red wine") without a specific product | Autocomplete surfaces the matching category/collection alongside any product hits, inviting a switch into browsing rather than forcing a flat product list | §7, §11, §12, `01_NAVIGATION_SPECIFICATION.md` §11–§12 |
| Gifting | Terms like "gift," "gift set," "present" | Matches surface Gifting-tagged Collection members via the synonym/Collection mechanism already established — not a separate gifting-specific system | §9, §15 |
| Occasion shopping | Occasion language ("birthday," "celebration") | The same Collection/synonym mechanism as gifting, generalized to any occasion tag a Collection carries | §9, §12, §15 |
| Food pairing | A wine or dish name plus pairing language ("pairs with," "goes with") | Surfaces the "pairs with" cross-sell suggestion attached to the matched result, clearly distinguished from the result set itself | §17 |
| Budget shopping | The Price facet/sort applied, or price-range language in the query | Served through the existing Price facet and sort (§13, §14) — search does not parse a numeric budget out of free text in v1; that is explicitly deferred to the natural-language-query work in Future Expansion (§28) | §13, §14 |
| Premium/luxury browsing | Terms like "premium," "sommelier," or direct entry via a premium Collection | Surfaces curated, editorially-boosted Collection members (§11) — a curation signal, not a personalization one | §11, §12 |
| Educational discovery | Descriptive, non-catalog language ("light," "fruity," "not too spicy") | Served by full-text tasting-note/ingredient matching (§5) — the mechanism that lets a customer succeed without knowing formal catalog vocabulary, directly serving `EXPERIENCE_PRINCIPLES.md` #5 (Guide Without Intimidating) | §5, §15, §16 |

# Query Understanding

The goal stated plainly: **a customer should be able to find products even when they don't use official catalog wording.** Every mechanism below is deterministic and already specified elsewhere in this document — query understanding in v1 is achieved through typo tolerance, synonyms, full-text matching, and standard normalization, never through a natural-language-understanding model (consistent with Search Intent's own v1 boundary, above).

- **Spelling mistakes** are fully covered by §8 (Typo Tolerance) and are not re-specified here.
- **Abbreviations** (e.g. a common shorthand for a product, brand, or attribute) are captured through the synonym dictionary (§9) as they are identified from real zero-result query logs (§18, §29) — an operational content task, not new engineering.
- **Plural/singular forms** of the same word ("wine"/"wines," "gift"/"gifts") are treated as equivalent matches through standard query normalization (§6) — ordinary tokenization handles most common cases, with irregular forms an automated stemmer misses added to the synonym dictionary (§9) as needed.
- **Local Nigerian terminology** — colloquial or everyday names for products, especially Food Central dishes, where a customer may reasonably use a household term rather than a formal menu name — is a required, actively-maintained category within the synonym dictionary (§9). This document does not enumerate specific terms itself; that content belongs to whoever owns the catalog and menu data (`PRODUCT_CATALOG.md`), sourced from real usage rather than assumed here.
- **Wine terminology** — regional spelling variants, varietal names, and informal descriptors — is served by the same synonym mechanism (§9) plus full-text tasting-note matching (§5) for descriptive, non-formal language.
- **Spirit terminology** — regional spelling variants (e.g. "whisky"/"whiskey," already named in §9) and well-known brand names resolving to their category or product — served by the same synonym and product-name matching mechanisms (§9, §10), not a spirits-specific system.
- **Food terminology** — dish names, ingredient names, and their colloquial equivalents — served by the same synonym dictionary (§9) plus full-text ingredient search (§5, §16).

Keeping query understanding entirely mechanism-based (rather than model-based) makes it deterministic, testable, and directly improvable from real zero-result data (§18) — a synonym gap is fixed by adding a synonym entry, not by retraining anything.

# Ranking Philosophy

This section states the priority order search ranking follows, and — more importantly — what is never allowed to override it. §10–§12 and §14 specify the mechanics; this section is the policy those mechanics implement.

**Priority order:**

1. **Relevance always comes first.** Textual match quality and typo-distance (§8, §10) determine whether a product is in the result set and its baseline position at all. Nothing below this line can promote an irrelevant product into relevance.
2. **Availability** acts as a soft tie-breaker among already-relevant results (§10) — an available product ranks above an otherwise-equivalent unavailable one, but availability never removes a relevant, unavailable product from the results entirely (§5, §12).
3. **Business merchandising (editorial boosting, §11)** may reorder *within* an already-relevant result set, bounded by the caps and time-limits already specified — it never inserts a product with no genuine relevance to the query.
4. **Popularity** has no ranking role in v1 — no real usage data exists yet to base it on (§10). When it is introduced (§28), it is designed to be a tie-breaker among relevant results, the same tier as availability, never a relevance replacement.
5. **Freshness** is not a silent ranking factor in v1 either — there is no general basis to prefer a newer product over an equally relevant older one. Freshness is instead exposed explicitly as the "Newest" sort option (§14), which a customer chooses deliberately, rather than an invisible thumb on the scale in the default relevance order.
6. **Promotional boosts** are the same mechanism as business merchandising (§11) and are bound by the same rule above.

**What is never allowed to override relevance — stated explicitly, not left to inference:**

- No promotional, merchandising, or boosted placement may insert a product into results for a query it has no genuine relevance to (§11).
- No business-priority or paid-style signal may outrank an exact or near-exact match on the customer's own typed query terms — the customer's literal intent always outranks the business's promotional intent for their own search.
- Availability may deprioritize but never hides a genuinely relevant, unavailable product (§5, §10, §12).
- Any future popularity or personalization signal (§28) is constrained, by this document, to operate as a tie-breaker among relevant results — stated now specifically so that constraint does not need to be re-derived or re-argued when that future work begins.

# Operational Considerations

Search must remain predictable and trustworthy as the underlying catalog changes beneath it. None of the following introduces a new backend mechanism beyond the index-freshness sync pattern already required in §26 — this section makes explicit what that sync pattern must guarantee from the customer's side, since "the index stays current" is meaningless without saying current *with respect to what*.

- **Products becoming unavailable** (sold out, or a Food Central item the kitchen can no longer fulfill): reflected in the index promptly via the existing sync mechanism (§26); the product remains findable and labeled accordingly (§12), never silently removed. A result already rendered in an open browser tab may briefly show stale availability until the customer's next fetch — an accepted, reasonable tradeoff, not an oversight, consistent with the caching-tolerance precedent already established in `01_NAVIGATION_SPECIFICATION.md` §27.
- **Price changes:** the index reflects current price at query time via the same sync mechanism; a price-sorted result set (§14) is only ever as stale as the index itself, with no separate price-specific caching layer to reason about.
- **Promotions or boosts expiring:** reuses §11's existing start/end-date, auto-expiring mechanism — no manual cleanup step, and no separate expiry logic to specify here.
- **Inventory changes** (restock, quantity changes): availability-driven ranking (§10) and labeling (§12) update automatically once the index reflects the new state — a restocked item's position and label correct themselves without a manual re-index trigger.
- **Products temporarily hidden by a deliberate merchandising decision** are a distinct case from "unavailable": a hidden product is fully excluded from search results and browsing, not shown-with-a-label — hiding is an intentional visibility decision (e.g. pulling an item from sale without deleting it), not a stock-state fact, and must not be conflated with §12's "unavailable but findable" rule, which applies only to stock/kitchen-capacity states.
- **Deleted products** are a third distinct case from both of the above: a genuinely deleted product is removed from the index promptly, so search never surfaces a result that turns out to be a broken link when clicked. "Unavailable" (still exists, not currently purchasable), "hidden" (exists, deliberately not shown), and "deleted" (no longer exists) are three different states and must not be handled as if they were one.

# Search Quality Checklist

Every future change to search — a new facet, a new synonym category, a new promotional boost mechanism, a ranking adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline `DESIGN_SYSTEM.md`'s Design Quality Checklist and `01_NAVIGATION_SPECIFICATION.md`'s Navigation Quality Checklist already apply to their own domains:

- [ ] **Is relevance preserved?** Checked against the Ranking Philosophy's priority order above — nothing demotes genuine relevance below merchandising, popularity, or freshness.
- [ ] **Is customer trust maintained?** No manipulated results, no fabricated urgency, and an honest zero-result state when one genuinely occurs (§12, §18).
- [ ] **Are unavailable products handled correctly?** Labeled, not hidden, for genuine stock/availability states — and correctly distinguished from a deliberately hidden or genuinely deleted product (Operational Considerations, above).
- [ ] **Are promotional boosts honest?** Capped, time-bound, relevance-scoped, and never inserting an irrelevant product (§11, Ranking Philosophy).
- [ ] **Does search remain accessible?** WAI-ARIA combobox semantics, live-region result announcements, and full keyboard operability hold with no exceptions (§22).
- [ ] **Is the mobile experience equal to desktop, not a reduced version of it?** Bottom-sheet filtering with an explicit apply action is a deliberate pattern choice, not a compromise (§13, §23).
- [ ] **Does search support both catalogs equally?** Cross-catalog labeling and equal-prominence results hold for any query that plausibly spans both (§2, §5).
- [ ] **Is performance acceptable?** Held to the same targets as the rest of the platform, with no search-specific relaxation (§27).
- [ ] **Does the change stay within v1's deterministic, non-AI query-understanding and intent model** — or does it actually require personalization or machine learning, in which case it belongs in Future Expansion (§28), not smuggled into v1 (Search Intent, Query Understanding, above)?
- [ ] **Does it preserve the allergen-filtering trust guarantee without exception?** (§13, §16) — this is a safety commitment, not an ordinary UX preference, and no change may weaken it.

This document is now **Version 1.0 — Approved and Frozen — the authoritative Search Specification** for all future search and product-discovery implementation.

---

**Document status:** Approved — Frozen (v1.0, approved by Paul 2026-07-18). This is the authoritative reference for all search and product-discovery implementation platform-wide, integrating directly with `01_NAVIGATION_SPECIFICATION.md` (Approved — Frozen; entry points) and `02_HOMEPAGE_SPECIFICATION.md` (Under Review; the homepage's own discovery surfaces) without redefining either. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, a Frozen document may only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md` — not as a side effect of downstream specification or implementation work.

## Sources

External research cited above (principles only — no search interfaces, layouts, wording, or proprietary interactions were referenced or copied):

- [Ecommerce Search UX Best Practices 2026 — Baymard Institute](https://baymard.com/blog/ecommerce-search-query-types)
- [E-Commerce Search Usability Research Studies — Baymard Institute](https://baymard.com/research/ecommerce-search)
- [Baymard Cliff Notes: Autocomplete Suggestions or Predictive Search](https://medium.com/design-bootcamp/baymard-cliff-notes-autocomplete-suggestions-or-predictive-search-7268784d1b6f)
- [Typo tolerance settings — Meilisearch Documentation](https://www.meilisearch.com/docs/learn/relevancy/typo_tolerance_settings)
- [Full-Text Search — Meilisearch](https://www.meilisearch.com/products/fulltext-search)
- [A Guide To Zero-Result Searches In Ecommerce Store — Wizzy](https://wizzy.ai/blog/zero-result-search-ecommerce/)
- [How To Fix Zero Search Results in Ecommerce — Bloomreach](https://www.bloomreach.com/en/blog/how-to-fix-zero-search-results-in-ecommerce)
- [What Is an Ecommerce Filter? UI Best Practices — Baymard Institute](https://baymard.com/learn/ecommerce-filter-ui)
- [Mobile Filter UX Design Patterns & Best Practices — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-mobile-filters)
- [Best practices for mobile search filter UX — LogRocket Blog](https://blog.logrocket.com/ux-design/best-practices-mobile-search-filter/)
- [ARIA live regions — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [ARIA22: Using role=status to present status messages — W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)
- [Semantic Search for E-commerce: 2026 Guide for Stores — Sparq](https://www.sparq.ai/blogs/semantic-search-ecommerce)
