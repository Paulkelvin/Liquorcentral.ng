"use client"

import repeat from "@lib/util/repeat"
import { convertToLocale } from "@lib/util/money"
import {
  groupSubtotal,
  isFoodCentralItem,
  splitGiftWrapLines,
} from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Text, clx } from "@modules/common/components/ui"

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
      <div key={title}>
        <Text
          as="span"
          className="!text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted"
        >
          {title}
        </Text>
        <div
          className={clx("mt-1 divide-y divide-divider", {
            "overflow-y-auto overflow-x-hidden no-scrollbar max-h-[420px]":
              hasOverflow,
          })}
        >
          <ul data-testid="items-table" className="divide-y divide-divider">
            {lines
              .slice()
              // Newest first, `id` as a deterministic tiebreak — the
              // previous comparator never returned `0` for a tie (equal
              // or missing `created_at`, common for items added close
              // together), which breaks `Array.sort`'s stability
              // contract and let ties visibly swap places on every
              // re-render (e.g. a "+" tap rebuilding `cart.items`).
              .sort((a, b) => {
                const diff =
                  String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
                return diff !== 0 ? diff : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
              })
              .map((item) => (
                <Item
                  // Variant, not line id — see cart-drawer's own note.
                  key={item.variant_id ?? item.id}
                  item={item}
                  type="preview"
                  currencyCode={cart.currency_code}
                />
              ))}
          </ul>
        </div>
        <div className="flex justify-between pt-2 text-[13px]">
          <span className="text-text-secondary">{title} subtotal</span>
          <span className="font-medium text-text-primary">
            {convertToLocale({
              amount: groupSubtotal(lines, giftWrapByParent),
              currency_code: cart.currency_code,
            })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {renderGroup("Wine & Spirits", wineLines)}
      {renderGroup("Food Central", foodLines)}
    </div>
  )
}

export default ItemsPreviewTemplate
