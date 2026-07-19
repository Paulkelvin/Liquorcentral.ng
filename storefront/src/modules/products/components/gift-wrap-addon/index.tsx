"use client"

import { Checkbox } from "@modules/common/components/ui"
import { convertToLocale } from "@lib/util/money"

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §16 — a simple, optional checkbox
 * near add-to-cart, not a separate page or flow. Renders only when a real
 * Gift Wrap product exists (`getGiftWrapProduct`) — never a placeholder.
 */
export default function GiftWrapAddon({
  price,
  currencyCode,
  checked,
  onChange,
}: {
  price: number
  currencyCode: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Checkbox
      id="gift-wrap-addon"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      label={`Add gift wrap (+${convertToLocale({ amount: price, currency_code: currencyCode })})`}
      data-testid="gift-wrap-addon"
    />
  )
}
