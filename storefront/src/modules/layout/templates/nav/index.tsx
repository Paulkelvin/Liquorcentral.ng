import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { StoreRegion } from "@medusajs/types"
import { IconAccount, IconBag } from "@modules/common/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import MobileNavDrawer from "@modules/layout/components/mobile-nav-drawer"
import MobileWayfindingStrip from "@modules/layout/components/mobile-wayfinding-strip"
import MegaMenu from "@modules/layout/components/mega-menu"
import FoodCentralMenu from "@modules/layout/components/food-central-menu"
import DepartmentSwitcherTrack from "@modules/layout/components/department-switcher-track"
import SearchField from "@modules/layout/components/search-field"

/**
 * 01_NAVIGATION_SPECIFICATION.md §5/§6/§9 — the persistent shell (logo,
 * primary navigation, search, account, cart), identical everywhere,
 * sticky/fixed on scroll, never shrinking or hiding on scroll direction.
 *
 * Two rows: a primary bar carrying search, the wordmark and the account
 * and cart controls, then a slim sub-bar beneath it holding the
 * department switcher centred across the full width. The two departments
 * previously sat crammed into the primary row's top-left corner, which
 * both unbalanced that row and buried the single most important choice
 * on the platform — §2's equal-prominence requirement reads far better
 * given its own dedicated line.
 */
export default async function Nav() {
  const [regions, locales, currentLocale, categories, { collections }] =
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions),
      listLocales(),
      getLocale(),
      // One retry before falling back to the "/store" link: a single
      // transient failure here (a cold connection to the backend, a
      // dropped request) used to render the mega menu's empty-state
      // fallback for the whole page — every category click landing on
      // "all products" instead of a category, until the next full
      // reload happened to hit a warm connection. A second attempt
      // covers exactly that class of blip without masking a genuine,
      // sustained outage (which still falls back after both attempts).
      listCategories().catch(() => listCategories()).catch(() => []),
      listCollections({ limit: "6" }).catch(() => ({ collections: [] })),
    ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto bg-surface-elevated">
        <nav
          aria-label="Main"
          className="ds-container flex h-16 w-full items-center justify-between text-caption text-text-secondary"
        >
          <div className="flex h-full flex-1 basis-0 items-center gap-6">
            <div className="h-full sm:hidden">
              <MobileNavDrawer
                categories={categories}
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="hidden h-full items-center sm:flex">
              <SearchField />
            </div>
          </div>

          <div className="flex h-full items-center">
            {/* Proposed Design Direction — "even a text-only wordmark with
                the display face" reads as a considered brand mark rather
                than generic uppercase body text (no logomark exists yet;
                see DECISION_LOG.md/BRAND_GUIDELINES.md for that open item). */}
            {/* "LiquorCentral" → "Liquor & Food Central", on Paul's
                direction — the wordmark now names both departments
                rather than implying the site is liquor-only. Sized down
                on mobile (`text-[15px]`, tracking loosened toward
                normal) since the longer string shares that row with a
                hamburger trigger and the cart icon; `whitespace-nowrap`
                keeps it one line rather than wrapping into the header's
                fixed height at the widths where it's tightest. */}
            <LocalizedClientLink
              href="/"
              className="whitespace-nowrap font-display text-[15px] font-semibold tracking-tight text-text-primary hover:text-interactive sm:text-heading-4"
              data-testid="nav-store-link"
            >
              Liquor &amp; Food Central
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-4">
            <div className="hidden h-full items-center gap-x-6 small:flex">
              {/* Icon + label, matching `CartTrigger` exactly — same 24px
                  glyph, same 1.5 gap, same 44px minimum target. The two
                  controls sit side by side, so an icon on one and bare text
                  on the other read as two different kinds of thing. The
                  glyph is `aria-hidden`: "Account" is already the accessible
                  name, and announcing the icon as well would repeat it. */}
              <LocalizedClientLink
                className="inline-flex h-full min-w-[44px] items-center justify-center gap-1.5 transition-colors duration-standard ease-in-out hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                href="/account"
                data-testid="nav-account-link"
              >
                <IconAccount aria-hidden="true" />
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-interactive min-w-[44px] inline-flex items-center justify-center gap-1.5"
                  href="/cart"
                  aria-label="Cart, 0 items"
                  data-testid="nav-cart-link"
                >
                  <IconBag aria-hidden="true" />
                  <span aria-hidden="true" className="hidden small:inline">
                    Cart
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* Department sub-bar. `relative` because the mega menu's panel is
          `absolute inset-x-0 top-full` and must resolve against this
          full-width row, not against its own narrow trigger. */}
      <div className="relative hidden border-y border-border bg-surface-elevated sm:block">
        <div className="ds-container flex items-center justify-center py-1.5 text-caption text-text-secondary">
          {/* The two departments now share one segmented track rather than
              sitting as underlined tabs. The track is deliberately *not*
              `relative` — see `DepartmentSwitcherTrack`, which builds its
              pill out of grid stacking precisely so the mega-menu panel
              keeps resolving against the full-width row above. */}
          <DepartmentSwitcherTrack
            className="w-[22rem]"
            wineSlot={
              <MegaMenu categories={categories} collections={collections} />
            }
            foodSlot={<FoodCentralMenu />}
          />
        </div>
      </div>

      <MobileWayfindingStrip />
    </div>
  )
}
