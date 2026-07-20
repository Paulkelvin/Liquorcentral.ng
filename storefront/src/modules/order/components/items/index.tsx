import repeat from "@lib/util/repeat"
import { isFoodCentralItem } from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@modules/common/components/ui"

import Divider from "@modules/common/components/divider"
import Item from "@modules/order/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

/**
 * 07_CHECKOUT_SPECIFICATION.md §8, §17 — "states each fulfillment group's
 * confirmed delivery outcome distinctly... the final expression of the
 * never-merge-the-two-legs discipline running through this entire
 * document" — the same grouping `06_CART_SPECIFICATION.md` §5 already
 * established, carried forward to the terminal confirmation state.
 */
const Items = ({ order }: ItemsProps) => {
  const items = order.items

  if (!items) {
    return (
      <div className="flex flex-col">
        <Divider className="!mb-0" />
        <Table>
          <Table.Body data-testid="products-table">
            {repeat(5).map((i) => (
              <SkeletonLineItem key={i} />
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  const cartLikeItems = items as unknown as HttpTypes.StoreCartLineItem[]
  const wineLines = cartLikeItems.filter((item) => !isFoodCentralItem(item))
  const foodLines = cartLikeItems.filter((item) => isFoodCentralItem(item))

  const renderGroup = (title: string, lines: HttpTypes.StoreCartLineItem[]) => {
    if (!lines.length) {
      return null
    }
    return (
      <div key={title} className="flex flex-col mb-4">
        <Text className="txt-medium-plus text-ui-fg-base my-2">{title}</Text>
        <Table>
          <Table.Body data-testid="products-table">
            {lines
              .slice()
              .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
              .map((item) => (
                <Item
                  key={item.id}
                  item={item as unknown as HttpTypes.StoreOrderLineItem}
                  currencyCode={order.currency_code}
                />
              ))}
          </Table.Body>
        </Table>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Divider className="!mb-0" />
      {renderGroup("Wine & Spirits", wineLines)}
      {renderGroup("Food Central", foodLines)}
    </div>
  )
}

export default Items
