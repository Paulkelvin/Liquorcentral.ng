"use client"

import { Text, Checkbox, clx } from "@modules/common/components/ui"
import { addGiftWrapToLineItem, deleteLineItem } from "@lib/data/cart"
import { useOptionalCart } from "@lib/context/cart-context"
import { broadcastCartChange } from "@lib/util/cart-broadcast"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import QuantityStepper from "@modules/products/components/quantity-stepper"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  /** §15 — the paired gift-wrap line item, if one is already attached. */
  giftWrapItem?: HttpTypes.StoreCartLineItem
  /** §15 — omitted entirely when Gift Wrap isn't eligible (Food Central) or not configured. */
  giftWrap?: { variantId: string; price: number }
  /** §7, §13, §17 — genuine available stock; omitted means uncapped (Food Central). */
  maxQuantity?: number
  /** §12 — zero purchasable remaining; labeled in place, never silently removed. */
  isUnavailable?: boolean
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({
  item,
  giftWrapItem,
  giftWrap,
  maxQuantity,
  isUnavailable,
  type = "full",
  currencyCode,
}: ItemProps) => {
  // Optional — the checkout order-summary preview renders this same
  // component outside `CartProvider` (see `useOptionalCart`'s own
  // comment). Only the "full" cart-page branch below ever calls
  // `setQuantity`/`removeItem`, and that branch only ever renders inside
  // `CartProvider`, so `?.` here is a type-safety formality, not a real
  // runtime gap.
  const cartCtx = useOptionalCart()
  const optimisticCart = cartCtx?.cart ?? null
  const setQuantity = cartCtx?.setQuantity
  const removeItem = cartCtx?.removeItem
  const [error, setError] = useState<string | null>(null)
  const [giftWrapPending, setGiftWrapPending] = useState(false)

  // The `/cart` *page* fetches and renders from its own server cart —
  // `item` here is that prop, not `useCart()`'s. So `useCart().setQuantity`
  // paints its change into the *provider's* optimistic cart (which drives
  // the drawer and the nav badge instantly) but never touches this prop,
  // and this component would still show the old quantity until the page
  // itself re-renders with fresh data a full round trip later. Reading
  // the displayed quantity from whichever optimistic line matches this
  // item's id — falling back to the prop when there isn't one yet — is
  // what makes the number on *this* page move immediately too.
  const optimisticItem = optimisticCart?.items?.find((i) => i.id === item.id)
  const displayQuantity = optimisticItem?.quantity ?? item.quantity

  // `useCart().setQuantity` (and `removeItem` below) already paint the
  // change immediately via the provider's own optimistic cart — this used
  // to run its own separate `await`+spinner on top of that, which is what
  // made a quantity tap or a remove sit on "loading" for a full server
  // round trip instead of reading as instant.
  const changeQuantity = (quantity: number) => {
    setError(null)
    setQuantity?.(item.id, quantity, (err) =>
      setError(err instanceof Error ? err.message : "Couldn't update quantity")
    )
  }

  const toggleGiftWrap = async (checked: boolean) => {
    setGiftWrapPending(true)
    try {
      if (checked && giftWrap) {
        await addGiftWrapToLineItem({ giftWrapVariantId: giftWrap.variantId, forLineItemId: item.id })
      } else if (!checked && giftWrapItem) {
        await deleteLineItem(giftWrapItem.id)
      }
      // Tell any other open tab this cart just changed — see
      // cart-broadcast.ts's own comment for the multi-tab bug this closes.
      broadcastCartChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update gift wrap")
    } finally {
      setGiftWrapPending(false)
    }
  }

  const title = (
    <>
      <Text
        className={clx(
          "text-text-primary",
          type === "preview" ? "!text-[14px] font-medium leading-snug" : "txt-medium-plus"
        )}
        data-testid="product-title"
      >
        {item.product_title}
      </Text>
      <LineItemOptions variant={item.variant} data-testid="product-variant" />
      {isUnavailable && (
        <Text className="text-danger mt-1" data-testid="product-unavailable-notice">
          Currently unavailable — remove this item or check back later.
        </Text>
      )}
    </>
  )

  const thumbnail = (
    <LocalizedClientLink
      href={`/products/${item.product_handle}`}
      aria-label={`View ${item.product_title || item.title || "product"}`}
      className={clx("block shrink-0", {
        "w-14": type === "preview",
        "w-20 sm:w-24": type === "full",
      })}
    >
      <Thumbnail
        thumbnail={item.thumbnail}
        images={item.variant?.product?.images}
        size="square"
        alt={item.title || item.product_title || "Product photo"}
      />
    </LocalizedClientLink>
  )

  /**
   * The cart's own line item is a self-contained card — thumbnail,
   * details, quantity controls and totals stacked inside a flex row —
   * rather than a table row. The table it used to render into could not
   * narrow past its own column widths, so the cart page overflowed
   * horizontally on a phone (measured at 532px of content in a 390px
   * viewport).
   */
  if (type === "full") {
    return (
      <li
        className="flex gap-3 rounded-radius-md border border-border p-3 sm:gap-4 sm:p-4"
        data-testid="product-row"
      >
        {thumbnail}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">{title}</div>
            <div className="shrink-0 text-text-secondary sm:text-right">
              <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
          </div>

          {giftWrap && (
            <Checkbox
              id={`gift-wrap-${item.id}`}
              checked={!!giftWrapItem}
              disabled={giftWrapPending}
              onChange={(event) => toggleGiftWrap(event.target.checked)}
              label={`Add gift wrap (+${convertToLocale({
                amount: giftWrap.price,
                currency_code: currencyCode,
              })})`}
              data-testid="cart-gift-wrap-toggle"
            />
          )}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <QuantityStepper
                quantity={displayQuantity}
                onChange={changeQuantity}
                max={maxQuantity}
                min={0}
              />
            </div>
            {/* Remove reads as a quiet text action under the line total,
                not a trash glyph wedged against the "+" button where it
                was one mis-tap away from an accidental deletion. The
                total itself is a <div>, not a <Text>: Text renders a <p>
                and LineItemPrice's own markup is a <div>, and that
                nesting is invalid HTML that broke cart hydration. */}
            <div className="flex flex-col items-end gap-1">
              <div
                className="txt-medium-plus text-text-primary"
                data-testid="product-line-total"
              >
                <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
              </div>
              <DeleteButton
                id={item.id}
                aria-label={`Remove ${item.product_title} from cart`}
                data-testid="product-delete-button"
                variant="text"
                onDelete={(id) =>
                  removeItem?.(id, (err) =>
                    setError(err instanceof Error ? err.message : "Couldn't remove item")
                  )
                }
              >
                Remove
              </DeleteButton>
            </div>
          </div>

          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </li>
    )
  }

  /**
   * The summary's compact row. Also a flex row rather than a table row:
   * inside a 416px sidebar the table's three columns each fought for
   * width, so the thumbnail collapsed to a bullet-sized square beside a
   * title wrapping to four lines. A fixed-width image, a flexible middle
   * that may wrap, and a right column that never shrinks holds together
   * at any sidebar width.
   */
  return (
    <li className="flex items-start gap-3 py-3" data-testid="product-row">
      {thumbnail}
      {/* Two columns, not three. A separate quantity/unit-price column
          took ~130px of a ~315px panel on a phone, squeezing every title
          into four wrapped lines. The unit price moves under the title,
          where it has room to sit on one line, and the right column
          carries only the line total. */}
      <div className="min-w-0 flex-1">
        {title}
        {/* `whitespace-nowrap` on the row and `shrink-0` on the "n ×"
            prefix: LineItemUnitPrice renders its own block, so without
            these the prefix became a separate flex item and wrapped
            away from the figure it qualifies. */}
        <span className="mt-0.5 flex items-baseline gap-x-1 whitespace-nowrap text-caption text-text-muted [&_span]:!text-caption">
          <span className="shrink-0">{item.quantity} ×</span>
          <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
        </span>
      </div>
      <div className="shrink-0 whitespace-nowrap text-right text-[14px] font-medium text-text-primary">
        <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
      </div>
    </li>
  )
}

export default Item
