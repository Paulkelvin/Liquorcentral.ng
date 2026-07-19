import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { Heading, Table, Text } from "@modules/common/components/ui"
import Item from "@modules/cart/components/item"

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
    <div className="flex flex-col gap-y-3" data-testid="cart-fulfillment-group">
      <div className="flex items-start gap-2">
        {icon}
        <div>
          <Heading level="h2" className="txt-medium-plus">
            {title}
          </Heading>
          <Text className="text-ui-fg-subtle">{deliveryMessage}</Text>
        </div>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus">
            <Table.HeaderCell className="!pl-0">Item</Table.HeaderCell>
            <Table.HeaderCell>
              <span className="sr-only">Product image</span>
            </Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">Price</Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">Total</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            .slice()
            .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
            .map((item) => (
              <Item
                key={item.id}
                item={item}
                giftWrapItem={giftWrapByParent.get(item.id)}
                giftWrap={giftWrap}
                maxQuantity={getMaxQuantity?.(item)}
                isUnavailable={isItemUnavailable?.(item)}
                currencyCode={currencyCode}
              />
            ))}
        </Table.Body>
      </Table>
      <div className="flex justify-end">
        <div className="flex items-center gap-x-4">
          <Text className="text-ui-fg-subtle">{title} subtotal</Text>
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="cart-fulfillment-group-subtotal"
            data-value={subtotal}
          >
            {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default FulfillmentGroup
