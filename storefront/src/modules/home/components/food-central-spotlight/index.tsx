import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

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
    queryParams: { limit: 4, fields: "+food_details.*" },
  })

  const foodProducts = response.products.filter(
    (product) => (product as unknown as { food_details?: unknown }).food_details
  )

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between items-center mb-8">
        <Heading level="h2" className="txt-xlarge">
          Today&rsquo;s Menu
        </Heading>
        <LocalizedClientLink
          href="/food-central"
          className="txt-medium-plus text-text-primary underline hover:text-interactive"
        >
          View Food Central
        </LocalizedClientLink>
      </div>

      {foodProducts.length === 0 ? (
        <NotTakingOrders title="Today's Menu" />
      ) : (
        <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-12">
          {foodProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
