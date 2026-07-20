import { HttpTypes } from "@medusajs/types"

/**
 * 09_FOOD_ORDERING_SPECIFICATION.md §7 — the specified minimum stage set:
 * "Order Received -> Preparing -> Ready (for pickup) or Out for Delivery
 * -> Completed." Finer sub-granularity within a stage is explicitly left
 * open (§25, §28) — not invented here.
 */
export const FOOD_ORDER_STAGES = [
  "order_received",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
] as const

export type FoodOrderStage = (typeof FOOD_ORDER_STAGES)[number]

const STAGE_LABELS: Record<FoodOrderStage, string> = {
  order_received: "Order Received",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
}

export function foodOrderStageLabel(stage: FoodOrderStage): string {
  return STAGE_LABELS[stage]
}

type OrderWithFoodContext = Pick<HttpTypes.StoreOrder, "metadata" | "items">

type LineItemWithProductDetails = HttpTypes.StoreOrderLineItem & {
  product?: { food_details?: unknown } | null
}

export function hasFoodCentralItems(order: OrderWithFoodContext): boolean {
  return !!order.items?.some(
    (item) => !!(item as LineItemWithProductDetails).product?.food_details
  )
}

/**
 * Reads the admin-set stage from Order's native `metadata` field (see
 * `food-order-status-widget.tsx` — no dedicated column/migration). `null`
 * whenever unset or an unrecognized value, in which case the storefront
 * shows nothing rather than fabricating a stage that was never actually
 * set (§7's "no stage is skipped or shown out of order" applies equally
 * to never inventing one that doesn't reflect a real kitchen event).
 */
export function getFoodOrderStage(
  order: OrderWithFoodContext
): FoodOrderStage | null {
  const raw = order.metadata?.food_order_status
  if (typeof raw !== "string") {
    return null
  }
  return (FOOD_ORDER_STAGES as readonly string[]).includes(raw)
    ? (raw as FoodOrderStage)
    : null
}
