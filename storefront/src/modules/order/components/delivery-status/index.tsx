import { HttpTypes } from "@medusajs/types"
import { hasFoodCentralItems } from "@lib/util/food-order-status"
import { hasWineSpiritsItems } from "@lib/util/wine-delivery-status"
import FoodOrderStatus from "@modules/order/components/food-order-status"
import WineDeliveryStatus from "@modules/order/components/wine-delivery-status"

/**
 * 10_DELIVERY_SPECIFICATION.md §15 — "A mixed order's order-detail view
 * presents both legs' delivery status side by side, clearly labeled...
 * No delivery communication ever merges the two legs into one combined
 * status." A single-catalog order keeps the generic "Order status"
 * heading each sub-component already defaults to; a genuinely mixed
 * order gives each block its own catalog-labeled heading instead, so
 * the two are never ambiguous about which leg they describe.
 */
export default function DeliveryStatus({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  const isMixed = hasFoodCentralItems(order) && hasWineSpiritsItems(order)

  return (
    <div className="flex flex-col gap-y-8">
      <WineDeliveryStatus
        order={order}
        heading={isMixed ? "Wine & Spirits status" : "Order status"}
      />
      <FoodOrderStatus
        order={order}
        heading={isMixed ? "Food Central status" : "Order status"}
      />
    </div>
  )
}
