# Navigation Specification

**Status:** Approved — Frozen (2026-07-18)
**Version:** 1.0
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the implementation-ready, authoritative specification for navigation across the entire LiquorCentral platform — the persistent shell, the category and collection browsing systems, search's entry points, account/cart access, and every wayfinding mechanism (breadcrumbs, internal links, deep links) that lets a customer move confidently between Wine & Spirits and Food Central inside one unified experience. It defines *behavior and architecture*, not appearance: no UI mockups, no wireframes, no visual design, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s hierarchy (this document sits in the Product Specifications tier, downstream of the four frozen Phase 0 documents and upstream of Design and Implementation).

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` (principally §5 Information Architecture and §7 Navigation Strategy), `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0, `INFORMATION_ARCHITECTURE.md`, `BUSINESS_RULES.md`, `PRODUCT_CATALOG.md`, and `DELIVERY_MODEL.md`, and none of it contradicts them. Where a decision is grounded in external UX/accessibility research rather than one of those documents, the source is cited inline and listed in Sources at the end — research validates the reasoning here, it never replaces the product thinking already established in those documents, and no layout, menu wording, or proprietary interaction was copied from any source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data and Medusa structures it depends on, and a QA engineer should be able to derive test cases from it — without a follow-up question. `02_HOMEPAGE_SPECIFICATION.md` already references this document for the shared shell rather than redefining it; this document is that reference, and does not redefine homepage-specific sections (hero, curated collections, age gate) that remain 02's responsibility.

---

## 1. Navigation Philosophy

Navigation on this platform has one job beneath its surface variety: **let a customer with a fully-formed intent move in a straight line, and let a customer without one be guided, without either customer ever feeling like they're using two different websites.** This follows directly from `PRODUCT_BLUEPRINT.md` §7's core decision — one persistent shell, two internally-distinct navigation patterns — and from `EXPERIENCE_PRINCIPLES.md` #11 (Consistency Creates Confidence) and #12 (Reduce Cognitive Load).

Three commitments follow from this, and everything else in this document is downstream of them:

1. **The shell is identical everywhere.** Logo, search, cart, and account behave the same way whether a customer is on the homepage, three levels deep in Whisky, or ordering from Food Central's Today's Menu. A customer should never have to relearn where things are when they cross from one product line to the other.
2. **Depth beneath the shell is asymmetric on purpose.** Wine & Spirits' navigation is discovery-paced (mega-menu browse, facets, curation); Food Central's is speed-paced (a fast, flat menu list). This is not an inconsistency — it is `BUSINESS_RULES.md`'s explicit requirement that food ordering prioritize speed while wine shopping prioritizes discovery, made structural rather than left to chance.
3. **Browsing and searching are equally first-class, never a fallback for each other.** A customer who wants to explore should never be nudged toward search to compensate for weak navigation, and a customer who already knows what they want should never be forced through category clicks to reach it. Baymard's large-scale ecommerce testing found roughly half of shoppers default to search and half to navigation as their preferred product-finding strategy, and that the *visual prominence* of the search field itself measurably shifts which one a visitor chooses — a muted, icon-only search field silently pushes traffic toward navigation regardless of what a visitor actually wants, and vice versa. §15 makes this parity a structural requirement, not a hope.

**Restraint is a navigation principle, not just a visual one.** `EXPERIENCE_PRINCIPLES.md` #3 (Premium Through Discipline) and current luxury-ecommerce research agree: navigation in a premium experience should read as an intuitive, quiet guide, not a dense directory — the most common failure mode observed in premium-adjacent retail is visual restraint undermined by an over-engineered information architecture underneath it. Every section below is written against that standard: as few navigation layers, links, and decisions as the catalog genuinely requires, never more because more was possible.

## 2. Business Objectives

- **Make discovery and speed both true at once**, for two catalogs with opposite pacing needs, without customers experiencing the shell itself as inconsistent (`PRODUCT_BLUEPRINT.md` §7; `BUSINESS_RULES.md`).
- **Protect equal prominence between Wine & Spirits and Food Central** at every level of navigation — neither product line may read as the platform's primary business with the other as an add-on (`PRODUCT_BLUEPRINT.md` §2, §4).
- **Minimize time-to-product** for a Confident Buyer and time-to-decision for a Guided Browser, since both are direct levers on the platform's core "confident enough to purchase immediately" vision (`PRODUCT_BLUEPRINT.md` §1).
- **Keep the category system scalable without redesign.** The catalog will grow — new spirit types, new collections, new occasions — and the navigation architecture must absorb that growth as data changes, not as a future navigation-redesign project (§28).
- **Make navigation itself a trust signal.** A predictable, complete, never-broken navigation system is part of `EXPERIENCE_PRINCIPLES.md` #9 (Trust Must Be Visible) — a customer half-lost in a site's structure trusts that site less, independent of the products on offer.

## 3. Customer Objectives

Mapped from `PRODUCT_BLUEPRINT.md` §4's four customer intents, applied specifically to navigation (not the whole homepage, as in `02_HOMEPAGE_SPECIFICATION.md` §4):

| Customer type | Navigation objective |
|---|---|
| Confident Buyer | Reach a known product in the fewest possible steps — search-first, but a direct category path should work equally well if they choose it. |
| Guided Browser | Move through Wine & Spirits' three discovery layers (formal taxonomy, varietal/style, occasion/curation — `INFORMATION_ARCHITECTURE.md`) without needing to already know which layer has what they want. |
| Repeat Household | Cross between Wine & Spirits and Food Central inside one visit without the shell resetting, losing cart contents, or feeling like two separate sessions. |
| Gifter | Reach a gifting-oriented entry point (a Collection, not a hidden filter) from the primary navigation, not only from the homepage. |

Every customer type additionally needs: to always know where they are (breadcrumbs, §18), to never hit a dead end (empty/error states, §24), and to reach search from anywhere in one action (§15).

## 4. Information Architecture

This section restates the structural decision `INFORMATION_ARCHITECTURE.md` already makes in full detail, at the level navigation implementation needs:

```
Home (shared shell: logo · search · cart · account)
├── Wine & Spirits            — mega-menu browse (§10), three discovery layers (§13)
│   ├── Formal taxonomy       — category tree, extensible (§11)
│   ├── Varietal/style        — facets, not a separate nav tree (§13)
│   └── Occasion/curation     — Collections (§12)
├── Food Central               — flat, fast menu list (§14)
│   ├── Today's Menu
│   ├── Scheduled Orders
│   └── Pickup
├── Account (§16)
└── Cart / Checkout (§17)     — shared, single cart, single checkout
```

Two structural facts drive every decision below and must not be re-litigated by any future navigation work without a business-decision-level change logged in `DECISION_LOG.md`:

1. **One shell, two branches, not two microsites** — `PRODUCT_BLUEPRINT.md` §5's core decision. The shell (logo, search, cart, account) is defined once, in this document, and referenced everywhere else.
2. **Wine & Spirits runs three navigation layers simultaneously** (formal taxonomy, varietal/style, occasion/curation) because expert and novice buyers browse differently, and neither layer may be built at the expense of the other (`INFORMATION_ARCHITECTURE.md`).

### Backend Data Requirements (consolidated)

| Navigation element | Data needed | Medusa mechanism | Custom work? |
|---|---|---|---|
| Category tree (§11) | Parent/child category structure, name, position/order, visibility | Native Product Category (nested) | No |
| Collections (§12) | Named collection, member products, position/order | Native Product Collection | No |
| Wine facets (§13) | Varietal, region, vintage, ABV, price, occasion tags | `wine-details` module fields (`MEDUSA_EXTENSIONS.md` #1), surfaced as Meilisearch facets (#6) | Facet sync only — module itself already scoped |
| "Pairs with" cross-links (§13, §14, §19) | Product-to-product relationship (wine ↔ dish) | Not yet modeled — flagged in `02_HOMEPAGE_SPECIFICATION.md` §8.6/§24 and repeated here | **Yes** — needs a small relationship addition to `MEDUSA_EXTENSIONS.md` before implementation |
| Food Central menu structure (§14) | Available items, prep time/availability | `food-details` module (#2) + delivery-slot module (#3) | No — already scoped |
| Cart/account state (header, §9/§16/§17) | Cart item count, session/auth state, order history | Native Cart, Customer, Order (Store API) | No |
| Search entry point (§15) | Query suggestions, facet metadata | Meilisearch index (#6) | No — pending formal approval, not new scope |

## 5. Global Navigation Strategy

One persistent shell (logo, search, cart, account — §9) is present on **every** page, with no exceptions, including deep product-detail and checkout pages (checkout narrows its *functional* scope per §17 but the shell itself never disappears, so a customer is never navigationally stranded). Beneath the shell, exactly two navigation patterns exist, matching `PRODUCT_BLUEPRINT.md` §7 precisely:

- **Wine & Spirits: mega-menu browse** (§10) — discovery-paced, multi-layer, facet-assisted.
- **Food Central: flat menu-list** (§14) — speed-paced, minimal depth, no mega menu.

No third pattern is introduced for any future category or product line without a logged business decision — two patterns is deliberate, not incomplete. New spirit types, new collections, or new occasions are **data added to the existing patterns** (§11, §12, §28), never a reason to invent a third pattern.

## 6. Desktop Navigation

- **Structure, left to right:** logo (links to Home) → primary navigation (Wine & Spirits, Food Central, plus any additional top-level entries per §11's data-driven tree) → a persistent, always-visible search field (§15, not an icon) → account → cart.
- **Primary navigation items are text labels, not icons** — icon-only primary navigation measurably increases cognitive load for unfamiliar categories, and this platform's primary categories are not universally icon-recognizable (a "Cognac" icon is not self-evident the way a magnifying glass is).
- **Wine & Spirits opens its mega menu on hover, with a click/tap fallback** for touch-capable laptops and any device without reliable hover — hover-only interaction is never the sole trigger (§22).
- **Food Central opens a lightweight dropdown**, not a mega menu, on the same hover/click model — structurally lighter to reinforce the speed-first pacing at the point of entry, not just once a customer is inside it.
- The shell does not visually change based on which branch (Wine & Spirits vs. Food Central) a customer is currently inside — no rebranded sub-header, no palette shift — reinforcing the one-ecosystem requirement (`BUSINESS_RULES.md`).

## 7. Mobile Navigation

Mobile is not a shrunk desktop layout — it is designed first, per `EXPERIENCE_PRINCIPLES.md` #8, and current research on hidden vs. visible navigation directly shapes the pattern chosen here:

- **A pure hamburger-only pattern is rejected.** Sites relying solely on a hidden hamburger menu see materially lower navigation engagement and discoverability than sites with any visible wayfinding — hidden navigation on mobile measurably increases reliance on search as a compensating behavior, and NN/g's research on hamburger menus found the pattern actively hurts UX metrics when it hides content users would otherwise have used (NN/g, "Hamburger Menus and Hidden Navigation Hurt UX Metrics"). Given §1's non-negotiable requirement that browsing and search stay equally first-class, hiding all of navigation behind one icon would silently violate that requirement by design.
- **The adopted pattern is a sticky header plus a persistent, always-visible wayfinding strip, plus a drawer for depth:**
  1. **Sticky header:** logo, a search affordance (§15), cart icon with item count, account icon.
  2. **Immediately beneath the header, a persistent, horizontally-scrollable primary strip** showing the platform's top-level destinations at all times — at minimum "Wine & Spirits" and "Food Central," with equal visual weight, directly protecting §2's equal-prominence requirement even on the smallest viewport. This is the "combo navigation" pattern (a visible primary layer plus a menu for overflow) that current research finds is now more common on mobile than pure hidden navigation specifically because it resolves the discoverability problem without abandoning depth.
  3. **A drawer (opened from a clearly-labeled "Menu" or "All Categories" affordance, not an unlabeled hamburger icon alone)** carries the full category tree depth (§11) and account/support links — this is where genuine navigational depth lives, without that depth crowding the persistent strip above it.
- **Touch targets** throughout mobile navigation meet the 44×44px minimum regardless of visual icon size (`DESIGN_SYSTEM.md` §B8, §B11).
- **The drawer, once open, traps focus and returns it to its trigger on close** (§21, §22) — the same interstitial discipline `02_HOMEPAGE_SPECIFICATION.md` §8.2 already applies to the age gate.

## 8. Footer Navigation

The footer is site-wide chrome, present on every page (its homepage-specific rendering behavior — collapsible accordion groupings on mobile, multi-column on desktop — is already specified in `02_HOMEPAGE_SPECIFICATION.md` §8.9; this section defines its navigational *content* structure, which applies identically wherever the footer appears, not only on the homepage).

- **Content groups:** Shop (a secondary, text-link sitemap of the primary category tree — not a duplicate mega menu, just crawlable links, see §26), Food Central (its own short link group, preserving equal prominence even in the footer), Company/Trust (about, contact, legitimacy content per `PRODUCT_BLUEPRINT.md` §11), Support (delivery policy, returns — subject to the alcohol-return open question in `BUSINESS_RULES.md`), Legal/Compliance.
- **The footer's sitemap-style links exist primarily for crawlability and a secondary wayfinding path** (§26), not as the primary navigation mechanism — a customer relying on the footer to find products indicates the primary navigation and search (§5, §15) underperformed, and that should be treated as a signal worth investigating, not an acceptable normal path.
- Footer navigation is real `<a href>` links throughout, never JavaScript-only click handlers (§21, §26).

## 9. Header Behaviour

- **The header is sticky/fixed on scroll**, on both mobile and desktop — search, cart, and account must never require scrolling back to the top to reach, directly serving the Confident Buyer's need for a one-action path to search (`02_HOMEPAGE_SPECIFICATION.md` §8.1, restated here as the authoritative definition).
- **The header does not shrink, hide-on-scroll-down, or otherwise change shape while scrolling.** A header that disappears or resizes based on scroll direction trades a small vertical-space gain for a predictability loss (`EXPERIENCE_PRINCIPLES.md` #11) and risks layout shift, which directly harms the performance targets in §27 (Cumulative Layout Shift is a measured Core Web Vital).
- **The header renders above all page content in stacking order** but never obscures a currently-focused interactive element — any transient overlay it produces (mega menu, mobile drawer, search suggestions) follows the same overlay discipline as the age gate in `02_HOMEPAGE_SPECIFICATION.md` §8.2 (dimmed background, not a blank one; underlying content remains server-rendered).
- **Cart item count updates immediately** on add-to-cart, without a full page reload, anywhere in the platform.

## 10. Mega Menu Strategy

A mega menu is used **for Wine & Spirits only**, per `PRODUCT_BLUEPRINT.md` §7's explicit decision — Food Central deliberately does not get one (§14). Within that decision, the mega menu itself is built to current usability research and to the restraint principle in §1, not maximized for its own sake:

- **Structure:** 3–4 labeled columns, each with a clear group heading — never an unlabeled wall of links. Mega menus without group headings measurably increase abandonment because visitors cannot quickly identify which section holds what they need (Baymard-derived mega-menu research, cited in Sources).
- **Link budget:** the menu is capped in the range of roughly 30 links total across all columns. Research on large ecommerce mega menus found that menus exceeding this range see a materially higher bounce rate from the navigation area itself, because visitors abandon browsing the menu and default to search instead — the opposite of the parity §1 and §15 require. If the category tree (§11, §28) grows past this budget, the correct response is deeper grouping or an added occasion/collection layer (§12), never simply widening the menu indefinitely.
- **Columns are organized by the formal taxonomy and, within it, by the varietal/style facet groupings** (§11, §13) — e.g. a "Spirits" column grouping Whisky, Cognac, Vodka, Gin, Rum, Tequila, and Liqueurs as sub-links, not each spirit type as its own top-level column. This keeps the menu within budget as the spirit-type list grows (§28) without a redesign.
- **A curated/occasion strip within the mega menu** (e.g. "Gifting," "Sommelier's Picks") surfaces Collections (§12) alongside the formal taxonomy, so a Guided Browser is served in the same interaction as a Confident Buyer, per §3.
- **Small category thumbnails are used sparingly** — one representative image per top-level column, not per link — aiding recognition (a documented mega-menu best practice) without producing a busy, decoration-heavy panel that would violate `EXPERIENCE_PRINCIPLES.md` #3 (Premium Through Discipline).
- **The mega menu is a disclosure panel, not an ARIA `menu` widget** — see §22 for why, and for the exact interaction pattern.

## 11. Product Category Navigation

**The category tree is data, not a hardcoded component.** The navigation renders whatever Product Category structure exists in Medusa at request time, ordered by an admin-configurable position field — adding, renaming, reordering, or retiring a category is a merchandising action, never a code change or a "navigation redesign."

The categories named in this specification's scope — Wines, Champagne, Whisky, Cognac, Vodka, Gin, Rum, Tequila, Liqueurs, Beer, Gift Sets, Accessories, plus Food Central as the second top-level branch — are treated here as **illustrative of the current catalog, not an enumerated, fixed list**. A reasonable default grouping (not a final decision — see the open question already logged in `INFORMATION_ARCHITECTURE.md` and repeated here for navigation specifically) nests most spirit types beneath a "Spirits" parent category and treats Wine, Champagne, Beer, Gift Sets, and Accessories as their own top-level or near-top-level entries, keeping the mega menu within its link budget (§10) as the list grows. The exact grouping is a merchandising decision, not an engineering one, and must not be assumed final by whoever implements this specification.

- **Category pages are real, indexable, deep-linkable URLs** (§20, §26) — never a client-side-only filtered view of a single generic listing page.
- **A category with children shows its immediate children as an in-page sub-navigation** (not only in the mega menu), so a customer who lands on "Spirits" from a search result or an external link can still navigate to "Whisky" without returning to the mega menu.
- **New categories require no navigation code changes** — this is the specification's direct answer to "do not hardcode today's catalog structure" (§28 expands on this as a forward-looking commitment, not just a technical note here).

## 12. Collection Navigation

Collections (occasion/editorial groupings such as "Gifting" or "Sommelier's Picks") are a **second, parallel data source** to the formal category tree (§11), per `INFORMATION_ARCHITECTURE.md`'s three-layer model — never modeled as categories themselves, since a product (e.g. a Cabernet) legitimately belongs to one category and multiple collections at once (e.g. both "Gifting" and "Sommelier's Picks").

- Collections surface in three places, consistently: the mega menu's curated strip (§10), a dedicated Collection landing page (real URL, per §20), and any homepage placement already specified in `02_HOMEPAGE_SPECIFICATION.md` §8.4.
- **The exact set of collections shipped at launch is not decided here** — it is the open merchandising question already logged in `PROJECT_STATUS.md` and `INFORMATION_ARCHITECTURE.md`. This specification defines how collections are navigated, not which ones exist.
- A Collection page uses the same product-card grid pattern as a Category page (§11) — one shared listing pattern serving two different data sources, not two different UI systems (`04_PRODUCT_LISTING_SPECIFICATION.md` owns the listing page itself; this document owns how a customer arrives at it).

## 13. Wine Discovery Navigation

This is where `INFORMATION_ARCHITECTURE.md`'s three simultaneous layers become a navigable experience, serving the Guided Browser specifically without penalizing the Confident Buyer:

1. **Formal taxonomy** (§11) — for a customer who already knows the category they want.
2. **Varietal/style facets** — surfaced as in-page filters on a Category or Collection page (grape variety, spirit type, region, vintage, price, ABV — from the `wine-details` module, `MEDUSA_EXTENSIONS.md` #1), not a separate navigation tree. A customer narrows within whatever category or collection they've already entered, rather than needing to guess the right facet combination from the mega menu itself.
3. **Occasion/curation** (§12) — for a customer with no formal-taxonomy starting point at all.
4. **"Pairs with" cross-links** on a product detail page — a lightweight, editorially-curated wine-to-dish (or wine-to-wine) relationship that lets a Guided Browser continue discovery without returning to the mega menu. The backend relationship this needs does not yet exist (flagged in `02_HOMEPAGE_SPECIFICATION.md` §8.6 and in this document's §4 table) — this section specifies the *navigation behavior* once it does; the data model itself is `MEDUSA_EXTENSIONS.md`'s open item, not this document's.

**Mobile-specific requirement:** facet filters (layer 2) open as a full-viewport or bottom-sheet panel on mobile, applied on explicit confirmation rather than live-updating on every tap — live-updating results while a filter panel is still open on a small viewport is a documented source of confusion and perceived slowness (`DESIGN_SYSTEM.md` §B9's "validate on confirm, not every keystroke" principle, applied here to filters rather than form fields).

## 14. Food Central Navigation

Deliberately the simplest navigation surface on the platform, matching `INFORMATION_ARCHITECTURE.md`'s "menu-like, not catalog-like" description and current food-delivery UX research, which consistently finds that speed to the right menu item — not exploratory depth — is what a food-ordering navigation succeeds or fails on.

- **Structure: Today's Menu, Scheduled Orders, Pickup** — three destinations, no deeper formal taxonomy layer beneath them at launch. Whether Today's Menu itself needs a further subdivision (e.g. by meal type) is an open question once real menu size is known (`INFORMATION_ARCHITECTURE.md`), not decided here.
- **No mega menu, no multi-layer facet system** (§10, §13 do not apply here) — a lightweight dropdown from the primary navigation (§6) or the mobile wayfinding strip (§7) is sufficient and intentional.
- **Within Today's Menu, category chips (e.g. cuisine or meal-type groupings, once the menu is large enough to need them) are a flat, single-tap filter row**, not a nested tree — consistent with food-delivery navigation research favoring simple, single-tap category filters over deep hierarchy for exactly this speed-first use case.
- **A same-day cutoff or availability indicator is visible at the navigation/listing level**, not only after a dish is selected (`02_HOMEPAGE_SPECIFICATION.md` §8.5 already establishes this for the homepage spotlight; this section confirms it applies to the full Food Central listing navigation as well).
- **Transition from Wine & Spirits into Food Central is one tap/click away at all times** via the primary navigation (§6) or the persistent mobile strip (§7) — never nested inside a generic "More" or "Other" menu, which would silently violate the equal-prominence requirement (§2).

## 15. Search Entry Points

Search is the platform's other first-class product-finding mechanism, per §1, and its entry point is defined here; the results experience itself (facets, ranking, empty/error states within results) belongs to `03_SEARCH_SPECIFICATION.md`.

- **The search field is a visible text input in the header, not an icon that must be tapped to reveal one, on desktop.** Baymard's research is specific on this point: the visual prominence of the search field itself shifts what share of visitors choose to search vs. browse — a muted or icon-only field silently suppresses search usage regardless of underlying capability.
- **On mobile, a persistent, tappable search affordance sits in the header at all times** (§7); given mobile header space constraints, this may render as an icon that expands to a full-viewport input on tap, provided the tap target is unambiguous and immediately available without opening the drawer first — search must never be nested inside the mobile drawer's depth.
- **Search-within-current-category is supported** — a customer already inside "Whisky" and searching should be able to search within that context rather than being silently returned to a whole-catalog result set. Baymard's mobile ecommerce research found the large majority of sites fail to offer this; supporting it here is a deliberate differentiator, not an assumed default.
- **Search results are clearly labeled by product line** (Wine & Spirits vs. Food Central) whenever a query plausibly returns both, per `PRODUCT_BLUEPRINT.md` §8 — a customer should never be confused about which catalog a given result belongs to.
- **Search is reachable in one action from every page**, including deep category, product-detail, and Food Central pages — this is the concrete fulfillment of §1's "equally first-class" commitment, and is independently required by `02_HOMEPAGE_SPECIFICATION.md`'s J5 journey.

## 16. Account Navigation

- **Structure:** Order history (spanning both product lines in one list, not two separate histories — `PRODUCT_BLUEPRINT.md` §4), saved addresses, account details, logout.
- **Guest state:** the account icon/menu offers sign-in/create-account, never a forced gate — guest checkout remains fully supported throughout (`BUSINESS_RULES.md`); the account menu is an invitation, not a requirement, anywhere in navigation.
- **Logged-in state:** the account icon reflects logged-in status at a glance (e.g. a filled vs. outline icon state, or an initial), so a returning customer doesn't need to open the menu just to confirm they're signed in.
- **Reorder access lives in two places by design:** a lightweight shortcut on the homepage for logged-in returning customers (`02_HOMEPAGE_SPECIFICATION.md` §8.8) and the full order history inside Account navigation — the two are not redundant, they serve the fast path and the complete path respectively.

## 17. Cart & Checkout Navigation Rules

- **The cart icon in the header opens a lightweight cart preview (drawer or dropdown) by default**, with a clear path to the full cart page — a customer adding one more item should not be forced through a full page navigation just to confirm what's already in the cart.
- **The cart persists across the entire session and across both product lines** — adding a Food Central dish does not create a second cart or clear an existing Wine & Spirits cart, per `PRODUCT_BLUEPRINT.md` §9's one-cart, one-checkout decision. Mixed-cart delivery clarity itself (separate delivery promises per line item) is `07_CHECKOUT_SPECIFICATION.md`'s concern, not navigation's — this document only guarantees the cart is reachable and singular.
- **Checkout navigation is linear and forward-committing**: a customer may navigate backward through completed checkout steps to review or correct information, but may not skip ahead to a step whose prerequisites (e.g. delivery method) aren't yet resolved. This is a navigation-flow rule, not a UI rule — the exact steps themselves belong to `07_CHECKOUT_SPECIFICATION.md`.
- **The persistent shell's primary navigation (mega menu, category links) remains reachable during checkout**, so a customer who wants to keep shopping isn't trapped — but leaving checkout to browse must not silently discard checkout progress; the cart and any entered checkout information persist on return.
- **No navigation element inside checkout introduces a new discovery surface** (no mega menu opening mid-checkout, no upsell navigation competing with completing the purchase) — checkout is where navigation deliberately narrows in service of `EXPERIENCE_PRINCIPLES.md` #7 (Every Page Should Move Customers Forward).

## 18. Breadcrumb Strategy

- **Breadcrumbs show hierarchical location, not browsing history** — per NN/g's breadcrumb guidelines, a breadcrumb trail reflects where a page sits in the site's structure (e.g. Home › Wine & Spirits › Spirits › Whisky), regardless of the actual path a customer took to arrive there.
- **Shown on:** category pages, collection pages, and product detail pages (any page with genuine hierarchical depth). **Not shown on:** the homepage, cart, checkout, or Food Central's flat structure, where a breadcrumb would either be trivial (Home › Food Central) or actively unwanted mid-checkout (§17).
- **Desktop shows the full trail; mobile may truncate to the immediate parent plus current page**, expandable to the full trail on request — full-trail-on-desktop, truncate-with-access-to-full-on-mobile is the documented pattern balancing mobile space constraints against not silently hiding structure.
- **Every breadcrumb segment except the current page is a real, clickable link**; the current page segment is marked `aria-current="location"` and is not itself a link (§21).
- **Breadcrumbs are wrapped in a `<nav>` landmark** with an accessible label (e.g. "Breadcrumb"), distinguishing them from the primary navigation landmark for screen-reader users (§21).
- Breadcrumb trails are eligible for `BreadcrumbList` structured data (§26).

## 19. Internal Linking Strategy

- **Every category, collection, and product is reachable by at least one crawlable text link from within the site's navigable structure** — the mega menu, footer sitemap (§8), category sub-navigation (§11), and "pairs with" cross-links (§13) together ensure no page is orphaned (§26, §28's "no orphaned pages" is the SEO-facing restatement of this rule).
- **Cross-sell links between Wine & Spirits and Food Central** — the "pairs with" mechanism (§13, §14) and the homepage's "Wine & Food, Connected" section (`02_HOMEPAGE_SPECIFICATION.md` §8.6) are the two sanctioned internal-linking mechanisms for reinforcing `EXPERIENCE_PRINCIPLES.md` #10 (Food and Wine Should Feel Connected). No other page invents its own ad hoc cross-sell mechanism — new cross-linking needs route through these two existing mechanisms, or through a logged decision to add a third.
- **Related-product links on a product detail page** (same category, same collection) are the responsibility of `05_PRODUCT_DETAILS_SPECIFICATION.md`; this document only establishes that they must be real links participating in the same crawlability/deep-linking rules as everything else here (§20, §26).

## 20. Deep Linking

- **Every navigable state is reachable by a unique, shareable URL** — every category, every collection, every product, and every applied facet/filter combination on a listing page reflects its state in the URL (query parameters for filters, not client-only state) so a customer can share, bookmark, or reload a filtered view and land back exactly where they were.
- **No navigation state is trapped in client-side memory alone.** A mega-menu selection, a facet filter, or a search-within-category query must all be representable in a URL, both for the customer's own bookmarking/sharing and for §26's crawlability requirement.
- **Deep-linked URLs are server-rendered with meaningful content**, not a client-side shell that only populates after JavaScript executes — directly serving both §26 (SEO) and §27 (performance) simultaneously, the same principle `02_HOMEPAGE_SPECIFICATION.md` §15 already applies to the homepage.
- **A URL structure itself (exact paths, slugs) is an implementation decision left to `ARCHITECTURE.md`/`API_DECISIONS.md`** — this document establishes the *principle* that deep linking must work everywhere, not the exact URL scheme.

## 21. Accessibility Requirements

Navigation is the highest-traffic accessibility surface on the platform — nearly every page interaction begins with it. `BUSINESS_RULES.md` and `PRODUCT_BLUEPRINT.md` §15 treat accessibility as a launch requirement, not a follow-up, and that applies to navigation with no exceptions:

- **Semantic HTML first.** Primary navigation, mega menu, mobile drawer, footer links, and breadcrumbs are built from real `<nav>`, `<ul>`, `<li>`, and `<a>` elements — never `<div>`-based fake controls styled to look like links, and never ARIA roles substituting for the native semantics that already exist (§22 explains why this matters specifically for the mega menu).
- **A "skip to main content" link precedes the header in tab order** (`02_HOMEPAGE_SPECIFICATION.md` §8.1, restated here as the navigation-wide rule, not homepage-specific).
- **Every navigation landmark is labeled distinctly** (primary navigation, breadcrumb navigation, footer navigation each get their own accessible name) so screen-reader users can jump directly to the one they need rather than parsing all navigation as one undifferentiated region.
- **The current page/section is programmatically indicated**, not conveyed by color alone — `aria-current="page"` on the active primary-navigation item, `aria-current="location"` on the current breadcrumb segment (§18), consistent with `BRAND_IDENTITY.md`'s never-color-alone rule already established for the homepage.
- **All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly** — no navigation-specific exceptions, matching `02_HOMEPAGE_SPECIFICATION.md` §16's own rule for the homepage.
- **The mobile drawer and mega menu, when open, trap focus and return it to their trigger element on close**, and are announced appropriately to assistive technology as expandable/collapsible regions (§9, §22).

## 22. Keyboard Navigation

- **Every navigation element is reachable and operable by keyboard alone**, with a visible focus state at every step (`DESIGN_SYSTEM.md`'s Focus token) — no exceptions for the mega menu, mobile drawer, or search suggestions.
- **The mega menu and Food Central dropdown are built as a disclosure pattern (a trigger with `aria-expanded`, controlling a panel of ordinary links), not as an ARIA `menu`/`menuitem` widget.** This is a deliberate, research-grounded choice: ARIA's `menu` role and its associated arrow-key interaction model are designed for application-style menus (a File/Edit/View menu bar), not standard site navigation, and applying them to ordinary site links is a documented source of confusion for assistive-technology users expecting normal link behavior, per current WAI-ARIA Authoring Practices guidance. Native `<nav>`/`<ul>`/`<a>` elements, disclosed via a labeled, `aria-expanded`-carrying trigger, are simpler, more predictable, and more accessible by default.
- **Interaction model for the disclosure pattern**, consistent with WAI-ARIA APG guidance for disclosure widgets:
  - `Enter`/`Space` on the trigger toggles the panel and updates `aria-expanded`.
  - `Tab` moves through the panel's links in visual order once open, same as any other set of links.
  - `Escape` closes an open panel and returns focus to its trigger.
  - Panel links are not focusable while their panel is closed (no silent tab-stops into hidden content).
- **The mobile drawer follows the same model**: a labeled trigger, `aria-expanded`, `Escape`-to-close, focus trapped within the drawer while open, focus returned to the trigger on close (§7, §21).
- **Breadcrumb and footer links require no special keyboard handling** beyond standard link behavior — they are not disclosure widgets and should not be engineered as if they were.

## 23. Responsive Behaviour

Tied directly to `DESIGN_SYSTEM.md` §B7's breakpoint tokens — no navigation-specific breakpoints are introduced:

| Breakpoint | Primary navigation pattern |
|---|---|
| `base`–`sm` (0–767px) | Sticky header + persistent wayfinding strip + drawer for depth (§7); search as an expandable header affordance; breadcrumbs truncated (§18). |
| `md` (768–1023px) | Transitional — sticky header with the wayfinding strip may remain, or the primary navigation may begin appearing inline depending on available width; the drawer remains available for anything that doesn't fit. Exact behavior at this breakpoint is left to implementation judgment within the mobile/desktop patterns already defined, not a third pattern. |
| `lg`–`2xl` (1024px+) | Full desktop pattern (§6): inline primary navigation, visible search field, mega menu on hover/click. |

No navigation pattern requires horizontal scrolling to access a core destination at any breakpoint, except the deliberately-scrollable mobile wayfinding strip (§7) and horizontally-scrollable collection shelves already specified in `02_HOMEPAGE_SPECIFICATION.md` §8.4 — both are intentional, affordance-signaled scroll regions, not an accidental overflow.

## 24. Empty & Error Navigation States

- **A category with zero currently-available products** does not disappear from navigation (which would look like a broken link) and does not render a blank listing page — it shows a clear "nothing available right now" state with a link back to a sibling category or the relevant Collection, mirroring the graceful-fallback discipline `02_HOMEPAGE_SPECIFICATION.md` §19 already establishes for the homepage.
- **A category or collection referenced by navigation but deleted/renamed on the backend** must not produce a broken link — navigation is rendered from live backend data (§11), so this failure mode should not occur in practice, but any stale cache must fail toward a graceful "category not found, here's where to go instead" page, never a raw 404 with no path forward.
- **Food Central navigation when the kitchen is closed** — the Today's Menu entry remains visible and clickable (never removed from navigation), leading to the same "not currently taking orders, here's the next opening time" state already specified in `02_HOMEPAGE_SPECIFICATION.md` §19, so a customer isn't confused about whether Food Central exists at all.
- **Search entry point when the search backend (Meilisearch) is unreachable** — the search field remains visible and submittable (never hidden or disabled, which would silently break §1's parity commitment); a failed query shows a plain-language message and a path back into category navigation, never a blank page or a raw error.
- **The mega menu or mobile drawer failing to load its data** (e.g. a category-tree fetch failure) falls back to a minimal, hardcoded "Wine & Spirits / Food Central" top-level pair — the two structural branches that `BUSINESS_RULES.md` guarantees will always exist — rather than an empty or broken menu with no way to navigate at all. This is the one place a small hardcoded fallback is correct: it is a last-resort safety net, not the primary mechanism (§11, §28).

## 25. Analytics Events

- `primary_nav_item_clicked` (value: category/branch name)
- `mega_menu_opened` / `mega_menu_closed` (value: `wine_spirits` or `food_central`)
- `mobile_drawer_opened` / `mobile_drawer_closed`
- `category_selected` (value: category path/slug)
- `collection_selected` (value: collection name)
- `facet_applied` (value: facet type + value) — wine discovery only (§13)
- `search_initiated` (value: originating surface — header, category page, etc.; complements `search_initiated_from_header` already defined in `02_HOMEPAGE_SPECIFICATION.md` §18)
- `search_within_category_used`
- `breadcrumb_clicked` (value: breadcrumb depth/segment)
- `pairs_with_link_clicked`
- `cart_icon_clicked` / `cart_preview_opened`
- `account_menu_opened`
- `footer_link_clicked` (value: link identifier — already defined in `02_HOMEPAGE_SPECIFICATION.md` §18, confirmed as the platform-wide event, not homepage-specific)

Each ties back to §2's business objectives — time-to-product for a Confident Buyer, for instance, can be derived from the gap between page load and the first of `search_initiated`, `category_selected`, or `collection_selected`.

## 26. SEO Considerations

- **Every navigation link is a real, crawlable `<a href>`** — no JavaScript-only click handlers standing in for navigation, in the mega menu, mobile drawer, or footer (§21 requires this for accessibility; it is equally required here for crawlability, and the two requirements reinforce rather than compete with each other).
- **Category and collection pages resolve to indexable, canonical URLs** (§20) — search-engine visibility for "buy [spirit type] Nigeria"-style queries depends directly on this, and is a genuine acquisition channel this platform has not yet had to build, unlike a marketplace aggregator competing on the same terms.
- **Faceted wine-discovery URLs (§13) require deliberate canonicalization** — without it, the combinatorial explosion of filter combinations (region × vintage × price, etc.) risks being crawled as near-duplicate content, diluting rather than helping search visibility. The specific mechanism (canonical tags, selective `noindex` on deep facet combinations, or a curated indexable subset) is an implementation decision for whoever builds `03_SEARCH_SPECIFICATION.md`/`04_PRODUCT_LISTING_SPECIFICATION.md`, but the requirement that *someone* solves this deliberately, rather than indexing every filter permutation by default, is established here.
- **Breadcrumb trails carry `BreadcrumbList` structured data** (§18), giving search engines an explicit signal of site hierarchy independent of crawling it.
- **The footer's sitemap-style links (§8) exist partly as an SEO safety net** — ensuring every category has at least one additional crawlable path to it beyond the mega menu, which some crawlers render less reliably than plain links.
- **No page in the navigable structure is orphaned** — reachable by zero internal links — since an orphaned page is effectively invisible to both customers and search engines alike (§19).

## 27. Performance Considerations

- **The header/shell must not be a source of layout shift** (§9) — its dimensions are stable and known before content loads, protecting Cumulative Layout Shift, one of the Core Web Vitals `02_HOMEPAGE_SPECIFICATION.md` §17 already treats as a conversion metric, not just an engineering one.
- **The mega menu's content loads without blocking the page's initial render** — the category tree can be fetched and cached aggressively (it changes on a merchandising cadence, not per-request), and the mega menu itself should not be part of the page's Largest Contentful Paint calculation.
- **The mobile drawer and mega menu panels lazy-render their contents** (not constructed in the DOM until first opened, or at minimum not part of the critical rendering path) — consistent with `02_HOMEPAGE_SPECIFICATION.md` §17's lazy-loading approach for below-the-fold sections, applied here to off-screen/closed navigation panels.
- **Category thumbnails in the mega menu (§10) are optimized and appropriately sized** — the same imagery-performance discipline `02_HOMEPAGE_SPECIFICATION.md` §17 applies to the hero image applies here, at smaller scale.
- **Search suggestions (§15) are debounced**, not fired on every keystroke, to avoid excessive backend load and to keep the interaction feeling responsive rather than laggy under real network conditions.
- Navigation itself is held to the platform-wide performance bar (`PRODUCT_BLUEPRINT.md` §16), with no navigation-specific relaxation of the LCP/CLS targets `02_HOMEPAGE_SPECIFICATION.md` §17 already establishes.

**Maximum acceptable navigation depth.** No product may sit more than three navigational levels beneath a root branch — branch → category → subcategory — before reaching a listing or product page (e.g. Wine & Spirits → Spirits → Whisky is the maximum depth; a fourth forced level is not permitted without a logged decision revisiting this budget). This is a complexity budget in service of `EXPERIENCE_PRINCIPLES.md` #12 (Reduce Cognitive Load), not a claim that a specific click count itself drives conversion — that stronger claim is not asserted here, deliberately, since it is not something this specification's research base actually established. Facets (§13) narrow *within* a level and do not count against this depth budget, since they are applied, not navigated through.

**Expected interaction latency.** Navigation interactions reuse `DESIGN_SYSTEM.md` §B10's existing motion tokens rather than inventing new timing values: opening/closing the mega menu or mobile drawer targets `motion-entrance`/`motion-exit` (200–350ms, already defined); hover/press feedback on any navigation control targets `motion-micro` (100–150ms). Search suggestions (debounced per above) should return and render within a window that still reads as instant — target under 300ms from the debounced query firing to suggestions appearing, beyond which a customer perceives lag rather than responsiveness. A full category or collection page navigation is a real page load and is held to the same LCP target `02_HOMEPAGE_SPECIFICATION.md` §17 already sets platform-wide (under 2.5 seconds at the 75th percentile on mobile) — navigation does not get a separate, looser budget for landing on a new page.

**Graceful degradation, in tiers, when backend data is unavailable.** This extends §24's empty/error states with the performance-specific ordering between them: (1) serve the category tree from cache — a brief staleness (a just-added category not yet visible) is preferred over a blocking live fetch on every request, since the tree changes on a merchandising cadence, not per-request; (2) if even a cached tree is unavailable, fail to §24's hardcoded two-branch fallback (Wine & Spirits / Food Central) rather than a blank or broken menu; (3) never let a navigation-data failure block or delay rendering of the page content beneath it — the shell degrades independently of the page it sits above, the same independence principle `02_HOMEPAGE_SPECIFICATION.md` §21 already applies to homepage sections.

## 28. Future Expansion Strategy

This section is the specification's direct answer to "navigation should support today's product while remaining scalable for future growth":

- **New categories, subcategories, and spirit types require zero navigation code changes** — they are Product Category records with a position value (§11); the mega menu's column grouping (§10) absorbs new entries automatically up to its link budget, at which point a merchandising decision (deeper grouping, or a new column) — not an engineering one — resolves it.
- **New collections require zero navigation code changes** — they are Product Collection records (§12), surfaced through the same mega-menu curated strip and Collection-page pattern already built for the first collection shipped.
- **A future third product line** (hypothetical — nothing here commits to one) would extend this document's pattern-selection logic (§5) — a new top-level branch choosing between the mega-menu and flat-list pattern, or genuinely warranting a third pattern, which would itself need a logged decision — rather than requiring this specification to be rewritten from scratch.
- **Personalization** (facet defaults, recently-viewed shortcuts in navigation, location-aware Food Central defaults) is explicitly deferred, matching `02_HOMEPAGE_SPECIFICATION.md` §14's platform-wide personalization deferral — none of it is assumed or designed against here, and none of it is blocked by anything in this specification.
- **Native mobile app navigation parity** is sequenced per `ROADMAP.md` Phase 8, once the web storefront's navigation patterns are proven — this document's shell/pattern decisions (not its exact HTML/ARIA implementation) are the reference for that future parity work, not something to be redesigned independently later.
- **Multi-region/multi-currency or multi-language navigation** is out of scope — `PRODUCT_BLUEPRINT.md` §18 already assumes single-region, single-currency for v1, and this document does not design against a future it isn't yet committed to.

**Demonstrating the architecture's reach, without committing to any of it.** None of the following is authorized, scoped, or planned work — `PRODUCT_BLUEPRINT.md` names none of them. They exist here only to show that this specification's mechanisms (the two-pattern model in §5, data-driven categories in §11, Collections in §12) already have an answer for plausible future growth, the same way `DESIGN_SYSTEM.md`'s "Future Theme Support" documents a capability without building it:

| Possible future addition | How the existing architecture would absorb it |
|---|---|
| Additional product categories or spirit types | Category tree (§11) — zero navigation redesign, already the primary case this document designs for. |
| A new service (e.g. sommelier consultation, corporate accounts) | A new top-level or account-adjacent destination, choosing between the two existing patterns per §5's logic — not a third pattern by default. |
| Subscriptions | Most naturally an Account navigation destination (§16) for management, with a discovery-style entry point if merchandised as its own offering — a pattern choice per §5, not a new mechanism. |
| Educational content (e.g. wine education, tasting guides) | An editorial Collection-like destination (§12), most plausibly CMS-fed once `MEDUSA_EXTENSIONS.md` #7 is approved — not a new navigation structure. |
| Events (e.g. tastings, in-person activations) | A content-driven destination, likely footer-adjacent or a lightweight top-level entry — the same mechanism as educational content above. |
| Corporate gifting | A specialized Collection (§12) plus a dedicated informational page — the same mechanism already serving consumer "Gifting," scaled up, not a parallel system. |
| A genuinely new business line | The only case that would need §5's full pattern-selection decision exercised again — and, if neither existing pattern fits, a third pattern, which requires a logged `DECISION_LOG.md` entry, not a silent addition. |

The pattern across every row but the last: growth is absorbed by **adding data to existing mechanisms**, not by redesigning navigation. Only a genuinely new top-level customer intent — not just a new category or content type — would ever require revisiting §5 itself.

## 29. Risks & Assumptions

**Risks:**

- **The exact category grouping (which spirit types nest under "Spirits," which stand alone) is not decided** — §11 proposes a reasonable default to stay within the mega menu's link budget, but this is a merchandising decision that must be confirmed, not assumed final, before implementation.
- **The mega menu's link budget (§10) could be exceeded** if the catalog grows faster than the grouping strategy accounts for — the mitigation (deeper grouping via §11's data-driven tree) is named, but requires active merchandising discipline, not just an architectural allowance.
- **The "pairs with" relationship data does not yet exist** (§4, §13, §14, §19) — this is the same gap already flagged in `02_HOMEPAGE_SPECIFICATION.md` §24, repeated here because navigation depends on it in three separate places, not just the homepage's single pairing moment.
- **The `md` breakpoint's exact pattern (§23) is left to implementation judgment** within the boundaries this document sets — a genuinely ambiguous transitional zone between the mobile and desktop patterns, worth validating with real usability testing once built rather than over-specifying here without evidence.
- **Faceted-URL canonicalization (§26) is named as a requirement without a chosen mechanism** — deferring the specific technique to implementation is appropriate, but the risk of it being skipped entirely (defaulting to indexing every filter permutation) should be treated as a real risk, not a hypothetical one, given how common that failure mode is industry-wide.

**Assumptions:**

- The Next.js Starter storefront (`TECH_STACK.md`) is the implementation target, making server-rendered, crawlable navigation (§20, §26) achievable as described.
- Meilisearch (`MEDUSA_EXTENSIONS.md` #6) powers both the search entry point referenced here (§15) and the facets referenced in §13, pending its formal approval.
- Medusa's native Product Category and Collection structures are sufficient for the entire navigation data model (§4, §11, §12) with no custom module required — confirmed by `INFORMATION_ARCHITECTURE.md` and `PRODUCT_CATALOG.md`, and not re-litigated here.
- No third top-level navigation pattern is needed at launch beyond the two named in §5 — an assumption inherited directly from `PRODUCT_BLUEPRINT.md` §7 and not independently re-derived here.

## 30. Acceptance Criteria

- [ ] The persistent shell (logo, search, cart, account) renders identically in structure and behavior on every page type tested (homepage, category, collection, product detail, Food Central, cart, checkout).
- [ ] Wine & Spirits and Food Central are both reachable within one tap/click from the primary navigation on every breakpoint, with equal visual weight.
- [ ] The Wine & Spirits mega menu contains group headings on every column and stays within its defined link budget.
- [ ] Food Central's navigation entry does not render a mega menu under any configuration.
- [ ] The search field is a visible text input (not icon-only) in the desktop header, and is reachable within one tap on mobile without opening the drawer first.
- [ ] Search-within-current-category returns results scoped to that category when invoked from within a category page.
- [ ] Every category and collection page has a real, unique, server-rendered URL that can be reloaded or shared and returns to the same state, including any applied facet filters.
- [ ] No primary navigation, mega menu, mobile drawer, breadcrumb, or footer link is implemented as a non-`<a>` element or a JavaScript-only click handler.
- [ ] Every interactive navigation element is operable by keyboard alone, with a visible focus state, and the mega menu/mobile drawer are built as disclosure patterns (not ARIA `menu` widgets).
- [ ] The mega menu and mobile drawer trap focus while open and return focus to their trigger on close, and are closable via `Escape`.
- [ ] Breadcrumbs appear on category, collection, and product detail pages, reflect hierarchical location (not history), and are absent from the homepage, cart, and checkout.
- [ ] The current page/section is indicated via `aria-current`, not color alone, in both primary navigation and breadcrumbs.
- [ ] A category with zero available products, a closed Food Central kitchen, and an unreachable search backend each degrade to a defined graceful state — never a blank page or broken link.
- [ ] The header introduces no measurable Cumulative Layout Shift, and the mega menu/mobile drawer do not block the page's Largest Contentful Paint.
- [ ] All navigation analytics events listed in §25 fire correctly and exactly once per corresponding user action.
- [ ] Adding a new Product Category or Collection in the backend causes it to appear in the relevant navigation surface without any code change, verified by adding a test category/collection and confirming its appearance.

---

# Navigation Governance

Everything above establishes *what* navigation does; this section establishes *who is allowed to change it, and how* — the direct answer to "navigation should evolve without unnecessary code changes." The organizing rule: **navigation's structure is developer-governed and changes only through a reviewed update to this specification; navigation's content is data and is merchandising/marketing-governed through the backend admin, requiring no code deploy.** Every element below is classified against that line.

| Navigation element | Generated from data, or manually curated? | Who controls it | Developer involvement required? |
|---|---|---|---|
| Shell structure (logo, header layout, search/cart/account placement — §6, §9) | Structural, not data | Engineering, against `DESIGN_SYSTEM.md` and this specification | Yes — any change is a specification update, not a config change |
| Two-pattern model (mega menu vs. flat list — §5, §10, §14) | Structural | Engineering/Product, per `PRODUCT_BLUEPRINT.md` §7 | Yes — introducing a third pattern requires a logged `DECISION_LOG.md` decision (§28) |
| Category tree contents (which categories exist, their names, nesting, order — §11) | **Data-driven, fully** | Merchandising, via the Medusa admin | **No** |
| Category *grouping rule* within the mega menu (e.g. which spirit types nest under "Spirits" — §10, §11) | Data-driven within a developer-set link budget | Merchandising proposes; the link budget itself (§10) is an engineering/architecture constraint | No, as long as the grouping stays within the existing budget; yes if the budget itself needs to change |
| Collections — evergreen (e.g. "Sommelier's Picks" — §12) | **Data-driven, fully** | Merchandising, via the Medusa admin | **No** |
| Collections — promotional/time-boxed (seasonal, limited-time — see Merchandising Strategy below) | **Data-driven, fully**, including automatic expiry | Marketing, via the Medusa admin, within the caps this document sets | **No**, provided the mechanism (start/end-dated Collections) is already built |
| "New Arrivals"-style automatic collections | Fully automatic (query-generated, not curated) | No ongoing human control needed once configured | Yes, once, to configure the query; no involvement afterward |
| Wine facets — which attribute fields exist (§13) | Schema, not data | Engineering, via the `wine-details`/`food-details` modules (`MEDUSA_EXTENSIONS.md`) | Yes — a new facet field is a module schema change |
| Wine facets — which existing facets are surfaced/prioritized on a given category | Configuration over an existing schema | Merchandising/Product | No, once the schema itself supports the field |
| Footer sitemap links (§8) | Auto-generated from category/collection data | Merchandising (content), Engineering (structure) | No for content; yes only if the footer's structural groupings themselves change |
| Footer legal/compliance links (§8) | Manually curated | Legal/Compliance, with Business sign-off | Typically yes, given the compliance sensitivity of getting this wrong |
| Breadcrumbs (§18) | Fully automatic, derived from category hierarchy | No manual control — a direct function of §11's data | No |
| Search entry point behavior (§15) | Structural | Engineering | Yes — this is shell behavior, not content |
| Account/cart navigation structure (§16, §17) | Structural | Engineering | Yes |
| Accessibility/keyboard mechanics (§21, §22) | Structural | Engineering | Yes — never a content-team lever |

**Why this table exists:** without an explicit answer to "who can change this without a developer," navigation risk defaults toward one of two failure modes — either merchandising/marketing routes every small content change through engineering (slowing the business down for no structural reason), or content changes bypass this specification entirely (letting navigation drift out of the disciplined, research-grounded shape defined above). This table is how both are avoided at once.

# Merchandising Strategy

Navigation must support merchandising — featured collections, seasonal campaigns, limited-time promotions, gifting occasions, editorial destinations, new arrivals, premium selections — **without compromising the usability and restraint principles this document is built on** (§1, `EXPERIENCE_PRINCIPLES.md` #3 Premium Through Discipline). The mechanism for this is not new: it is Collections (§12), used under a stricter set of rules than a permanent, evergreen Collection needs.

**The core rule: promotional content is an optional layer, never permanent structural navigation.** Concretely:

- **Promotional/campaign Collections surface only in the mega menu's curated strip (§10) or a clearly-bounded "Featured" entry point** — never as new formal-taxonomy columns (§11), and never by displacing an existing category. The formal taxonomy is permanent; the promotional layer sits beside it, never inside it.
- **A hard cap on simultaneously-featured promotional entries** — no more than 3–4 at any time, the same discipline §10 already applies to the mega menu's link budget. A merchandising team wanting to feature a fifth item retires one of the current four; the cap is not negotiable per-campaign, because an uncapped promotional layer is exactly how a restrained mega menu (§10) erodes into a cluttered one over time.
- **Every promotional Collection carries a start and end date, enforced by data.** A seasonal or limited-time entry disappears from navigation automatically when it expires — this is a governance point (see the table above: no developer or manual cleanup step required) as much as a merchandising one, and it is the direct mechanism that prevents a stale "Valentine's Gifting" entry from still being live in July.
- **No fake urgency.** A countdown, a "only X left," or any other artificial scarcity device applied to a promotional navigation entry is explicitly against `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions) and is not sanctioned by this specification — a time-boxed promotion may say when it ends; it may not manufacture pressure beyond that fact.
- **Mapped examples**, none of which require a new mechanism beyond Collections (§12) and the rules above:
  - *Featured collections, premium selections* (e.g. "Sommelier's Picks") — an evergreen, non-expiring Collection; merchandising-curated.
  - *Seasonal campaigns, limited-time promotions* — a start/end-dated Collection under the cap above.
  - *Gifting occasions* — the existing "Gifting" Collection already named throughout `INFORMATION_ARCHITECTURE.md`; may run evergreen or seasonally spun (e.g. a Valentine's-specific gifting entry) within the same rules.
  - *New arrivals* — the one case that is fully automatic rather than curated (a query-generated Collection, e.g. "products added in the last N days") — no ongoing merchandising action required once configured, per the Governance table above.
  - *Editorial destinations* — content-led, most plausibly CMS-fed once `MEDUSA_EXTENSIONS.md` #7 (Sanity) is approved; not built now, and named here only to confirm it fits the same promotional-layer treatment rather than requiring a new navigation mechanism when it arrives.
- **Visual treatment is `DESIGN_SYSTEM.md`'s responsibility, not this document's** — but the architectural point stands regardless of visual execution: a promotional entry must always be structurally distinguishable from permanent taxonomy, so removing one on expiry never leaves a gap, broken link, or orphaned page (§19, §26) behind it.

# Navigation Quality Checklist

Every future navigation change — a new category, a new promotional Collection, a new interaction pattern, a modification to the shell — must be able to answer **yes** to all of the following before it's considered complete, the same discipline `DESIGN_SYSTEM.md`'s own Design Quality Checklist applies to components:

- [ ] **Does it reduce customer effort?** Measured against §2's business objectives and §3's customer objectives, not assumed.
- [ ] **Does it improve discoverability?** Or does it quietly bury something a customer needs behind an extra step (§1, §7)?
- [ ] **Does it preserve consistency?** The shell behaves identically wherever it appears (§1, §9); a change confined to one page that the shell doesn't reflect elsewhere is a red flag, not a shortcut.
- [ ] **Does it remain accessible?** Semantic HTML, keyboard operability, and the disclosure-pattern discipline (§21, §22) hold with no exceptions carved out for the new change.
- [ ] **Does it support mobile-first behaviour?** Designed and tested at the smallest breakpoint first (§7, §23), not shrunk down from a desktop-first design.
- [ ] **Does it avoid unnecessary complexity?** A change that adds a navigational layer, a new pattern, or a new column without a demonstrated need is a violation of §1's restraint principle, not a neutral addition.
- [ ] **Does it support merchandising without becoming advertising?** Checked against the Merchandising Strategy's cap, expiry, and no-fake-urgency rules above — a promotional entry that ignores any of the three has failed this check regardless of its business intent.
- [ ] **Does it remain scalable?** Can it be added, changed, or removed as data (per the Governance table above), or does it require a code change for what should be a content decision (§28)?
- [ ] **Does it preserve equal prominence between Wine & Spirits and Food Central?** (§2, `BUSINESS_RULES.md`) — no change may make either line read as primary and the other as an afterthought.
- [ ] **Does it stay within the two established patterns (§5, §10, §14)?** A third pattern is never introduced silently — only through a logged `DECISION_LOG.md` decision (§28).

This document is now **Version 1.0 — Approved and Frozen — the authoritative Navigation Specification** for all future navigation implementation. See the Document status note below.

---

**Document status:** Approved — Frozen (v1.0, approved by Paul 2026-07-18). This is the authoritative reference for all navigation implementation platform-wide, and the shell definition every other Product Specification (starting with `02_HOMEPAGE_SPECIFICATION.md`) already references rather than redefines. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, a Frozen document may only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md` — not as a side effect of downstream specification or implementation work.

## Sources

External research cited above (principles only — no layouts, menu wording, branding, or proprietary interactions were referenced or copied):

- [E-Commerce Homepage & Category Navigation — Baymard Institute](https://baymard.com/research/homepage-and-category-usability)
- [Ecommerce Mega Menus: Best Practices Backed by Competitor Benchmarks](https://www.karlmission.com/blog/ecommerce-mega-menus-best-practices-backed-by-competitor-benchmarks)
- [Baymard Cliff Notes: Main Navigation UX Best Practices](https://sam-saenz.medium.com/baymard-cliff-notes-main-navigation-ux-best-practices-566ddd591c65)
- [Hamburger Menus and Hidden Navigation Hurt UX Metrics — Nielsen Norman Group](https://www.nngroup.com/articles/hamburger-menus/)
- [Basic Patterns for Mobile Navigation: A Primer — Nielsen Norman Group](https://www.nngroup.com/articles/mobile-navigation-patterns/)
- [Bottom Navigation Pattern On Mobile Web Pages: A Better Alternative? — Smashing Magazine](https://www.smashingmagazine.com/2019/08/bottom-navigation-pattern-mobile-web-pages/)
- [Breadcrumbs: 11 Design Guidelines for Desktop and Mobile — Nielsen Norman Group](https://www.nngroup.com/articles/breadcrumbs/)
- [Accessible Breadcrumbs — example and best practices — aditus.io](https://www.aditus.io/patterns/breadcrumbs/)
- [Developing a Keyboard Interface — ARIA Authoring Practices Guide, W3C WAI](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Does your navigation need an ARIA menu? Probably not. — Pope Tech](https://blog.pope.tech/2026/02/10/does-your-navigation-need-an-aria-menu-probably-not/)
- [E-Commerce Search Usability Research Studies — Baymard Institute](https://baymard.com/research/ecommerce-search)
- [Mobile Usability: Allow Users to "Search Within" Their Current Category (94% Don't) — Baymard Institute](https://baymard.com/blog/search-within-current-category)
- [Applying Luxury Principles to Ecommerce Design — Nielsen Norman Group](https://www.nngroup.com/articles/luxury-principles-ecommerce-design/)
- [Quiet Luxury eCommerce Strategy: Translating Physical Brand Architecture to Digital Revenue](https://designandbuild.co/insights/quiet-luxury-ecommerce-digital-strategy-premium-brands)
- [Food Delivery & Takeout Ecommerce UX Research — Baymard Institute](https://baymard.com/research/online-food-delivery)
