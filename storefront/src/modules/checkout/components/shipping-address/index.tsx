import { HttpTypes } from "@medusajs/types"
import { Container, Text } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { hasRealAddress } from "@lib/util/cart-fulfillment"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

/**
 * 07_CHECKOUT_SPECIFICATION.md §7 — "freeform, landmark-friendly fields, not
 * a rigid street-address/postal-code structure," and "the minimum field set
 * genuinely needed." The vendored template's apparel-store form (required
 * postal code, a "Company" field with no genuine use case here) is replaced
 * with the field set this platform actually needs: a name, a delivery
 * contact, a freeform delivery address, an optional landmark/directions
 * field, and City/State — the state (or city) is also the plain-language
 * signal `06_CART_SPECIFICATION.md` §10/§11's Lagos-only eligibility check
 * reads at the checkout page level, since the exact geo-zone definition
 * remains an open business decision this document doesn't invent.
 * Country isn't shown at all — this region has exactly one — and is sent as
 * a fixed hidden value instead of a single-option dropdown nobody needs to
 * operate.
 */
const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code ||
      cart?.region?.countries?.[0]?.iso_2 ||
      "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    if (hasRealAddress(cart?.shipping_address)) {
      setFormAddress(cart?.shipping_address, cart?.email)
    } else if (customer) {
      // 08_CUSTOMER_ACCOUNT_SPECIFICATION.md §12 — "one saved address may
      // be marked as default, pre-selected at checkout" — only applied
      // when the cart doesn't already carry a real address of its own.
      const defaultAddress = customer.addresses?.find(
        (a) => a.is_default_shipping || a.is_default_billing
      )
      if (defaultAddress) {
        setFormAddress(defaultAddress as HttpTypes.StoreCartAddress)
      }
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <input
        type="hidden"
        name="shipping_address.country_code"
        value={formData["shipping_address.country_code"]}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <div className="col-span-2">
          <Input
            label="Delivery address"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            data-testid="shipping-address-input"
          />
        </div>
        <div className="col-span-2">
          <Input
            label="Landmark or additional directions (optional)"
            name="shipping_address.address_2"
            autoComplete="address-line2"
            value={formData["shipping_address.address_2"]}
            onChange={handleChange}
            data-testid="shipping-landmark-input"
          />
          <Text className="txt-small text-ui-fg-subtle mt-1">
            e.g. &ldquo;behind Shoprite, opposite First Bank&rdquo; — helps our
            rider find you faster.
          </Text>
        </div>
        <Input
          label="City / Area"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <Input
          label="State"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          required
          data-testid="shipping-province-input"
        />
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as delivery address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label="Delivery contact phone"
          name="shipping_address.phone"
          type="tel"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress
