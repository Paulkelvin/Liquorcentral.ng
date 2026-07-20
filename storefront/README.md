# LiquorCentral Storefront

The customer-facing Next.js storefront for [LiquorCentral.ng](../README.md), wired to `backend/apps/backend`'s Store API.

This is **engineering output**, not planning documentation. The authoritative source of truth for what this storefront must do is `/docs` — see in particular `docs/TECH_STACK.md`, `docs/DESIGN_SYSTEM.md`, and the eleven frozen `docs/specifications/`. Nothing here should contradict those documents; if it ever does, the documentation wins and the code is the bug.

## What this is

Medusa's official **DTC Starter** storefront app (`apps/storefront` extracted from `https://github.com/medusajs/dtc-starter`, the actively-maintained successor to the now-deprecated `nextjs-starter-medusa` repository), per `TECH_STACK.md`'s "Next.js Starter (\"DTC Starter\")" recommendation. Only the storefront app was taken from that repository — its own bundled `apps/backend` was discarded, since this project already has its own fully custom Medusa backend at `backend/apps/backend` (the two share the `@dtc/backend` package name, confirming this project's `backend/` was itself originally scaffolded from the same starter family).

This milestone is a **scaffold, not a redesign**: it proves the storefront runs and talks to the real backend (real Nigeria region, real publishable API key, real Store API calls) using the starter's own out-of-the-box UI, unmodified. Applying `DESIGN_SYSTEM.md`/`BRAND_IDENTITY.md`'s actual colors, typography, and component patterns is separate, later work (`ROADMAP.md` Phase 0c, component specification) — not attempted here, since inventing UI ahead of that phase would be exactly the kind of unauthorized product/UI decision this project's engineering discipline avoids.

## What's configured

- **Package versions pinned to match the backend exactly** — `@medusajs/js-sdk`, `@medusajs/icons`, `@medusajs/types` at `2.17.2`, matching the DTC Starter's own default pins (no drift, unlike the deprecated repo's stale "latest" pins found and discarded during this milestone's own exploration). No version drift between backend and storefront.
- **`NEXT_PUBLIC_DEFAULT_REGION=ng`** and a real publishable API key scoped to the "LiquorCentral Storefront" sales channel (created via the Admin API, linked to the sales channel Milestone 1 seeded) — not the template's placeholder Denmark/`pk_test` defaults.
- **Yarn** (`packageManager: yarn@1.22.22`, matching `backend/apps/backend`'s exact pin) — the starter's own monorepo used pnpm, but since this app was extracted as a standalone, non-monorepo package, Yarn keeps tooling consistent with the rest of this project rather than introducing a second package manager.

## Known engineering fixes (mechanical, not business decisions)

A handful of narrow type-safety and lint issues in the vendored template were fixed — all mechanical (null-guards, a stricter type shape, an unused suppression comment), none touching business logic or UI:

- `src/lib/data/cart.ts` — `setAddresses`' dynamically-built `data`/`billing_address` objects (built field-by-field from `FormData`, which can technically hand back a `File`) now cast through `unknown` rather than `any`, satisfying `@typescript-eslint/no-explicit-any`; three `catch (e: any)` blocks narrowed to `catch (e)` with an `instanceof Error` check; two placeholder gift-card functions' unused params prefixed with `_` (their real logic is commented out upstream — this project has no approved gift-card feature, so it stays untouched, not implemented).
- `src/modules/checkout/components/shipping/index.tsx` — the `Shipping` component's prop type widened from `StoreCartShippingOption` to `StoreCartShippingOptionWithServiceZone` (the type the `/store/shipping-options` endpoint actually returns, confirmed against `@medusajs/types`' own response type) so `service_zone` resolves; `formatAddress` narrowed to a minimal structural type covering only the fields it reads, resolving a `StoreFulfillmentAddress` vs. `StoreCartAddress` `phone` nullability mismatch.
- `src/modules/common/components/line-item-price/index.tsx`, `line-item-unit-price/index.tsx` — `total`/`original_total` defaulted to `0` when `undefined`.
- `src/modules/layout/components/country-select/index.tsx` — `CountryOption`'s `country`/`label` fields widened to optional (matching what a region with a missing ISO code or display name can actually produce), with a guard in `handleChange`.
- `src/modules/layout/components/language-select/index.tsx` — two `@ts-ignore` comments (flagged by lint as needing `@ts-expect-error`) removed entirely once bumping `eslint`/pinning React 19 types confirmed there was no longer a real type error underneath them.

## Local development

Prerequisites: the backend (`backend/apps/backend`) running locally on port 9000, with a Nigeria region and a publishable API key linked to a sales channel (see `backend/README.md`).

```bash
# from storefront/
cp .env.template .env.local
# fill in NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (create one via the Admin API or
# dashboard, linked to the backend's sales channel) and set
# NEXT_PUBLIC_DEFAULT_REGION=ng to match the backend's seeded Nigeria region

yarn install
yarn dev      # http://localhost:8000
# or, for a production build:
yarn build && yarn start
```

Validated end to end against the real backend: `tsc --noEmit` and `yarn lint` both clean; `yarn build` succeeds; the homepage and `/ng/store` listing both return `200` and render using real Store API data (empty product/collection results are expected — no catalog data has been seeded yet).

## Phase 0c — Storefront Foundation (Milestone 6)

The reusable infrastructure every future specification implementation (Homepage, Navigation, Search, Product Listing, Product Details, Cart, Checkout) sits on top of. **Not** an implementation of any of those specifications' own behavior — see "What's deliberately not here yet" below for the exact boundary.

### Design tokens (`tailwind.config.js`, `src/styles/globals.css`)

Every `DESIGN_SYSTEM.md` §B token is implemented, resolved through CSS custom properties so a future theme only ever changes `:root` variable definitions, never a component:

- **Color** (§B6, three tiers) — Tier 1 Brand, Tier 2 Functional, and the Neutral System all defined as CSS variables; Tier 3 semantic tokens (`primary`, `secondary`, `accent`, `surface`/`surface-elevated`, `text-primary`/`text-secondary`/`text-muted`, `border`, `divider`, `focus`, `interactive`, `disabled`, `success`/`warning`/`danger`/`information`) are the only names any new component may reference — never a raw hex, never the vendored `grey` scale. Interactive hover/active states use `color-mix()` (an 8%/16% black overlay on whichever base color is active, per §B6's "Interactive States" mechanism) rather than hardcoded per-color hover hexes — confirmed resolving correctly in a real browser (`color-mix(in srgb, #ec2d07 92%, black)`), not just present in source.
- **Typography** (§B1) — the 7-step scale (`caption`/`body`/`body-lg`/`heading-4`/`heading-3`/`heading-2`/`heading-1`) as Tailwind `fontSize` tokens. `font-display` is a generic system-serif stack (`ui-serif, Georgia, ...`), not a named webfont — `BRAND_GUIDELINES.md` explicitly reserves typeface selection as its own not-yet-made decision; the token exists so no component needs to change once a real typeface is chosen.
- **Spacing** (§B2) — no new tokens needed: Tailwind's own default numeric spacing scale (`p-1`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`, ...) already resolves to 4px multiples matching §B2's `space-*` scale exactly.
- **Grid & breakpoints** (§B3, §B7) — `.ds-container` (1280px max-width, responsive margins) for new components; `sm` breakpoint corrected to 480px (Tailwind's own `md`/`lg`/`xl`/`2xl` defaults already match §B7 exactly, so only `sm` needed overriding).
- **Elevation, radius, motion** (§B4, §B5, §B10) — `shadow-elevation-{0,1,2,3}`, `rounded-radius-{sm,md,lg,full}`, `duration-{micro,standard,entrance,exit}` (paired with Tailwind's own `ease-out`/`ease-in-out`/`ease-in`, which already match §B10's named easings).
- **Vendored Medusa UI preset tokens are untouched** — `grey`, the old `soft`/`base`/`rounded`/`large`/`circle` radius keys, and the custom `2xsmall`–`2xlarge` breakpoints all still exist alongside the new tokens, so nothing already using them broke.

### Accessibility foundation (`globals.css`, layouts)

- Visible `:focus-visible` ring using the `focus` token, never removed.
- A skip-to-content link (`.skip-link`) in both the `(main)` and `(checkout)` layouts, targeting a single `<main id="main-content">` landmark per page (a pre-existing duplicate-`<main>` bug — the root layout also wrapped children in `<main>` — was fixed as part of this).
- Platform-wide `prefers-reduced-motion` support (near-instant transitions/animations when requested).
- **Validated with real execution, not just markup review**: axe-core run against a live, backend-connected page found and fixed two genuine, pre-existing WCAG violations in the vendored cart-dropdown trigger (a `<button>` wrapping a nested `<a>` — `nested-interactive`; then an invalid `aria-expanded` on a bare `<span>` after the first fix — `aria-allowed-attr`), resolved by rendering Headless UI's `PopoverButton` `as={LocalizedClientLink}` directly rather than nesting two interactive elements. Homepage, Store, and Cart pages all now score zero axe violations for WCAG 2A/2AA on their shell chrome. One further violation was found and *not* fixed — a color-contrast failure on `text-ui-fg-muted` ("Sort by") on the Store listing page — because it lives in vendored Product Listing behavior this milestone's scope explicitly excludes; recorded here for whoever implements `04_PRODUCT_LISTING_SPECIFICATION.md`.

### Shared UI primitives (`src/modules/common/components/ui`)

Retokenized in place, not duplicated — this file was already the vendored template's de facto shared component library (`Text`, `Heading`, `Button`, `Container`, `Badge`, `IconBadge`, `IconButton`, `Label`, `Input`, `Table`, `RadioGroup`, `Checkbox`), used by 20+ existing account/checkout/cart components. Every one of those call sites now renders with LiquorCentral tokens automatically, with no change to their own behavior. `Button`/`IconButton`/`Input` all enforce a 44×44px minimum touch target (§B11) regardless of visual size.

### Navigation & footer shells (layout only)

`Nav`, `Footer`, and the `(checkout)` layout's header are retokenized and have "Medusa Store" branding text corrected to "LiquorCentral" — no mega menu, category tree, or search entry point added (that is `01_NAVIGATION_SPECIFICATION.md`'s own future implementation). The vendored "Powered by Medusa & Next.js" CTA and GitHub/Docs/Source-code footer links were removed entirely (marketing content for the wrong product, not a design decision).

### Error boundaries, empty states, toasts, forms

- `src/app/[countryCode]/error.tsx` and `src/app/global-error.tsx` — Next.js App Router error-boundary convention, previously entirely absent.
- `src/modules/common/components/empty-state` — a generic `title`/`description`/`icon`/`action` shell for "nothing here yet" moments; no specification's own empty-state copy is invented.
- `src/modules/common/components/toast` (`ToastProvider`/`useToast`, mounted once at the root layout) — an `aria-live="polite"` toast mechanism any future feature can call into; DESIGN_SYSTEM.md §B9 requires inline confirmation *in addition to* a toast, never a toast alone, so this is deliberately the toast half of that pair, not a replacement for it.
- `src/modules/common/components/form-field` + `src/lib/hooks/use-blur-validation.ts` — the canonical label/control/error composition and the "validate on blur, not on every keystroke" rule from §B9, as reusable, business-logic-free primitives.

### Testing foundation

Jest + React Testing Library (`next/jest`, so SWC transform/path aliases/env loading all match Next.js's own), `.env.test` holds a dummy publishable key only (Next.js does not load `.env.local` when `NODE_ENV=test`). 17 tests across 5 suites cover every new primitive above. **Storybook was deliberately not added** — a judgment call, not an oversight: this milestone builds infrastructure, not yet a populated component library, and no other part of this project uses Storybook today; revisit once real page specifications start producing a meaningful number of visual component variants.

## Milestone 7 — Navigation (`01_NAVIGATION_SPECIFICATION.md`)

Implements the Frozen v1.0 specification's own behavior on top of Phase 0c's shell — the mega menu, Food Central dropdown, mobile drawer/wayfinding strip, header search field, breadcrumbs, and the footer's five content groups. Not a redesign of anything Phase 0c already built; every new piece is additive.

### Backend: a provisional category tree (`src/migration-scripts/navigation-category-seed.ts`)

The project had **zero** Product Categories before this milestone — no catalog data has ever been seeded (Phase 2/3's field-list decisions are still open). §11 itself proposes "a reasonable default grouping (not a final decision)" — a "Spirits" parent (Whisky, Cognac, Vodka, Gin, Rum, Tequila, Liqueurs) plus Wines, Champagne, Beer, Gift Sets, and Accessories as their own top-level entries — so this idempotent script seeds exactly that, and nothing else. It exists only so the mega menu has real, data-driven categories to render and so §30's "adding a category requires no code change" acceptance criterion is actually testable; every category remains freely renamable/regroupable/deletable from the admin with zero code change, per the spec's own Governance table. Food Central is deliberately **not** seeded as a category — §11/§14 treat "Wine & Spirits" and "Food Central" as the platform's two hardcoded structural branches (also §24's fallback pair), not Product Category records.

### Desktop shell (`src/modules/layout/templates/nav`)

- **`MegaMenu`** (§10) — a Headless UI `Popover` disclosure panel (not an ARIA `menu` widget, per §22's explicit instruction), columns built by `src/lib/util/mega-menu.ts`'s `groupCategoriesForMegaMenu` — a pure, content-agnostic function that round-robins whatever top-level categories currently exist across 3 columns by rank. §11 is explicit that the exact grouping is "a merchandising decision, not an engineering one," so this function makes no assumption about which category belongs with which other one; it only does the mechanical part, which is what makes §28's "zero navigation code changes" true as the category set grows or shrinks. Falls back to a plain link if the category tree is empty (§24).
- **`FoodCentralMenu`** (§14) — deliberately *not* data-driven, unlike the mega menu: three fixed destinations (Today's Menu, Scheduled Orders, Pickup), matching §14's "no deeper formal taxonomy layer at launch."
- **`SearchField`** (§15) — a real, always-visible `<input type="search">` in the desktop header (never icon-only); a one-tap icon-to-full-viewport input on mobile. Submits as a plain GET `<form>`, not a JS-only handler, so it produces a real, bookmarkable URL and still works without client JS (§20, §26).
- **`src/lib/hooks/use-hover-intent-open.ts`** — §10's "hover, with a click/tap fallback" needs the trigger to open on `mouseenter` *and* still work as an ordinary click target. Headless UI's `Popover` only exposes `close()`, not `open()`, so opening on hover means synthetically clicking the trigger — and an un-delayed synthetic click races a genuine click on the same element (the browser always fires `mouseenter` moments before `click`), causing a flash-open-then-immediately-close bug. **Found with a real Playwright click, not by inspection** — confirmed, fixed with a short hover-intent delay (cancelled if the mouse leaves or a real click arrives first), and re-verified with the same automated click plus a genuine hover-and-wait sequence. Covered by `src/lib/hooks/__tests__/use-hover-intent-open.test.tsx`.

### Mobile (`MobileNavDrawer`, `MobileWayfindingStrip`)

`MobileNavDrawer` replaces Phase 0c's placeholder `SideMenu` (deleted — it only had Home/Store/Account/Cart, no category depth) with §7.3's "clearly-labeled 'Menu' affordance… carries the full category tree depth" — its region/language selectors are carried over unchanged, not dropped. `MobileWayfindingStrip` is the persistent, horizontally-scrollable Wine & Spirits/Food Central pair beneath the mobile header (§7.2), protecting §2's equal-prominence requirement at the smallest viewport.

### Breadcrumbs (`src/modules/common/components/breadcrumbs`)

One reusable component wired into category, collection, and product detail pages — real `<nav aria-label="Breadcrumb">`, `aria-current="location"` on the current segment (never a link), and `BreadcrumbList` JSON-LD generated from the same segment list (§18, §26). Product detail's breadcrumb needed `+categories.*` added to its `listProducts` fields query, since the vendored template never fetched a product's category before.

### Footer (`src/modules/layout/templates/footer`)

Restructured from two ad hoc columns (Categories/Collections) into §8's five named groups — Shop, Food Central, Company, Support, Legal — each a real `<a href>`. Company/Support/Legal point at real, minimal placeholder pages (`/about`, `/support`, `/legal`, reusing Phase 0c's `EmptyState`) rather than a redirect or 404: their actual brand/legal copy is not this specification's or this milestone's to write (`PRODUCT_BLUEPRINT.md` §11 content, legal sign-off), but a footer link must never be a dead end (§19, §24).

### `/search` — a minimal bridge, not `03_SEARCH_SPECIFICATION.md`

`src/app/[countryCode]/(main)/search` is deliberately minimal: a native `q`-filtered product list with `noindex, follow` (§26), no ranking philosophy, no typo tolerance/synonyms, no facets, no search-within-category, no product-line labeling. All of that is `03_SEARCH_SPECIFICATION.md`'s own Meilisearch-backed implementation (`MEDUSA_EXTENSIONS.md` #6), still pending formal approval — this page exists only so §15's header search field never leads to a 404, and will be replaced wholesale when 03 is implemented for real.

### Food Central placeholder pages (`/food-central`, `/food-central/scheduled`, `/food-central/pickup`)

§14/§24: these three nav destinations "must remain visible and clickable at all times… so a customer isn't confused about whether Food Central exists at all." None of `09_FOOD_ORDERING_SPECIFICATION.md`'s real menu/ordering behavior is built yet — each renders `NotTakingOrders`, reusing Phase 0c's `EmptyState` infrastructure.

### Validated with real execution, not just markup review

- `tsc --noEmit`, `next lint`, `next build` (with the real backend running for `generateStaticParams`), and the full Jest suite (26 tests across 7 suites — 9 new) all clean.
- **axe-core against six live, backend-connected pages** (home, a category with children, a leaf category, Food Central, search, about): the home/search/about pages score zero violations. Two `color-contrast` violations were found and are **not** fixed here — both pre-existing/systemic, not introduced by this milestone: (1) `text-ui-fg-muted` on the vendored "Sort by" control, the exact violation Phase 0c's own README already documented as Product Listing's future scope; (2) white text on the `Button` component's `bg-primary` (#EC2D07), measured at 4.24:1 against the required 4.5:1 — confirmed systemic by testing the Cart page (which uses the same `Button` primary variant) independently of any navigation change; a Design-System-level concern (one of `BRAND_IDENTITY.md`'s four fixed brand colors), not this milestone's to alter. A third violation *was* found and fixed: the vendored `InteractiveLink` component (used for a category's in-page children sub-navigation, §11) used the old `text-ui-fg-interactive` preset color at 3.35:1 contrast — retokenized to the new `text-interactive` semantic token, since §11's sub-navigation is squarely this specification's own requirement, not out-of-scope vendored behavior like the other two.
- **Keyboard/focus interaction verified with real Playwright automation**, not assumed from markup: `aria-expanded` toggles correctly on Enter/click for the mega menu and Food Central dropdown; `Escape` closes each and returns focus to its trigger; the mobile drawer opens on click and closes on `Escape`.

### Known limitation

Product detail breadcrumbs could not be live-tested end to end — no product has ever been seeded in this catalog (field-list decisions are still open, per `docs/PROJECT_STATUS.md`). The code path mirrors the already-verified category/collection breadcrumb pattern exactly and is covered by the same `tsc`/build pass, but has not been exercised against a real product.

## Milestone 8 — Homepage (`02_HOMEPAGE_SPECIFICATION.md`)

Implements the Frozen v1.0 specification's own section list (§7) on top of Milestone 7's shell: the Age Verification Gate, Hero, Curated Collections, Food Central Spotlight, Trust & Delivery Band, and Returning Customer Strip. "Wine & Food, Connected" (§8.6) is deliberately absent — its "pairs with" backend relationship doesn't exist yet, and §19 is explicit that with no pairing content configured, the section doesn't render.

### Age Verification Gate (`src/modules/home/components/age-gate`)

§8.2's highest-risk accessibility surface, mounted in the shared `(main)` layout (not just the homepage) so it's genuinely site-wide per §24's assumed default. Built on Headless UI's `Dialog`, but with `onClose` deliberately a no-op — `Escape` and an outside click normally dismiss a `Dialog`, and §8.2 is explicit that "`Escape` does not silently bypass a legal gate." Only the two explicit actions (confirm/decline) can close it. Decline shows a plain "age restricted" message in place of the confirm/decline buttons — §8.2 itself flags the exact declined-visitor policy (exit entirely vs. a non-alcohol-only mode) as an open business decision this specification doesn't resolve, so this is the minimal, non-inventive interpretation: no page content is ever revealed after decline, and nothing about a "non-alcohol mode" is invented.

A genuine bug was found and fixed here, not just in UI polish: a plain string constant (the cookie name) was re-exported from the `"use client"` `AgeGate` module for the server-rendered layout to read. This resolved to `undefined` at runtime despite compiling cleanly — Next.js replaces a client module's exports with client-reference stubs for React Server Components serialization, which only work for components, not plain data crossing the boundary. Real end-to-end testing (confirm, then reload) caught this; the fix is a boundary-free `constants.ts` file both the server layout and the client component import from directly.

### Hero, Trust & Delivery Band (`src/modules/home/components/{hero,trust-delivery-band}`)

Copy in both is Paul's own already-finalized text, not invented: the Hero's headline/subhead are `BRAND_IDENTITY.md` §10's Positioning Statement and §11's Value Proposition (both explicitly flagged there as candidates for "direct or near-direct use in hero copy"); the Trust & Delivery Band's four statements are §8.7/§13's own required content, verbatim.

### Curated Collections, Food Central Spotlight (`src/modules/home/components/{curated-collections,food-central-spotlight}`)

No Collections and no products of either catalog have ever been seeded in this project (field-list decisions are still open, `docs/PROJECT_STATUS.md`), so both sections always render their §19 empty states today: Curated Collections falls back to a plain "Shop Wine & Spirits" link; Food Central Spotlight reuses the exact `NotTakingOrders` component `01_NAVIGATION_SPECIFICATION.md`'s Food Central destinations already use, not a second implementation. Both fallback paths are real, data-driven code, not placeholders — a shelf or menu item appears automatically the moment real data exists. Food Central Spotlight filters products by `+food_details.*` presence (`PRODUCT_CATALOG.md`'s actual mechanism for distinguishing the two catalogs — module-link presence, not a Product Category), consistent with Milestone 7's own decision not to model Food Central as a category.

### Returning Customer Strip (`src/modules/home/components/returning-customer-strip`)

§8.8: renders only for a logged-in customer with prior orders, entirely absent otherwise (not an empty state). `retrieveCustomer()` already fetches `*orders`; a type cast was needed since `StoreCustomer`'s static type doesn't declare that linked field, the same gap Milestone 7's `product.categories` fix hit.

### A genuine layout bug found only by screenshot, not by any automated check

`MegaMenu`'s panel used `absolute inset-x-0`, intended to span the full header width — but the `Popover` wrapper around the trigger button also carried `position: relative`, becoming a *nearer* positioned ancestor than the header. `inset-x-0` resolved against that narrow trigger wrapper instead, squeezing all three columns into a ~110px box with overlapping, unreadable text. `tsc`, `eslint`, Jest, and axe-core all passed with this bug present — none of them render layout geometry. A real screenshot of the open mega menu caught it immediately; the fix removes `relative` from the trigger wrapper so `inset-x-0` resolves against the header (already `position: relative`, full page width) instead. Re-screenshotted and confirmed correct after the fix — see the Visual Validation section of the Milestone 8 completion report for both the broken and fixed screenshots.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (31 tests across 8 suites — 5 new, including 5 for the age gate covering the Escape-does-not-close requirement specifically) all clean.
- **axe-core against every page already covered in Milestone 7, plus the homepage in both its gated and verified states**: zero new violations. The only finding is the same pre-existing, systemic `Button` primary-variant contrast issue already documented in Milestone 7 (now also visible on the Hero's and Food Central Spotlight's own CTAs, which reuse that same component styling) — not a new issue, not altered here.
- **Real Playwright end-to-end verification of the age gate's full lifecycle**: shown on first visit; `Escape` confirmed not to close it; confirming sets a real cookie and closes it; **reloading the page correctly keeps it closed** (the exact case that caught the cross-boundary constant bug above); declining shows the restricted message with no confirm/decline actions left to press.
- **Full visual validation with real browser screenshots** — see the completion report for this milestone. One genuine layout bug (above) was found this way and does not appear in any other check performed.

## Milestone 9 — Product Listing (`04_PRODUCT_LISTING_SPECIFICATION.md`)

Implements the specification's card, sort, pagination, and empty-state behavior across every listing surface that reuses `PaginatedProducts` (category pages, collection pages, the all-products `/store` page) plus the Food Central homepage spotlight. Filtering/facets (§10) is deliberately not built — it reuses `03_SEARCH_SPECIFICATION.md` §13's facet system in full per §10's own text, which remains pending Meilisearch approval, the same gate already documented for Search's own bridge-only implementation.

### Product Card Information Hierarchy (`src/modules/products/components/product-preview`)

The card is rebuilt around §9's rule: image/name/price always shown; **at most one** of a promotional badge or a catalog-specific supporting fact; a quick-add control that is a genuinely separate sibling element, never nested inside the card's one real link. No promotional-badge mechanism exists anywhere on this platform yet (only navigation's Collection-based promotional layer does, and it isn't wired to per-card badges), so the one-fact slot today only ever surfaces Food Central's prep-time fact (`food_details.prep_time_minutes`); a Wine & Spirits card correctly leaves it empty rather than inventing a badge with nothing genuine behind it — matching §9's own expectation that "this slot is more often left empty than used" for that catalog. Availability is a separate, always-shown state fact, not counted against the one-slot cap (§9's own explicit distinction): an unavailable product (every variant sold out, or zero variants configured) is labeled "Sold out" and its quick-add is entirely absent, never a silently-disabled or hidden card.

`src/modules/products/components/product-preview/quick-add-button.tsx` (new) implements §9's Quick Actions: Food Central cards get a full-width, primary-styled quick-add (offering it by default, per §9); Wine & Spirits cards get a lower-visual-weight text-link quick-add, present but not primary — both stay keyboard/touch-operable at all times, since §14/§24 forbid a hover-only reveal being the *only* way to reach an action. A card with no option-selection UI can only resolve a variant automatically when the product genuinely has just one; a multi-variant product (e.g. multiple bottle sizes) instead renders "Select options," linking to the product detail page's real option picker rather than guessing — still one click away, never a silent wrong-variant add. Quick-add gives immediate inline confirmation ("Adding…" → "Added ✓") and relies on the existing `CartDropdown`'s own item-count-triggered auto-open for the "persistent confirmation" §9 requires, rather than building a second, redundant confirmation mechanism.

### "Load More" pagination (`src/modules/store/components/load-more`, `paginated-products.tsx` rewritten)

§13's adopted pattern, replacing the vendored classic page-number `Pagination` component (deleted — fully superseded, zero remaining references). `page` in the URL means "how many pages are currently loaded"; `listProductsWithSort` gained a `cumulative` mode that re-fetches and re-slices from the start on every request, so a shared or reloaded `?page=3` link server-renders pages 1–3 concatenated — satisfying §26's "first-loaded state must be complete, server-rendered content" and §13/§20's "every loaded page reflected in the URL" simultaneously, without a separate client-side fetch/cache/append layer to keep in sync. Newly-loaded results are announced via a polite live region, with the delta computed server-side rather than inferred client-side.

### Sort (`sort-products/index.tsx`) and empty states (`empty-state`, reused from Phase 0c)

§11: default sort is "Featured," not "Newest" — but no per-product merchandising-rank field exists in Medusa's native model, and none was invented here; "Featured" is honestly a no-op fallthrough to the API's natural/default order (documented in-code), while still being the correct *default selection* per §11's explicit rule. §21: a genuinely empty category/collection/all-products listing shows a real "Nothing available right now" message with a link to a sibling surface (`/categories`), not an empty grid — reusing `EmptyState` from Phase 0c rather than a second implementation.

### A genuine latent bug found while wiring catalog-fact data through

Fetching `food_details`/`wine_details` fields for the card's one-fact slot required passing an extra `fields` query parameter into `listProducts` — which revealed that a caller-supplied `fields` value was silently **replacing** the function's default field set (pricing, variant options, images) instead of extending it. Food Central Spotlight (built in Milestone 8) already passed its own `fields: "+food_details.*"` and had been silently losing pricing data ever since — its cards rendered with no price, passing every automated check because nothing asserts on price *presence*, only on price *formatting* when present. Fixed by merging the default and caller-supplied field lists additively in `src/lib/data/products.ts`; re-verified Food Central Spotlight's cards now render prices correctly.

### Alt text (`src/modules/products/components/thumbnail`)

§24/§111 require "descriptive alt text on every product image (never a generic filename)" — the shared `Thumbnail` component hard-coded `alt="Thumbnail"` on every image. Added an `alt` prop (defaulting to a still-generic "Product photo" fallback only where no title is genuinely available) and passed real product/item titles from every listing, cart, order, and account call site.

### Visual validation against real seeded data

This project has never seeded a single catalog product (Milestones 7 and 8 already documented this), which meant every card state this milestone implements — the one-fact slot, both quick-add weights, "Select options," "Sold out," Load More actually triggering — had no real data to render against. Rather than fabricate screenshots or skip visual validation, 13 temporary, clearly `[QA]`-prefixed products were created directly via the Admin API (one Food Central dish with a prep-time value, one single-variant wine, one multi-variant wine, one deliberately out-of-stock wine, and nine filler wines to exceed the 12-per-page Load More threshold), screenshotted in every relevant state, and **deleted immediately afterward** — the catalog was confirmed back to zero products (`GET /store/products` → `count: 0`) before this milestone closed. See `DECISION_LOG.md`'s Milestone 9 entry for the full reasoning and the one manual cleanup item this left behind (a temporary admin account that cannot delete itself).

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (31 tests across 8 suites, all pre-existing — no new component-level tests were added this milestone; validation relied on real end-to-end/axe coverage instead, per the standing visual-validation requirement) all clean.
- **axe-core against the wines category listing, the all-products listing, and the empty-state category, real seeded QA data present**: one violation class found, `color-contrast`, entirely pre-existing and untouched by this milestone — the vendored "Sort by" label and `PreviewPrice`'s `text-ui-fg-muted` price text (both already documented since Milestone 7 as Product Listing's own future scope, now confirmed still present because this is that milestone), and the same systemic `Button` primary-variant contrast issue on the empty state's CTA (documented since Milestone 7).
- **A structural check confirmed zero links containing a nested `<a>`** anywhere on the listing (§9/§212's core accessibility commitment), and that `products-list` is a genuine `<ul>` with `<li>` children carrying a real `aria-label` (e.g. "12 products") — proper list semantics, not `div`-soup.
- **Real Playwright keyboard-operability check**: the quick-add button is reachable via `Tab` and activates on `Enter` alone (confirmed by observing its state change to "Adding…"), not mouse-only.
- **Full visual validation with real browser screenshots against real (temporary) seeded data** — desktop and mobile listing grids, every card state (sold out, select-options, catalog fact + primary quick-add, secondary quick-add idle/adding/added), the cart dropdown's auto-confirmation, sort reordering, Load More before/pending/after, and the genuine empty state — see this milestone's completion report.

## Milestone 10 — Search (`03_SEARCH_SPECIFICATION.md`)

Upgrades `/search` from Milestone 7's minimal native bridge into a real results experience, built on the confirmed specification implementation order (Navigation → Homepage → Search → Product Listing → ...) supplied alongside a batch of newly-approved business decisions, one of which is search-specific: **a unified result list across both catalogs, with a small catalog-identity badge per result, never split into separate result pages.** Meilisearch itself remains unapproved (`DECISION_LOG.md`), so everything genuinely dependent on it — typo tolerance (§8), synonyms (§9), autocomplete (§7), editorial boosting (§11), faceted filtering (§13) — is deliberately not built here, exactly as `03_SEARCH_SPECIFICATION.md` §29 itself anticipates. What the new business decision asks for turns out not to need Meilisearch at all, and is built for real.

### Unified results with a catalog badge (`product-preview/index.tsx`, `search/page.tsx`)

`ProductPreview` gained a `showCatalogBadge` prop: when true, the card's existing one-fact slot (Product Card Information Hierarchy, Milestone 9) carries a "Food Central" / "Wine & Spirits" identity badge instead of Food Central's prep-time fact — still at most one occupant of that slot, per §9's own restraint rule, just a different occupant in this one context. Category and collection listings never pass this prop (the page context already makes the catalog unambiguous there); only search does, since a unified list genuinely needs it. `PaginatedProducts` — the same shared component Product Listing built — gained an optional `query` prop (mapped to the Store API's native `q` parameter) and passes `showCatalogBadge` through, so Search reuses Product Listing's card, sort, Load More, and empty-state infrastructure entirely rather than a parallel implementation, directly satisfying §9's "same card hierarchy... holds across search results" rule.

### Sort relabeling (`sort-products/index.tsx`)

§14 requires search's default sort to read "Relevance," not "Featured" — the word Product Listing's own identical no-op default uses. Rather than add a second sort mechanism, `SortProducts` gained a `defaultSortLabel` prop so the same underlying `"featured"` value (and the same honest natural-order fallthrough documented since Milestone 9) reads correctly in each context — "Featured" on a category page, "Relevance" on search results.

### Honest zero-result recovery (`search/page.tsx`)

§18 specifies three recovery tiers: a typo-corrected re-query, the closest matching category, or a curated fallback. Tier 1 needs Meilisearch's typo-distance data and is not built. Tiers 2/3 are: a plain "No results" message naming the exact query, and a "Browse Wine & Spirits" link into `/categories` — honest, not a fabricated "closest match" claim this implementation has no real algorithm to back. Distinct from this is the **pre-query state** (§19): before any search is submitted, the page shows a plain prompt, not an error or an empty grid — a real, distinct state from a genuine zero-result query, exactly as §19 requires them to be treated differently.

### Result count announcement (§22)

`PaginatedProducts` gained a `role="status" aria-live="polite"` region announcing e.g. "3 results" (search) or "12 products" (listings, via the new `itemNoun` prop) once a query/listing resolves, in addition to the `<ul>`'s own `aria-label`. Documented honestly, not overclaimed: a live region present at *initial* page load is not guaranteed to be announced by every screen reader on first paint — a real, known ARIA limitation for full page navigations, not a bug — while Load More's own live region (Milestone 9) reliably announces every *subsequent* change, which is the more common real-world interaction pattern (scanning results, then loading more).

### Deliberately not built, and why

Autocomplete (§7) was considered and deliberately not attempted natively: without Meilisearch's typo tolerance and ranking behind it, a native-only "as you type" suggestion list would very likely feel broken rather than helpful (returning nothing for a one-character typo, the exact failure §7/§8 exist to prevent) — building a weak version would risk violating `EXPERIENCE_PRINCIPLES.md` #9's trust standard, worse than not building it yet. Faceted filtering (§13) remains blocked on the same unfinalized wine/food attribute field lists already blocking Product Listing's own facets. "Pairs with" cross-sell (§17) remains blocked on its unbuilt data model. Search-within-category (§4, §15/§16) — a UI affordance on category pages themselves, not the results page — was not added to Navigation's category templates this milestone; the entry point exists (the header search field) but no scoped-search-within-the-current-category control does yet.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (31 tests across 8 suites, all pre-existing) all clean.
- **axe-core against the pre-query, populated-results, and zero-result search states, real seeded QA data present**: zero new violations — only the same pre-existing, already-documented `Button`/price-text/"Sort by" contrast issues (Milestones 7–9).
- **A structural check confirmed**: the `robots` meta tag reads `noindex, follow` (§25); all three catalog badges render with the correct text ("Food Central" on the one Food Central QA product, "Wine & Spirits" on the two wine QA products) for a query genuinely matching both catalogs (`q=Citrus`, chosen specifically to prove this for real rather than by construction); zero links containing a nested `<a>`; selecting a sort order updates the URL to carry both `q` and `sortBy` together (§6's "every applied query, filter, and sort order is reflected in the URL"), and the result grid re-sorts correctly (ascending price confirmed against the three seeded prices).
- **Real browser screenshots against temporary QA-only seed data** (three products — one Food Central, two Wine & Spirits, all sharing a genuine title match so one real query proves the cross-catalog behavior) — created and fully deleted via the Admin API immediately after screenshots were taken, same discipline as Milestone 9; the catalog was confirmed back to zero products afterward. This time both temporary admin accounts were also fully deprovisioned (deleted cross-account, since a user cannot delete itself but can delete another), leaving only a harmless orphaned auth-identity credential behind rather than Milestone 9's still-live leftover account — see `DECISION_LOG.md`.

## Milestone 11 — Product Details (`05_PRODUCT_DETAILS_SPECIFICATION.md`)

Implements the product detail page (PDP) — the natural destination of every product card built across Navigation, Homepage, Product Listing, and Search — following the confirmed specification order, on top of the vendored template's existing PDP scaffold (gallery, `ProductInfo`, `ProductActions`, `RelatedProducts`).

### Gallery zoom and an honest empty state (`image-gallery/index.tsx`)

§6 requires zoom, "not optional." Each gallery image is now a button that opens a full-viewport Headless UI `Dialog` lightbox showing the same image as a plain, unmodified `<img>` — deliberately not `next/image` in the zoomed view, so the browser's own native pinch-to-zoom and double-tap gestures work unmodified on mobile rather than being trapped inside a custom pan/zoom engine. Alt text is now distinct and descriptive per image (`"{product title} — photo N of M"`) rather than the vendored template's generic `"Product image N"`. When a product has no images configured, the gallery falls back to a single, honest placeholder (§23) instead of a blank region — genuinely exercised during this milestone's validation, since this project has still never seeded a real product image.

### Catalog-specific structured fact sheets (`wine-fact-sheet/`, `food-fact-sheet/`, `product-tabs/`)

§10–§13's structured facts, reading `wine_details`/`food_details` directly via the same `+wine_details.*`/`+food_details.*` Store API field mechanism Milestone 8's Food Central Spotlight and Milestone 9's card catalog-fact slot already established — no new backend work. Wine facts group under "About this wine" (vintage, producer, region, bottle size, ABV) and "Tasting" (tasting notes, serving temperature); food facts group under "Ingredients & Allergens" (full ingredient list, allergens always icon-plus-text per §11's never-color-alone rule, dietary-flag chips) and "Preparation" (prep time, spice level, portion size). Any field genuinely absent for a given product is simply omitted (§23) — vintage on a non-vintage spirit, for instance — never rendered as an empty or placeholder row. This replaces the vendored template's generic, apparel-oriented "Material / Country of origin / Weight / Dimensions" tab, which applies to neither wine nor food.

### A genuine quantity stepper (`quantity-stepper/`, `product-actions/index.tsx`)

§17 — previously entirely absent; the vendored template always added quantity 1 with no control to change it. A real numeric stepper now sits beside Add to Cart, with a proper associated label (not a bare pair of unlabeled buttons). Wine & Spirits is capped by genuine available stock (the variant's real `inventory_quantity`, confirmed by pushing a stock-of-5 QA product past 8 and observing the stepper clamp at 5 with the increase button disabled); Food Central is deliberately uncapped, since inventory tracking is off for that catalog and any practical per-order limit is an operational/kitchen-capacity concern, not a customer-facing stock number invented at the PDP level (confirmed uncapped to 16 on a QA dish).

### A conditional Gift Wrap add-on (`gift-wrap-addon/`, `lib/data/products.ts`'s `getGiftWrapProduct`)

§16's v1-appropriate cross-sell — a priced line item, per `PRODUCT_CATALOG.md`'s existing recommendation, not a product attribute. Looked up by the well-known handle `gift-wrap`; renders only when a real product with that handle exists in the catalog, and adds it as a genuine second cart line item alongside the main product when checked. No such product has ever been created in this catalog, so this renders nothing today — the same graceful-absence discipline Milestone 8's Curated Collections/Food Central Spotlight already established, not a broken or placeholder feature. Creating one real `gift-wrap`-handled product in the Admin is the only step needed to light it up.

### Add-to-cart confirmation (`product-actions/index.tsx`)

§18/§25 — immediate, persistent confirmation via both a toast (Phase 0c's `useToast`) and an inline `role="status" aria-live="polite"` region, per `DESIGN_SYSTEM.md` §B9's explicit "a toast in addition to inline confirmation, never a toast alone" rule. Confirmed end to end via real Playwright automation: adding a product updates the header's cart count and both confirmation surfaces fire.

### Trust, Delivery, and Pickup (`trust-and-delivery/index.tsx`)

§19–§21 as their own page section, stated plainly on every PDP rather than assumed already seen on the homepage (§4). States the platform's actual current launch-scope delivery areas — Wine & Spirits across all of Lagos, Food Central within Lagos Island, per the batch business-decision entry in `DECISION_LOG.md` — rather than `02_HOMEPAGE_SPECIFICATION.md`'s older, verbatim-required "nationwide" Trust & Delivery Band wording; the two documents' wording now genuinely differs, a deliberate, recorded choice (`DECISION_LOG.md`), not an inconsistency to silently ignore. States a factual, honest return/age-verification note per catalog: Food Central's "cooked to order, not eligible for return" (a factual consequence of the business model), and Wine & Spirits' age-verification reminder ("you'll be asked to confirm you are 18 years or older at checkout") — never inventing the still-open alcohol-return-policy business decision.

### SEO (`products/templates/index.tsx`, `[handle]/page.tsx`)

`Product`/`Offer` JSON-LD structured data reflecting real price/currency/availability, and a unique, descriptive meta title/description per product (§27) — no longer a templated string identical across the catalog.

### A genuine navigation-model correction, caught before shipping

This milestone's breadcrumb initially assumed a single "Wine & Spirits"/"Food Central" root Product Category per branch. The actual Milestone 7 implementation models neither branch that way: Wine & Spirits is a flat set of top-level categories with no unifying parent, and Food Central is not a Product Category at all — it's a dedicated `/food-central` route tree (`navigation-category-seed.ts`'s own explicit design). Corrected before commit: the breadcrumb's middle segment now links to `/store` (Wine & Spirits) or `/food-central` (Food Central), both real, working routes, rather than a nonexistent `/categories/wine-spirits`/`/categories/food-central` that would 404 on every PDP.

### Three genuine accessibility violations found via live axe-core testing, and fixed

All three newly surfaced by this milestone giving the shared Accordion component and the page's own heading structure real content for the first time:

- **`button-name` (critical)**: the Accordion's chevron-only trigger `<button>` had no accessible name at all — its visible label was a sibling `<Text>`, not a descendant, of the actual button. Fixed by making the whole labeled header row the trigger (the correct Radix pattern), confirmed safe since `product-tabs/accordion.tsx` has exactly one consumer.
- **`heading-order` (moderate)**: promoting the product title to a genuine `<h1>` (below) left the Accordion's Radix-default `<h3>` header skipping a level. Fixed with `AccordionPrimitive.Header asChild` wrapping a real `<h2>`.
- **`page-has-heading-one` (moderate)**: no product detail page had a top-level heading at all — the vendored template rendered the product title as an `<h2>`. Promoted to `<h1>`, matching this page's own status as its single most important heading.

One already-documented, systemic Design-System-level violation (the shared `Button` component's primary-variant color contrast, first flagged in Milestone 7, confirmed present on Cart too) was reconfirmed present here via the same scan and deliberately left unaltered, per that same precedent — a Design-System-level fix, not a per-page one.

### Deliberately not built, and why

Pairing Recommendations (§14, "pairs with") — the same unscoped backend relationship Homepage, Navigation, Search, and Product Listing have each already flagged, now a fifth specification depending on it. Customer reviews (§22) — no review system exists in v1, by explicit specification design. Related Products (§15) required no new work — the vendored template's existing `RelatedProducts` component already reuses the shared `ProductPreview` card and surfaces same-catalog items via collection/tag membership, correctly absent when none exist.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (48 tests across 16 suites — 4 new files covering `QuantityStepper`'s stock-cap/uncapped behavior, `WineFactSheet`/`FoodFactSheet`'s field-omission and never-color-alone allergen display, and `ImageGallery`'s empty-state/zoom-open/Escape-close behavior) all clean.
- **Real browser validation against two temporary QA-only products** (one Wine & Spirits with real stock quantity 5, one Food Central) **plus a temporary `gift-wrap`-handled product**, created via the Admin API: the wine fact sheet, food fact sheet, quantity stepper (both the stock-capped and uncapped paths), gift wrap checkbox, add-to-cart confirmation (both toast and live region, confirmed via a real `waitForResponse`-gated Playwright interaction), and the Trust & Delivery section were all exercised and screenshotted on desktop and mobile viewports.
- **A genuine Medusa/Next.js investigation, resolved as a false lead, not a real bug**: combining `+wine_details.*`/`+food_details.*` with `*variants.calculated_price` in one Store API query appeared to silently drop the linked-module fields during isolated `curl` testing — but only when no `region_id` was supplied, an edge case the real application (which always resolves and passes a region via `listProducts`) never hits. The actual cause was a stale Next.js dev-mode fetch cache persisted on disk (`.next/cache/fetch-cache`), surviving a plain process restart; a full `.next` clear resolved it. See `DECISION_LOG.md`'s Milestone 11 entry for the full account, recorded so a future session doesn't re-diagnose the same false lead.
- All QA products and both temporary admin accounts used across this milestone's two validation rounds were fully deleted before closing — the second round's admin account via a one-off `medusa exec` script calling the User module service's `deleteUsers` method directly, bypassing the Admin API's own "a user cannot delete itself" restriction entirely. No leftover admin account remains, unlike Milestone 9's still-open one. Confirmed via a direct Store API product-count check (0) before closing.

## Milestone 12 — Cart (`06_CART_SPECIFICATION.md`)

Implements the shopping cart page — the natural destination of every add-to-cart action built across Product Listing and Product Details — following the confirmed specification order, on top of the vendored template's existing cart scaffold.

### Two-fulfillment-group layout (`fulfillment-group/`, `cart/templates/items.tsx`)

§5/§6 — Wine & Spirits and Food Central now render as two visually distinct groups, never interleaved and never sharing one delivery promise, using the same `food_details`/`wine_details` presence check (`cart-fulfillment.ts`'s `isFoodCentralItem`) every prior specification's implementation already established for catalog identification. Each group states its own delivery scope plainly ("Delivered across all of Lagos" / "Delivered within Lagos Island — same-day, scheduled, or pickup, chosen at checkout") and shows its own subtotal beneath its own items, in addition to the cart-wide total. A mixed cart additionally shows a restrained, native `<details>`/`<summary>` "Why is my cart split?" disclosure — absent entirely from a single-catalog cart, since there's nothing to explain.

### Real stock-capped quantity, reusing Milestone 11's exact stepper (`quantity-stepper/`, `cart/components/item/`)

§7/§13/§17 — the vendored `CartItemSelect` dropdown (hardcoded to a max of 10 regardless of real stock) is gone; `Item` now uses the same `QuantityStepper` built for the PDP. Wine & Spirits is capped by genuine available stock; Food Central is deliberately uncapped. `QuantityStepper` gained one new optional prop, `min` (default `1`, unchanged everywhere else) — the cart passes `min={0}` so its decrement button can reach zero, and `Item`'s `onChange` handler calls `deleteLineItem` rather than `updateLineItem` when quantity would go to zero, giving §7's "reducing a line item's quantity to zero removes it, immediately, without a blocking confirmation dialog" its own real interaction path without duplicating the shared stepper component.

### Gift Wrap, now interoperable across both surfaces it can be added from (`lib/data/cart.ts`'s `addGiftWrapToLineItem`, `product-actions/index.tsx`)

§15 — Gift Wrap is editable directly in the cart (a checkbox per eligible Wine & Spirits line item), not only at the PDP's point of add-to-cart, reusing `05_PRODUCT_DETAILS_SPECIFICATION.md` §16's decision that it's a priced line item, never a product attribute. Implemented as a second cart line item tagged with `{ gift_wrap_for: <parentLineItemId> }` metadata (Medusa has no native "line item add-on" relationship) — `cart-fulfillment.ts`'s `splitGiftWrapLines` reads this back to pair a wrap with its parent product line for display. **A genuine cross-milestone integration gap was found and fixed here**: the PDP's own gift-wrap-at-add-time flow (built in Milestone 11) added the wrap as a second, independent, unlinked `addToCart` call — invisible to this milestone's pairing logic, and miscategorized into whichever fulfillment group its own catalog-less identity defaulted to. Fixed by having `addToCart` return the line item it just created (previously discarded) and having the PDP call the same `addGiftWrapToLineItem` helper the cart's own toggle uses, so a wrap added from either surface now produces an identical, recognizable shape.

### Honest Pricing Transparency (`common/components/cart-totals/`)

§8, and the Pricing Transparency table — delivery fee and tax now read "Calculated at checkout" explicitly, with an additional "+ delivery & tax, calculated at checkout" caveat beneath the item total. **A genuine, direct spec violation in the vendored component, found and fixed**: it previously displayed `shipping_subtotal ?? 0` and `tax_total ?? 0` as literal `₦0.00` figures whenever no shipping method existed yet — indistinguishable from "free," and exactly the "presented with more certainty than the cart actually has" failure §8 forbids. The whole totals block is now wrapped in `role="status" aria-live="polite"` (§23's cart-total live-region requirement).

### Server-side stock re-validation at cart view (`app/[countryCode]/(main)/cart/page.tsx`)

§12/§13 — a Wine & Spirits line item's requested quantity is re-checked against genuine current stock every time the cart page loads, since real time has passed since add-to-cart. If stock has fallen but some quantity remains purchasable, the line item is clamped down to that amount with a visible, specific notice. If stock has fallen to zero, the line item's quantity is left untouched and it's labeled "Currently unavailable" in place instead — **confirmed by direct testing that clamping to zero via the ordinary line-item-update endpoint deletes the line item outright**, which would have silently removed it, exactly what §12/§13 forbid. Two genuine backend/framework limitations were found and worked around while building this:

- **`StoreProductVariant.inventory_quantity` is a Store API field the products route decorates but the cart module's own `items.variant` expansion never populates**, confirmed by direct `curl` testing with and without a `*variants` wildcard, in and out of the cart context — real stock now comes from a small batch `/store/products?id[]=...` lookup (`getVariantInventoryMap`) rather than trusting the cart's own field expansion for this one value.
- **Next.js 15 forbids calling `revalidateTag` during a page's render** — confirmed by direct testing (it throws `Error: ... revalidateTag ... during render which is unsupported`), which the existing cache-tag-revalidating `updateLineItem` helper does internally. The reconciliation write path calls the Medusa SDK's `updateLineItem` directly instead, and carries the corrected cart forward from that call's own response rather than re-fetching through a cache tag that a mid-render `revalidateTag` call can't actually invalidate in time.

The page also gained `robots: { index: false, follow: false }` (§25 — a cart is customer-specific and session-bound, no different from search's own `noindex` treatment).

### Accessible remove actions (`common/components/delete-button/`)

§23 — `DeleteButton` previously rendered an icon with no accessible name at all whenever used without visible text children (the cart's own usage). It now accepts an `aria-label` prop, wired to a specific `Remove ${productName}` on every cart call site.

### Three genuine accessibility violations found via live axe-core testing, and fixed

All three newly surfaced by giving the cart real, multi-item, multi-group content for the first time:

- **`empty-table-header` (minor)**: the thumbnail-image column's table header was an empty cell with no discernible text for screen readers. Fixed with a visually-hidden `sr-only` label.
- **`link-name` (serious, three instances)**: thumbnail links wrapping an image-less product (this environment's QA seed had no real images) had no accessible name at all — no `alt` text reaches the link when the image is a placeholder icon, not a real `<img>`. Fixed with an explicit `aria-label` on the link itself.
- **`page-has-heading-one` (moderate)**: the cart page's own "Cart" heading had been left at the shared `Heading` component's `h2` default. Promoted to `<h1>`.

One already-documented, systemic Design-System-level violation (the shared `Button`/`text-ui-fg-interactive` color-contrast tokens, first flagged in Milestone 7) was reconfirmed present here via the same scan and deliberately left unaltered, per that same precedent.

### Deliberately not built, and why

Saved-for-Later (§14) — a new, not-yet-approved recommendation this specification itself introduces, explicitly flagged as requiring backend scoping before implementation (§26), not a pre-approved v1 feature. Cart-level cross-selling (§18) — the same unscoped "pairs with" relationship six prior specifications have already flagged. A price-change-since-added-to-cart notice (§8/§19) — the correct comparison (a line item's captured `unit_price` against its variant's live `calculated_price`) is straightforward in principle, but this milestone's environment started from a completely empty catalog, meaning there was no way to validate the comparison against a genuine price change without either fabricating one or shipping it unverified; flagged for a future pass with real catalog data rather than guessed at now.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (58 tests across 13 suites — 14 new tests covering `cart-fulfillment.ts`'s grouping/stock/subtotal logic) all clean.
- **Real browser validation against a low-stock QA wine product (stock deliberately set to a small number for stock-cap testing), a QA food product, and a temporary `gift-wrap`-handled product**, created via the Admin API: the two-group layout, per-group subtotals, gift-wrap toggle (added from both the cart and the PDP), the "Calculated at checkout" pricing states, and both the partial-clamp and full-out-of-stock reconciliation paths were exercised directly by adjusting real inventory levels via the Admin API between page loads and screenshotting the result on desktop and mobile viewports.
- All QA products and the temporary admin account were fully deleted before closing — the account via the same one-off `medusa exec` script Milestone 11 established, calling the User module service's `deleteUsers` method directly. Confirmed via a direct Store API product-count check (0) before closing.

## Milestone 13 — Checkout (`07_CHECKOUT_SPECIFICATION.md`)

Implements the checkout flow — the seventh and final individual specification in the confirmed order, built on Cart's own "Proceed to Checkout" entry point (Milestone 12), on top of the vendored template's existing checkout scaffold.

### A genuine, total shipping-infrastructure gap, closed with a permanent seed, before any UI work

Confirmed via the Admin API (`GET /admin/shipping-options` returned empty) that this environment had **zero shipping options anywhere** — Milestone 1's seed had deliberately stopped at region/store/sales-channel. Checkout cannot function at all without at least one real shipping option a cart can select, so minimal, **permanent** (not QA-only) infrastructure was created: the existing "QA Lagos Warehouse" stock location (Milestone 12) was renamed to "LiquorCentral Lagos Warehouse" and had Medusa's native `manual_manual` fulfillment provider enabled on it; two Fulfillment Sets were created on top of it — **"LiquorCentral Nationwide Delivery"** (type `shipping`, one Service Zone "Nigeria," one flat ₦3,000 Shipping Option "Standard Delivery") and **"LiquorCentral Pickup"** (type `pickup`, one Service Zone "Lagos Island Pickup," one flat ₦0 Shipping Option "Pickup — Lagos Island"). This is production configuration, analogous to Milestone 1's own region/store/sales-channel seed — not removed at the end of this milestone, unlike every prior milestone's temporary QA products. See `docs/DECISION_LOG.md` for exact IDs and full reasoning.

### Freeform, Nigeria-appropriate address capture (`checkout/components/shipping-address/`, `billing_address/`)

§6 — the vendored template's `postal_code` and `company` fields are gone; a new "Landmark or additional directions (optional)" field (bound to `address_2`) replaces them, since a landmark is what actually helps a Lagos delivery rider, not a postal code this market doesn't use. "Phone" is relabeled "Delivery contact phone" (now required); "Address" is relabeled "Delivery address"; "City" is relabeled "City / Area." Country is fixed via a hidden input rather than the vendored country dropdown, since the region has exactly one country — showing a single-option dropdown would be actively confusing, not merely redundant. `lib/data/cart.ts`'s `setAddresses` was fixed to actually read the real `address_2` form value (previously always hardcoded to `""`) and no longer sends `postal_code`/`company` to the backend.

### The delivery-eligibility blocking condition (`lib/util/cart-fulfillment.ts`, `checkout/components/delivery-eligibility-conflict/`)

§8, §11 — Food Central only delivers within Lagos Island; a cart containing a Food Central item, shipping to a genuinely non-Lagos address, with no pickup method chosen, is a real, unresolved conflict that must block order placement, not just show a warning. `isLagosAddress()` is an honest plain-language proxy (does the customer's own `province`/`city` string contain "lagos," case-insensitive) — the precise geo-zone mechanism (postal-pattern zones vs. true radius) remains an explicitly open business decision this milestone doesn't invent (`docs/PROJECT_STATUS.md`). `hasUnresolvedDeliveryConflict()` combines this with `hasFoodCentralItems()` and `isPickupShippingMethod()` (a pragmatic proxy — detects pickup by the shipping option's own name, since the cart's shipping-method expansion carries no dedicated fulfillment-set-type field) and is reused identically by a new `DeliveryEligibilityConflict` banner (offering "change delivery address," "remove the Food Central item(s)," or "choose pickup instead") and by `PaymentButton`'s own new `notReady` prop, so the banner and the actual order-placement gate can never disagree.

### Fulfillment-group carry-forward into Order Summary and Order Confirmation (`cart/templates/preview.tsx`, `order/components/items/`)

§5 — Cart's own "never interleaved, never merged into one delivery promise" discipline (Milestone 12) now continues through checkout and past it: both the checkout sidebar's Order Summary and the post-purchase Order Confirmation page group their line items into "Wine & Spirits"/"Food Central" sections with per-group subtotals, reusing `cart-fulfillment.ts`'s `isFoodCentralItem`/`splitGiftWrapLines`/`groupSubtotal` utilities unchanged. Required extending two previously non-overridable `fields` strings (`checkout/page.tsx`'s `retrieveCart` call, `lib/data/orders.ts`'s `retrieveOrder` call) to also request `+items.product.food_details.*,+items.product.wine_details.*`.

### Pricing Transparency, complete with no new code (§13)

Cart's own `CartTotals` fix (Milestone 12 — shows "Calculated at checkout" until a real shipping method exists, a real confirmed figure once one does) is reused as-is by Checkout and Order Confirmation, since all three surfaces share the same component. The moment a real shipping method is selected in checkout, the same component automatically shows the genuine delivery fee/tax — nothing further was needed.

### Payment State Behaviour, against the only provider actually available (`checkout/components/payment/`, `payment-button/`)

§14, §26 — Paystack is the approved payment provider (`DECISION_LOG.md`), but the module itself is not yet built; this milestone wires payment-state handling (pending/failed/cancelled/expired/retry) against Medusa's placeholder `pp_system_default` provider instead, the same honest stand-in every prior milestone touching payment has used.

### Review & Confirm, with a restated age-verification reminder (`checkout/components/review/`)

`hasDeliveryConflict` (from the blocking-condition check above) gates `PaymentButton`'s `notReady` state. A reminder — "This order contains age-restricted items — you'll confirm you are 18 years or older on delivery" — renders whenever the cart genuinely contains a Wine & Spirits item (computed via `splitGiftWrapLines` + `isFoodCentralItem`, not a static string), restating the existing entry-gate commitment rather than adding a new compliance mechanism.

### A critical, newly-surfaced accessibility bug in a SHARED component, found only because this was the first time any real Shipping Option ever existed to render against (`common/components/radio/`)

A live axe-core scan against the Shipping step found `button-name` (critical) and `nested-interactive` (serious) violations, both traced to one root cause: the shared `Radio` visual-indicator component rendered a nested `<button role="radio" aria-checked="true">` — the `aria-checked` value **hardcoded to `"true"` regardless of the actual `checked` prop** — inside every consumer's own already-semantic interactive wrapper (Shipping's method/pickup radios, Payment's provider radio, the saved-address `Listbox.Option`). This had never been caught before, across four consumers and several prior milestones' own axe-core scans, because this was literally the first time any real Shipping Option ever existed for it to render against in a live browser. Fixed by converting it to a plain, `aria-hidden="true"` decorative `<span>` — every consumer already provides its own real interactive semantics, so the nested control was never necessary. Also fixed in the same pass: a confirmed `page-has-heading-one` (no `<h1>` existed anywhere on the checkout page — every step heading is an `h2`; fixed with a visually-hidden `sr-only` `<h1>Checkout</h1>` in `CheckoutForm`). One already-documented, systemic Design-System-level violation (the shared `Button`/`text-ui-fg-interactive` color-contrast issue, first flagged in Milestone 7) was reconfirmed present on the edit-address and add-discount links and deliberately left unaltered, per the same precedent.

### Focus management and live-region announcements (§21, §22)

A new shared hook, `lib/hooks/use-focus-step-heading.ts`, moves focus to a checkout step's own heading whenever that step becomes the active one — applied identically across Addresses, Shipping, Payment, and Review, so keyboard/screen-reader users land somewhere meaningful on every step transition instead of losing their place. `checkout/components/error-message/` gained `role="alert" aria-live="assertive"`, propagating to every checkout error usage (address, shipping, payment, discount) with one change.

### Empty-cart and blocking-condition checkout guard (§4, §19), and `noindex` metadata (§25)

`checkout/page.tsx` now redirects to `/cart` if the cart has no items, or if any Wine & Spirits item has confirmed zero available stock (reusing `getVariantInventoryMap`/`isStockManaged`/`isFoodCentralItem` from Milestone 12) — checkout must never render against an empty cart or a confirmed-unavailable item. Both `checkout/page.tsx` and the order-confirmation `page.tsx` gained `robots: { index: false, follow: false }` (customer-specific, session-bound content, matching Search's and Cart's own `noindex` treatment).

### Two recurring bug classes hit again, not new discoveries

- **The Next.js dev-mode stale-fetch-cache bug first documented in Milestone 11's `DECISION_LOG.md` entry recurred here** — a 500 error referencing an already-deleted Milestone-12 variant ID appeared when adding a brand-new Milestone-13 QA product to cart, because the long-running dev server had accumulated stale cached responses from before the Milestone-12 QA products were deleted. Fixed via the same established procedure: kill the dev server, `rm -rf .next`, restart fresh. Recorded again since this is the second occurrence.
- **A genuine Medusa data-integrity constraint, resolved honestly rather than bypassed**: hard-deleting the QA wine product used for validation failed with `"Cannot remove following inventory item(s) since they have reservations"` — a real, completed test order had created a genuine inventory reservation. Resolved by setting the product's `status` to `"draft"` rather than force-deleting it, preserving order history intact while returning the live catalog to its standing zero-product state.

### Deliberately not built, and why

**True per-fulfillment-group delivery-method/slot selection (§9/§10)** — Medusa's shipping-method-per-cart model is cart-wide, not per-catalog-group, and the `delivery-slot` module (Milestone 4) has no storefront wiring at all. One combined shipping-method selection serves the whole cart instead, an honest v1 simplification, not silently smoothed over. **Real Paystack integration** — the provider choice is approved, but the module itself isn't built; `pp_system_default` is the placeholder, same as every prior milestone. **Cash-on-delivery** — already resolved as unsupported, nothing to build. **A hard age-recheck at order confirmation** — still an open business decision; only the existing reminder is restated, no new compliance gate added. **A real notification channel** — the channel choice (Email/WhatsApp/in-app) is decided, but the provider module itself remains unbuilt.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (71 tests across 14 suites — 13 new tests covering `cart-fulfillment.ts`'s new Lagos-eligibility/conflict-detection functions) all clean.
- **Real browser validation** end to end: added a real QA wine product and a real QA food product to cart, submitted a real non-Lagos delivery address (triggering the conflict banner), switched to the Pickup shipping option (resolving it), completed a real placeholder-provider payment, and confirmed the resulting order page correctly grouped both catalogs with their own subtotals. A live axe-core scan was run against the Shipping step (finding and fixing the `Radio` bug above) and against the Order Confirmation page (finding only the pre-existing color-contrast issue). Both desktop and mobile viewports were screenshotted at each state.
- The QA food product and the temporary admin account were fully deleted before closing (the account via the same `medusa exec` script workaround). The QA wine product was **unpublished** (`status: "draft"`), not deleted, since a real completed test order's inventory reservation blocked hard-deletion — confirmed via the Store API that the live catalog count is back to 0 while the product and its order history remain intact.

## Milestone 14 — Customer Account (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`)

Implements the account area — the eighth specification in the confirmed order, built on Checkout's order-confirmation entry point (Milestone 13) and the vendored template's existing account module, which turned out on inspection to be partly stubbed (password change, email change) and partly missing (password reset, reordering, notification preferences, privacy/deletion) relative to the frozen specification.

### Password reset, entirely new (`account/components/forgot-password/`, `reset-password/`, `app/.../reset-password/`)

§9 — a "Forgot password?" link on the login step (never buried), a generic "if an account exists, a reset link has been sent" message regardless of what actually happened server-side (`lib/data/customer.ts`'s `requestPasswordReset` swallows the outcome deliberately), and a reset-completion page mirroring `verify-account`'s own verifying/success/error pattern for consistency, built against native Medusa Auth's own `resetPassword`/`updateProvider` methods — no custom mechanism invented.

### Password change, actually implemented (`account/components/profile-password/`)

§11, Session & Security Behaviour — the vendored template's version was a literal `console.info("Password update is not implemented")` stub with no wiring at all. `lib/data/customer.ts`'s new `updateCustomerPassword` re-authenticates with the *current* password first (the step-up pattern this document requires for every sensitive action) before accepting a new one, then rotates the current session to the freshly-issued token. **A genuine, confirmed native-Medusa limitation, not a gap in this implementation**: JWTs have no server-side revocation list, so "invalidates every other active session" can only be partially honored — a token already issued to another device remains valid until it naturally expires. Flagged, not silently claimed as solved.

### Email change: investigated, found genuinely blocked, and left honestly read-only (`account/components/profile-email/`)

§11 wants email changes to require re-verification before taking effect. Direct inspection of `@medusajs/auth-emailpass`'s own source found its `update()` method only ever reads a `password` field — there is no code path anywhere that renames an auth identity's `entity_id` (the email a customer actually logs in with). Calling the Customer module's own `update({ email })` would only change the *displayed* record, silently leaving the *login* identity pointed at the old address — a real, confusing mismatch, not a cosmetic one. Rather than ship a control that quietly breaks login, email is shown read-only with an honest note. Needs new backend work (a mechanism to rename or re-link an auth identity) this milestone doesn't invent.

### Saved Addresses, matching Checkout's own freeform model (`account/components/address-card/`, `address-book/`)

§12 — "saved addresses use the identical freeform, landmark-friendly field structure already established in Checkout §7" — no `postal_code`, no `company`, country fixed via a hidden input, a landmark/directions field. One address may be marked default (a "Default" badge, a "use as my default address" checkbox), enforced client-side (`clearOtherDefaultAddresses` in `lib/data/customer.ts`) since **the Customer module's Address entity has no service-level exclusivity constraint on `is_default_shipping`/`is_default_billing` at all** — confirmed by inspecting `@medusajs/customer`'s own models and migrations directly, not assumed. Checkout's own `ShippingAddress` now pre-fills from the customer's default address when the cart doesn't already carry a real one of its own (§12's "pre-selected at checkout"). The vendored `ProfileBillingAddress` — a separate, apparel-store-shaped "Billing address" Profile section duplicating this same concept with the old rigid model — was removed entirely, since the frozen specification's own flat Information Architecture (§5) has no separate billing-address section.

### Order history, status, and a real re-validating Reorder action (`account/components/order-card/`, `overview/`, `reorder-button/`, `lib/data/orders.ts`, `lib/util/reorder.ts`)

§13 — each order now shows a real status badge (Medusa's own native `fulfillment_status`, no invented taxonomy) alongside date/total/item-count, in both the account Overview and the full Orders list. §15's Reorder action re-validates every line against genuinely current availability and pricing before adding it to a fresh cart — never a blind copy of the old order. A pure, unit-tested decision function, `resolveReorderDecision` (`lib/util/reorder.ts`), determines per line whether to add (clamped to real available stock, the same "clamp down, never silently drop to zero" discipline Cart's own stock reconciliation established) or report unavailable (the variant is no longer returned by the Store API at all — discontinued, unpublished, or deleted). A price change since the original order is detected by comparing the newly-added line's current `unit_price` against the order line's captured one, and surfaced in a plain-language summary before the customer reaches the cart. Gift-wrap lines are deliberately excluded from reorder — re-adding a wrap tied to a specific past line item id has no stable meaning against a brand-new cart's own fresh lines.

### Notification Preferences, an honest stub (`account/components/notification-preferences/`)

§16 — "specifies that a preference exists and is respected, not the channel(s) it applies to... once the notification-channel decision is made." Email and WhatsApp are approved channels, but the notification *provider module* that would actually send anything through either is not yet built (its Tier B document remains Draft). Building a toggle with nothing behind it would look functional while silently doing nothing — worse than not building it. States the current, honest situation instead.

### Privacy & Security, with a real (request-intake, not automated) deletion/deactivation pathway (`account/components/privacy-security/`)

§17, §18 — shows the customer's own data (name, email, phone, saved-address count) plus a note that the exact data-retention/NDPR specifics remain an open business/legal decision. §18's deletion/deactivation request requires re-confirming the current password (the same step-up pattern as password change) before writing a real, timestamped field to the customer record (`account_deletion_requested_at`/`account_deactivation_requested_at`, visible to whoever processes it) and signing the customer out. **This is a real, working mechanism, not a simulated one — but it is intake only**: the exact deletion-vs-deactivation policy (waiting periods, anonymization) is explicitly still open (§28), so nothing here claims future logins are actually blocked or that data is actually anonymized, since no backend enforcement of either exists yet. Focus moves to the confirmation message afterward (§22's "irreversible action" requirement), via a `tabIndex={-1}` ref and `role="status" aria-live="polite"`.

### Two genuine, platform-wide bugs found via live testing, affecting far more than this milestone's own new code

- **The shared `Input` component (`common/components/input/`) had no `id` attribute on its underlying `<input>` at all**, so the sibling `<label htmlFor={name}>` never actually associated with it — `htmlFor` pointed at a `name` value, not a real `id`. A live axe-core scan of the login/register pages found `label` (critical) and `label-title-only` (serious) violations on every text field. This affects **every form built with this one shared component across the entire platform** — checkout, product actions, and this milestone's own new forms — and had never been caught before because this was the first time any axe scan in this project's history had actually run *while* a form using this component was open and rendering raw fields (Checkout's Milestone 13 scan happened to run one step past the address form each time it filled one in). Fixed with `id={name}` (overridable via props, matching the component's own existing default-then-override pattern).
- **Medusa v2 creates every cart's `shipping_address`/`billing_address` record eagerly, at cart-creation time — non-null, but every field but `country_code` is `null` until a real address is submitted.** Found via direct inspection of a live cart through the Store API, after this milestone's own new default-address prefill logic silently never ran. Six checkout call sites across five files — all written in Milestone 13 — had been checking bare `cart.shipping_address &&` truthiness as their "has a real address" signal, meaning the delivery-eligibility conflict gate, the payment button's readiness check, the review step's step-completion gate, the delivery step's "Edit" link visibility, and the address step's own collapsed-summary view had all been evaluating as if a real address existed from the very first render, before the customer ever entered anything. `06_CART_SPECIFICATION.md`'s own `cart/templates/summary.tsx` had already discovered and correctly handled this exact gotcha (`!cart?.shipping_address?.address_1`); Checkout's own code just never reused that discipline. Fixed with one new shared helper, `hasRealAddress()` (`lib/util/cart-fulfillment.ts`), applied at all six call sites.

### A second instance of the "shared collapsed-state stays interactive" bug class Milestone 13 fixed for `Radio` (`account/components/account-info/`)

The account area's field-edit-in-place pattern (`AccountInfo`) collapses a field's edit form via `max-h-0 opacity-0` — but with `overflow-visible` (needed so it isn't clipped) and no `pointer-events-none`, the collapsed form's own "Save changes" button remained genuinely clickable and keyboard-focusable despite being invisible. Found via real Playwright automation: a click aimed at the Password field's "Edit" button was silently intercepted by the Name field's own hidden "Save" button sitting on top of it, timing out the test. Fixed with `inert` (React 19's native support), which correctly disables pointer/keyboard interaction and removes the subtree from the accessibility tree while collapsed — a more complete fix than `pointer-events-none` alone, since it also fixes tab order. Success/error states in the same component gained `role="status"`/`role="alert"` `aria-live` announcements.

### A QA-seeding gap caught mid-validation, not an application bug

This milestone's two fresh QA products (a wine variant, a food item) were created via the Admin API without a `shipping_profile_id` link — Medusa's real `completeCartWorkflow` correctly rejected order placement with "cart items require shipping profiles that are not satisfied by the current shipping methods." Confirmed via direct inspection of the `product_shipping_profile` link table (empty for both), linked both products to the store's one real shipping profile, and re-validated successfully. Recorded so a future QA seed doesn't repeat the omission.

### Other genuine, real bugs found and fixed via live axe-core testing against a real signed-up customer, two real saved addresses, and a real placed mixed order

- Two `heading-order` breaks from `AccountLayout`'s and `TransferRequestForm`'s own `<h3>`s — both simply needed `<h2>`, since account pages had never carried enough real content before for the skip to be reachable.
- A `heading-order` break from `AccountNav`'s own desktop "Account" section label, which was itself an `<h3>` positioned *before* every account page's own `<h1>` in DOM order (`AccountLayout` renders the nav ahead of `{children}`) — converted to a plain `<p>`, since it's a nav-section label, not page content.
- A missing `page-has-heading-one` and an invalid `<ul><span>` (the empty-orders-list case wasn't wrapped in `<li>`) on the account Overview page.
- A `Badge color="success"` tried first for the "Default" address badge failed contrast — swapped for the already-passing `color="neutral"` rather than editing the frozen `DESIGN_SYSTEM.md` token itself.
- A genuine, direct trust-violation on the Orders page: copy claiming "you can also create returns or exchanges for your orders if needed" — false, no returns pathway exists, pending the still-open alcohol-return-policy decision. The same class of fabricated-trust-signal bug Milestone 11 found in the vendored PDP's "no questions asked" refund copy.
- Residual "Medusa Store" branding in Register's heading/copy and page metadata across Login/Profile.

One already-documented, systemic Design-System-level violation (the shared `Button`/`text-ui-fg-interactive` color-contrast tokens, first flagged in Milestone 7) was reconfirmed present via this milestone's own scans and deliberately left unaltered, per that same precedent.

### Deliberately not built, and why

**Real notification-channel toggles** (§16) — the provider module doesn't exist yet. **Automated, policy-enforcing account deletion/deactivation** (§18) — the policy itself is still an open business/legal decision; only the request-intake mechanism is real. **A real email-change flow** (§11) — blocked on a confirmed Medusa Auth architecture limitation, not a business decision; needs new backend work. **Multi-factor authentication, concurrent-session listing/management UI, rate-limit threshold tuning** — Session & Security Behaviour names these as implementation parameters the document doesn't fix; native Medusa Auth's own request-level protections are relied on as-is, not audited or extended here.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (80 tests across 15 suites — 9 new tests covering `hasRealAddress` and the pure reorder-decision function) all clean.
- **Real end-to-end validation**: signed up a fresh customer, added two freeform saved addresses (confirming default-exclusivity enforcement and no duplicate-`id` collisions across multiple rendered address cards), placed a real mixed Wine & Spirits + Food Central order through the full Checkout flow (confirming the default-address prefill fix), viewed it in Order History with its real status badge, reordered it successfully into a fresh cart (confirming both catalogs re-grouped correctly with current prices), changed the account password successfully, and requested account deactivation (confirming the real sign-out and the confirmation message's focus management). A live axe-core scan ran at every step.
- The QA food product and the temporary QA admin account were fully deleted before closing (the account via the same `medusa exec` script workaround). The QA wine product was unpublished (`status: "draft"`), not deleted, since real orders and a real reorder created inventory reservations blocking hard-deletion — the live catalog count was reconfirmed at 0 before closing. Test customer accounts created during validation were deliberately left in place — no customer-deletion mechanism exists (§18 is request-intake only), the same category of harmless test artifact as the placed test orders themselves.

## Milestone 15 — Food Ordering (`09_FOOD_ORDERING_SPECIFICATION.md`)

Implements the ordering-specific behavior beyond generic catalog browsing that Food Central needs — the ninth specification in the confirmed order, built on Customer Account (Milestone 14). Research against every prior milestone's actual implementation (not assumption) found roughly 60–70% of the specification already satisfied: catalog structure via `food-details`/Navigation's static Food Central routes, ingredient/allergen/prep-time display via Product Details §11, mixed-order handling via Cart/Checkout's fulfillment-group discipline, and quantity-uncapped/no-customization via the existing stepper. This milestone's own new work narrows to exactly two mechanisms the specification names as a decided minimum with no existing backend home, plus wiring three static placeholder pages into a real listing.

### The Available/Unavailable dish flag, deliberately not added to `food-details` (`lib/util/food-availability.ts`, backend's `admin/widgets/food-availability-widget.tsx`)

§6, §16 — a dish can be "86'd" mid-day due to an ingredient shortage, shown in place as Unavailable rather than silently removed. `TIER_B_FOOD_ATTRIBUTES_MODULE.md` (Approved, frozen) explicitly and repeatedly excludes this exact concept from the `food-details` module ("no attribute record from this module ever stores or computes a live availability state") — so rather than add a new custom module (data model, service, migration, link, workflow hooks) for a single boolean, it's stored on Product's own native `metadata` field (`food_available`), toggled via a new admin widget mirroring the existing `food-details-widget.tsx`/`wine-details-widget.tsx` pattern. `storefront/src/lib/data/products.ts`'s shared `listProducts` helper already appends `+metadata` to every request centrally (a Milestone 9 fix), so no per-call-site field-string change was needed anywhere it's read. `isFoodCentralUnavailable()` is wired into both `ProductPreview` (a distinct "Unavailable" label, never the same "Sold out" text Wine & Spirits' stock-based check uses) and `ProductActions` (disables Add to Cart with dedicated messaging, distinct from "Out of stock").

### The cook-to-order status progression (`lib/util/food-order-status.ts`, `order/components/food-order-status/`, backend's `admin/widgets/food-order-status-widget.tsx`)

§7 — the specification's own decided minimum: Order Received → Preparing → Ready (for pickup) or Out for Delivery → Completed; only the sub-granularity within a stage is left open. Stored on Order's own native `metadata` field (`food_order_status`) — already a validated, writable field on the native `POST /admin/orders/:id` route, so no new backend route or migration was needed. A new admin widget offers a fixed five-option dropdown rather than the native Metadata editor's generic free-text entry, reducing the chance of a staff typo the storefront can't recognize. `FoodOrderStatus` renders real heading/list semantics plus a live region on order confirmation, order details, and the account order list — but only when an order genuinely contains a Food Central item *and* a stage has actually been set; an order with neither shows nothing, never a fabricated default. The displayed third stage (Ready for Pickup vs. Out for Delivery) is chosen automatically from the order's own shipping method, reusing the same `isPickupShippingMethod()` helper Checkout's delivery-conflict logic already established.

### A real Food Central menu listing, replacing three static placeholders (`food-central/components/menu-grid/`)

The three `/food-central` route pages (Today's Menu, Pickup, Scheduled Orders) were 100% static before this milestone — each unconditionally rendered the `NotTakingOrders` empty state regardless of actual catalog content, even though the homepage's own Food Central Spotlight had already proven a real `listProducts({ fields: "+food_details.*" })` + filter query worked. Extracted that exact pattern into a shared `FoodCentralMenuGrid` and wired all three routes to it. Since pickup/scheduling selection both genuinely happen at Checkout (§9/§10/§11, not redefined here) and no cutoff/scheduling infrastructure exists to differentiate the three destinations yet, all three correctly show the identical real menu today — the honest current state, not a shortcut.

### Deliberately not built, and why

**The "Available to schedule" third availability state** (§6) — distinguishing "past today's cutoff, bookable ahead" from "genuinely 86'd" needs both a decided cutoff time and delivery-slot storefront wiring, both explicitly "not yet built"/"not yet decided" per §25's own Backend Requirements table (confirmed: zero references to `delivery-slot`/`deliverySlot` anywhere in `storefront/src`). **The same-day cutoff countdown and any scheduling-picker UI** (§9, §10) — same dependency. **Kitchen operating hours/early-closure gating** (§22) — `§25` independently lists this as "not yet scoped," a distinct question from the general delivery-slot "9am–11pm" figure recorded elsewhere in the tracking docs, per `TIER_B_DELIVERY_SLOT_MODULE.md`/`TIER_B_FOOD_ATTRIBUTES_MODULE.md`'s shared confirmation that neither module owns Food Central's live kitchen-hours state.

### A pre-existing, platform-wide accessibility finding, reconfirmed rather than fixed

A live axe-core scan of the new pages found one color-contrast violation (`ui-fg-muted`/`ui-fg-interactive`), traced directly to `@medusajs/ui-preset`'s own vendored color tokens (confirmed via inspecting `node_modules/@medusajs/ui-preset` directly), not a first-party component this milestone touched. The same class of finding as the already-documented, systemic `Button`/`text-ui-fg-interactive` violation carried since Milestone 7 — reconfirmed present and deliberately left unaltered, since fixing a vendored Medusa UI design token would ripple across every previously-shipped, already-audited page platform-wide, a Design-System-level change out of this milestone's own scope.

### A pre-existing inconsistency fixed while touching adjacent code, not introduced here

`order/components/order-details/index.tsx` had its own private, byte-identical duplicate of the already-shared `lib/util/order-status.ts` formatter (created in Milestone 14) — consolidated to the shared version while adding the new status display to this file. A pre-existing typo in the same file (`sata-testid="order-payment-status"`, silently never matching any test selector) was fixed in the same pass.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (80 tests across 14 suites, unchanged from Milestone 14 — no new pure-function logic warranted new unit tests this milestone) all clean. The backend's own `medusa build` (types, lint, backend + admin dashboard compile) also clean.
- **Real end-to-end validation**: created two temporary QA dishes via the Admin API (one left Available, one flagged Unavailable via the new admin widget), confirmed both render correctly on the Today's Menu listing and their own PDPs (real Playwright screenshots, not static review) — the available dish shows a working Add to Cart; the unavailable one shows "Unavailable" with no Add-to-Cart control anywhere. Placed one real order through the full Store API checkout flow (pickup method), set its status to "Preparing" via the new admin widget, and confirmed the live-heading/list/live-region status display renders correctly (with the automatically-chosen "Ready for Pickup" third stage) on the order confirmation page.
- Both QA products were deleted afterward (Food Central's untracked inventory meant no reservation blocked hard-deletion, unlike several prior milestones' wine products); the temporary QA admin account was deleted via the established `medusa exec` self-deletion-workaround script. The one real test order was deliberately left in place as an ordinary historical record, consistent with every prior milestone's treatment of completed test orders.

## Milestone 16 — Delivery Tracking (`10_DELIVERY_SPECIFICATION.md`)

Implements the post-order delivery-tracking behavior this specification adds beyond what Food Ordering already built — the tenth specification in the confirmed order. `10_DELIVERY_SPECIFICATION.md` was found already drafted, Approved — Frozen (v1.0), correcting a stale "not yet drafted" note carried in the tracking docs. Direct comparison against the frozen document found coverage (§5), the two-fulfillment-leg model (§5, §15), pickup (§8), and address/landmark handling (§12) all already satisfied by Cart, Checkout, and Food Ordering — the genuinely new work is Wine & Spirits' own delivery-status progression (§10) and rendering both catalogs' statuses independently on a mixed order (§15).

### Wine & Spirits' own delivery-status progression, specified here for the first time (`lib/util/wine-delivery-status.ts`, `order/components/wine-delivery-status/`, backend's `admin/widgets/wine-delivery-status-widget.tsx`)

§10 — Order Placed → Dispatched → In Transit → Delivered, the nationwide-dispatch equivalent of Food Ordering's own cook-to-order progression (`09_FOOD_ORDERING_SPECIFICATION.md` §7). Implemented via the identical mechanism: `order.metadata.wine_delivery_status` (a native field, no migration) set through a new admin widget mirroring `food-order-status-widget.tsx` exactly, and displayed via `WineDeliveryStatus`, a component structurally identical to `FoodOrderStatus` — real heading/list semantics, a live region, renders nothing when the order has no Wine & Spirits item or no stage has been set.

### Both legs shown independently, never merged (`order/components/delivery-status/`)

§15 — "no delivery communication ever merges the two legs into one combined status." A new `DeliveryStatus` wrapper renders both `WineDeliveryStatus` and `FoodOrderStatus`; on a genuinely mixed order it gives each its own catalog-labeled heading ("Wine & Spirits status"/"Food Central status"), and on a single-catalog order each keeps its plain "Order status" default — there's no ambiguity to resolve when only one is present. Wired into both the order-confirmation and account order-details templates in place of the bare `FoodOrderStatus` Milestone 15 added.

### Deliberately not built, and why

**Rider assignment/dispatch** (§7) — the specification itself states this "is currently an operational process (manual/staff-coordinated), not a dedicated software module." **Proof of delivery** (§17) — "not yet scoped" per the specification's own Backend Requirements table. **The delivery-fee schedule, rescheduling/cancellation policy, and the failed-delivery-attempt policy** (§13, §14, §16) — all named as genuine open business/operational decisions the specification itself doesn't resolve. **Proactive WhatsApp/SMS delivery communication** (§18) — depends on the still-unbuilt, still-Draft notification provider module. **Live GPS tracking, third-party courier integration, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, and locker pickup** (§27) — all explicitly out of scope per direct instruction; none appear anywhere.

### A pre-existing, already-documented accessibility finding, reconfirmed rather than fixed

A live axe-core scan of the order-confirmation page found one color-contrast violation (`bg-primary`), the same systemic `Button` finding carried since Milestone 7 — traced to an element unrelated to any component this milestone added, reconfirmed present and deliberately left unaltered per the established precedent.

### Validated with real execution, not just static analysis

- `tsc --noEmit`, `next lint`, `next build` (real backend running), and the full Jest suite (80 tests, unchanged — no new pure-function logic warranted new unit tests) all clean. The backend's own `medusa build` also clean.
- **Real end-to-end validation**: created one temporary QA wine product and one temporary QA food product, placed a real mixed order through the full Store API checkout flow, set both new admin widgets (Dispatched; Preparing), and confirmed both status blocks render correctly, independently, clearly labeled, on the order confirmation page (real Playwright screenshots) and both admin widgets render correctly side by side in the Admin dashboard.
- Both QA products and the temporary QA admin account were deleted after validation; the one real mixed test order was deliberately left in place as an ordinary historical record, consistent with every prior milestone's treatment of completed test orders.

## Milestone 17 — Admin Workflows (`11_ADMIN_WORKFLOWS_SPECIFICATION.md`)

The eleventh and final specification in the confirmed order — a backend-only milestone (the admin dashboard, not `storefront/`), recorded here for consistency with every prior milestone's documentation location. Comparing the frozen document's 30 sections against every prior milestone's actual implementation found nearly all its scope already satisfied by existing work: product/attribute management (Milestones 2–3's `wine-details`/`food-details` widgets), category/collection management (native Medusa Admin, Milestone 7's seeded tree), inventory/availability management (native Inventory plus Milestone 15's `food-availability-widget`), pricing (native Medusa Pricing), a mixed order's two fulfillment legs already shown to staff as distinctly as to the customer (Milestones 15/16's two independent status widgets), kitchen/delivery status advancement (those same widgets), and customer support order/account lookup (native Admin's Customer→Orders view). The one requirement with no existing surface anywhere was §5's at-a-glance operational dashboard.

### An operations dashboard, on the closest honest native surface (`backend/apps/backend/src/admin/widgets/operations-dashboard-widget.tsx`)

§5 — Medusa Admin has no dashboard/home injection zone at all, confirmed by inspecting `@medusajs/admin-shared`'s own full zone list directly rather than assuming one existed. `order.list.before` (appearing above the Orders list table) was chosen as the closest honest surface, since order volume/status is §5's own primary named content. Shows total order count, a Food Central queue count, and a Wine & Spirits in-transit count, all with equal visual weight (Cross-Catalog Operational Parity — neither catalog's summary positioned or weighted as more important). The two catalog counts are computed over an honestly-stated recent-orders sample ("last 50 orders"), not a fabricated full-history total — §18 explicitly names a dedicated reporting/aggregation mechanism as "not yet built," and building a true historical aggregation endpoint here would be inventing backend capability the specification itself says doesn't exist yet.

### Deliberately not built, and why

**Promotional-collection start/end-date fields and simultaneous-cap enforcement** (§7, §10) — a real, buildable gap, but no live promotional Collection exists anywhere in this environment to validate an enforcement mechanism against; the identical reasoning Milestone 12 applied when it found no real catalog data existed to validate price-change detection against genuine (not fabricated) price movement. **Staff roles/permissions** (§15) — a genuinely open business/technical decision the specification itself doesn't resolve. **Audit logging** (§20) and **staff-facing notifications/alert thresholds** (§19) — both "not yet scoped" per the specification's own Backend Requirements table. **Richer reports/analytics beyond the dashboard snapshot** (§18) and **a CMS-authoring workflow** (§16, dependent on the not-yet-approved Sanity integration) — both explicitly deferred.

### Validated with real execution

- The backend's own `medusa build` (types, lint, backend + admin dashboard compile) clean.
- **Real end-to-end validation**: a temporary QA admin account logged into the real running Admin dashboard and confirmed the widget renders correctly on the Orders page with accurate counts. The counts correctly showed 0 for both catalog queues, reflecting that the underlying QA test products from Milestones 15/16 had already been deleted during those milestones' own cleanup — an honest consequence of cleanup order, not a bug, and confirmed as such by re-checking the widget's own product-presence logic against that expectation.
- The temporary QA admin account was deleted afterward via the established `medusa exec` self-deletion-workaround script; no QA products were created or needed for this backend-only milestone.

**With this milestone, all eleven specifications in the confirmed implementation order (`01` through `11`) are complete.**

## Milestone 18 — Paystack payment provider and email/WhatsApp notification providers

A backend-only milestone (`backend/apps/backend/`, not `storefront/`), recorded here for consistency with every prior milestone's documentation location. Per Paul's direct instruction, built the two remaining approved-but-unbuilt backend modules — Paystack (`MEDUSA_EXTENSIONS.md` #4) and the email/WhatsApp notification channels (`MEDUSA_EXTENSIONS.md` #5) — ready to activate the moment real credentials exist.

### Paystack, a real redirect-based payment provider (`backend/apps/backend/src/modules/payment-paystack/`)

Paystack's standard integration is a hosted checkout page, not a client-confirmed inline flow like Stripe's — `initiatePayment` creates a Paystack transaction and returns its `authorization_url` in the storefront-visible `data` field; `authorizePayment` verifies the transaction directly with Paystack rather than trusting a redirect alone; `getWebhookActionAndData` independently confirms via Paystack's HMAC-SHA512-verified `charge.success` webhook. Paystack auto-captures a successful charge, so `capturePayment` is an honest no-op rather than inventing a manual-capture step Paystack's API doesn't have.

### Email and WhatsApp notification providers (`backend/apps/backend/src/modules/notification-whatsapp/`, `@medusajs/notification-sendgrid`)

Email uses Medusa's own official SendGrid package — its raw-HTML `content` path means no SendGrid Dynamic Template needs pre-creating in SendGrid's dashboard. WhatsApp is a custom provider against Meta's Cloud API; since every message this platform sends is business-initiated, every send uses a pre-approved WhatsApp message template (free-form text is rejected outside a customer-reply window) — a real, load-bearing constraint, not an implementation detail glossed over.

### Every provider activates by adding credentials, not by a further code change

All three are registered conditionally in `medusa-config.ts`, only once their own required environment variable(s) exist — confirmed by direct testing with the dev server in three states: no keys (boots identically to before); real-shaped fake keys for all three services (confirms registration succeeds and, for the notification path, that a real placed order's `order.placed` event correctly routes to SendGrid's real API — failing only on the fake key's own 401 rejection, not on any wiring problem); then reverted. See `backend/apps/backend/.env.template` for exactly which variables each service needs and where to find them, and the one extra manual step Paystack needs (linking the region to the new provider via `POST /admin/regions/:id`, the same pattern Checkout's shipping options already use).

### A first real notification consumer (`backend/apps/backend/src/subscribers/order-placed.ts`)

Fires on Medusa's native `order.placed` event (no custom event needed) and sends an order-confirmation email. Validated against two real placed test orders in different environment states, confirming the subscriber's failure mode changes exactly as expected (no provider found → real SendGrid API rejection) as credentials are added.

### Deliberately not built, and why

**Further event-triggered notifications** (dispatch/preparing/delivered status-change messages using the Milestone 15/16 order-status mechanisms, password-reset-via-WhatsApp) — `MEDUSA_EXTENSIONS.md` #5 itself warns against underscoping this as a quick add-on; building every touchpoint before even one has a real credential to prove itself against risks unverified sprawl. **The storefront's own Paystack redirect UI** (a "Continue to Paystack" button, callback handling in Checkout) — cannot be meaningfully tested without a real Paystack key and a live redirect round-trip; shipping untested UI against a real payment flow is a correctness risk not worth taking blind. Both are the natural next step once Paul supplies real credentials.

### Validated with real execution

- The backend's own `medusa build` (types, lint, backend + admin dashboard compile) clean throughout.
- **Real end-to-end validation**: three separate dev-server boot states (no keys; all three services with real-shaped fake credentials; reverted) each confirmed via `curl`'s health check and direct log inspection. Registered `pp_paystack_paystack` against the Nigeria region via the Admin API, confirmed it appeared in the Store API's payment-providers list, then reverted. Placed two real test orders via the Store API to exercise the `order.placed` subscriber in two different credential states.
- Three temporary QA admin accounts (one per boot-validation pass) and one temporary QA product were deleted afterward via the established cleanup patterns; the two real test orders were deliberately left in place as ordinary historical records.

## What's deliberately not here yet

- **Meilisearch-backed search: ranking/typo-tolerance/synonyms, autocomplete, editorial boosting, and faceted search results** (`03_SEARCH_SPECIFICATION.md` §7, §8, §9, §11, §13) — Meilisearch itself remains unapproved (`DECISION_LOG.md`); `/search` today is a real native results page (unified list, catalog badges, sort, Load More, honest zero-result recovery — Milestone 10) but not this document's full mechanism set. **Search-within-category** (§4, §15/§16) also remains unbuilt — no scoped-search affordance exists on category pages yet.
- **Product Listing's own filtering/facets** (§10) — reuses Search's §13 facet system per §10's own text, so it shares the exact same Meilisearch-approval gate as Search's own implementation, above; no facet UI exists on any listing yet.
- **A real "Featured" merchandising order and a real promotional-badge mechanism** (§9, §11, §17, Product Card Information Hierarchy) — no per-product manual-rank field exists in Medusa's native model, and no promotional-badge mechanism exists on the platform at all; "Featured" is an honest no-op fallthrough to the API's natural order, and every card's one-fact slot only ever surfaces Food Central's prep-time fact today. Both need Paul's attribute-field-list approval (the same one blocking full catalog population) before a real implementation is possible.
- **The "pairs with" cross-catalog relationship** (§8.6, §13, §14, §18, §19, Product Details §14, and now Cart §18) — the underlying data model doesn't exist yet (`MEDUSA_EXTENSIONS.md`'s own open item); no cross-link UI was built or invented here. Six specifications now depend on this same gap — the Homepage's "Wine & Food, Connected" section, Product Details' Pairing Recommendations, and Cart's own single-catalog cross-sell suggestion are all correctly absent rather than faked.
- **Customer reviews** (`05_PRODUCT_DETAILS_SPECIFICATION.md` §22) — no review system exists in v1, by explicit specification design; no star rating, review count, or review content appears anywhere on a PDP.
- **Faceted-URL canonicalization** (§26) and **navigation/homepage/listing/cart analytics events** (§18, §25, Cart §24) — no facets exist yet to canonicalize, and no analytics infrastructure exists anywhere in this project yet to wire events into.
- **Merchandising promotional-Collection caps/expiry enforcement** (Merchandising Strategy section) — no Collections have been created yet; the mega menu and Curated Collections already render whatever Collections exist (data-driven, §12), but no cap/expiry logic was built ahead of real data to enforce it against.
- **A real payment provider** — Paystack is the approved choice (`DECISION_LOG.md`), but the module itself is not yet implemented; Checkout (Milestone 13) is fully wired against Medusa's placeholder `pp_system_default` provider instead.
- **Any real product/catalog data persisted between sessions** — pages render correctly with empty results; Milestones 9 through 15's own visual validation each used temporary QA-only products, created and deleted (or, for the wine product each time, unpublished after a real order's inventory reservation blocked deletion) via the Admin API specifically for that purpose — see this README's own Milestone sections and `DECISION_LOG.md`.
- **A real customer email-change flow** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §11) — a confirmed native Medusa Auth architecture limitation (no mechanism to rename a login identity's email), not a missing UI; email is shown read-only. Needs new backend work.
- **Automated, policy-enforcing account deletion/deactivation** (§18) — a real request-intake mechanism exists (Milestone 14: a timestamped field on the customer record, gated by password re-confirmation), but the underlying deletion-vs-deactivation policy is an explicitly open business/legal decision this milestone doesn't invent; nothing is automated against a policy that doesn't exist yet.
- **Real notification-channel preferences** (§16) — the channel choice (Email/WhatsApp/in-app) is decided, but the provider module that would actually send anything through either doesn't exist yet; Notification Preferences is an honest informational stub.
- **Multi-factor authentication and concurrent-session management UI** (Session & Security Behaviour) — named as implementation parameters the specification itself doesn't fix; native Medusa Auth's own protections are relied on as-is.
- **The Gift Wrap add-on** (Product Details §16, Cart §15) is built and now interoperable across both surfaces (Milestone 12) but still dormant — it renders only once a real product with handle `gift-wrap` exists in the catalog; no code change needed to light it up, just creating that product in the Admin.
- **Saved-for-Later** (Cart §14) — a new, not-yet-approved recommendation `06_CART_SPECIFICATION.md` itself introduces, requiring backend scoping before implementation; not built.
- **A price-change-since-added-to-cart notice** (Cart §8/§19) — the correct comparison is straightforward in principle (captured `unit_price` vs. the variant's live `calculated_price`), but not implemented without real catalog data to validate it against genuine, not fabricated, price movement.
- **True per-fulfillment-group delivery-method/slot selection** (`07_CHECKOUT_SPECIFICATION.md` §9/§10) — the backend's `delivery-slot` module (Milestone 4) has no storefront-facing UI yet, and Medusa's shipping-method model is cart-wide, not per-catalog-group; Checkout uses one combined shipping-method selection for the whole cart instead. The calendar-grid slot picker itself remains entirely unbuilt.
- **Food Central's "Available to schedule" third availability state, the same-day cutoff countdown, and any scheduling-picker UI** (`09_FOOD_ORDERING_SPECIFICATION.md` §6, §9, §10) — the same delivery-slot storefront-wiring gap as the bullet above, plus an undecided cutoff time; only the binary Available/Unavailable distinction is built (Milestone 15). **Kitchen operating hours/early-closure gating** (§22) — named as "not yet scoped" by the specification's own Backend Requirements table, a distinct question from the general delivery-slot "9am–11pm" figure recorded elsewhere in the tracking docs.
- **The precise Lagos geo-zone definition underlying Checkout's delivery-eligibility blocking condition** (§8/§11) — `isLagosAddress()` is an honest plain-language proxy (does the address name Lagos), not the real geofencing/postal-zone mechanism, which remains an open business decision (`docs/PROJECT_STATUS.md`).
- **Cash-on-delivery, a hard age-recheck at order confirmation, and a real notification channel** — the first is already resolved as unsupported (nothing to build); the second remains an open business decision, with only the existing age-verification reminder restated at Checkout's Review step; the third has its channels decided (Email/WhatsApp/in-app) but no provider module built yet.
- **A real display typeface** — `font-display` is a generic system-serif stack; `BRAND_GUIDELINES.md` has not yet selected one.
- **The color-contrast issues found and left unfixed** — see "Validated with real execution" above (vendored "Sort by" control and price text; the `Button`/`text-ui-fg-interactive`/`ui-fg-muted` color tokens, confirmed systemic since Milestone 7, reconfirmed present on Product Details' add-to-cart button in Milestone 11, Cart's own "Go to checkout"/discount-code link in Milestone 12, Checkout's edit-address/add-discount links in Milestone 13, the account area's own instances in Milestone 14, and the new Food Central menu/PDP price text and order-confirmation link in Milestone 15 — all traced to the same vendored `@medusajs/ui-preset` token layer, not a first-party component).
- **A mobile accordion footer** (§8.9's "collapsible/accordion groupings to avoid an excessively long scroll") — Milestone 7 built a static, always-expanded footer identical on mobile and desktop; not revisited since, but worth flagging given real mobile screenshots in this and prior milestones' completion reports show the long-scroll consequence directly.
