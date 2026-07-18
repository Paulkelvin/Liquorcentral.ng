# Product Details Specification

**Status:** Approved — Frozen (2026-07-18)
**Version:** 1.0
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for every product detail page (PDP) across LiquorCentral — the page a customer reaches to make a final purchasing decision, whether for a bottle of wine, a spirit, or a Food Central dish. It defines *customer behavior, product information architecture, trust, conversion, accessibility, scalability, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §3 (Product Philosophy) and §13 (Product Data Strategy), `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0, and `PRODUCT_CATALOG.md`, and none of it contradicts them. It integrates directly with the four already-frozen specifications it sits beside: `01_NAVIGATION_SPECIFICATION.md` defines breadcrumbs and deep linking into a PDP; `02_HOMEPAGE_SPECIFICATION.md` and `04_PRODUCT_LISTING_SPECIFICATION.md` are the primary surfaces that link *into* a PDP; `03_SEARCH_SPECIFICATION.md` shares the product card component that also links here. This document does not redefine any of them — it is what a customer reaches once they click through.

Where a decision is grounded in external UX, accessibility, or conversion research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary visual design was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Product Detail Philosophy

The product detail page is where `PRODUCT_BLUEPRINT.md` §1's vision — "confident enough to purchase immediately" — is either earned or lost. It is the concrete expression of the Product Philosophy (`PRODUCT_BLUEPRINT.md` §3): fewer, completely-described products, structured well enough that a first-time buyer can decide without leaving the site. Its one job: **remove every reasonable doubt, without demanding the customer read everything to get there.**

This is not a contradiction to resolve once and forget — it is a standing tension the page must hold every time it renders, because a Confident Buyer and a Guided Browser (§3) want different things from the identical page:

1. **A novice customer must never feel unqualified to buy.** `EXPERIENCE_PRINCIPLES.md` #5 (Guide Without Intimidating) applies nowhere more directly than here — a wine PDP's expert vocabulary (appellation, tannin structure) must sit beside plain-language guidance, not replace it.
2. **A knowledgeable customer must never feel the page is thin.** The same page must carry genuine structured depth (§10, §12, §13) for a buyer who wants it — progressive disclosure (§7) is the mechanism that serves both audiences from one page rather than forcing a choice between them.
3. **Trust outweighs conversion tactics, without exception.** Every trust mechanism on this page (§19) is honest by construction — current research finds up to 62% of leading ecommerce sites still have mediocre-or-worse product page UX, and the sites that clear that bar do it through clarity and honesty, not through pressure.

## 2. Business Objectives

- **Maximize add-to-cart conversion without misleading tactics** — the two are not in tension; cited research finds strategic, honest UX optimization (clear pricing, delivery timing, return terms, real trust signals) drives measurable conversion gains on its own.
- **Reduce post-purchase returns and support inquiries** by setting accurate expectations up front (`PRODUCT_CATALOG.md`'s photography and data-completeness standards) — a return caused by an inaccurate PDP is a preventable cost, not a customer-service problem to absorb after the fact.
- **Reinforce premium positioning through restraint and photography quality**, not through density of information — `EXPERIENCE_PRINCIPLES.md` #3 (Premium Through Discipline) and #4 (Photography Sells First) both apply directly to this page.
- **Serve Wine & Spirits' discovery-oriented depth and Food Central's speed-oriented clarity from one shared page architecture** (§10, §11), consistent with the asymmetric-within-one-shell pattern already established in every prior specification.
- **Protect trust and legal compliance** (age confirmation reminders, honest availability, honest delivery expectations, §19–§21) as a business objective in its own right, not a constraint fought against.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to the product detail page specifically:

| Customer type | PDP objective |
|---|---|
| Confident Buyer | Confirm this is the right item fast (name, price, availability, one or two defining facts) and complete add-to-cart with minimal scrolling or reading required. |
| Guided Browser | Progressively explore structured facts, tasting notes/ingredients, and pairing context (§7, §10/§11, §14) at their own pace, without feeling required to read all of it before deciding. |
| Repeat Household | Recognize a familiar product quickly and reach quantity/add-to-cart (§17, §18) without re-reading content they already know. |
| Gifter | Find gift-relevant framing (an occasion cue carried from a Gifting collection entry, §4) and enough presentation-quality information (photography, story) to feel confident buying for someone else. |

Every customer type additionally needs: to trust that availability and pricing shown here are accurate (§8, §9), to never hit a broken or dead page (§23, §24), and to reach this page identically whether they arrived from a listing, search, or the homepage (§4).

## 4. Entry Points

The *mechanics* that lead to a product detail page are fully specified elsewhere and are not redefined here — this section only confirms the complete set:

- **A product card click** from a category listing, collection listing, or Food Central menu listing (`04_PRODUCT_LISTING_SPECIFICATION.md` §9) — the primary entry point.
- **A product card click from search results** (`03_SEARCH_SPECIFICATION.md`), using the identical card component.
- **A curated shelf on the homepage** (`02_HOMEPAGE_SPECIFICATION.md` §8.4, §8.6, §8.8).
- **A "pairs with" cross-sell link** from another PDP (§14) or from any surface that already hosts one (homepage, listing, search).
- **A direct/deep link** (`01_NAVIGATION_SPECIFICATION.md` §20) — every PDP has a unique, shareable, server-rendered URL, reachable without having passed through any other page first.

A PDP does not vary its behavior by entry point — a customer arriving via a direct link from outside the platform sees the identical page a customer arriving from a listing sees, including the delivery/geography context (§20) a homepage visitor would already have seen — this matters specifically because a direct-linked visitor may never have encountered that context elsewhere (§19's geographic-confusion mitigation).

## 5. Information Architecture

The page follows one consistent structure across both catalogs, implementing the progressive-disclosure discipline (§7) at the page-layout level:

1. **Above the fold — the "buy" section:** gallery (§6), name, price (§8), availability (§9), one or two immediately-visible key facts (§7), quantity (§17), and add-to-cart (§18) — kept deliberately simple, mirroring wine-ecommerce research's own finding that a page's top "buy section" should stay simple while richer content lives below it.
2. **Immediately below — structured facts:** the catalog-specific fact sheet (§10 or §11, presented via §13's structured format).
3. **Further down — pairing and related content:** pairing recommendations (§14), related products (§15), any cross-sell (§16).
4. **Trust and delivery context:** trust signals (§19), delivery information (§20), pickup information (§21) — present on every PDP, not assumed already seen elsewhere (§4).
5. **Reviews (§22):** not present in v1 — see that section.

This ordering is not arbitrary — it follows the same "clarity on cost and policy before the customer is asked to commit" principle current research identifies as the highest-leverage set of PDP improvements: pricing, delivery timing, and return terms belong before the customer has emotionally committed, not buried below content they may not reach.

## 6. Product Gallery Behaviour

- **Multiple images per product, covering distinct shot types**: a plain product shot, an in-scale or context shot, a feature close-up, and — for Wine & Spirits specifically — a label-detail shot (`PRODUCT_CATALOG.md`'s existing photography standard, restated here as this section's authoritative requirement, not a separate rule). Current research finds these shot types each answer a different customer question that reduces purchase hesitation; a typical product needs roughly five to eight images to cover them without padding the gallery unnecessarily.
- **Zoom is required, not optional** — current research finds a significant share of ecommerce sites still lack functional zoom, and that its absence measurably erodes confidence at the exact moment a customer is inspecting a product most closely. Desktop supports zoom-on-hover or click-to-zoom; mobile supports pinch-to-zoom and double-tap, the expected native gestures, not a zoom trapped inside a fixed frame.
- **Image resolution is sufficient to remain crisp under zoom** — a stated, testable requirement (§30), not left to whatever asset happens to be supplied.
- **The gallery is keyboard- and screen-reader-operable** (§25) — every image carries distinct, descriptive alt text (never a generic filename or a repeated caption across images), and gallery navigation (next/previous, thumbnail selection) is reachable without a pointer device.
- **No autoplay, no video that starts without an explicit action** — consistent with `02_HOMEPAGE_SPECIFICATION.md` §8.3's platform-wide rejection of auto-advancing content and the accessibility risk it introduces.

## 7. Product Information Hierarchy

This section states, explicitly, the priority order every PDP follows — the direct answer to reducing cognitive load while still supporting an informed purchase decision:

**Immediately visible, above the fold, on every PDP (§5):**
- Product name and price (§8)
- Primary gallery image (§6)
- Availability status (§9)
- At most one or two defining facts appropriate to the product (e.g. a Wine & Spirits vintage/region pairing, or a Food Central spice-level/prep-time pairing) — never the full fact sheet compressed into this zone
- Quantity selector and add-to-cart (§17, §18)

**Progressively disclosed — present on the page, but not competing for above-the-fold attention:**
- The full structured fact sheet (§10 or §11, formatted per §13)
- Full tasting notes / full ingredient list
- Pairing recommendations (§14) and related products (§15)
- Detailed delivery/pickup information (§20, §21) — the *existence* of nationwide vs. Lagos-only delivery is stated plainly and early (§20), but slot-level detail is progressively disclosed

**Optional — present only when genuinely available, never fabricated to fill space:**
- Producer/winemaker story or extended narrative content
- Serving/storage guidance (§10)
- Any cross-sell add-on (§16)

**Never shown on a PDP:**
- Competitor comparisons or pricing
- Personalized or browsing-history-based content (out of scope for v1, §29)
- Any claim not backed by real catalog data (fabricated ratings, unverified "best-seller" labels) — the same non-fabrication standard already established in `04_PRODUCT_LISTING_SPECIFICATION.md`'s Merchandising Governance, restated here for the PDP context
- Customer reviews or ratings (§22) — no review system exists yet; this is not the same as "never," see §29

This hierarchy is consistent across Wine & Spirits and Food Central — the same four tiers apply to both catalogs; only the specific facts occupying each tier differ (§10, §11).

## 8. Pricing Behaviour

- **Price is always shown in full, in the platform's currency**, matching the identical price already shown on the listing card that linked here (`04_PRODUCT_LISTING_SPECIFICATION.md` §9) — a PDP price that differs from what the customer saw on the way in is a trust failure, not a rounding detail.
- **A genuine promotional price is shown alongside its real original price**, never fabricated or exaggerated — the same rule already established for listing cards, applied here without modification.
- **No "starting from" or obscured pricing** that resolves to something different once the customer commits — current research names this specifically as a source of hesitation this page must not introduce.
- **Tax and fee clarity**: the price shown reflects what the customer will actually be asked to pay for the item itself; any additional delivery fee or tax mechanics belong to checkout (`07_CHECKOUT_SPECIFICATION.md`, not yet drafted) and are not redefined here — this document only guarantees the item price itself is never misleading.

## 9. Availability Behaviour

Reuses `04_PRODUCT_LISTING_SPECIFICATION.md`'s Operational Behaviour three-way distinction directly, applied to the single-product PDP context rather than a grid:

- **Unavailable** (sold out, or a Food Central item the kitchen can't currently fulfill): the page remains reachable and clearly labeled, with add-to-cart disabled and a clear reason shown — never a silent or missing button.
- **Low stock**: shown only where genuinely true, using the same factual, non-urgency-manufacturing language already established for listings — never a fabricated countdown.
- **Hidden**: a hidden product's PDP is not reachable at all — this is the one state where the page itself, not just an action on it, is affected; a customer following a stale link to a hidden product sees the graceful not-found handling in §24, not a page that loads and then explains it's hidden.
- **Discontinued**: the page shows a plain "no longer available" state with related-product suggestions (§15) rather than pretending the product still exists — permanently retired, not a temporary state.

## 10. Wine Product Experience

The wine/spirits PDP is built to serve a customer who knows very little while still giving a knowledgeable buyer genuine structured depth — the same tension named in §1, made concrete:

- **A short, plain-language description sits above the structured fact sheet** (e.g. "a light, easy-drinking red" before the technical grape/region data) — the guiding layer `EXPERIENCE_PRINCIPLES.md` #5 requires, so a novice is oriented before encountering vocabulary they may not know.
- **Tasting notes** describe flavor profile in vivid, concrete language (current wine-ecommerce research's own finding — specific sensory language, not generic marketing adjectives) and are treated as genuine content, not filler.
- **Serving guidance** (temperature, glassware) — optional (§7), shown where genuinely useful, never invented for products where it wouldn't add real value.
- **Region, producer, vintage** — vintage shown only where applicable to the product (a non-vintage spirit or blend simply omits the field rather than showing a placeholder); region and producer are core structured facts for nearly every Wine & Spirits product.
- **ABV** — always shown where applicable; a factual, compliance-relevant data point, not optional in the way serving guidance is.
- **Food pairing** — a short pairing note lives in the structured fact sheet itself (a quick, text-level pairing cue), distinct from the fuller Pairing Recommendations module (§14), which is the cross-catalog "pairs with" mechanism — the two are complementary, not duplicative: one is a fact, the other is a merchandising-curated cross-sell.
- **Storage guidance** — optional (§7), shown where genuinely relevant (e.g. a wine meant to be cellared vs. one meant to be drunk immediately).
- Every field above is **shown only where applicable to the specific product** — this section does not require every field on every product; a field with no data for a given product is omitted, never rendered as an empty or placeholder row (§23).

## 11. Food Product Experience

The Food Central PDP is built around speed and radical transparency, reflecting `BUSINESS_RULES.md`'s speed-first requirement and the safety stakes specific to this catalog:

- **Preparation expectations**: a clear "cooked to order" statement and realistic prep-time expectation, set here rather than discovered only after ordering.
- **Ingredient transparency**: the full ingredient list is shown, not abbreviated or summarized — current research on digital-menu allergen transparency finds allergen filters are used roughly ten times more often than any other menu filter, underscoring how load-bearing this information genuinely is for real customers, not a nice-to-have.
- **Allergen information**: prominent, never color-alone (icon or symbol paired with explicit text, per current research on digital-menu allergen display and consistent with the platform-wide never-color-alone rule already established everywhere else) — this is the PDP-level expression of the same safety-critical guarantee already established for allergen filtering in `03_SEARCH_SPECIFICATION.md` and `04_PRODUCT_LISTING_SPECIFICATION.md`.
- **Spice level**: shown on a clear, consistent scale (the same scale used in facet filtering, `03_SEARCH_SPECIFICATION.md` §13, so the PDP and the filter that led here never disagree).
- **Portion information**: a factual serving/portion-size description, set here rather than left for the customer to guess.
- **Availability windows**: today's-menu availability and the same-day cutoff or next-opening-time messaging already established in `01_NAVIGATION_SPECIFICATION.md` §14, `02_HOMEPAGE_SPECIFICATION.md` §8.5, and `04_PRODUCT_LISTING_SPECIFICATION.md` §19 — not redefined differently here.
- **Same-day delivery messaging**: an explicit cutoff (a countdown or a stated time), never a vague "same-day where available" promise — `DELIVERY_MODEL.md`'s own finding that vague delivery promises measurably underperform explicit cutoffs, applied at the point of decision rather than only at checkout.

## 12. Product Attributes

The structured *data model* behind §10 and §11's customer-facing facts — two focused, linked attribute modules, not one universal one, per `PRODUCT_BLUEPRINT.md` §13:

- **`wine-details`** (`MEDUSA_EXTENSIONS.md` #1) supplies every Wine & Spirits field named in §10.
- **`food-details`** (`MEDUSA_EXTENSIONS.md` #2) supplies every Food Central field named in §11, including the compliance-sensitive allergen/dietary fields.
- **Exact field lists are not finalized** (`PRODUCT_CATALOG.md`) — this document specifies what customer-facing behavior each field must support once populated (§10, §11, §13), not a final schema.
- A field with no value for a given product is simply absent from the rendered fact sheet (§7, §23) — the module's nullability is a data concern; the customer never sees an empty row.

## 13. Product Facts

Distinct from §12 (the data model): this section is the customer-facing *presentation* of that data — the structured, scannable fact sheet itself, not the schema behind it.

- **Facts render as labeled key-value pairs, grouped logically** (e.g. a wine's facts grouped under "About this wine" and "Tasting"; a dish's facts grouped under "Ingredients & Allergens" and "Preparation") — current wine-ecommerce research specifically recommends breaking product information into smaller, titled sections rather than one undifferentiated block, and a mix of short paragraphs and scannable rows over dense paragraphs alone.
- **Icons may accompany a fact for quick scanning** (e.g. an ABV icon, a spice-level icon) but never replace the text label — the same never-icon-alone discipline `01_NAVIGATION_SPECIFICATION.md` §8's iconography rule and the platform's never-color-alone rule both already establish.
- **The fact sheet is the progressively-disclosed tier from §7** — reachable on the page, not hidden behind a page navigation or a separate tab that would remove it from the page's own scroll flow.

## 14. Pairing Recommendations

The cross-catalog "pairs with" mechanism, applied to the PDP — a wine PDP may surface a suggested Food Central dish, and a Food Central PDP may surface a suggested wine, directly implementing `EXPERIENCE_PRINCIPLES.md` #10 (Food and Wine Should Feel Connected):

- **Editorial, not algorithmic, in v1** — the same explainable, non-black-box approach already established in `02_HOMEPAGE_SPECIFICATION.md` §8.6, not a recommendation-engine feed.
- **A single, restrained placement** — one pairing suggestion (or a small curated set), not a heavy module competing with the fact sheet (§13) for the page's attention, consistent with the restraint principle applied throughout every prior specification.
- **Depends on the same "pairs with" relationship data already flagged as unscoped** in `MEDUSA_EXTENSIONS.md` by `02_HOMEPAGE_SPECIFICATION.md`, `01_NAVIGATION_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, and `04_PRODUCT_LISTING_SPECIFICATION.md` — this is the fifth Product Specification to depend on that same gap, which should be treated as a genuine priority to scope, not a recurring footnote to keep restating without acting on.

## 15. Related Products

Distinct from Pairing Recommendations (§14): **same-catalog** similar items (more wine from the same region or varietal; more dishes from the same meal type), surfaced via existing category/collection membership (`01_NAVIGATION_SPECIFICATION.md` §11, §12) — this needs no new backend relationship data and can be built today, unlike §14's cross-catalog dependency.

- Rendered using the same product card component as every listing (`04_PRODUCT_LISTING_SPECIFICATION.md` §9) — no separate card design for this context.
- Shown only when genuine related items exist; absent, not empty, otherwise (§23).

## 16. Cross-selling

Distinct from both §14 (cross-catalog pairing) and §15 (same-catalog related items): a v1-appropriate, buildable-now complementary offer — specifically, **Gift Wrap as an order-time add-on**, per `PRODUCT_CATALOG.md`'s existing recommendation that gift wrapping is modeled as an addable, priced line item rather than a product attribute. Offered as a simple, optional checkbox/line-item addition near add-to-cart (§18), not a separate page or flow.

- **Broader algorithmic cross-selling** ("frequently bought together," usage-driven) is explicitly deferred to Future Expansion (§29) — no real usage data exists yet to power it responsibly, the same deferral condition applied throughout every prior specification.

## 17. Quantity Selection

- **A numeric stepper (increment/decrement controls) sits beside add-to-cart**, per current research favoring stepper controls over a bare text field for this exact interaction — placed adjacent to add-to-cart, not separated from it, and meeting the 44×44px touch-target minimum (`DESIGN_SYSTEM.md` §B11) on mobile.
- **Wine & Spirits quantity is capped by genuine available stock** (inventory tracking is on for this catalog, `PRODUCT_BLUEPRINT.md` §6) — the stepper cannot be pushed past what's actually available, with a clear message if the customer attempts to.
- **Food Central quantity is not capped by a stock count** (inventory tracking is off, made-to-order per `PRODUCT_BLUEPRINT.md` §6) — any practical per-order limit is an operational/kitchen-capacity concern handled at checkout/fulfillment (`07_CHECKOUT_SPECIFICATION.md`, `DELIVERY_MODEL.md`), not a customer-facing stock number invented at the PDP level.
- **The default quantity is always one** — never pre-filled higher, which current UX research names as a dark pattern eroding trust rather than aiding conversion.

## 18. Add to Cart Behaviour

- **Add-to-cart provides immediate, persistent confirmation** (a cart-count update, at minimum), reusing the same cart-feedback research already cited in `04_PRODUCT_LISTING_SPECIFICATION.md` §9 — a customer should never have to double-check whether the action succeeded.
- **A sticky add-to-cart affordance remains reachable on mobile as the customer scrolls through progressively-disclosed content** (§7) — current research names sticky add-to-cart controls as a measurable mobile-conversion lever, and this page's own progressive-disclosure design (which deliberately encourages scrolling) makes this pattern directly relevant rather than optional.
- **An unavailable product's add-to-cart is disabled with a clear, visible reason** (§9), never hidden — consistent with the platform-wide "labeled, not hidden" discipline.
- **The selected quantity (§17) and any cross-sell add-on (§16) are respected exactly as configured** when added — no silent quantity reset, no silently-dropped add-on.
- **Add-to-cart from the PDP is analytically distinguished from a quick-add on a listing card** (§26) — both feed the same cart, but the originating context matters for understanding conversion behavior.

## 19. Trust Signals

Every trust mechanism on this page, stated explicitly — **trust always outweighs conversion tactics; nothing below may be used to pressure rather than inform**, per `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions):

- **Authenticity**: the platform-wide "sold and delivered by us directly" claim (`PRODUCT_BLUEPRINT.md` §11) is established once, on the homepage and footer (`02_HOMEPAGE_SPECIFICATION.md` §8.7) — a PDP does not need to repeat the full claim, but may reference it briefly where natural (e.g. near the trust/delivery block, §20) rather than asserting a new, PDP-specific authenticity claim.
- **Freshness**: for Food Central specifically, a plain "cooked to order, not held stock" statement — a factual claim already true by the business model (`PRODUCT_BLUEPRINT.md` §6), not a marketing embellishment.
- **Availability accuracy**: honest, current-data-backed labeling (§9) — the single largest trust lever this page controls directly.
- **Pricing transparency**: full, honest pricing with no obscured costs (§8).
- **Delivery expectations**: stated plainly and specifically to this product's catalog (§20), not deferred entirely to checkout.
- **Returns/refunds, where applicable**: the alcohol return/refund policy remains an open business decision (`PROJECT_STATUS.md`, `BUSINESS_RULES.md`) and is not invented here — a Wine & Spirits PDP states only what is actually decided once that decision lands; a Food Central PDP states plainly that returns do not apply to a cooked-to-order item, which is a factual consequence of the business model, not an open question.
- **Age confirmation reminders**: a lightweight, non-intrusive compliance reinforcement on alcohol product pages specifically (e.g. a small, factual note that the order will be age-verified) — this is a reminder, not a second full age gate (`02_HOMEPAGE_SPECIFICATION.md` §8.2 already owns the actual gate), and it does not resolve the still-open question of whether a hard compliance re-check happens at order confirmation (`PRODUCT_BLUEPRINT.md` §9) — that decision belongs to checkout, not this page.
- **No trust signal on this page is fabricated, exaggerated, or used to manufacture urgency** — the same non-manipulation standard already established in every prior specification's Merchandising Rules/Governance, restated here as this page's own explicit commitment because trust is this page's primary job (§1).

## 20. Delivery Information

- **Stated plainly on every PDP, not assumed already seen on the homepage** (§4) — a Wine & Spirits PDP states nationwide delivery; a Food Central PDP states Lagos-only delivery with same-day, scheduled, and pickup options (§21) — directly mitigating the geographic-confusion risk `PRODUCT_BLUEPRINT.md` §18 names repeatedly across prior specifications, applied here at the point of decision rather than left to checkout to surface for the first time.
- **Same-day cutoff and slot information for Food Central** is explicit, not vague (§11, reusing `DELIVERY_MODEL.md`'s explicit-cutoff finding directly).
- **Exact slot-level scheduling mechanics belong to checkout** (`07_CHECKOUT_SPECIFICATION.md`, not yet drafted) — this page states what's available and roughly when, not a full slot picker.

## 21. Pickup Information

- **Presented with equal visual weight to delivery**, including a clear ready-time estimate — `DELIVERY_MODEL.md`'s own explicit finding that pickup is frequently under-designed relative to delivery despite being operationally simpler, applied here directly rather than re-derived.
- **Confirmed available for Food Central.** Whether Wine & Spirits ever offers pickup is not established in any prior document (`PRODUCT_BLUEPRINT.md` §10 names only nationwide courier delivery for that catalog) — this document does not assume it does; pickup information renders on a Wine & Spirits PDP only if and when that option is actually configured for the product, never fabricated to fill the section.

## 22. Reviews Strategy

**No customer review or rating system exists in v1.** No star rating, review count, or review content is displayed on any PDP. This is a deliberate scope boundary, not an oversight: `MEDUSA_EXTENSIONS.md` does not scope a review module, and inventing review display without the underlying system would either show fabricated data or an empty, broken-looking module — both explicitly disallowed elsewhere in this document (§7, §23). Reviews are addressed as a named future capability in §29, not designed against here.

## 23. Empty States

- **No gallery images configured**: falls back to a single, honest placeholder image rather than a broken or blank gallery region — this should be treated as a data-completeness gap to fix operationally (`PRODUCT_CATALOG.md`'s photography standard), not a normal expected state.
- **A structured fact with no value for this product** (§12): the corresponding row is simply omitted from the fact sheet (§13) — never rendered as an empty label or a placeholder dash.
- **No pairing recommendation configured** (§14): the module does not render, rather than showing a broken or placeholder pairing — the same rule already established in `02_HOMEPAGE_SPECIFICATION.md` §19.
- **No related products found** (§15): the module does not render — an empty "Related Products" heading with nothing beneath it is not an acceptable state.

## 24. Error States

- **A product genuinely not found** (deleted, or a stale/incorrect link): a graceful, plain-language page with a path back into listings or search (`01_NAVIGATION_SPECIFICATION.md` §24, `03_SEARCH_SPECIFICATION.md` §18's recovery pattern reused here) — never a raw, dead-end error.
- **A hidden product's URL is visited** (§9): the same graceful not-found handling as above — a hidden product is indistinguishable, from the outside, from one that doesn't exist, which is the correct behavior for a deliberate visibility decision.
- **Partial data load failure**: the gallery, fact sheet, pairing module, and trust/delivery block each fail independently — a failure fetching pairing data must never prevent the fact sheet or add-to-cart from rendering, the same independent-failure discipline already established in `02_HOMEPAGE_SPECIFICATION.md` §21 and `03_SEARCH_SPECIFICATION.md` §21.
- **Add-to-cart failure**: a clear, retryable error, with the customer's selected quantity (§17) and any cross-sell selection (§16) preserved — never a silent failure or a state that requires re-configuring the whole selection from scratch.

## 25. Accessibility

- **The gallery is fully keyboard- and screen-reader-operable** (§6), with distinct alt text per image.
- **Progressively disclosed sections (§7) use a disclosure pattern** — a labeled, `aria-expanded`-carrying trigger controlling a content region — the same accessible pattern `01_NAVIGATION_SPECIFICATION.md` §22 already establishes for the mega menu and mobile drawer, reused here for the identical reason: this is genuinely a disclosure widget, not an ARIA `menu`.
- **The quantity stepper (§17) uses proper number-input semantics and a visible, associated label** — not a bare pair of unlabeled buttons.
- **Add-to-cart confirmation is announced to assistive technology via a polite live region** (`role="status"`, `aria-live="polite"`), the same pattern `03_SEARCH_SPECIFICATION.md` §22 and `04_PRODUCT_LISTING_SPECIFICATION.md` §24 already establish for their own confirmations.
- **Allergen and availability information is never color-only** — icon or symbol paired with explicit text in every case (§11), directly validated by current digital-menu research on allergen display as well as the platform's own pre-existing rule.
- **All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly**, with no PDP-specific exception.

## 26. Analytics

- `product_detail_viewed` (value: product id, entry point)
- `gallery_image_viewed` (value: image index/type)
- `fact_sheet_section_expanded` (value: section name) — the progressive-disclosure interaction signal
- `quantity_changed` (value: new quantity)
- `add_to_cart_clicked` (value: product id, quantity, originating page = PDP) — distinguished from `04_PRODUCT_LISTING_SPECIFICATION.md` §25's `quick_add_to_cart_clicked`, which fires from a listing card instead
- `pairing_suggestion_clicked` (reused from `02_HOMEPAGE_SPECIFICATION.md` §18, not a duplicate event)
- `related_product_clicked`
- `gift_wrap_selected` (§16)

Each ties back to §2's business objectives — conversion from `product_detail_viewed` to `add_to_cart_clicked` is this page's primary health signal, and `fact_sheet_section_expanded` is the direct measure of whether progressive disclosure (§7) is actually being used.

## 27. SEO Considerations

- **Every product detail page is a real, indexable, crawlable URL** — the same primary-surface status `01_NAVIGATION_SPECIFICATION.md` §26 already establishes for category/collection listings, in deliberate contrast to `03_SEARCH_SPECIFICATION.md` §25's `noindex` search-results pages.
- **Structured data (`Product`/`Offer` schema) reflects price, availability, and currency accurately** — kept in sync with what the page itself shows (§8, §9), never a stale or independently-maintained copy.
- **A well-structured, complete fact sheet (§10, §12, §13) is itself an SEO asset, not only a customer-facing one** — current research on wine-ecommerce structured data specifically finds that machine-readable, complete product data (producer, vintage, region, tasting notes, ABV) measurably improves how search engines and AI-driven discovery systems rank and represent a product, which is a direct, evidence-based reason the fact sheet's completeness matters beyond the page itself.
- **Descriptive, unique meta title and description per product** — never a templated string identical across the catalog.
- **Descriptive alt text on every gallery image** (§6) serves SEO and accessibility simultaneously, the same dual-purpose principle already established in `02_HOMEPAGE_SPECIFICATION.md` §15.
- **Canonical URLs** — one authoritative URL per product, with no duplicate-content risk from tracking parameters or entry-point-specific query strings.

## 28. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Core product data (name, price, images) | Native Product module | Platform-wide | Native |
| Wine structured facts (§10) | `wine-details` module fields | `MEDUSA_EXTENSIONS.md` #1 | Field list not finalized (`PRODUCT_CATALOG.md`) |
| Food structured facts, incl. allergens (§11) | `food-details` module fields | `MEDUSA_EXTENSIONS.md` #2 | Field list not finalized; allergen-accuracy ownership also open |
| Availability/stock (§9, §17) | Native inventory (Wine & Spirits, tracking on) / availability flag (Food Central, tracking off) | `PRODUCT_CATALOG.md` | Native |
| Pairing Recommendations (§14) | Product-to-product relationship, not yet modeled | Flagged by four prior specifications | **Not yet scoped in `MEDUSA_EXTENSIONS.md`** |
| Related Products (§15) | Native Product Category/Collection membership | `01_NAVIGATION_SPECIFICATION.md` §11, §12 | Native |
| Gift Wrap add-on (§16) | A priced line item, per `PRODUCT_CATALOG.md`'s existing recommendation | `PRODUCT_CATALOG.md` | Recommended, not yet built |
| Cart state (§18) | Native Cart (Store API) | Platform-wide | Native |
| Analytics events (§26) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 29. Future Expansion

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, the same way every prior specification's own future-expansion section documents capability without committing to a roadmap item:

- **Customer reviews** — would require a Review module (not yet scoped in `MEDUSA_EXTENSIONS.md`) plus a moderation process; §22 confirms none of this exists in v1. Adding it later does not require restructuring this document — it occupies a defined, currently-empty tier in §7's hierarchy.
- **Expert reviews** — sommelier ratings or critic scores, named in wine-ecommerce research as valuable rich content; a plausible CMS-driven addition (`MEDUSA_EXTENSIONS.md` #7, once approved) rather than a core-commerce data requirement.
- **Recommendations** — an algorithmic "customers who viewed/bought this also liked" module extending §15's related-products concept beyond category/collection membership, deferred for the same no-usage-data-yet reason applied throughout every prior specification.
- **Personalization** — customer-specific fact emphasis, pairing suggestions, or content ordering — explicitly not v1, matching the platform-wide deferral already established everywhere else.
- **AI assistance** — a conversational "ask about this product" capability (e.g. helping a novice wine buyer ask a follow-up question in plain language) — a plausible, evidence-aligned extension of `EXPERIENCE_PRINCIPLES.md` #5's Guide Without Intimidating principle, but a genuinely new capability, not a variation of anything built for v1.
- **Richer educational content** — deeper producer stories, wine-education content, or cooking/preparation context — CMS-driven once `MEDUSA_EXTENSIONS.md` #7 is approved, extending §10/§11's optional-content tier without restructuring it.

None of the above is authorized or scoped work — `PRODUCT_BLUEPRINT.md` and `MEDUSA_EXTENSIONS.md` name none of it as committed. This section exists solely to confirm the architecture chosen for v1 does not foreclose it.

## 30. Acceptance Criteria

- [ ] Every product detail page has a unique, shareable, server-rendered URL, reachable directly without passing through another page first.
- [ ] The gallery displays multiple images with functional zoom on both desktop (hover/click) and mobile (pinch/double-tap), and every image has distinct, descriptive alt text.
- [ ] Price shown on the PDP is identical to the price shown on the listing card that linked to it.
- [ ] An unavailable product's add-to-cart control is disabled with a visible reason; a hidden or discontinued product is handled per §9's three-way distinction, never conflated.
- [ ] Every structured fact rendered on the page has a real value; no field renders as an empty or placeholder row.
- [ ] Wine & Spirits vintage is omitted (not shown blank) for products where it does not apply.
- [ ] Food Central allergen information is present, prominent, and never conveyed by color alone.
- [ ] The quantity stepper cannot exceed genuine available stock for Wine & Spirits products.
- [ ] Add-to-cart provides immediate, persistent confirmation (cart count update) and remains reachable via a sticky control while scrolling on mobile.
- [ ] Nationwide vs. Lagos-only delivery scope is stated on every PDP, not only on the homepage.
- [ ] Pickup information, where applicable, is presented with equal visual weight to delivery, including a ready-time estimate.
- [ ] No star rating, review count, or review content appears anywhere on the page.
- [ ] No trust signal, badge, or availability claim is fabricated or exaggerated.
- [ ] Progressively disclosed sections are built as an accessible disclosure pattern, fully keyboard-operable, with correct `aria-expanded` state.
- [ ] Every product detail page resolves to a real, indexable URL with accurate `Product`/`Offer` structured data and a unique meta title/description.
- [ ] All analytics events listed in §26 fire correctly and exactly once per corresponding user action.

---

# Product Details Quality Checklist

Every future change to a product detail page — a new fact-sheet field, a new trust signal, a new cross-sell mechanism, a layout adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline `DESIGN_SYSTEM.md`, `01_NAVIGATION_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, and `04_PRODUCT_LISTING_SPECIFICATION.md` already apply to their own domains:

- [ ] **Does it reduce cognitive load while still supporting an informed decision?** Checked against §7's four-tier hierarchy — nothing above the fold crowds the page, and nothing genuinely important is buried past where a customer would reasonably look.
- [ ] **Is product information consistent** with the listing card, search result, and homepage placement the customer arrived from (§4, §8)?
- [ ] **Are unavailable, hidden, and discontinued products handled correctly** and kept distinct from one another (§9)?
- [ ] **Are promotions and trust signals honest?** No fabricated urgency, no exaggerated claim, no trust badge asserting something not actually true (§8, §19).
- [ ] **Does the experience remain accessible?** Gallery, disclosure sections, quantity stepper, and add-to-cart confirmation all meet §25's requirements with no exceptions.
- [ ] **Does it perform well on mobile**, with the sticky add-to-cart pattern and touch-friendly controls treated as the default experience, not an afterthought (§17, §18)?
- [ ] **Does it support both business lines** — Wine & Spirits' structured depth and Food Central's speed/transparency — from the same page architecture, without either catalog's PDP reading as an afterthought (§10, §11)?
- [ ] **Does it preserve customer trust over conversion pressure?** Every mechanism on the page is checked against §1 and §19's standard before it's checked against its conversion impact.
- [ ] **Does it stay within v1's scope**, correctly deferring reviews, recommendations, personalization, and AI assistance to §29 rather than smuggling any of them in early?
- [ ] **Does it preserve the allergen-information trust guarantee without exception?** (§11, §25) — a safety commitment, not an ordinary content preference.

This document is now **Version 1.0 — Approved and Frozen — the authoritative Product Details Specification** for all future product detail page implementation.

---

**Document status:** Approved — Frozen (v1.0, approved by Paul 2026-07-18). This is the authoritative reference for all product detail page implementation platform-wide, integrating directly with `01_NAVIGATION_SPECIFICATION.md` (deep linking, breadcrumbs), `02_HOMEPAGE_SPECIFICATION.md` and `04_PRODUCT_LISTING_SPECIFICATION.md` (entry points and the shared product card), and `03_SEARCH_SPECIFICATION.md` (the shared product card in search results) without redefining any of them. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, a Frozen document may only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md` — not as a side effect of downstream specification or implementation work.

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary visual designs were referenced or copied):

- [Product Page UX Best Practices 2026 — Baymard Institute](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
- [Ecommerce Trust Signals: What to Add to Product Pages to Increase Trust](https://foursixty.com/blog/ecommerce-trust-signals/)
- [Ensure Sufficient Image Resolution and Zoom — Baymard Institute](https://baymard.com/blog/ensure-sufficient-image-resolution-and-zoom)
- [Ecommerce UX: Best Practices Product Image Gallery — UX Planet](https://uxplanet.org/ecommerce-ux-best-practices-product-image-gallery-e0ce6145d270)
- [What Is Progressive Disclosure in UX? — UXPin](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/)
- [What is Progressive Disclosure? — Interaction Design Foundation](https://ixdf.org/literature/topics/progressive-disclosure)
- [How To Improve Your Winery's Ecommerce UX and Design — Highway 29 Creative](https://www.hwy29creative.com/blog/how-to-improve-your-winerys-ecommerce-ux-and-design)
- [Your Wine Data is a Mess — Sommelier.bot](https://sommelier.bot/wine-retail-seo-data-standardization-vivino/)
- [How Better Menu Transparency Personalizes Guest Preferences and Drives Sales — Olo](https://www.olo.com/blog/how-better-allergen-transparency-personalizes-guest-preferences-and-drives-sales)
- [Grocery UX: Dynamically Update the "Add to Cart" Button to a Quantity Selector — Baymard Institute](https://baymard.com/blog/grocery-add-to-cart-buttons)
- [Adding an Item to a Shopping Cart: Provide Clear, Persistent Feedback — Nielsen Norman Group](https://www.nngroup.com/articles/cart-feedback/)
