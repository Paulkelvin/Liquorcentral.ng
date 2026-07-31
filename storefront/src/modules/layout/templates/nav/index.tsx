import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { StoreRegion } from "@medusajs/types"
import { ShoppingBag } from "@medusajs/icons"
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
      listCategories().catch(() => []),
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
            <LocalizedClientLink
              href="/"
              className="font-display text-heading-4 font-semibold tracking-tight text-text-primary hover:text-interactive"
              data-testid="nav-store-link"
            >
              LiquorCentral
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-4">
            <div className="hidden h-full items-center gap-x-6 small:flex">
              <LocalizedClientLink
                className="hover:text-interactive"
                href="/account"
                data-testid="nav-account-link"
              >
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
                  <ShoppingBag width={24} height={24} />
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
