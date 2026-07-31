import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import QuickAddButton from "@modules/products/components/product-preview/quick-add-button"
import { CARD_SHELL } from "./card-shell"

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
 *
 * **The card carries only image, name and price.** The description and the
 * catalog label were removed on Paul's direction to condense the card's
 * height. §9 requires image, name and price, and permits *at most one*
 * supporting fact — it does not require one, so dropping both stays inside
 * the specification. The catalog distinction survives where it still does
 * work: `department` still colours the quick-add control, so a Food Central
 * dish and a bottle remain visually distinguishable without a text tag.
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
      className={`${CARD_SHELL} flex w-[260px] flex-col bg-surface-elevated small:w-[300px]`}
      data-testid="editorial-product-card"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* 4:3, and roughly two-thirds of the card's height — the ratio Paul
            specified. `rounded={false}` because the card already clips its
            own corners; a second radius inside would show a hairline of card
            background between the two curves. `shrink-0` stops the image
            being squeezed when this card is stretched to the track height,
            which would silently break the 4:3 ratio. */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink-100">
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

      {/* 12px padding, 8px rhythm. Image, name, price, button — nothing else. */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Clamped at two lines, but the second is *not* reserved with a
            `min-h`. Reserving it keeps prices on one line across the row, at
            the cost of an obvious dead gap under every one-line title —
            which is the loose spacing this card was condensed to remove. The
            row's alignment is carried by the flush card edges and by the
            buttons' shared baseline (`mt-auto` below) instead. */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="line-clamp-2 text-body font-medium leading-snug text-text-primary transition-colors duration-standard ease-in-out hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          data-testid="product-link"
        >
          {product.title}
        </LocalizedClientLink>

        <div className="text-body font-semibold text-text-primary">
          {cheapestPrice ? (
            <PreviewPrice price={cheapestPrice} />
          ) : (
            <span className="text-caption font-normal text-text-muted">
              Price unavailable
            </span>
          )}
        </div>

        {/* `mt-auto` pins the button to the bottom of whatever height the
            track settles on, so the buttons across the row share one
            baseline even if a card's content is shorter. */}
        <div className="mt-auto pt-1">
          <QuickAddButton
            product={product}
            department={isFoodCentral ? "food" : "wine"}
            // Matches the card's own 16px corner, per Paul's direction.
            // `!` is required, not decoration: `QuickAddButton` hardcodes
            // `rounded-radius-md` in its shared class and `clx` is plain
            // `clsx`, not tailwind-merge — without `!` the two utilities
            // have identical specificity and Tailwind's emit order silently
            // decides the winner.
            className="!rounded-radius-lg"
          />
        </div>
      </div>
    </div>
  )
}
