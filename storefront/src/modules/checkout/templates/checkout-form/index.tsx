import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { hasRealAddress, hasUnresolvedDeliveryConflict } from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import Addresses from "@modules/checkout/components/addresses"
import DeliveryEligibilityConflict from "@modules/checkout/components/delivery-eligibility-conflict"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  // 07_CHECKOUT_SPECIFICATION.md §8, §11 — checked as soon as a real
  // address exists, since that's the earliest point this check can happen.
  // `hasRealAddress`, not bare truthiness: Medusa creates every cart's
  // shipping_address record eagerly (empty but non-null), which would
  // otherwise make this evaluate before the customer ever enters anything.
  const hasConflict =
    hasRealAddress(cart.shipping_address) && hasUnresolvedDeliveryConflict(cart)

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      {/* 07_CHECKOUT_SPECIFICATION.md §22 — no checkout page had a
          top-level heading at all; each step's own heading is an `h2`. */}
      <Heading level="h1" className="sr-only">
        Checkout
      </Heading>

      <Addresses cart={cart} customer={customer} />

      {hasConflict && <DeliveryEligibilityConflict />}

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} hasDeliveryConflict={hasConflict} />
    </div>
  )
}
