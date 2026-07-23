"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuantityStepper from "@modules/common/components/quantity-stepper"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  /**
   * Real, freshly-looked-up stock count for this line item's variant,
   * supplied by the caller (see `templates/items.tsx`) since the Cart
   * endpoint's own `variant.inventory_quantity` field expansion does not
   * resolve. `undefined` means "not managed / no cap," not "zero."
   */
  inventoryQuantity?: number
}

function isVariantAvailable(
  variant: HttpTypes.StoreProductVariant | null | undefined,
  inventoryQuantity: number | undefined
) {
  if (!variant) {
    return false
  }
  if (!variant.manage_inventory) {
    return true
  }
  if (variant.allow_backorder) {
    return true
  }
  return (inventoryQuantity || 0) > 0
}

const Item = ({ item, type = "full", currencyCode, inventoryQuantity }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const variant = item.variant
  const unavailable = !isVariantAvailable(variant, inventoryQuantity)

  /**
   * 06_CART_SPECIFICATION.md §7 — "Wine & Spirits quantity remains
   * capped by genuine available stock, re-validated at cart view...
   * Food Central quantity remains uncapped by a stock count."
   */
  const maxQuantity =
    variant?.manage_inventory && !variant?.allow_backorder
      ? inventoryQuantity || 0
      : undefined

  const itemName = item.title || item.product_title || "item"
  const quantityLabelId = `cart-quantity-label-${item.id}`

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          aria-label={itemName}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            alt={itemName}
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {/* 06_CART_SPECIFICATION.md §12 — "labeled in place, never
            silently removed." Informational only; the customer decides
            what to do next (§19). */}
        {unavailable && (
          <Text
            as="span"
            size="caption"
            className="text-danger block"
            data-testid="cart-item-unavailable-label"
          >
            Currently unavailable
          </Text>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex flex-col gap-2 items-start">
            <div className="flex gap-2 items-center">
              <DeleteButton
                id={item.id}
                itemName={itemName}
                data-testid="product-delete-button"
              />
              <span id={quantityLabelId} className="sr-only">
                Quantity for {itemName}
              </span>
              <QuantityStepper
                value={item.quantity}
                max={maxQuantity}
                onDecrease={() => changeQuantity(Math.max(1, item.quantity - 1))}
                onIncrease={() =>
                  changeQuantity(
                    maxQuantity !== undefined
                      ? Math.min(maxQuantity, item.quantity + 1)
                      : item.quantity + 1
                  )
                }
                disabled={updating || unavailable}
                labelId={quantityLabelId}
                data-testid="product-quantity-value"
              />
              {updating && <Spinner />}
            </div>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
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
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
