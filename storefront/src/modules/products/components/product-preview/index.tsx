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
      className="group flex h-full flex-col overflow-hidden rounded-radius-md border border-divider bg-surface-elevated shadow-elevation-1"
    >
      {/* §9/§212 — the card's one real link wraps only image/name/price;
          quick-add is a sibling control below, never nested inside it. */}
      <LocalizedClientLink href={`/products/${product.handle}`}>
        {/* The photo runs edge to edge into the card's top corners — no
            inset on the sides or top — with the card's own
            `overflow-hidden` doing the corner clipping. */}
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          rounded={false}
          alt={product.title || "Product photo"}
        />
        <div className="flex flex-col gap-1 px-3 pt-3 pb-3">
          {/* The eyebrow slot. There is no brand field on the product
              model, so this carries the catalog's own supporting fact
              (Food Central prep time, or the catalog name on a mixed
              search result) and is simply absent otherwise — §9 expects
              it empty more often than not for Wine & Spirits. */}
          {catalogFact &&
            (showCatalogBadge ? (
              // The mixed-search catalog marker stays a plain eyebrow: it
              // names which catalog a result came from, it isn't a claim
              // about the item, so a tinted chip would overstate it.
              <span
                className="text-[11px] font-medium uppercase tracking-wider text-text-muted"
                data-testid="product-catalog-badge"
              >
                {catalogFact}
              </span>
            ) : (
              // Prep time is a concrete promise about the dish, so it
              // reads as a tag rather than a caption. `self-start` keeps
              // the tint hugging the text instead of stretching the full
              // card width in this flex column.
              <span
                className="self-start rounded-radius-sm bg-interactive-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-interactive-on-tint"
                data-testid="product-catalog-fact"
              >
                {catalogFact}
              </span>
            ))}
          {/* Capped at 2 lines so a long name can never push a card's
              own layout apart; equal-height rows plus the button's
              `mt-auto` below keep every card's action on one baseline
              whether the title runs to one line or two. */}
          <Text
            className="!text-[14px] font-medium leading-snug text-text-primary line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          {/* Price reads as a line of its own beneath the name, not laid
              over the photo. */}
          {cheapestPrice && (
            <div className="flex items-baseline gap-x-2">
              <PreviewPrice price={cheapestPrice} />
            </div>
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
        // The inset comes from a padded wrapper, not margins on the
        // button itself: quick-add's own `w-full` wins the cascade over
        // any `w-auto` passed in here (Tailwind orders by stylesheet
        // position, not class-string order), so a margin-based inset
        // resolved to 100% width *plus* margins and pushed the button's
        // right edge past the card, where `overflow-hidden` quietly
        // clipped it. Padding a wrapper makes 100% mean the right thing.
        <div className="mt-auto px-3 pb-3">
          <QuickAddButton
            product={product}
            department={isFoodCentral ? "food" : "wine"}
          />
        </div>
      )}
    </div>
  )
}
