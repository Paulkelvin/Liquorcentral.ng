import { HttpTypes } from "@medusajs/types"

type ProductWithFoodMetadata = Pick<HttpTypes.StoreProduct, "metadata"> & {
  food_details?: unknown
}

export function isFoodCentralProduct(product: ProductWithFoodMetadata): boolean {
  return !!product.food_details
}

/**
 * 09_FOOD_ORDERING_SPECIFICATION.md §6, §16 — a dish is "Unavailable"
 * (86'd) only when explicitly flagged so; absent the flag, every dish
 * defaults to available. Stored on Product's own native `metadata`
 * field (`food_available: false`) rather than a new module/migration —
 * TIER_B_FOOD_ATTRIBUTES_MODULE.md's architecture boundary keeps this
 * concept out of `food_details` specifically, not out of Product
 * metadata generally, and `API_DECISIONS.md`'s "use native routes as-is
 * wherever possible" principle favors reusing a field that already
 * exists over inventing a dedicated module for a single boolean.
 *
 * This implements only the "Unavailable" state of §6's three-state
 * model. "Available to schedule" is not implemented — it depends on
 * same-day cutoff timing and delivery-slot storefront wiring that are
 * both explicitly "not yet built" per §25's own Backend Requirements
 * table, not something this flag can honestly distinguish on its own.
 */
export function isFoodCentralUnavailable(
  product: ProductWithFoodMetadata
): boolean {
  return (
    isFoodCentralProduct(product) && product.metadata?.food_available === false
  )
}
