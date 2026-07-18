# Homepage Specification

**Status:** Under Review
**Version:** 0.1
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the implementation-ready reference for the LiquorCentral homepage. It defines *behavior* — what the homepage must do, for whom, under what conditions, and why — not what it looks like. Every recommendation below derives from `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0, and none of it contradicts them. Where a decision is grounded in external UX research rather than one of those four documents, the source is cited inline — research strengthens the reasoning here, it never replaces the product thinking already established in those documents.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, and a QA engineer should be able to derive test cases from it — without asking a follow-up question first.

---

## 1. Purpose

The homepage is the first and highest-traffic surface in the product. Its job is to convert an unfamiliar or returning visitor into someone taking a confident next step — into Wine & Spirits discovery, into a fast Food Central order, or into a repeat purchase — within the emotional register `EXPERIENCE_PRINCIPLES.md` sets for a first landing: **welcomed, not overwhelmed** (Emotional Goals, §7).

## 2. Homepage Responsibilities

**The homepage must:**
- Establish the unified brand promise (`BRAND_IDENTITY.md` positioning statement) within the first viewport.
- Route the visitor efficiently into whichever intent they already have — wine discovery or fast food ordering — without forcing a binary choice, since a Repeat Household customer type (`PRODUCT_BLUEPRINT.md` §4) plausibly wants both in one visit.
- Surface trust signals early and specifically, given this is a new brand in a market where **81% of online shoppers report feeling uneasy buying from an unfamiliar site**, and trusting customers spend measurably more (Forter, cited in industry hero-section research, 2026).
- Serve both first-time and returning visitors without either audience feeling like an afterthought.

**The homepage must not:**
- Function as a general content hub, blog, or marketing scroll unrelated to a clear next action.
- Force account creation or an intrusive newsletter wall before any value is delivered (`BUSINESS_RULES.md` — guest checkout, low friction).
- Cram competing messages and calls-to-action into the first viewport — the single most common hero-section failure identified in current UX research (Perfect Afternoon, 2026) and the direct opposite of `EXPERIENCE_PRINCIPLES.md` #2 (Simplicity Before Features).

## 3. Business Goals

- Reduce time-to-first-meaningful-action (a search, a category entry, an add-to-cart) for a first-time visitor.
- Establish trust within the first viewport, consistent with `PRODUCT_BLUEPRINT.md` §11 (Trust Strategy) and `BRAND_IDENTITY.md` §21 (Trust Principles).
- Present Wine & Spirits and Food Central with equal prominence and distinct pacing, reinforcing the "one cohesive ecosystem" requirement (`PRODUCT_BLUEPRINT.md` §2) without collapsing their different discovery speeds into one identical treatment.
- Support the platform-wide success metric from `EXPERIENCE_PRINCIPLES.md`: does this make LiquorCentral feel more trustworthy, more premium, easier to use, and more enjoyable?

## 4. Customer Goals

Mapped from `PRODUCT_BLUEPRINT.md` §4's four customer types:

| Customer type | Homepage goal |
|---|---|
| Confident Buyer | Reach search or a known product with minimal friction — the homepage should never be an obstacle between this visitor and the search bar. |
| Guided Browser | Find a curated, low-pressure entry point into wine discovery (an occasion or curated shelf, not a raw category list). |
| Repeat Household | Recognize the homepage quickly, reach a reorder shortcut or either product line fast, since this visitor plausibly wants both wine and food in one visit. |
| Gifter | Find a gifting-oriented entry point without having to search for it explicitly. |

## 5. Primary User Journeys

- **J1 — First-time visitor, wine-led:** lands → age-gate confirms → hero → selects Wine & Spirits path → browses a curated collection → proceeds to a product detail page.
- **J2 — First-time visitor, food-led:** lands → age-gate confirms (see §12; Food Central itself is not age-restricted, but the gate is encountered site-wide on first visit per current mechanics — see Risks, §24) → hero → selects Food Central → today's menu → fast add-to-cart.
- **J3 — Returning, logged-in customer:** lands → recognized → reorder shortcut or either product line, whichever is closer to the top of the page for that visitor.
- **J4 — Gifter:** lands → hero → curated "Gifting" collection (surfaced per `PRODUCT_BLUEPRINT.md` §5's occasion-layer, exact collection set pending merchandising input per `INFORMATION_ARCHITECTURE.md`) → product detail page framed for gifting.
- **J5 — Confident Buyer, direct search intent:** lands → uses the persistent header search bar immediately, bypassing homepage content sections entirely. The homepage must not obstruct this — search must be reachable in one tap/click from the very top of the page regardless of scroll position (see `01_NAVIGATION_SPECIFICATION.md`).

## 6. Information Hierarchy

Above-the-fold priority order, deliberately in this sequence:

1. **Trust/brand promise first, not a sales pitch first** — matches the Emotional Goal of feeling welcomed before feeling sold to (`BRAND_IDENTITY.md` §7).
2. **Path selection (Wine & Spirits / Food Central)** — the primary functional decision most visitors need to make.
3. Below the fold: curated discovery (wine), today's menu spotlight (food), the wine-and-food connection moment, the trust-and-delivery band, a light returning-customer strip, and the footer — in that order.

This ordering follows current hero-section research directly: above-the-fold content should carry one clear value proposition and an obvious primary action, not multiple competing ones (Perfect Afternoon; Shopify homepage design guidance, 2026).

## 7. Homepage Sections

In page order:

1. **Persistent Header/Shell** — logo, search, cart, account (fully specified in `01_NAVIGATION_SPECIFICATION.md`; referenced, not redefined, here).
2. **Age Verification Gate** — first-visit interstitial, not a scrollable section (see §8.2).
3. **Hero — Brand Welcome & Dual Path Entry** — one brand statement, two clearly weighted entry points (Wine & Spirits, Food Central).
4. **Curated Collections (Wine & Spirits)** — editorial shelves (e.g. Sommelier's Picks, Gifting).
5. **Food Central Spotlight** — today's menu / fast entry point.
6. **Wine & Food, Connected** — a cross-sell storytelling moment linking the two catalogs.
7. **Trust & Delivery Band** — sold-direct claim, delivery coverage clarity, secure payment.
8. **Returning Customer Strip** — light, non-intrusive reorder shortcut (logged-in visitors only).
9. **Footer** — legitimacy content, legal/compliance, support, navigation.

## 8. Behaviour of Each Section

### 8.1 Persistent Header/Shell

- **Purpose:** constant orientation and access to search, cart, and account from anywhere on the homepage.
- **Business rationale:** removes any dependency on scroll position to reach the platform's core actions.
- **Customer value:** serves the Confident Buyer journey (J5) directly — search is never more than one action away.
- **Behaviour:** persists (sticky or fixed) through scroll; full specification lives in `01_NAVIGATION_SPECIFICATION.md`.
- **Mobile behaviour:** collapses to a condensed bar with an accessible menu affordance; search remains one tap away.
- **Desktop behaviour:** full-width bar with visible search field, not just an icon.
- **Accessibility considerations:** a "skip to main content" link precedes the header in tab order, per `DESIGN_SYSTEM.md` §B11.
- **Backend dependencies:** cart item count, account/session state.
- **Future extensibility:** none specific to the homepage; see `01_NAVIGATION_SPECIFICATION.md`.

### 8.2 Age Verification Gate

- **Purpose:** legal compliance gate before alcohol content is browsable, framed as reassurance rather than an obstacle (`PRODUCT_BLUEPRINT.md` §11).
- **Business rationale:** a non-negotiable compliance requirement (`BUSINESS_RULES.md`); how it's framed materially affects first impression.
- **Customer value:** confirms the platform takes compliance seriously without feeling punitive — a stated trust signal in its own right.
- **Behaviour:** shown once per session (exact persistence duration is an open item — see `PROJECT_STATUS.md`) on first visit, before alcohol categories are reachable. Confirmation is required to proceed; declining exits or restricts to non-alcohol content only if that path is technically supported (open item, not decided here — see §24).
- **Mobile behaviour:** full-viewport interstitial; large, unambiguous confirm/decline actions meeting the 44×44px minimum touch target (`DESIGN_SYSTEM.md` §B11).
- **Desktop behaviour:** centered modal over a dimmed (not blank) background — the page beneath should already be rendered, not blocked, so the gate reads as an overlay, not a loading barrier (see §17, §20 on why this matters for performance/SEO).
- **Accessibility considerations:** proper modal semantics (focus trapped within the gate, focus returns to the page on confirm, `Escape` does not silently bypass a legal gate), announced to screen readers as a dialog, meets contrast requirements from `DESIGN_SYSTEM.md` §B11.
- **Backend dependencies:** none required for a simple confirmation; a persistent "verified" flag on the customer/session is the only state involved.
- **Future extensibility:** a hard compliance re-check at order confirmation (flagged as an open item in `PRODUCT_BLUEPRINT.md` §9) would layer on top of this gate, not replace it.

### 8.3 Hero — Brand Welcome & Dual Path Entry

- **Purpose:** deliver the brand promise and let the visitor choose their path in one disciplined moment, not two competing ones.
- **Business rationale:** directly implements `BRAND_IDENTITY.md`'s finalized positioning statement as the visitor's first impression, and answers the platform's single biggest first-viewport question — "wine or food, or both?" — immediately.
- **Customer value:** matches the Emotional Goal of feeling welcomed, and gives every customer type (§4) a fast, low-friction way to state their intent.
- **Behaviour:** exactly one brand statement (headline + short supporting line, drawn from `BRAND_IDENTITY.md`'s positioning/value proposition) and exactly two primary entry points — Wine & Spirits and Food Central — presented with equal visual weight. **No auto-rotating carousel or slider.** Current research is unambiguous on this: carousels see roughly 1% engagement, with 89% of any clicks landing on the first slide only; auto-advancing content increases bounce and actively harms Largest Contentful Paint, a measured Core Web Vital (Baymard Institute; Notre Dame carousel study; Smashing Magazine, 2023–2026 sourcing). A single static hero directly protects both the trust goal (§3) and the performance goal (§17).
- **Mobile behaviour:** entry points stack vertically, both reachable without scrolling on common device heights where feasible; brand statement is concise enough to avoid pushing both entry points below the fold.
- **Desktop behaviour:** entry points may sit side by side; brand statement remains the single dominant message, per the "no competing messages" rule in §2.
- **Accessibility considerations:** brand statement is a real `<h1>`; both entry points are genuine links/buttons (not div-based fake controls), reachable and operable by keyboard, with visible focus states per `DESIGN_SYSTEM.md`'s Focus token.
- **Backend dependencies:** none — this section's content is largely static/editorial, sourced from brand copy, not live product data.
- **Future extensibility:** `DESIGN_SYSTEM.md`'s Future Theme Support (seasonal themes) could reskin this section's Accent usage for a campaign without changing its structure.

### 8.4 Curated Collections (Wine & Spirits)

- **Purpose:** serve the Guided Browser and Gifter customer types with low-pressure, editorial discovery, per `PRODUCT_BLUEPRINT.md` §5 and the wine-commerce research behind it (most buyers choose by curated suggestion, not raw category expertise).
- **Business rationale:** curation over volume is the stated Product Philosophy (`PRODUCT_BLUEPRINT.md` §3); this section is where that philosophy is first visible.
- **Customer value:** gives an unsure visitor a confident starting point without requiring wine expertise.
- **Behaviour:** one or more named, editorially curated shelves (e.g. "Sommelier's Picks," "Gifting" — exact set is an open merchandising decision per `INFORMATION_ARCHITECTURE.md`), each a horizontally scrollable or gridded set of product cards linking to `05_PRODUCT_DETAILS_SPECIFICATION.md` pages.
- **Mobile behaviour:** horizontal scroll with clear affordance (partial-card peek) rather than a dense grid, to preserve one-thumb usability.
- **Desktop behaviour:** grid or wider horizontal scroll; more items visible without interaction.
- **Accessibility considerations:** horizontally scrollable regions are keyboard-navigable (arrow keys or tab order through visible cards), not mouse/touch-only.
- **Backend dependencies:** a Medusa Product Collection or Category per curated shelf, queried via the Store API; no custom module required (`PRODUCT_CATALOG.md`).
- **Future extensibility:** personalized curation (different shelves per visitor) is explicitly deferred — see §14.

### 8.5 Food Central Spotlight

- **Purpose:** give Food Central a fast, prominent entry point matching its speed-first requirement (`EXPERIENCE_PRINCIPLES.md`, `PRODUCT_BLUEPRINT.md` §7), never buried beneath wine content.
- **Business rationale:** equal prominence to Wine & Spirits is required by `PRODUCT_BLUEPRINT.md` §2 — Food Central is a premium subsidiary, not an afterthought.
- **Customer value:** serves the food-led journey (J2) with minimal browsing depth before a decision is possible.
- **Behaviour:** surfaces a snapshot of today's menu (a small set of items, not the full menu) with a clear "same-day cutoff" or availability indicator where relevant, and a direct link into the full Food Central menu (`04_PRODUCT_LISTING_SPECIFICATION.md` / `09_FOOD_ORDERING_SPECIFICATION.md`).
- **Mobile behaviour:** compact card set, optimized for a quick scan and tap — no more interaction depth than necessary to reach an add-to-cart or menu entry.
- **Desktop behaviour:** a slightly larger snapshot, still deliberately partial (not the full menu) to keep this a "spotlight," not a duplicate listing page.
- **Accessibility considerations:** availability/cutoff information is conveyed in text, not color alone (`BRAND_IDENTITY.md` §13's Do's and Don'ts — never rely on color as the only signal).
- **Backend dependencies:** Food Central Product Category filtered to currently available items; prep-time/availability data from the food-attributes module (`MEDUSA_EXTENSIONS.md` #2); same-day cutoff logic from the delivery-slot module (`MEDUSA_EXTENSIONS.md` #3).
- **Future extensibility:** a location/time-aware default (e.g. showing lunch items in the morning) is a future personalization opportunity, not v1 (§14).

### 8.6 Wine & Food, Connected

- **Purpose:** make the wine-and-food pairing relationship visible and tangible, not just implied by shared navigation — directly implements `EXPERIENCE_PRINCIPLES.md` #10 (Food and Wine Should Feel Connected).
- **Business rationale:** this is LiquorCentral's structural differentiator (`PRODUCT_BLUEPRINT.md`'s wine × gourmet-food cross-sell) and deserves its own moment, not just a nav-level connection.
- **Customer value:** gives the Repeat Household and Guided Browser a reason to explore both catalogs in one visit.
- **Behaviour:** a small, editorial "pairs with" moment (e.g. one wine and one dish presented together with a short reason) rather than an algorithmic recommendation feed — consistent with the explainable, non-black-box pairing approach already established in product research.
- **Mobile behaviour:** single stacked pairing example; concise supporting copy.
- **Desktop behaviour:** may show more than one pairing example side by side.
- **Accessibility considerations:** pairing images carry descriptive alt text (e.g. "Sauvignon Blanc paired with grilled fish"), not generic filenames.
- **Backend dependencies:** a lightweight product-to-product relationship, per the "pairs with" module scoped in earlier research (`MEDUSA_EXTENSIONS.md`-adjacent; not yet built — a small backend dependency worth flagging to whoever picks up this section's implementation).
- **Future extensibility:** could grow into a larger content hub fed by the CMS integration once approved (`MEDUSA_EXTENSIONS.md` #7), but v1 keeps this editorial and manually curated.

### 8.7 Trust & Delivery Band

- **Purpose:** state plainly what makes this platform trustworthy and what to expect on delivery, before the visitor has to dig for it.
- **Business rationale:** directly implements `PRODUCT_BLUEPRINT.md` §11 (the "sold and delivered by us directly" claim, a genuine differentiator only available because there's no marketplace) and mitigates the geographic-confusion risk named in `PRODUCT_BLUEPRINT.md` §18.
- **Customer value:** answers the unstated question every new visitor to an unfamiliar retailer has — is this legitimate, and what happens after I order? — matching the finding that trust must be earned explicitly in this market, not assumed.
- **Behaviour:** a compact band (not a wall of text) stating: sold and delivered directly by LiquorCentral (no third-party sellers); Wine & Spirits ships nationwide; Food Central delivers in Lagos only, same-day/scheduled/pickup available; secure payment. The nationwide-vs-Lagos distinction is stated here — on the homepage, before any product-specific page — specifically to prevent a Food-Central-interested visitor outside Lagos from discovering the restriction only at checkout.
- **Mobile behaviour:** stacked, icon-led short statements; scannable in a few seconds.
- **Desktop behaviour:** may present as a horizontal row of the same short statements.
- **Accessibility considerations:** each trust statement pairs an icon with text (never icon-only), consistent with `DESIGN_SYSTEM.md` §B8's clarity-first iconography principle.
- **Backend dependencies:** largely static content; no live backend data required for this band specifically.
- **Future extensibility:** could surface live delivery-area lookup (postcode/address check) directly in this band in a later version; v1 keeps it informational only.

### 8.8 Returning Customer Strip

- **Purpose:** give a logged-in, returning visitor a fast path back into ordering without making a first-time visitor feel excluded or the page feel cluttered.
- **Business rationale:** serves the Repeat Household customer type (`PRODUCT_BLUEPRINT.md` §4) and the naturally recurring purchase pattern this category rewards.
- **Customer value:** removes repeated friction for restocking wine or reordering a favorite dish.
- **Behaviour:** shown only to logged-in customers with at least one prior order; a compact strip offering "reorder" shortcuts to 1–3 recent orders. Entirely absent (not a placeholder or an empty state) for guests and first-time customers.
- **Mobile behaviour:** a single horizontally scrollable row of recent-order shortcuts.
- **Desktop behaviour:** same pattern, more visible at once.
- **Accessibility considerations:** each shortcut clearly labels what it re-adds (e.g. "Reorder: [product names]"), not a bare "Reorder" button with no context.
- **Backend dependencies:** Customer and Order history via the Store API (native Medusa — no custom module required, per `PRODUCT_BLUEPRINT.md` §4).
- **Future extensibility:** this is the deliberately minimal v1 version of personalization — see §14 for what's explicitly deferred beyond it.

### 8.9 Footer

- **Purpose:** carry legitimacy, legal, and support information that reinforces trust without competing with the homepage's primary actions above.
- **Business rationale:** part of the explicit trust strategy (`PRODUCT_BLUEPRINT.md` §11) — visible business legitimacy, a real support channel, clear terms.
- **Customer value:** gives a skeptical visitor somewhere to verify legitimacy (contact info, policies) without that content crowding the main page.
- **Behaviour:** standard footer content — support/contact, return and delivery policy links, legal/compliance disclosures, and secondary navigation. Not a marketing section; kept deliberately understated.
- **Mobile behaviour:** collapsible/accordion groupings to avoid an excessively long scroll.
- **Desktop behaviour:** multi-column layout, fully expanded.
- **Accessibility considerations:** footer landmark region (`<footer>`), logical heading structure for each link group.
- **Backend dependencies:** none — static content.
- **Future extensibility:** none specific; a stable, low-change section by design.

## 9. Backend Data Requirements

| Section | Data needed | Source |
|---|---|---|
| Header/Shell | Cart count, session/auth state | Native Medusa Store API |
| Age Gate | Session verification flag | Storefront session, no backend query |
| Hero | Static brand copy | Storefront content, not Medusa |
| Curated Collections | Product Collections/Categories | Native Medusa Store API (`PRODUCT_CATALOG.md`) |
| Food Central Spotlight | Available menu items, prep-time/availability, same-day cutoff | Food-attributes module (`MEDUSA_EXTENSIONS.md` #2) + delivery-slot module (#3) |
| Wine & Food, Connected | Curated "pairs with" relationship | Small, not-yet-built product-relationship data (flagged above) |
| Trust & Delivery Band | Static trust copy; delivery coverage facts | Storefront content |
| Returning Customer Strip | Customer + Order history | Native Medusa Store API |
| Footer | Static legal/support content | Storefront content |

## 10. Search & Discovery

The homepage does not host its own search results — the persistent header search bar (`01_NAVIGATION_SPECIFICATION.md`) is the single entry point, per `PRODUCT_BLUEPRINT.md` §8's one-shared-search-bar decision. The homepage may optionally surface a small set of "popular" or "trending" query shortcuts near the hero in a future iteration (§14), but v1 relies entirely on the header's search entry point plus the curated/spotlight sections above as discovery paths. Search itself (results, facets, labeling across catalogs) is fully specified in `03_SEARCH_SPECIFICATION.md`, powered by Meilisearch (`MEDUSA_EXTENSIONS.md` #6).

## 11. Food Central Integration Strategy

Food Central is represented on the homepage with **equal structural prominence** to Wine & Spirits (one hero entry point each, one dedicated discovery section each — §8.4 and §8.5) but **distinct pacing**: the wine section is browse-oriented (curated shelves inviting exploration), the Food Central section is decision-oriented (a small, fast snapshot with a direct path to ordering). This asymmetry is deliberate, not an oversight — it implements `PRODUCT_BLUEPRINT.md` §7's differentiated navigation pacing at the homepage level, while the shared hero, shared trust band, and the "Wine & Food, Connected" section keep both feeling like one ecosystem rather than two bolted-together sites (`PRODUCT_BLUEPRINT.md` §2).

## 12. Trust Strategy

The homepage carries three distinct trust mechanisms, each addressed to a different anxiety:

1. **Legitimacy** (Trust & Delivery Band, Footer) — addresses "is this a real, accountable company?"
2. **Compliance framing** (Age Verification Gate) — addresses legal requirements while itself functioning as a trust signal when framed respectfully, not punitively (`PRODUCT_BLUEPRINT.md` §11).
3. **Product/delivery clarity** (Trust & Delivery Band) — addresses "will I get what I expect, when I expect it?" — directly countering the geographic-confusion risk named in `PRODUCT_BLUEPRINT.md` §18.

## 13. Delivery Messaging

Stated explicitly in the Trust & Delivery Band (§8.7), not deferred to checkout: Wine & Spirits ships nationwide; Food Central delivers in Lagos only, with same-day, scheduled, and pickup options. This placement is a direct mitigation for the risk flagged in `PRODUCT_BLUEPRINT.md` §18 — a customer outside Lagos should learn about the Food Central restriction on the homepage, not after adding items to a cart.

## 14. Personalization Opportunities (Future)

Explicitly **not** in v1: algorithmic product recommendations, browsing-history-based curation, location/IP-based default catalog switching (e.g. auto-hiding Food Central for a visitor outside Lagos rather than informing them per §13), time-of-day-aware menu defaults, and search-query shortcuts based on trending behavior. All are plausible future enhancements (§23) but require real usage data this platform doesn't have yet, and none are assumed or designed against here.

## 15. SEO Strategy

- Server-rendered above-the-fold content (via the Next.js Starter storefront, `TECH_STACK.md`) so search engines and slow connections both see meaningful content immediately — the age-gate overlay must not block this render (see §8.2, §20).
- One semantic `<h1>` (the hero's brand statement); logical heading hierarchy through the rest of the page.
- Descriptive, unique meta title and description reflecting the finalized positioning statement (`BRAND_IDENTITY.md` §10).
- Open Graph and structured data (Organization/LocalBusiness schema) for legitimate, verifiable rich results — itself a trust signal in search results, not just an SEO mechanic.
- Descriptive alt text on all imagery (hero, curated collection cards, pairing moment) — serves both SEO and accessibility simultaneously.

## 16. Accessibility Considerations

- Skip-to-content link precedes the header.
- Full keyboard operability of every interactive element, including horizontally-scrollable collection shelves (§8.4).
- Age Verification Gate implemented with correct dialog semantics, focus trapping, and focus return (§8.2) — this is the highest-risk accessibility surface on the page given it blocks all other content on first visit.
- No information conveyed by color alone anywhere on the page (`BRAND_IDENTITY.md` Do's and Don'ts).
- All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly — no homepage-specific exceptions.
- No auto-advancing content of any kind (§8.3), removing an entire category of motion-related accessibility risk.

## 17. Performance Expectations

Held to the stricter end of the platform's performance bar, since the homepage is the highest-traffic single page and the first mobile experience for most visitors (mobile is 70%+ of ecommerce traffic — Shopify homepage research, 2026):

- **Target: LCP under 2.5 seconds at the 75th percentile on mobile** — the WCAG-adjacent "good" Core Web Vitals threshold; the ecommerce sector median currently sits at 3.2 seconds on mobile, and sites clearing all three Core Web Vitals thresholds see measured conversion improvements of 15–30% (2026 industry benchmarking). This is an explicit target, not an aspiration, consistent with `PRODUCT_BLUEPRINT.md` §16 treating performance as a conversion metric.
- The hero image (§8.3) is very likely the LCP element — it must be optimized, correctly sized per breakpoint, and never dependent on a carousel/slider script, which independently harms LCP (Perfect Afternoon, 2026).
- Below-the-fold sections (§8.4–§8.8) lazy-load their imagery.
- The Age Verification Gate must not delay the underlying page's render — it overlays already-rendered content (§8.2), not a loading blocker.

## 18. Analytics Events

- `age_gate_shown`, `age_gate_confirmed`, `age_gate_declined`
- `hero_path_selected` (value: `wine` or `food`)
- `curated_collection_item_clicked` (with collection name)
- `food_spotlight_item_clicked`
- `pairing_moment_clicked`
- `search_initiated_from_header` (homepage as originating page)
- `reorder_shortcut_clicked` (returning customers only)
- `footer_link_clicked` (with link identifier)

Each ties back to the business goals in §3 — specifically, time-to-first-meaningful-action can be derived from the gap between page load and the first of `hero_path_selected`, `search_initiated_from_header`, or `reorder_shortcut_clicked`.

## 19. Empty States

- **No curated collection configured:** the Curated Collections section (§8.4) falls back to a general "Shop Wine & Spirits" link rather than rendering an empty or broken shelf.
- **Kitchen closed / no available menu items:** the Food Central Spotlight (§8.5) shows a clear "not currently taking orders" message with the next expected opening time, rather than an empty grid.
- **No prior orders for a logged-in customer:** the Returning Customer Strip (§8.8) does not render at all — it is not shown as an empty state, since a customer with no order history isn't yet a "returning" customer in the sense this section serves.
- **No pairing content configured:** the "Wine & Food, Connected" section (§8.6) does not render rather than showing a broken or placeholder pairing.

## 20. Loading States

- Skeleton placeholders (matching each section's approximate shape) are preferred over spinners for the Curated Collections, Food Central Spotlight, and Returning Customer Strip sections — skeletons communicate structure immediately and are perceived as faster, directly serving `EXPERIENCE_PRINCIPLES.md` #6 (Speed Builds Trust).
- The Hero (§8.3) and Trust & Delivery Band (§8.7) are largely static content and should be server-rendered with no visible loading state at all.
- The Age Verification Gate overlays content that continues rendering beneath it — it is never the reason the rest of the page appears to "hang" (§8.2, §17).

## 21. Error States

- Each section fails **independently** — a failure fetching curated-collection data must not prevent the Food Central Spotlight, Trust Band, or any other section from rendering.
- A section that fails to load its data falls back to its empty state (§19) rather than a visible error message, wherever a graceful fallback exists (e.g. the curated-collections-to-general-catalog fallback). A visible, plain-language error is reserved for cases with no reasonable fallback (e.g. the entire page's product data layer is unreachable).
- No blank white space or broken layout is an acceptable failure mode for any section.

## 22. Version 1 Scope

**In scope for v1:** Persistent header/shell (referencing `01_NAVIGATION_SPECIFICATION.md`), Age Verification Gate, Hero with dual path entry, one or two curated Wine & Spirits collections, Food Central Spotlight, a single "Wine & Food, Connected" pairing moment, Trust & Delivery Band, a minimal Returning Customer Strip (reorder shortcuts only, no other personalization), and a standard footer.

**Explicitly deferred:** everything named in §14 (Personalization Opportunities), any seasonal/theme-based visual variation (possible later per `DESIGN_SYSTEM.md`'s Future Theme Support, not v1), and a homepage-embedded delivery-area lookup tool (§8.7's future extensibility note).

## 23. Future Enhancements

- Personalization per §14, once real usage data exists.
- A CMS-driven (`MEDUSA_EXTENSIONS.md` #7, once approved) richer version of the "Wine & Food, Connected" section — seasonal stories, pairing guides — beyond the single curated moment in v1.
- Seasonal or campaign-driven visual variation via `DESIGN_SYSTEM.md`'s Future Theme Support, without structural changes to this specification.
- A homepage-embedded delivery-area/postcode check, reducing the need to reach checkout to learn Food Central eligibility.
- Native mobile app parity, sequenced per `ROADMAP.md` Phase 8.

## 24. Risks & Assumptions

**Risks:**
- **Age-gate mechanics remain an open business decision** (`PROJECT_STATUS.md`) — specifically whether the gate is site-wide or only triggers when entering alcohol content. This specification assumes a site-wide gate on first visit as the simpler, more conservative default (consistent with J1/J2 in §5), but this should be confirmed, not assumed final.
- **Geographic confusion** remains a risk even with delivery messaging on the homepage (§13) if a visitor skips past it — checkout-level enforcement (`07_CHECKOUT_SPECIFICATION.md`) is the true backstop; the homepage band reduces but does not eliminate this risk.
- **Curated collection content requires ongoing merchandising effort** (`PRODUCT_BLUEPRINT.md` §18) — an under-maintained shelf degrades the homepage's core discovery value over time.
- **The "Wine & Food, Connected" section's backend relationship data does not yet exist** — flagged in §8.6 and §9 as a small, currently unscoped dependency that should be added to `MEDUSA_EXTENSIONS.md` before implementation begins.

**Assumptions:**
- The Next.js Starter storefront (`TECH_STACK.md`) is the implementation target, making server-rendering of above-the-fold content achievable as described in §15/§17.
- Meilisearch (`MEDUSA_EXTENSIONS.md` #6) powers the header search referenced in §10.
- A logged-in customer's order history is available via native Medusa APIs with no additional backend work, per §9.

## 25. Acceptance Criteria

- [ ] The age verification gate appears on first visit and cannot be bypassed without an explicit confirmation action.
- [ ] The underlying homepage content is server-rendered and present in the DOM even while the age gate is displayed (verifiable via view-source / server response, independent of the gate's own visibility).
- [ ] Both Wine & Spirits and Food Central entry points are reachable within one tap/click from the initial mobile viewport, without scrolling.
- [ ] No section of the homepage uses an auto-advancing carousel or slider.
- [ ] The distinction between nationwide Wine & Spirits delivery and Lagos-only Food Central delivery is stated on the homepage, above the footer.
- [ ] All homepage imagery has descriptive, non-generic alt text.
- [ ] The Returning Customer Strip does not render for guests or first-time customers.
- [ ] Every homepage section fails independently — simulating a data failure in one section does not break or blank any other section.
- [ ] Homepage LCP measures under 2.5 seconds at the 75th percentile under defined mobile test conditions.
- [ ] Every interactive element on the page is operable by keyboard alone, with a visible focus state.
- [ ] No homepage copy or interaction relies on color as the sole carrier of meaning.
- [ ] All analytics events listed in §18 fire correctly and exactly once per corresponding user action.

---

**Document status:** Under Review (v0.1). This is the first full draft, ready for and now awaiting Paul's review — not yet approved. Upon approval, this specification becomes the reference for homepage implementation, alongside `01_NAVIGATION_SPECIFICATION.md` for the shared shell it references.

## Sources

External research cited above (principles only — no layouts, branding, or proprietary designs were referenced or copied):

- [Hero Section Design: Best Practices & Examples for 2026](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Homepage Design: 18 Examples and Best Practices (2026) — Shopify](https://www.shopify.com/blog/homepage-design)
- [Core Web Vitals Benchmarks 2026: What Good Looks Like](https://www.digitalapplied.com/blog/core-web-vitals-benchmarks-2026-pass-rate-reference)
- [Page Speed Statistics 2026: Performance and Revenue Impact](https://www.digitalapplied.com/blog/page-speed-statistics-2026-revenue-impact)
- [10 UX Requirements for Homepage Carousels — Baymard Institute](https://baymard.com/blog/homepage-carousel)
- [A Step-By-Step Guide To Building Accessible Carousels — Smashing Magazine](https://www.smashingmagazine.com/2023/02/guide-building-accessible-carousels/)
