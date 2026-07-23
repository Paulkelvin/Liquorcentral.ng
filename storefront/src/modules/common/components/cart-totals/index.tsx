"use client"

import { convertToLocale } from "@lib/util/money"
import { Text } from "@modules/common/components/ui"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    shipping_methods?: unknown[] | null
  }
}

/**
 * 06_CART_SPECIFICATION.md §8 / Pricing Transparency — "the cart states
 * plainly what it can and cannot calculate yet... never presented with
 * more certainty than the cart actually has." Before a shipping method
 * exists (true for every cart-page view — an address/slot choice only
 * happens at checkout, §6/§10), shipping and tax are genuinely unknown,
 * not a confirmed ₦0 — showing "₦0.00" would read as "free shipping, no
 * tax," a false claim of precision this component previously made
 * regardless of context. Once a shipping method is actually selected
 * (checkout), the real computed amount is shown instead — this component
 * is shared with `checkout-summary`, where that context is real.
 */
const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    shipping_methods,
  } = totals

  const shippingKnown = !!shipping_methods?.length

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          {shippingKnown ? (
            <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
              {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
            </span>
          ) : (
            <span data-testid="cart-shipping" className="text-text-secondary">
              Calculated at checkout
            </span>
          )}
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Taxes</span>
          {shippingKnown ? (
            <span data-testid="cart-taxes" data-value={tax_total || 0}>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          ) : (
            <span data-testid="cart-taxes" className="text-text-secondary">
              Calculated at checkout
            </span>
          )}
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {shippingKnown
            ? convertToLocale({ amount: total ?? 0, currency_code })
            : convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
        </span>
      </div>
      {!shippingKnown && (
        <Text as="p" size="caption" muted data-testid="cart-total-notice">
          + delivery &amp; tax, calculated at checkout
        </Text>
      )}
      <div className="h-px w-full border-b border-gray-200 mt-4" />
      {/* §23 — "cart total and subtotal updates are announced to
          assistive technology via a polite live region." Any DOM text
          change here (a quantity update, removal, or price change
          re-rendering this total) is announced automatically, the
          standard live-region pattern — no extra diffing logic needed. */}
      <div role="status" aria-live="polite" className="sr-only">
        Cart total: {convertToLocale({ amount: (shippingKnown ? total : item_subtotal) ?? 0, currency_code })}
      </div>
    </div>
  )
}

export default CartTotals
