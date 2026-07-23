import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type ProductWithCatalog = HttpTypes.StoreProduct & {
  food_details?: unknown
  wine_details?: unknown
}

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // §15 — "same-catalog similar items... surfaced via existing
  // category/collection membership — this needs no new backend
  // relationship data." Category takes priority over collection (a
  // category groups genuinely similar products; a collection is often a
  // broader merchandising shelf), falling back to tags only if neither
  // is set.
  const categoryIds = (product.categories ?? [])
    .map((c) => c.id)
    .filter(Boolean) as string[]
  const hasCategoryOrCollectionOrTags =
    categoryIds.length > 0 || !!product.collection_id || !!product.tags?.length

  const queryParams: HttpTypes.StoreProductListParams & { fields?: string } = {
    // §10/§9 — related Food Central cards still need their own catalog
    // fact (prep-time); same `+food_details.*,+wine_details.*` mechanism
    // Product Listing's own cards already use.
    fields: "+food_details.*,+wine_details.*",
  }
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (categoryIds.length > 0) {
    queryParams.category_id = categoryIds
  } else if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  } else if (product.tags?.length) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  } else {
    // No category/collection/tag to narrow by at all — rather than an
    // unfiltered, potentially cross-catalog query (a Food Central dish
    // showing Wine & Spirits "related" results, or vice versa, which
    // §15 never intends), over-fetch and filter to the same catalog
    // client-side, the same `food_details`/`wine_details`-presence
    // pattern already established in FoodCentralSpotlight and the
    // Product Card Information Hierarchy.
    queryParams.limit = 100
  }
  queryParams.is_giftcard = false

  const sourceIsFoodCentral = !!(product as ProductWithCatalog).food_details

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    const candidates = response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
    if (hasCategoryOrCollectionOrTags) {
      return candidates
    }
    return candidates
      .filter(
        (candidate) =>
          !!(candidate as ProductWithCatalog).food_details === sourceIsFoodCentral
      )
      .slice(0, 8)
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          You might also like
        </p>
      </div>

      <ul
        className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        aria-label={`${products.length} related product${products.length === 1 ? "" : "s"}`}
      >
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
