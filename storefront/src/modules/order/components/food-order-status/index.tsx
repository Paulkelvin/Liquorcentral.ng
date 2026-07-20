import { HttpTypes } from "@medusajs/types"
import { Heading, clx } from "@modules/common/components/ui"
import { isPickupShippingMethod } from "@lib/util/cart-fulfillment"
import {
  FoodOrderStage,
  foodOrderStageLabel,
  getFoodOrderStage,
  hasFoodCentralItems,
} from "@lib/util/food-order-status"

/**
 * 09_FOOD_ORDERING_SPECIFICATION.md §7 — "Order Received -> Preparing ->
 * Ready (pickup) or Out for Delivery -> Completed... no stage is skipped
 * or shown out of order." Renders only when the order genuinely contains
 * a Food Central item AND a stage has actually been set by staff
 * (`food-order-status-widget.tsx`) — an order with no value set shows
 * nothing here rather than a fabricated "Order Received" default, since
 * this document's honesty requirement (§8, §17) applies equally to
 * never implying a status update that hasn't genuinely happened.
 *
 * §21 — real heading/list semantics, plus a live region. This
 * announces the current stage whenever the component (re-)renders with
 * a changed value — there is no polling or push-update mechanism yet
 * (real-time status is `10_DELIVERY_SPECIFICATION.md` §11's own
 * documented v1 limitation, not a live GPS/push mechanism), so this is
 * accurate as of each page load/refresh, not truly live while a tab
 * sits open.
 *
 * `heading` lets a caller rendering both catalogs' statuses side by
 * side (`10_DELIVERY_SPECIFICATION.md` §15 — "never merged into one
 * status") give this block its own catalog-labeled heading instead of
 * the generic "Order status" default used when only one catalog's
 * status is present.
 */
export default function FoodOrderStatus({
  order,
  heading = "Order status",
}: {
  order: HttpTypes.StoreOrder
  heading?: string
}) {
  const stage = getFoodOrderStage(order)
  const containsFood = hasFoodCentralItems(order)

  if (!containsFood || !stage) {
    return null
  }

  const isPickup = (order.shipping_methods ?? []).some((method) =>
    isPickupShippingMethod(method)
  )

  const baseStages: FoodOrderStage[] = [
    "order_received",
    "preparing",
    isPickup ? "ready_for_pickup" : "out_for_delivery",
    "completed",
  ]

  // If staff set the "other" delivery-method stage than the order's own
  // shipping method implies, still show the real value rather than hide
  // it — swap it into the third slot instead of silently disagreeing.
  const displayStages = baseStages.includes(stage)
    ? baseStages
    : ([baseStages[0], baseStages[1], stage, baseStages[3]] as FoodOrderStage[])

  const currentIndex = displayStages.indexOf(stage)

  return (
    <div className="flex flex-col gap-y-4" data-testid="food-order-status">
      <Heading level="h2" className="txt-large">
        {heading}
      </Heading>
      <ol className="flex flex-col gap-y-2">
        {displayStages.map((s, index) => {
          const isCurrent = index === currentIndex
          const isComplete = index < currentIndex
          return (
            <li
              key={s}
              className={clx("flex items-center gap-x-2 txt-compact-small", {
                "text-text-primary font-medium": isCurrent,
                "text-text-secondary": isComplete,
                "text-text-disabled": index > currentIndex,
              })}
            >
              <span aria-hidden="true">{isCurrent || isComplete ? "●" : "○"}</span>
              {foodOrderStageLabel(s)}
              {isCurrent && <span className="sr-only"> (current stage)</span>}
            </li>
          )
        })}
      </ol>
      <div role="status" aria-live="polite" className="sr-only">
        {`${heading}: ${foodOrderStageLabel(stage)}`}
      </div>
    </div>
  )
}
