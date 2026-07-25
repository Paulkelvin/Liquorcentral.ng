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
    // `h-full` + `flex-col` so every card in a CSS Grid row (the parent
    // <ul>'s own grid, e.g. paginated-products.tsx) stretches to match
    // its tallest sibling, and quick-add's `mt-auto` (a direct flex
    // child of this same container) pins itself to the card's bottom
    // edge regardless of how many lines the title above it wraps to.
    <div
      data-testid="product-wrapper"
      className="group flex h-full flex-col rounded-radius-md border border-border bg-surface-elevated p-2"
    >
      {/* §9/§212 — the card's one real link wraps only image/name/price;
          quick-add is a sibling control below, never nested inside it. */}
      <LocalizedClientLink href={`/products/${product.handle}`}>
        {/* Price sits *on* the photo, bottom-right, over a dark
            bottom-up gradient scrim — the scrim is what makes light
            type legible regardless of what the photo behind it looks
            like, so it is never rendered without one. */}
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            alt={product.title || "Product photo"}
          />
          {cheapestPrice && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-radius-sm bg-gradient-to-t from-scrim to-transparent"
              />
              <div className="absolute bottom-2 right-2 flex items-baseline gap-x-2">
                <PreviewPrice price={cheapestPrice} overlay />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-0.5 px-1 pt-3 pb-3">
          {/* Capped at 2 lines so a long name can never push a card's
              own layout apart; equal-height rows plus the button's
              `mt-auto` below keep every card's action on one baseline
              whether the title runs to one line or two. */}
          <Text
            className="text-text-primary font-medium line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>
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
          className="mt-auto"
        />
      )}
    </div>
  )
}
