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

## What's deliberately not here yet

- **`03_SEARCH_SPECIFICATION.md`'s own implementation** — ranking, typo tolerance, synonyms, facets, search-within-category, product-line labeling — all Meilisearch-backed and still pending formal approval; `/search` today is a minimal native bridge only.
- **Product Listing's own filtering/facets** (§10) — reuses Search's §13 facet system per §10's own text, so it shares the exact same Meilisearch-approval gate as Search's own implementation, above; no facet UI exists on any listing yet.
- **A real "Featured" merchandising order and a real promotional-badge mechanism** (§9, §11, §17, Product Card Information Hierarchy) — no per-product manual-rank field exists in Medusa's native model, and no promotional-badge mechanism exists on the platform at all; "Featured" is an honest no-op fallthrough to the API's natural order, and every card's one-fact slot only ever surfaces Food Central's prep-time fact today. Both need Paul's attribute-field-list approval (the same one blocking full catalog population) before a real implementation is possible.
- **The "pairs with" cross-catalog relationship** (§8.6, §13, §14, §18, §19) — the underlying data model doesn't exist yet (`MEDUSA_EXTENSIONS.md`'s own open item); no cross-link UI was built or invented here, and the Homepage's own "Wine & Food, Connected" section is correctly absent rather than faked.
- **Faceted-URL canonicalization** (§26) and **navigation/homepage/listing analytics events** (§18, §25) — no facets exist yet to canonicalize, and no analytics infrastructure exists anywhere in this project yet to wire events into.
- **Merchandising promotional-Collection caps/expiry enforcement** (Merchandising Strategy section) — no Collections have been created yet; the mega menu and Curated Collections already render whatever Collections exist (data-driven, §12), but no cap/expiry logic was built ahead of real data to enforce it against.
- **A real payment provider** — the storefront's checkout flow exists (from the starter) but has nothing to connect to yet; `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md`'s provider choice remains an open business decision.
- **Any product/catalog data** — no products have been seeded; pages render correctly with empty results (Milestone 9's own visual validation used temporary QA-only products, created and deleted via the Admin API specifically for that purpose — see this README's Milestone 9 section and `DECISION_LOG.md`).
- **Delivery-slot selection UI** — the backend's `delivery-slot` module (Milestone 4) has no storefront-facing UI yet; `07_CHECKOUT_SPECIFICATION.md`'s calendar-grid slot picker is unbuilt.
- **A real display typeface** — `font-display` is a generic system-serif stack; `BRAND_GUIDELINES.md` has not yet selected one.
- **The color-contrast issues found and left unfixed** — see "Validated with real execution" above (vendored "Sort by" control and price text; the `Button` primary variant's white-on-`#EC2D07` contrast, confirmed systemic since Milestone 7).
- **A mobile accordion footer** (§8.9's "collapsible/accordion groupings to avoid an excessively long scroll") — Milestone 7 built a static, always-expanded footer identical on mobile and desktop; not revisited since, but worth flagging given real mobile screenshots in this and prior milestones' completion reports show the long-scroll consequence directly.
