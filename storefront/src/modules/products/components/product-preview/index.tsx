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
    /**
     * **A borderless card: tinted image tile, text sitting directly on the
     * page.** Paul supplied a reference and asked for its treatment in our
     * own colours — the card had been a white panel with a border and a
     * shadow, which framed every product in a box.
     *
     * What carries the card now is the *contrast step* between the image
     * tile (`ink-100`) and the page (`surface`), not a border. Two things
     * follow from that and are easy to undo by accident:
     *
     * - **Do not put a background or border back on this wrapper.** The tile
     *   is the only surface; a second one around it re-boxes the card and
     *   the tint stops reading as a tile at all.
     * - **The tile tint only shows where the photograph does not cover it** —
     *   today that is the placeholder and loading states. It will do real
     *   visual work once product photography is cut-out or has its own
     *   neutral ground, which is `BRAND_GUIDELINES.md`'s open item. The
     *   structure is built for that; it is not waiting on code.
     *
     * `h-full` + `flex-col` so every card in a grid row stretches to its
     * tallest sibling and quick-add's `mt-auto` pins to the bottom edge
     * regardless of how many lines the title wraps to.
     */
    <div
      data-testid="product-wrapper"
      className="group flex h-full flex-col"
    >
      {/* §9/§212 — the card's one real link wraps only image/name/price;
          quick-add is a sibling control below, never nested inside it. */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="flex flex-col">
        {/* The tile owns the radius, the clipping and the tint; the
            thumbnail inside is square-cornered and transparent.
            **Not `className="!rounded-radius-md"` on the Thumbnail** — its
            own comment explains why radius is a prop there: the base class
            is already `!important`, so a second `!important` radius from a
            caller is resolved by Tailwind's emit order rather than by
            intent. A wrapper sidesteps that entirely. */}
        <div className="relative overflow-hidden rounded-radius-md bg-ink-100">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            rounded={false}
            alt={product.title || "Product photo"}
            className="!bg-transparent"
          />

          {/* The supporting fact moved **onto** the image.
              `04_PRODUCT_LISTING_SPECIFICATION.md` §9 still allows at most
              one, and it is still at most one — but keeping it out of the
              text block is what leaves title and price alone underneath,
              which is the thing that makes the reference card read as calm.
              Same overlay treatment as the Today's Menu dish card, so the
              two agree. */}
          {catalogFact && (
            <span
              className="absolute left-2 top-2 rounded-radius-full bg-scrim px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-elevated backdrop-blur-sm"
              data-testid={
                showCatalogBadge ? "product-catalog-badge" : "product-catalog-fact"
              }
            >
              {catalogFact}
            </span>
          )}
        </div>

        {/* No side padding — the text aligns to the tile's own edges, which
            is what makes the column read as one block rather than a card
            with an inset. */}
        <div className="flex flex-col gap-0.5 pt-3">
          {/* Smaller and quieter than before (was 14px medium, primary).
              Paul: "we have a bit big titles than what is in this product
              card". The name is the label; the price is the thing being
              decided on, so the price now carries the weight. */}
          <Text
            className="!text-[13px] font-normal leading-snug text-text-secondary line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          {cheapestPrice && (
            <div className="flex items-baseline gap-x-2 text-[14px] font-semibold text-text-primary">
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
                  kitchen-capacity "Unavailable" is a distinct concept from
                  Wine & Spirits' stock-based "Sold out", not the same label
                  reused. */}
              {foodUnavailable ? "Unavailable" : "Sold out"}
            </Text>
          )}
        </div>
      </LocalizedClientLink>

      {!isUnavailable && (
        // `mt-auto` pins quick-add to the card's bottom edge, so every
        // button in a grid row sits on one baseline however many lines the
        // titles above them wrap to.
        <div className="mt-auto pt-3">
          <QuickAddButton
            product={product}
            department={isFoodCentral ? "food" : "wine"}
          />
        </div>
      )}
    </div>
  )
}
