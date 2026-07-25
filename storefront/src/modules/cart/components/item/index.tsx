"use client"

import { Table, Text, Checkbox, clx } from "@modules/common/components/ui"
import { addGiftWrapToLineItem, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
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
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [giftWrapPending, setGiftWrapPending] = useState(false)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const action =
      quantity <= 0 ? deleteLineItem(item.id) : updateLineItem({ lineId: item.id, quantity })

    await action
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const toggleGiftWrap = async (checked: boolean) => {
    setGiftWrapPending(true)
    try {
      if (checked && giftWrap) {
        await addGiftWrapToLineItem({ giftWrapVariantId: giftWrap.variantId, forLineItemId: item.id })
      } else if (!checked && giftWrapItem) {
        await deleteLineItem(giftWrapItem.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update gift wrap")
    } finally {
      setGiftWrapPending(false)
    }
  }

  const title = (
    <>
      <Text className="txt-medium-plus text-text-primary" data-testid="product-title">
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
      className={clx("flex shrink-0", {
        "w-16": type === "preview",
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
   * viewport). The checkout summary's compact `preview` variant still
   * renders as a table row, since it genuinely lives inside one.
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <QuantityStepper
                quantity={item.quantity}
                onChange={changeQuantity}
                max={maxQuantity}
                min={0}
                disabled={updating}
              />
              <DeleteButton
                id={item.id}
                aria-label={`Remove ${item.product_title} from cart`}
                data-testid="product-delete-button"
              />
              {updating && <Spinner />}
            </div>
            {/* Not a <Text>: that renders a <p>, and LineItemPrice's own
                markup is a <div>, so the pair produced a <div> inside a
                <p> — invalid HTML that React repairs during hydration,
                which threw away and re-rendered the whole cart tree on
                every load. */}
            <div
              className="txt-medium-plus text-text-primary"
              data-testid="product-line-total"
            >
              <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
          </div>

          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </li>
    )
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">{thumbnail}</Table.Cell>
      <Table.Cell className="text-left">{title}</Table.Cell>
      <Table.Cell className="!pr-0">
        <span className="flex h-full flex-col items-center justify-center !pr-0">
          <span className="flex gap-x-1 ">
            <Text className="text-text-muted">{item.quantity}x </Text>
            <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
          </span>
          <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
