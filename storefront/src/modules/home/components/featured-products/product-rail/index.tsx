import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="ds-container py-12 small:py-24">
      <div className="flex justify-between items-center gap-4 mb-6">
        {/* Editorial-scale section heading (§3, 20px/text-heading-4)
            rather than the full text-heading-2 (31px) `level="h2"`
            otherwise maps to — `!` (important) since Heading's own
            headingSizeByLevel class is hardcoded ahead of this
            className in source order. Semantic level stays h2 (correct
            document outline); only the visual size is overridden. */}
        {/* Deliberately not truncated — a long collection title wraps
            onto a second line rather than being cut off with an
            ellipsis. "View all" stays on one line via its own
            `shrink-0 whitespace-nowrap`, so the two never collide. */}
        <Heading level="h2" display className="!text-body-lg sm:!text-heading-3">
          {collection.title}
        </Heading>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      {/* Equal-height cards (ProductPreview's own `h-full` + grid's
          default row stretch) no longer need the old oversized gap-y
          that padded around variable-height cards — a normal gap works
          now that every card in a row lines up on the same baseline. */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
      </ul>
    </div>
  )
}
