"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { Badge, Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

/**
 * 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §12 — the identical freeform,
 * landmark-friendly field structure as checkout (no postal_code, no
 * company), plus "one saved address may be marked as default" — shown as
 * a badge and toggled via the same checkbox used when adding an address.
 */
const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const isDefault = address.is_default_shipping || address.is_default_billing
  const [defaultChecked, setDefaultChecked] = useState(!!isDefault)
  const { state, open, close: closeModal } = useToggleState(false)
  const countryCode = region.countries?.[0]?.iso_2 || address.country_code || ""

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <Heading
              className="text-left text-base-semi"
              data-testid="address-name"
            >
              {address.first_name} {address.last_name}
            </Heading>
            {isDefault && (
              // color="success" (bg-success-tint/text-success) was tried
              // first but failed a live axe-core color-contrast check —
              // a newly-surfaced instance of the same Design-System-level
              // token issue already documented for the shared Button
              // component (see DECISION_LOG.md); "neutral" is used instead
              // since it's already confirmed passing elsewhere (e.g. the
              // order-status badge).
              <Badge color="neutral" data-testid="address-default-badge">
                Default
              </Badge>
            )}
          </div>
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-city-province">
              {address.city}
              {address.province && `, ${address.province}`}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            Edit
          </button>
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <input type="hidden" name="country_code" value={countryCode} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Delivery address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <div>
                <Input
                  label="Landmark or additional directions (optional)"
                  name="address_2"
                  autoComplete="address-line2"
                  defaultValue={address.address_2 || undefined}
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
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
                <Input
                  label="State"
                  name="province"
                  required
                  autoComplete="address-level1"
                  defaultValue={address.province || undefined}
                  data-testid="state-input"
                />
              </div>
              <Input
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
              <div className="mt-2">
                <Checkbox
                  label="Use as my default address"
                  name="is_default"
                  id={`is-default-${address.id}`}
                  checked={defaultChecked}
                  onChange={() => setDefaultChecked(!defaultChecked)}
                  data-testid="is-default-checkbox"
                />
              </div>
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
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

export default EditAddress
