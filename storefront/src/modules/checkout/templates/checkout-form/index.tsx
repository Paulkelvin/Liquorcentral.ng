import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { hasRealAddress, hasUnresolvedDeliveryConflict } from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import Addresses from "@modules/checkout/components/addresses"
import DeliveryEligibilityConflict from "@modules/checkout/components/delivery-eligibility-conflict"
import Payment from "@modules/checkout/components/payment"
import ProgressSteps from "@modules/checkout/components/progress-steps"
import Shipping from "@modules/checkout/components/shipping"
import StepGate from "@modules/checkout/components/step-gate"

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
    // Each step is now an enclosed card (padded, hairline border), so the
    // gap between them separates real objects rather than butting two
    // unbounded white areas against each other.
    <div className="w-full grid grid-cols-1 gap-y-4 small:gap-y-6">
      {/* 07_CHECKOUT_SPECIFICATION.md §22 — no checkout page had a
          top-level heading at all; each step's own heading is an `h2`. */}
      <Heading level="h1" className="sr-only">
        Checkout
      </Heading>

      <ProgressSteps />

      {/* Each step's card is hidden entirely until the customer actually
          reaches it — see StepGate's own comment for the "the window"
          complaint this replaces (every step, including ones nowhere
          near yet, used to always render its own card). Address is
          step 0, so it's always shown once there's a `?step=` at all. */}
      <StepGate step="address">
        <Addresses cart={cart} customer={customer} />
      </StepGate>

      {hasConflict && <DeliveryEligibilityConflict />}

      <StepGate step="delivery">
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      </StepGate>

      <StepGate step="payment">
        <Payment
          cart={cart}
          availablePaymentMethods={paymentMethods}
          hasDeliveryConflict={hasConflict}
        />
      </StepGate>
    </div>
  )
}
