"use client"
import { setAddresses } from "@lib/data/cart"
import useFocusStepHeading from "@lib/hooks/use-focus-step-heading"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { hasRealAddress } from "@lib/util/cart-fulfillment"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import { Heading, Text } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"
  const headingRef = useFocusStepHeading(isOpen)

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-surface-elevated">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          ref={headingRef}
          tabIndex={-1}
          level="h2"
          className="flex flex-row text-heading-1 gap-x-2 items-baseline focus:outline-none"
        >
          Shipping Address
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && hasRealAddress(cart?.shipping_address) && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-interactive hover:text-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            {!customer && (
              <Text
                className="text-text-secondary txt-small mb-4"
                data-testid="guest-checkout-note"
              >
                You don&apos;t need an account to complete this order —
                checking out as a guest is fully supported.
              </Text>
            )}
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-heading-1 gap-x-4 pb-6 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-caption">
            {cart && cart.shipping_address && hasRealAddress(cart.shipping_address) ? (
              // Real bug found via a live mobile screenshot: this recap was
              // an unconditional 3-column flex row (`w-1/3` each, no
              // responsive stacking at all), which on a narrow viewport
              // squeezed every column to ~100px — text wrapped immediately
              // and, in the "Delivery contact" column, visibly overlapped
              // the neighboring column's text. Stacks to one column on
              // mobile; 3 columns only from `small:` up, where there's
              // genuinely enough width for them.
              <div className="flex flex-col small:flex-row items-start gap-6 small:gap-x-8">
                <div
                  className="flex flex-col w-full small:w-1/3"
                  data-testid="shipping-address-summary"
                >
                  <Text className="txt-medium-plus text-text-primary mb-1">
                    Shipping Address
                  </Text>
                  <Text className="txt-medium text-text-secondary">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </Text>
                  <Text className="txt-medium text-text-secondary">
                    {cart.shipping_address.address_1}
                    {cart.shipping_address.address_2 &&
                      `, ${cart.shipping_address.address_2}`}
                  </Text>
                  <Text className="txt-medium text-text-secondary">
                    {cart.shipping_address.city},{" "}
                    {cart.shipping_address.province}
                  </Text>
                </div>

                <div
                  className="flex flex-col w-full small:w-1/3"
                  data-testid="shipping-contact-summary"
                >
                  <Text className="txt-medium-plus text-text-primary mb-1">
                    Delivery contact
                  </Text>
                  <Text className="txt-medium text-text-secondary">
                    {cart.shipping_address.phone}
                  </Text>
                  <Text className="txt-medium text-text-secondary break-all">
                    {cart.email}
                  </Text>
                </div>

                <div
                  className="flex flex-col w-full small:w-1/3"
                  data-testid="billing-address-summary"
                >
                  <Text className="txt-medium-plus text-text-primary mb-1">
                    Billing Address
                  </Text>

                  {sameAsBilling ? (
                    <Text className="txt-medium text-text-secondary">
                      Billing and delivery address are the same.
                    </Text>
                  ) : (
                    <>
                      <Text className="txt-medium text-text-secondary">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </Text>
                      <Text className="txt-medium text-text-secondary">
                        {cart.billing_address?.address_1}
                        {cart.billing_address?.address_2 &&
                          `, ${cart.billing_address.address_2}`}
                      </Text>
                      <Text className="txt-medium text-text-secondary">
                        {cart.billing_address?.city},{" "}
                        {cart.billing_address?.province}
                      </Text>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
