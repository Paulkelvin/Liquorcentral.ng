import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"
import { Heading, Text } from "@modules/common/components/ui"
import SectionCTAButton from "@modules/common/components/section-cta-button"
import SectionLink from "@modules/common/components/section-link"
import ProductPreview from "@modules/products/components/product-preview"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.5 — a small snapshot of today's menu,
 * not the full menu, with a direct link into Food Central. §19's empty
 * state: "Kitchen closed / no available menu items: shows a clear 'not
 * currently taking orders' message... rather than an empty grid" — this
 * project has never seeded a single product of either catalog (field-list
 * decisions are still open, `docs/PROJECT_STATUS.md`), so this always
 * renders that state today, via the same `NotTakingOrders` component
 * `01_NAVIGATION_SPECIFICATION.md`'s Food Central destinations already
 * use, not a second, duplicate empty-state implementation.
 *
 * `PRODUCT_CATALOG.md` models both catalogs as ordinary Products
 * distinguished by which attribute module they're linked to (a dish has
 * `food_details`, a wine has `wine_details`) — not a "Food Central"
 * Product Category (`01_NAVIGATION_SPECIFICATION.md`'s own seed script
 * deliberately doesn't create one; see its comment). Filtering on
 * `+food_details.*` is the correct, already-established mechanism.
 */
export default async function FoodCentralSpotlight({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100, fields: "+food_details.*" },
  })

  const foodProducts = response.products
    .filter(
      (product) => (product as unknown as { food_details?: unknown }).food_details
    )
    // Six, not four: the shared grid is 2-up on a phone and 3-up from
    // `small:`, and six is the smallest count that fills both cleanly. Four
    // left a 3+1 row on desktop.
    .slice(0, 6)

  return (
    // A warm sand band, so the kitchen reads as a different kind of section
    // from the retail rows around it. It is `surface-warm` rather than
    // `ink-100` for a reason that now matters more than when it was written:
    // every card here draws its image on an `ink-100` tile, and a band in the
    // same colour erases it. `surface-warm` is kept deliberately lighter than
    // the tile — see the token's own note in `globals.css`.
    <section
      aria-labelledby="todays-menu-heading"
      className="w-full bg-surface-warm"
      data-testid="todays-menu"
    >
      <div className="ds-container py-12 small:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <Heading
              level="h2"
              display
              id="todays-menu-heading"
              className="!text-[24px] font-semibold tracking-[-0.01em] text-text-primary small:!text-[30px]"
            >
              Today&rsquo;s Menu
            </Heading>
            {/* `text-secondary`, not `muted`. On this warm tint `muted`
                (ink-500) measures 4.45:1 — under the 4.5 floor, and caught
                by a live axe run rather than by eye. Any tinted band lowers
                the contrast ceiling; the same swap was needed on the
                Featured Collection's band for the same reason. */}
            <Text className="mt-1 text-text-secondary">
              Cooked to order, delivered across Lagos.
            </Text>
          </div>
          {/* The same control as "View all" and "See the collection"
              above, via `SectionLink`. It was `InteractiveLink` (brand
              green) — the one section header on the page that looked like a
              different kind of thing. */}
          <SectionLink href="/food-central">View Food Central</SectionLink>
        </div>

        {foodProducts.length === 0 ? (
          <NotTakingOrders title="Today's Menu" />
        ) : (
          <>
          {/* **This was a swipeable 1.2-card carousel on a phone, to Paul's
              own earlier brief, and is now the shared grid.** He reversed it:
              horizontal scrolling for products is out site-wide and every
              listing uses the category pages' card. Recorded rather than
              deleted because the carousel was specified deliberately — the
              `basis-[78%]` that put the next card half on screen was the
              scroll affordance, not an accident of sizing.

              Dishes keep everything that made them dishes: `ProductPreview`
              already renders the prep-time fact as the same overlay pill, and
              already tints quick-add green for anything carrying
              `food_details`. Nothing about Food Central's identity depended on
              a separate card component. */}
          <ul className={PRODUCT_GRID}>
            {foodProducts.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>

          <SectionCTAButton href="/food-central" data-testid="todays-menu-see-all">
            View Food Central
          </SectionCTAButton>
          </>
        )}
      </div>
    </section>
  )
}
