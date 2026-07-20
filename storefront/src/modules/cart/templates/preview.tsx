"use client"

import repeat from "@lib/util/repeat"
import { convertToLocale } from "@lib/util/money"
import {
  groupSubtotal,
  isFoodCentralItem,
  splitGiftWrapLines,
} from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Table, Text, clx } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

/**
 * 07_CHECKOUT_SPECIFICATION.md §5, §8 — the Order Summary step carries the
 * cart's two fulfillment-leg groups forward unchanged, "never merged into
 * one line" — the exact grouping `06_CART_SPECIFICATION.md` §5 already
 * established, reused here rather than restated.
 */
const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items

  if (!items) {
    return (
      <div>
        {repeat(3).map((i) => (
          <SkeletonLineItem key={i} />
        ))}
      </div>
    )
  }

  const { productLines, giftWrapByParent } = splitGiftWrapLines(items)
  const wineLines = productLines.filter((item) => !isFoodCentralItem(item))
  const foodLines = productLines.filter((item) => isFoodCentralItem(item))

  const renderGroup = (
    title: string,
    lines: HttpTypes.StoreCartLineItem[]
  ) => {
    if (!lines.length) {
      return null
    }
    const hasOverflow = lines.length > 4
    return (
      <div key={title} className="mb-4">
        <Text className="txt-small-plus text-ui-fg-subtle mb-2">{title}</Text>
        <div
          className={clx({
            "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
              hasOverflow,
          })}
        >
          <Table>
            <Table.Body data-testid="items-table">
              {lines
                .slice()
                .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
                .map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    type="preview"
                    currencyCode={cart.currency_code}
                  />
                ))}
            </Table.Body>
          </Table>
        </div>
        <div className="flex justify-end">
          <Text className="txt-small-plus text-ui-fg-subtle">
            {title} subtotal:{" "}
            {convertToLocale({
              amount: groupSubtotal(lines, giftWrapByParent),
              currency_code: cart.currency_code,
            })}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderGroup("Wine & Spirits", wineLines)}
      {renderGroup("Food Central", foodLines)}
    </div>
  )
}

export default ItemsPreviewTemplate
