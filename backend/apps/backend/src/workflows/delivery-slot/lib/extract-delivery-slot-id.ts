/**
 * A delivery slot is attached to a cart the same way any fulfillment
 * provider attaches custom data to a shipping method selection — via the
 * native, provider-agnostic `data` JSON field on the cart's shipping
 * method (see @medusajs/cart's ShippingMethod model, and
 * addShippingMethodToCartWorkflow's own documented `data` property:
 * "Custom data useful for the fulfillment provider processing the
 * shipping option or method"). This is the Medusa-native extension point
 * TIER_B_DELIVERY_SLOT_MODULE.md §10 asks for — no new cart field, no
 * schema change to the native Cart module.
 *
 * A cart with no delivery-slot-carrying shipping method (e.g. a Wine &
 * Spirits-only order, or a Food Central pickup order using a ready-time
 * estimate rather than a booked slot, per §5's explicitly unresolved
 * pickup boundary) simply has no delivery_slot_id to extract — this is
 * the expected, non-error case for every order this module's scope (§8)
 * does not apply to.
 */
export type CartShippingMethodLike = {
  data?: Record<string, unknown> | null
}

export type CartLike = {
  shipping_methods?: CartShippingMethodLike[] | null
}

export function extractDeliverySlotId(cart: CartLike | null | undefined): string | undefined {
  const shippingMethods = cart?.shipping_methods ?? []

  for (const shippingMethod of shippingMethods) {
    const deliverySlotId = shippingMethod?.data?.delivery_slot_id

    if (typeof deliverySlotId === "string" && deliverySlotId.length > 0) {
      return deliverySlotId
    }
  }

  return undefined
}
