"use client"
import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import useFocusStepHeading from "@lib/hooks/use-focus-step-heading"
import { isFoodCentralItem, splitGiftWrapLines } from "@lib/util/cart-fulfillment"
import { CheckCircleSolid, CreditCard, ShieldCheck } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentButton from "@modules/checkout/components/payment-button"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
  hasDeliveryConflict = false,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
  /** §8, §11 — a real Food Central/address conflict blocks placing the order. */
  hasDeliveryConflict?: boolean
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  const headingRef = useFocusStepHeading(isOpen)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  // Payment is now the last step — there is no further step to advance
  // to, so "ready" means the terms/place-order block below replaces the
  // method-selection button in place, rather than navigating anywhere.
  // See this component's own note further down for why Payment absorbed
  // Review's content instead of keeping it as a separate step.
  const readyToPlaceOrder =
    !!paymentReady && (!isStripeLike(selectedPaymentMethod) || cardComplete)

  // §15 — the same lightweight, non-blocking age-verification restatement
  // Review used to carry, shown only when the cart genuinely contains an
  // age-restricted Wine & Spirits item.
  const { productLines } = splitGiftWrapLines(cart.items ?? [])
  const hasWineItems = productLines.some((item) => !isFoodCentralItem(item))

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  /**
   * No longer navigates to a "review" step on success — there isn't one
   * anymore. Confirming a payment method (or finishing entering a card)
   * just makes `readyToPlaceOrder` true on the next render, which swaps
   * this button out for the terms/Place Order block below, in place.
   *
   * **Payment absorbed Review rather than keeping it separate.** The
   * checkout used to be four stacked accordion steps — Address, Delivery,
   * Payment, Review — each rendering its own card even before it was
   * reached. Paul: "do we really need to put all of these steps... my aim
   * is to reduce friction as low as possible." Review's entire job was a
   * terms restatement and the Place Order button; folding both into
   * Payment's own last screen removes an entire step (and its click) for
   * every order, without dropping anything Review used to show.
   */
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="rounded-radius-md border border-divider bg-surface-elevated p-4 small:p-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          ref={headingRef}
          tabIndex={-1}
          level="h2"
          className={clx(
            "flex flex-row !text-heading-4 font-semibold gap-x-2 items-center focus:outline-none",
            {
              "pointer-events-none select-none !text-text-muted":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-interactive hover:text-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-full small:w-1/3">
              <Text className="txt-medium-plus text-text-primary mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-text-secondary"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          {/* Design Audit Phase 3 roadmap item 14 ("Checkout visual
              polish... trust signals at payment step") — the audit's own
              Conversion & Trust finding: "'Secure payment' is a text
              statement in the trust band [only]. No payment provider logos,
              no security badges at checkout." A concrete reassurance right
              beside the actual payment control, not just on the homepage. */}
          <div className="flex items-center gap-2 text-caption text-text-secondary mt-4">
            <ShieldCheck className="text-secondary shrink-0" />
            <span>Your payment is processed securely. We never store your card details.</span>
          </div>

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {readyToPlaceOrder ? (
            // Review's own content, unchanged — just no longer behind a
            // separate step. `border-t` gives it a clean break from the
            // method selection above rather than running straight on.
            <div className="mt-6 border-t border-divider pt-6">
              <Text className="txt-medium-plus text-text-primary mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read
                LiquorCentral&apos;s Privacy Policy.
              </Text>
              {hasWineItems && (
                <Text
                  className="text-text-secondary txt-small mt-2"
                  data-testid="checkout-age-verification-note"
                >
                  This order contains age-restricted items — you&apos;ll
                  confirm you are 18 years or older on delivery.
                </Text>
              )}
              <div className="mt-6">
                <PaymentButton
                  cart={cart}
                  notReady={hasDeliveryConflict}
                  data-testid="submit-order-button"
                />
              </div>
            </div>
          ) : (
            <Button
              size="large"
              className="mt-6 w-full sm:w-auto sm:min-w-[260px] px-8"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              {!activeSession && isStripeLike(selectedPaymentMethod)
                ? "Enter card details"
                : "Continue"}
            </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex flex-col small:flex-row items-start gap-6 small:gap-x-1 w-full">
              <div className="flex flex-col w-full small:w-1/3">
                <Text className="txt-medium-plus text-text-primary mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-text-secondary"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-full small:w-1/3">
                <Text className="txt-medium-plus text-text-primary mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-text-secondary items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ink-100">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeLike(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-full small:w-1/3">
              <Text className="txt-medium-plus text-text-primary mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-text-secondary"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Payment
