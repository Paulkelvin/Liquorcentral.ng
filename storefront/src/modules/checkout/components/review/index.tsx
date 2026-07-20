"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"

import { hasRealAddress, isFoodCentralItem, splitGiftWrapLines } from "@lib/util/cart-fulfillment"
import useFocusStepHeading from "@lib/hooks/use-focus-step-heading"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

const Review = ({
  cart,
  hasDeliveryConflict = false,
}: {
  cart: HttpTypes.StoreCart
  /** §8, §11 — a real Food Central/address conflict blocks placing the order. */
  hasDeliveryConflict?: boolean
}) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"
  const headingRef = useFocusStepHeading(isOpen)

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    hasRealAddress(cart.shipping_address) &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // §15 — a lightweight, non-blocking restatement (not a re-confirmation)
  // that the order will be age-verified, shown only when it genuinely
  // contains an age-restricted Wine & Spirits item.
  const { productLines } = splitGiftWrapLines(cart.items ?? [])
  const hasWineItems = productLines.some((item) => !isFoodCentralItem(item))

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          ref={headingRef}
          tabIndex={-1}
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline focus:outline-none",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
              {hasWineItems && (
                <Text
                  className="text-ui-fg-subtle txt-small mt-2"
                  data-testid="checkout-age-verification-note"
                >
                  This order contains age-restricted items — you&apos;ll
                  confirm you are 18 years or older on delivery.
                </Text>
              )}
            </div>
          </div>
          <PaymentButton
            cart={cart}
            notReady={hasDeliveryConflict}
            data-testid="submit-order-button"
          />
        </>
      )}
    </div>
  )
}

export default Review
