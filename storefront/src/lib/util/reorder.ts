/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §15 — the pure re-validation
 * decision behind `reorderItems` (`lib/data/orders.ts`): a variant that no
 * longer exists (discontinued/unpublished — absent from the Store API
 * response entirely) is unavailable; a stock-managed variant genuinely at
 * zero is unavailable; anything else re-adds, capped at real available
 * stock when the original quantity exceeds it — the same "clamp down,
 * never silently drop to zero" discipline `cart-fulfillment.ts` already
 * established for the cart's own stock reconciliation.
 */
export type ReorderLine = { quantity: number }

export type ReorderVariant = {
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
}

export type ReorderDecision =
  | { action: "unavailable" }
  | { action: "add"; quantity: number }

export function resolveReorderDecision(
  line: ReorderLine,
  variant: ReorderVariant | undefined
): ReorderDecision {
  if (!variant) {
    return { action: "unavailable" }
  }

  const stockManaged = !!variant.manage_inventory && !variant.allow_backorder
  if (!stockManaged) {
    return { action: "add", quantity: line.quantity }
  }

  const available = variant.inventory_quantity ?? 0
  if (available === 0) {
    return { action: "unavailable" }
  }

  return { action: "add", quantity: Math.min(line.quantity, available) }
}
