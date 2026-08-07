import { listAllProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"
import LoadMoreLink from "@modules/food-central/components/load-more-link"
import { Heading, Text } from "@modules/common/components/ui"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"

const MENU_PAGE_SIZE = 12

/**
 * 01_NAVIGATION_SPECIFICATION.md §14 / 04_PRODUCT_LISTING_SPECIFICATION.md
 * §19 — Today's Menu, Pickup, and Scheduled Orders share one flat menu
 * listing (§5 — "menu-like, not taxonomy-like," no deep category tree).
 * Reuses the exact `listProducts({ fields: "+food_details.*" })` + filter
 * pattern `FoodCentralSpotlight` already proved out on the homepage,
 * rather than inventing a second query shape for the full listing.
 *
 * Pickup and scheduling selection both happen at checkout (§9, §10,
 * `07_CHECKOUT_SPECIFICATION.md` §9/§10) — not redefined here. Since
 * delivery-slot storefront wiring and same-day cutoff timing are both
 * explicitly "not yet built" / "not yet decided" (§25, §28), these three
 * destinations cannot yet behave differently from one another at the
 * menu-browsing stage; each shows the identical real menu, with only its
 * own heading/description differing, until that infrastructure exists.
 */
export default async function FoodCentralMenuGrid({
  countryCode,
  title,
  description,
  page = 1,
}: {
  countryCode: string
  title: string
  description?: string
  /** Cumulative "Load more" page — same URL-driven convention as
   * `store/templates/paginated-products`: every render shows every dish
   * from the start through this many pages. */
  page?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  /**
   * Every product, then filtered to dishes — not the first 100 products.
   * The menu is a subset of a catalog it shares with Wine & Spirits, so a
   * single 100-product request spent most of its budget on bottles and
   * silently dropped dishes past that point. Load More then concluded the
   * menu had ended, because as far as it could see, it had.
   */
  const { products } = await listAllProducts({
    countryCode,
    queryParams: { fields: "+food_details.*" },
  })

  const allFoodProducts = products.filter(
    (product) => (product as unknown as { food_details?: unknown }).food_details
  )

  if (allFoodProducts.length === 0) {
    return <NotTakingOrders title={title} />
  }

  const visibleCount = page * MENU_PAGE_SIZE
  const previousCount = Math.min((page - 1) * MENU_PAGE_SIZE, allFoodProducts.length)
  const foodProducts = allFoodProducts.slice(0, visibleCount)
  const hasMore = allFoodProducts.length > foodProducts.length
  const newlyLoadedCount = page > 1 ? foodProducts.length - previousCount : 0

  return (
    // `py-6` to match the catalog listings — 48px of dead air above the
    // title was pushing the menu itself down the screen on a phone.
    <div className="ds-container py-6 small:py-10">
      {/* `!` (important) because Heading hardcodes a size per level ahead
          of any className passed in, so the plain utility never wins.
          Editorial scale rather than the full display size: at 39px the
          title alone owned the first screen on a phone. */}
      <div className="mb-3 flex flex-col gap-y-2">
        <Heading
          level="h1"
          className="!text-[22px] font-semibold md:!text-[28px]"
        >
          {title}
        </Heading>
        {description && (
          <Text className="text-text-secondary max-w-2xl">{description}</Text>
        )}
      </div>
      {/* Same grid as every other listing on the platform — this was the
          one surface still running four columns. */}
      <ul className={PRODUCT_GRID}>
        {foodProducts.map((product, index) => {
          // First dish of the batch this click loaded — Load More scrolls
          // here, so the customer lands on the first new dish rather than
          // below the last one.
          const startsNewBatch = page > 1 && index === previousCount
          return (
            <li
              key={product.id}
              className={
                startsNewBatch ? "scroll-mt-32 small:scroll-mt-40" : undefined
              }
              {...(startsNewBatch
                ? { "data-new-batch-start": "true", tabIndex: -1 }
                : {})}
            >
              <ProductPreview product={product} region={region} />
            </li>
          )
        })}
      </ul>
      <LoadMoreLink
        hasMore={hasMore}
        nextPage={page + 1}
        newlyLoadedCount={newlyLoadedCount}
      />
    </div>
  )
}
