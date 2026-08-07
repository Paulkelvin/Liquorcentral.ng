import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({
  cart,
  knownDeliveryFee,
}: {
  cart: HttpTypes.StoreCart
  knownDeliveryFee?: number | null
}) => {
  return (
    <div className="flex flex-col-reverse small:sticky small:top-6 small:flex-col">
      {/* An enclosed panel rather than bare content in a column: on
          desktop the summary now reads as a distinct object beside the
          form, and the sections inside it get real vertical rhythm
          instead of stacking flush against one another. */}
      <div className="flex w-full flex-col gap-6 rounded-radius-md border border-divider bg-surface-elevated p-5 shadow-elevation-1">
        <Heading level="h2" className="!text-body-lg font-semibold">
          Order summary
        </Heading>
        <ItemsPreviewTemplate cart={cart} />
        <div className="border-t border-divider pt-5">
          <CartTotals totals={cart} knownDeliveryFee={knownDeliveryFee} />
        </div>
        <div className="border-t border-divider pt-5">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
