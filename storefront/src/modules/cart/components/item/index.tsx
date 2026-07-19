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

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          aria-label={`View ${item.product_title || item.title || "product"}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            alt={item.title || item.product_title || "Product photo"}
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text className="txt-medium-plus text-ui-fg-base" data-testid="product-title">
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {isUnavailable && (
          <Text className="text-ui-fg-error mt-1" data-testid="product-unavailable-notice">
            Currently unavailable — remove this item or check back later.
          </Text>
        )}
        {giftWrap && type === "full" && (
          <div className="mt-2">
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
          </div>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center">
            <DeleteButton
              id={item.id}
              aria-label={`Remove ${item.product_title} from cart`}
              data-testid="product-delete-button"
            />
            <QuantityStepper
              quantity={item.quantity}
              onChange={changeQuantity}
              max={maxQuantity}
              min={0}
              disabled={updating}
            />
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
            </span>
          )}
          <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
