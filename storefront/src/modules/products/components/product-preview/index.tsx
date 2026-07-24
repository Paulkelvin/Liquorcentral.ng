import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { isFoodCentralUnavailable } from "@lib/util/food-availability"
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
  showCatalogBadge,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  /**
   * 03_SEARCH_SPECIFICATION.md's new cross-catalog-labeling requirement
   * (a unified result list spans both catalogs, so each card needs its
   * own "Food Central" / "Wine & Spirits" identity marker) — `true` only
   * on search results, where a mixed list makes catalog identity genuinely
   * ambiguous without it. Category/collection listings never pass this:
   * the surrounding page context already makes the catalog unambiguous
   * there, and showing a redundant badge on every card would violate
   * §9's own restraint principle.
   */
  showCatalogBadge?: boolean
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
   * with nothing genuine behind it. On search results (`showCatalogBadge`),
   * the same one slot instead carries the catalog-identity badge — still
   * at most one occupant, never both at once.
   */
  const catalogFact = showCatalogBadge
    ? isFoodCentral
      ? "Food Central"
      : "Wine & Spirits"
    : isFoodCentral && catalogProduct.food_details?.prep_time_minutes
    ? `~${catalogProduct.food_details.prep_time_minutes} min prep`
    : null

  const variants = (product.variants ?? []) as InventoryVariant[]
  const foodUnavailable = isFoodCentralUnavailable(catalogProduct)
  const soldOut = variants.length === 0 || !variants.some(isVariantAvailable)
  const isUnavailable = foodUnavailable || soldOut

  return (
    <div data-testid="product-wrapper" className="flex flex-col gap-2">
      {/* §9/§212 — the card's one real link wraps only image/name/price;
          quick-add is a sibling control below, never nested inside it. */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="group">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          alt={product.title || "Product photo"}
        />
        {/*
         * Real bug found on the live deployment, not the sandbox: a
         * side-by-side title/price row (`justify-between items-start`)
         * collided visually whenever a title wrapped to 2 lines on a
         * narrow mobile card (2-column grid) — the price, pinned to the
         * top via `items-start`, rendered directly beside the title's
         * first line instead of clearing it. Price now sits on its own
         * line below a title capped at 2 lines (`line-clamp-2`, ellipsis
         * beyond that) so a long name can never push the layout apart or
         * collide with the price, at any card width.
         */}
        <div className="flex flex-col mt-3 gap-1">
          <Text
            size="caption"
            className="text-text-secondary font-medium line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {cheapestPrice && (
            <div className="flex items-center gap-x-2">
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
          {catalogFact && (
            <Text
              as="span"
              size="caption"
              muted
              data-testid={
                showCatalogBadge
                  ? "product-catalog-badge"
                  : "product-catalog-fact"
              }
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
              {/* 09_FOOD_ORDERING_SPECIFICATION.md §6 — Food Central's
                  kitchen-capacity "Unavailable" is a distinct concept
                  from Wine & Spirits' stock-based "Sold out", not the
                  same label reused. */}
              {foodUnavailable ? "Unavailable" : "Sold out"}
            </Text>
          )}
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
