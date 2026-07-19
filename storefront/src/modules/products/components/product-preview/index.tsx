import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import QuickAddButton from "./quick-add-button"

/**
 * `PRODUCT_CATALOG.md` distinguishes Food Central dishes from Wine &
 * Spirits products by which attribute module they're linked to, not a
 * Product Category — the same `food_details`/`wine_details` cast pattern
 * already established in FoodCentralSpotlight.
 */
type ProductWithCatalogDetails = HttpTypes.StoreProduct & {
  food_details?: { prep_time_minutes?: number | null } | null
  wine_details?: unknown
}

type InventoryVariant = HttpTypes.StoreProductVariant & {
  inventory_quantity?: number
}

function isVariantAvailable(variant: InventoryVariant) {
  if (!variant.manage_inventory) {
    return true
  }
  if (variant.allow_backorder) {
    return true
  }
  return (variant.inventory_quantity || 0) > 0
}

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const catalogProduct = product as ProductWithCatalogDetails
  const isFoodCentral = !!catalogProduct.food_details

  /**
   * Product Card Information Hierarchy (04_PRODUCT_LISTING_SPECIFICATION.md,
   * near the end) — at most one of a promotional badge OR a catalog
   * supporting fact. No promotional-badge mechanism exists on the platform
   * yet (only navigation's Collection-based promotional layer does, and
   * it isn't wired to per-card badges), so this slot today only ever
   * surfaces Food Central's prep-time fact. A Wine & Spirits card leaves
   * it empty, matching §9's own expectation that "this slot is more often
   * left empty than used" for that catalog rather than inventing a badge
   * with nothing genuine behind it.
   */
  const catalogFact =
    isFoodCentral && catalogProduct.food_details?.prep_time_minutes
      ? `~${catalogProduct.food_details.prep_time_minutes} min prep`
      : null

  const variants = (product.variants ?? []) as InventoryVariant[]
  const isUnavailable =
    variants.length === 0 || !variants.some(isVariantAvailable)

  return (
    <div data-testid="product-wrapper" className="flex flex-col gap-2">
      {/* §9/§212 — the card's one real link wraps only image/name/price;
          quick-add is a sibling control below, never nested inside it. */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="group">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          alt={product.title || "Product photo"}
        />
        <div className="flex txt-compact-medium mt-4 justify-between items-start gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <Text className="text-ui-fg-subtle" data-testid="product-title">
              {product.title}
            </Text>
            {catalogFact && (
              <Text
                as="span"
                size="caption"
                muted
                data-testid="product-catalog-fact"
              >
                {catalogFact}
              </Text>
            )}
            {isUnavailable && (
              <Text
                as="span"
                size="caption"
                className="text-danger"
                data-testid="product-unavailable-label"
              >
                Sold out
              </Text>
            )}
          </div>
          <div className="flex items-center gap-x-2 shrink-0">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
      {!isUnavailable && (
        <QuickAddButton
          product={product}
          weight={isFoodCentral ? "primary" : "secondary"}
        />
      )}
    </div>
  )
}
