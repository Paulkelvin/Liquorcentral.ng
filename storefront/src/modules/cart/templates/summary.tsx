"use client"

import { Button, Heading, Text } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  itemCount?: number
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

/**
 * The order summary panel: a titled surface with the item count beside
 * the heading, the cost breakdown, then the discount field, and finally
 * the single primary action with a quieter "continue shopping" escape
 * beneath it — so the strongest visual weight on the page sits on the
 * one thing the customer is most likely to want next.
 */
const Summary = ({ cart, itemCount }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-6 rounded-radius-md border border-border bg-surface-elevated p-5 small:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <Heading level="h2" className="!text-heading-4">
          Order summary
        </Heading>
        {typeof itemCount === "number" && itemCount > 0 && (
          <Text size="caption" muted data-testid="cart-item-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        )}
      </div>

      <div className="border-t border-divider pt-5">
        <CartTotals totals={cart} />
      </div>

      <div className="border-t border-divider pt-5">
        <DiscountCode cart={cart} />
      </div>

      <div className="flex flex-col gap-3">
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button size="large" className="w-full">
            Go to checkout
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/store"
          className="text-center text-caption text-text-secondary transition-colors duration-standard ease-in-out hover:text-text-primary"
          data-testid="continue-shopping-summary"
        >
          Continue shopping
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Summary
