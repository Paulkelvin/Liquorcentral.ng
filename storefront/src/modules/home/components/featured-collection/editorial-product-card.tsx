import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import QuickAddButton from "@modules/products/components/product-preview/quick-add-button"

type ProductWithCatalogDetails = HttpTypes.StoreProduct & {
  food_details?: { prep_time_minutes?: number | null } | null
}

/**
 * The product card used *only* inside the Featured Collection row.
 *
 * **Why a second card exists at all.** `04_PRODUCT_LISTING_SPECIFICATION.md`
 * §9 is explicit that the product card is "specified once, here, and
 * referenced everywhere else — no page redefines it independently," and
 * `ProductPreview` is that card. This one does not redefine the card's
 * *information hierarchy*, which is the thing that specification actually
 * governs: image, name and price always present; at most one supporting fact;
 * a quick-add control that is a genuine sibling of the card's single link,
 * never nested inside it. All of that is preserved exactly.
 *
 * What differs is the **image presentation**, changed on Paul's explicit
 * design direction: a 4:3 landscape crop instead of `ProductPreview`'s 4:5
 * portrait. The portrait frame was making bottles look stranded — a tall
 * container around a tall, narrow object leaves dead space down both sides,
 * and at rail size the bottle shrinks to nothing. A landscape crop fills with
 * the scene around the bottle rather than with empty background.
 *
 * `ProductPreview` is deliberately left untouched, because it is what every
 * category, collection and search listing renders — changing it to suit one
 * homepage row would have reached far beyond the section being designed.
 */
export default function EditorialProductCard({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const catalogProduct = product as ProductWithCatalogDetails
  const isFoodCentral = !!catalogProduct.food_details

  return (
    // Not a link itself — the image and title are the link, the quick-add is
    // its sibling. Wrapping the whole card in an anchor would nest the button
    // inside it (`nested-interactive`).
    <div
      className="group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-radius-lg border border-border bg-surface-elevated shadow-elevation-1 transition-[box-shadow,transform] duration-standard ease-in-out hover:-translate-y-1 hover:shadow-elevation-2 small:w-[300px]"
      data-testid="editorial-product-card"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* 4:3, and roughly two-thirds of the card's height — the ratio Paul
            specified. `rounded={false}` because the card already clips its
            own corners; a second radius inside would show a hairline of card
            background between the two curves. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
          <div className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              rounded={false}
              alt={product.title}
              className="!h-full !rounded-none"
            />
          </div>
        </div>
      </LocalizedClientLink>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-muted">
          {isFoodCentral ? "Food Central" : "Wine & Spirits"}
        </span>

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="text-body font-medium leading-snug text-text-primary transition-colors duration-standard ease-in-out hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          data-testid="product-link"
        >
          {product.title}
        </LocalizedClientLink>

        {product.description && (
          // Two lines, then clipped. A rail card is a decision aid, not the
          // product page — the full description lives one click away.
          <p className="line-clamp-2 text-caption leading-snug text-text-secondary">
            {product.description}
          </p>
        )}

        <div className="mt-2 text-body font-semibold text-text-primary">
          {cheapestPrice ? (
            <PreviewPrice price={cheapestPrice} />
          ) : (
            <span className="text-caption font-normal text-text-muted">
              Price unavailable
            </span>
          )}
        </div>

        <div className="mt-3">
          <QuickAddButton
            product={product}
            department={isFoodCentral ? "food" : "wine"}
          />
        </div>
      </div>
    </div>
  )
}
