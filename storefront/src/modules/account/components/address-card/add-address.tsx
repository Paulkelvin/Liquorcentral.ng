"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §12 — "saved addresses use the
 * identical freeform, landmark-friendly field structure already
 * established in 07_CHECKOUT_SPECIFICATION.md §7" — no postal_code, no
 * company, country fixed via a hidden input (this region has exactly one).
 */
const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const hasDefault = addresses.some(
    (a) => a.is_default_shipping || a.is_default_billing
  )
  const countryCode = region.countries?.[0]?.iso_2 || ""
  const [successState, setSuccessState] = useState(false)
  const [isDefault, setIsDefault] = useState(!hasDefault)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">New address</span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Add address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-2">
              <input type="hidden" name="country_code" value={countryCode} />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Delivery address"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <div>
                <Input
                  label="Landmark or additional directions (optional)"
                  name="address_2"
                  autoComplete="address-line2"
                  data-testid="address-2-input"
                />
                <Text className="txt-small text-ui-fg-subtle mt-1">
                  e.g. &ldquo;behind Shoprite, opposite First Bank&rdquo; —
                  helps our rider find you faster.
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="City / Area"
                  name="city"
                  required
                  autoComplete="address-level2"
                  data-testid="city-input"
                />
                <Input
                  label="State"
                  name="province"
                  required
                  autoComplete="address-level1"
                  data-testid="state-input"
                />
              </div>
              <Input
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                data-testid="phone-input"
              />
              <div className="mt-2">
                <Checkbox
                  label="Use as my default address"
                  name="is_default"
                  checked={isDefault}
                  onChange={() => setIsDefault(!isDefault)}
                  data-testid="is-default-checkbox"
                />
              </div>
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
