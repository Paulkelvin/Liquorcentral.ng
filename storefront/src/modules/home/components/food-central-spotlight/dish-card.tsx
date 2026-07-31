import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { isFoodCentralUnavailable } from "@lib/util/food-availability"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import QuickAddButton from "@modules/products/components/product-preview/quick-add-button"
import { Text } from "@modules/common/components/ui"

type DishProduct = HttpTypes.StoreProduct & {
  food_details?: { prep_time_minutes?: number | null } | null
}

type InventoryVariant = HttpTypes.StoreProductVariant & {
  inventory_quantity?: number
}

function isVariantAvailable(variant: InventoryVariant) {
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  return (variant.inventory_quantity || 0) > 0
}

/**
 * The dish card used *only* in the homepage's Today's Menu row.
 *
 * **Why a third card exists.** Same reasoning as
 * `featured-collection/editorial-product-card.tsx`:
 * `04_PRODUCT_LISTING_SPECIFICATION.md` §9 governs the card's *information
 * hierarchy*, and that is preserved here exactly — image, name and price
 * always present; **at most one** supporting fact (the prep time, and
 * nothing else); a quick-add control that is a genuine sibling of the
 * card's single link, never nested inside it.
 *
 * What differs is presentation, on Paul's direction: a 4:3 landscape crop
 * instead of `ProductPreview`'s portrait frame, the prep time lifted onto
 * the photograph as an overlay pill, and the solid full-width button
 * replaced by a round icon control so the food carries the card.
 * `ProductPreview` is untouched — it renders every category, collection and
 * search listing, and this is one homepage row.
 *
 * **The description is genuinely optional and not invented.** §9 permits at
 * most one supporting fact; the prep-time pill *is* that fact. The one-line
 * description below the title is the product's own `description` field
 * clamped to a single line, present only when the catalog has one — not a
 * generated tagline. A dish with no description simply shows none, and the
 * card's height does not depend on it.
 *
 * **Unavailability is Food Central's own concept.**
 * `09_FOOD_ORDERING_SPECIFICATION.md` §6 distinguishes a kitchen-capacity
 * "Unavailable" from Wine & Spirits' stock-based "Sold out"; the same
 * distinction is kept here rather than collapsing both into one label.
 */
export default function DishCard({ product }: { product: HttpTypes.StoreProduct }) {
  const { cheapestPrice } = getProductPrice({ product })
  const dish = product as DishProduct
  const prepMinutes = dish.food_details?.prep_time_minutes
  const variants = (product.variants ?? []) as InventoryVariant[]
  const foodUnavailable = isFoodCentralUnavailable(dish)
  const soldOut = variants.length === 0 || !variants.some(isVariantAvailable)
  const isUnavailable = foodUnavailable || soldOut

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-radius-lg border border-border bg-surface-elevated transition-[box-shadow,transform] duration-standard ease-in-out hover:-translate-y-1 hover:shadow-elevation-2"
      data-testid="dish-card"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* 4:3, so a plated dish is cropped across its width rather than
            through the middle of the plate — which is what the portrait
            frame was doing. */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink-100">
          <div className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              rounded={false}
              alt={product.title || "Dish photo"}
              className="!h-full !rounded-none"
            />
          </div>

          {/* The prep-time pill, over the photograph's top-left.
              `bg-scrim` (ink-900 at 70%) plus `backdrop-blur-sm` rather
              than a flat tint: a solid chip on a photograph reads as a
              sticker, and pure transparency gambles white text against
              whatever brightness the photo happens to have there.

              **It is a token, not `bg-ink-900/70`.** Every colour in this
              design system resolves to a hex string through a CSS variable,
              so Tailwind's `/70` modifier compiles to `rgb(#1a1a1a / 0.7)`
              and silently renders **transparent** — this exact bug was
              measured here before the token existed. Alpha must be baked
              into the token, which is why `--ink-900-50` already was. */}
          {prepMinutes ? (
            <span
              className="absolute left-3 top-3 rounded-radius-full bg-scrim px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-elevated backdrop-blur-sm"
              data-testid="product-catalog-fact"
            >
              ~{prepMinutes} min prep
            </span>
          ) : null}
        </div>
      </LocalizedClientLink>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="line-clamp-2 text-body font-semibold leading-snug text-text-primary transition-colors duration-standard ease-in-out hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          data-testid="product-title"
        >
          {product.title}
        </LocalizedClientLink>

        {product.description ? (
          <p className="line-clamp-1 text-caption text-text-secondary">
            {product.description}
          </p>
        ) : null}

        {/* Price and action share the last line: the price is the card's
            second-loudest element after the title, and the round control
            sits beside it rather than spanning the card. */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-body font-semibold text-text-primary">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} />
            ) : (
              <span className="text-caption font-normal text-text-muted">
                Price unavailable
              </span>
            )}
          </div>

          {isUnavailable ? (
            <Text
              as="span"
              size="caption"
              className="text-danger"
              data-testid="product-unavailable-label"
            >
              {foodUnavailable ? "Unavailable" : "Sold out"}
            </Text>
          ) : (
            <QuickAddButton
              product={product}
              department="food"
              appearance="icon"
            />
          )}
        </div>
      </div>
    </div>
  )
}
