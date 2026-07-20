import { HttpTypes } from "@medusajs/types"

/**
 * 10_DELIVERY_SPECIFICATION.md §10 — Wine & Spirits' own nationwide-dispatch
 * status progression, specified for the first time in that document (Food
 * Central's equivalent was already specified by
 * `09_FOOD_ORDERING_SPECIFICATION.md` §7): Order Placed -> Dispatched ->
 * In Transit -> Delivered. Finer sub-granularity is explicitly left open
 * (§25, §28) — not invented here.
 */
export const WINE_DELIVERY_STAGES = [
  "order_placed",
  "dispatched",
  "in_transit",
  "delivered",
] as const

export type WineDeliveryStage = (typeof WINE_DELIVERY_STAGES)[number]

const STAGE_LABELS: Record<WineDeliveryStage, string> = {
  order_placed: "Order Placed",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
}

export function wineDeliveryStageLabel(stage: WineDeliveryStage): string {
  return STAGE_LABELS[stage]
}

type OrderWithWineContext = Pick<HttpTypes.StoreOrder, "metadata" | "items">

type LineItemWithProductDetails = HttpTypes.StoreOrderLineItem & {
  product?: { wine_details?: unknown } | null
}

export function hasWineSpiritsItems(order: OrderWithWineContext): boolean {
  return !!order.items?.some(
    (item) => !!(item as LineItemWithProductDetails).product?.wine_details
  )
}

/**
 * Reads the admin-set stage from Order's native `metadata` field (see
 * `wine-delivery-status-widget.tsx` — no dedicated column/migration,
 * same reasoning as `food-order-status.ts`'s identical mechanism). `null`
 * whenever unset or an unrecognized value — the storefront shows nothing
 * rather than fabricating a stage that was never genuinely true (§10's
 * "a status is only shown once it is genuinely true").
 */
export function getWineDeliveryStage(
  order: OrderWithWineContext
): WineDeliveryStage | null {
  const raw = order.metadata?.wine_delivery_status
  if (typeof raw !== "string") {
    return null
  }
  return (WINE_DELIVERY_STAGES as readonly string[]).includes(raw)
    ? (raw as WineDeliveryStage)
    : null
}
