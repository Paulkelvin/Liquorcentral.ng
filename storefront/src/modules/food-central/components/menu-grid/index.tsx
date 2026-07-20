import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"
import { Heading, Text } from "@modules/common/components/ui"

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
}: {
  countryCode: string
  title: string
  description?: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100, fields: "+food_details.*" },
  })

  const foodProducts = response.products.filter(
    (product) => (product as unknown as { food_details?: unknown }).food_details
  )

  if (foodProducts.length === 0) {
    return <NotTakingOrders title={title} />
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="mb-8 flex flex-col gap-y-2">
        <Heading level="h1" className="txt-xlarge">
          {title}
        </Heading>
        {description && (
          <Text className="text-text-secondary max-w-2xl">{description}</Text>
        )}
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-12">
        {foodProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
