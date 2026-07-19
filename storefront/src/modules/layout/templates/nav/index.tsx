import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import MobileNavDrawer from "@modules/layout/components/mobile-nav-drawer"
import MobileWayfindingStrip from "@modules/layout/components/mobile-wayfinding-strip"
import MegaMenu from "@modules/layout/components/mega-menu"
import FoodCentralMenu from "@modules/layout/components/food-central-menu"
import SearchField from "@modules/layout/components/search-field"

/**
 * 01_NAVIGATION_SPECIFICATION.md §5/§6/§9 — the persistent shell (logo,
 * primary navigation, search, account, cart), identical everywhere,
 * sticky/fixed on scroll, never shrinking or hiding on scroll direction.
 * Replaces the Phase 0c placeholder shell (logo + region/locale menu +
 * Account/Cart only) with this specification's own behavior: the Wine &
 * Spirits mega menu (§10), the Food Central dropdown (§14), a visible
 * search field (§15), and the mobile wayfinding strip (§7.2) beneath the
 * header. §24's graceful-degradation ordering (serve from cache, fall
 * back to the hardcoded two-branch pair, never block page content) is
 * satisfied by `listCategories`/`listCollections` already being
 * `force-cache`d Server Actions (`src/lib/data/categories.ts`,
 * `collections.ts`) and by MegaMenu's own empty-columns fallback.
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
      <header className="relative h-16 mx-auto border-b duration-200 bg-surface-elevated border-border">
        <nav
          aria-label="Main"
          className="content-container txt-xsmall-plus text-text-secondary flex items-center justify-between w-full h-full text-small-regular"
        >
          <div className="flex-1 basis-0 h-full flex items-center gap-6">
            <div className="h-full sm:hidden">
              <MobileNavDrawer
                categories={categories}
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="hidden sm:flex items-center h-full gap-6">
              <MegaMenu categories={categories} collections={collections} />
              <FoodCentralMenu />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-text-primary hover:text-interactive uppercase"
              data-testid="nav-store-link"
            >
              LiquorCentral
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-4 h-full flex-1 basis-0 justify-end">
            <SearchField />
            <div className="hidden small:flex items-center gap-x-6 h-full">
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
                  className="hover:text-interactive flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
      <MobileWayfindingStrip />
    </div>
  )
}
