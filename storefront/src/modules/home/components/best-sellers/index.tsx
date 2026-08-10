import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import SectionLink from "@modules/common/components/section-link"
import { Heading, Text } from "@modules/common/components/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"
import { BEST_SELLER_HANDLES } from "./products"

/**
 * A plain 4-card shelf, not an editorial section — no `CuratedMark`
 * (that gold accent is reserved for Featured Collection's own "chosen by
 * us, not by an algorithm" claim, see that section's own comment on why
 * it's the one gold mark on the page). This one just states what it is.
 *
 * Sits directly under Featured Collection: both are Wine & Spirits
 * merchandising shelves, so keeping them adjacent groups "here's what we
 * recommend" with "here's what's popular" before the page moves on to
 * Food Central.
 */
export default async function BestSellers({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const {
    response: { products: fetched },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      handle: BEST_SELLER_HANDLES,
      limit: BEST_SELLER_HANDLES.length,
      fields: "*variants.calculated_price,+food_details.*",
    },
  }).catch(() => ({ response: { products: [] as never[] } }))

  // Re-sorted to match `products.ts`'s order — see that file's own note;
  // Medusa doesn't return a multi-handle query in request order.
  const products = BEST_SELLER_HANDLES.map((handle) =>
    fetched.find((p) => p.handle === handle)
  ).filter((p): p is (typeof fetched)[number] => Boolean(p))

  if (!products.length) {
    return null
  }

  return (
    <section
      aria-labelledby="best-sellers-heading"
      className="w-full bg-surface"
    >
      <div className="ds-container py-12 small:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <Heading
              level="h2"
              display
              id="best-sellers-heading"
              className="!text-[24px] font-semibold tracking-[-0.01em] text-text-primary small:!text-[30px]"
            >
              Best sellers
            </Heading>
            <Text className="mt-1 text-text-secondary">
              What LiquorCentral customers reach for most.
            </Text>
          </div>
          <SectionLink href="/store">View all</SectionLink>
        </div>

        <ul className={PRODUCT_GRID}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
