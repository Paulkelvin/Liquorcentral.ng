"use client"

import { Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      {/* A single interactive element, not a link wrapping a button (a
          nested-interactive violation the same class already fixed once
          in the cart dropdown, Milestone 6) — the link itself carries
          the button's own visual styling. */}
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="inline-flex gap-2 items-center justify-center rounded-radius-md font-medium min-h-[44px] w-full bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active"
      >
        Go to checkout
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
