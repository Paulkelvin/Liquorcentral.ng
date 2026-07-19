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

## What's deliberately not here yet

- **Any LiquorCentral branding beyond shared chrome (Nav/Footer text) and design tokens** — the Homepage's own hero content ("Ecommerce Starter Template", "Powered by Medusa and Next.js", a GitHub CTA) is still the vendored template's placeholder, deliberately untouched — that is `02_HOMEPAGE_SPECIFICATION.md`'s own future implementation, not this milestone's.
- **01_NAVIGATION_SPECIFICATION.md's own behavior** — no mega menu, category tree, or search entry point.
- **A real payment provider** — the storefront's checkout flow exists (from the starter) but has nothing to connect to yet; `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md`'s provider choice remains an open business decision.
- **Any product/catalog data** — no products have been seeded; pages render correctly with empty results.
- **Delivery-slot selection UI** — the backend's `delivery-slot` module (Milestone 4) has no storefront-facing UI yet; `07_CHECKOUT_SPECIFICATION.md`'s calendar-grid slot picker is unbuilt.
- **A real display typeface** — `font-display` is a generic system-serif stack; `BRAND_GUIDELINES.md` has not yet selected one.
- **The color-contrast issue on the vendored Store listing page's "Sort by" control** — found via real axe-core testing, left unfixed since it's Product Listing behavior, not shell infrastructure.
