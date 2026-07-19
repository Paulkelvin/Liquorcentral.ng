import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import { MapPin, TruckFast } from "@medusajs/icons"

import FulfillmentGroup from "@modules/cart/components/fulfillment-group"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import {
  getAvailableStock,
  groupSubtotal,
  isFoodCentralItem,
  splitGiftWrapLines,
} from "@lib/util/cart-fulfillment"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
  giftWrap?: { variantId: string; price: number }
  /** §7, §13 — Wine & Spirits line item id -> genuine available stock (already merged server-side). */
  stockByVariantId?: Record<string, number>
}

const ItemsTemplate = ({ cart, giftWrap, stockByVariantId }: ItemsTemplateProps) => {
  const items = cart?.items

  if (!items) {
    return (
      <div>
        <div className="pb-3 flex items-center">
          <Heading level="h1" className="text-[2rem] leading-[2.75rem]">
            Cart
          </Heading>
        </div>
        {repeat(3).map((i) => (
          <SkeletonLineItem key={i} />
        ))}
      </div>
    )
  }

  const { productLines, giftWrapByParent } = splitGiftWrapLines(items)
  const wineLines = productLines.filter((item) => !isFoodCentralItem(item))
  const foodLines = productLines.filter((item) => isFoodCentralItem(item))

  const getMaxQuantity = (item: HttpTypes.StoreCartLineItem) => {
    const knownQuantity = item.variant_id ? stockByVariantId?.[item.variant_id] : undefined
    return getAvailableStock(item, knownQuantity)
  }

  const isItemUnavailable = (item: HttpTypes.StoreCartLineItem) => {
    if (isFoodCentralItem(item)) {
      return false
    }
    const max = getMaxQuantity(item)
    return max === 0
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="pb-1 flex items-center justify-between">
        <Heading level="h1" className="text-[2rem] leading-[2.75rem]">
          Cart
        </Heading>
        {wineLines.length > 0 && foodLines.length > 0 && (
          <details className="text-small-regular text-ui-fg-subtle">
            <summary className="cursor-pointer select-none">Why is my cart split?</summary>
            <p className="mt-2 max-w-sm">
              LiquorCentral is one company serving two catalogs with different delivery
              models — Wine &amp; Spirits and Food Central are grouped separately so each
              one&apos;s delivery promise stays clear, but everything still checks out together
              as one order.
            </p>
          </details>
        )}
      </div>

      <FulfillmentGroup
        title="Wine & Spirits"
        icon={<TruckFast className="mt-1 shrink-0 text-ui-fg-subtle" aria-hidden="true" />}
        deliveryMessage="Delivered across all of Lagos."
        items={wineLines}
        giftWrapByParent={giftWrapByParent}
        giftWrap={giftWrap}
        currencyCode={cart.currency_code}
        subtotal={groupSubtotal(wineLines, giftWrapByParent)}
        getMaxQuantity={getMaxQuantity}
        isItemUnavailable={isItemUnavailable}
      />

      <FulfillmentGroup
        title="Food Central"
        icon={<MapPin className="mt-1 shrink-0 text-ui-fg-subtle" aria-hidden="true" />}
        deliveryMessage="Delivered within Lagos Island — same-day, scheduled, or pickup, chosen at checkout."
        items={foodLines}
        giftWrapByParent={giftWrapByParent}
        currencyCode={cart.currency_code}
        subtotal={groupSubtotal(foodLines, giftWrapByParent)}
      />
    </div>
  )
}

export default ItemsTemplate
