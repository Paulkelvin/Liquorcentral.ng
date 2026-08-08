import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import Item from "@modules/cart/components/item"
import GroupSubtotal from "./group-subtotal"

type FulfillmentGroupProps = {
  title: string
  icon: React.ReactNode
  deliveryMessage: string
  items: HttpTypes.StoreCartLineItem[]
  giftWrapByParent: Map<string, HttpTypes.StoreCartLineItem>
  giftWrap?: { variantId: string; price: number }
  currencyCode: string
  subtotal: number
  getMaxQuantity?: (item: HttpTypes.StoreCartLineItem) => number | undefined
  isItemUnavailable?: (item: HttpTypes.StoreCartLineItem) => boolean
}

/**
 * 06_CART_SPECIFICATION.md §5, §6 — one visually distinct group per
 * fulfillment leg, each with its own heading (naming the catalog and
 * delivery model explicitly, never "Group 1/2"), its own delivery
 * messaging (never merged with the other group's, §17), and its own
 * subtotal — a mixed cart is one order with two legs, not two carts
 * awkwardly sharing a page.
 */
const FulfillmentGroup = ({
  title,
  icon,
  deliveryMessage,
  items,
  giftWrapByParent,
  giftWrap,
  currencyCode,
  subtotal,
  getMaxQuantity,
  isItemUnavailable,
}: FulfillmentGroupProps) => {
  if (!items.length) {
    return null
  }

  return (
    <div data-testid="cart-fulfillment-group">
      {/* The header owns its own space below it, so the group's items
          read as belonging to it rather than starting immediately under
          the delivery message. */}
      <div className="mb-6 flex items-start gap-2">
        {icon}
        <div>
          <Heading level="h2" className="!text-body font-semibold">
            {title}
          </Heading>
          <Text className="!text-[14px] text-text-secondary">
            {deliveryMessage}
          </Text>
        </div>
      </div>
      <ul className="flex flex-col gap-4">
        {items
          .slice()
          // Newest first, `id` as a deterministic tiebreak — see
          // `cart/templates/preview.tsx`'s identical fix for why the
          // previous comparator (never returning `0` for a tie) let
          // items visibly swap places on every re-render.
          .sort((a, b) => {
            const diff =
              String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
            return diff !== 0 ? diff : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
          })
          .map((item) => (
            <Item
              // Variant, not line id — see cart-drawer's own note for the
              // image flash that keying on a soon-to-be-replaced
              // `optimistic-…` id produced.
              key={item.variant_id ?? item.id}
              item={item}
              giftWrapItem={giftWrapByParent.get(item.id)}
              giftWrap={giftWrap}
              maxQuantity={getMaxQuantity?.(item)}
              isUnavailable={isItemUnavailable?.(item)}
              currencyCode={currencyCode}
            />
          ))}
      </ul>
      <div className="mt-4 flex justify-end border-t border-divider pt-4">
        <div className="flex items-center gap-x-4">
          <Text className="text-text-secondary">{title} subtotal</Text>
          <GroupSubtotal amount={subtotal} currencyCode={currencyCode} />
        </div>
      </div>
    </div>
  )
}

export default FulfillmentGroup
