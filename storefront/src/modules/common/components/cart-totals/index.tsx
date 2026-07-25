"use client"

import { convertToLocale } from "@lib/util/money"
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
    /** §6/§10 — no shipping method exists yet at cart view; delivery is chosen at checkout. */
    shipping_methods?: unknown[] | null
  }
}

/**
 * Pricing Transparency table — delivery fee and tax are Unknown/estimated
 * until a real address (and, for Food Central, a chosen delivery/pickup
 * option) exist, which happens at checkout, not in the cart (§6, §10).
 * Showing a literal ₦0 here — as the previous version of this component
 * did — is exactly the "presented with more certainty than the cart
 * actually has" failure §8 and the Pricing Transparency table both
 * explicitly forbid; a stated dependency replaces it.
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

  const shippingKnown = (shipping_methods?.length ?? 0) > 0

  return (
    <div role="status" aria-live="polite">
      {/* `gap-y-3` between rows, and each row's own label may wrap to two
          lines — at 10px apart the breakdown read as one block of text
          rather than four scannable figures. */}
      <div className="flex flex-col gap-y-3 text-[14px] text-text-secondary">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery fee</span>
          {shippingKnown ? (
            <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
              {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
            </span>
          ) : (
            <span data-testid="cart-shipping" data-value="calculated-at-checkout">
              Calculated at checkout
            </span>
          )}
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-interactive"
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
          <span className="flex gap-x-1 items-center ">Tax</span>
          {shippingKnown ? (
            <span data-testid="cart-taxes" data-value={tax_total || 0}>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          ) : (
            <span data-testid="cart-taxes" data-value="calculated-at-checkout">
              Calculated at checkout
            </span>
          )}
        </div>
      </div>
      {/* A solid rule directly above the total, and nothing below it —
          the total is the last thing read, so a second rule underneath
          only made it look like another row in the breakdown. */}
      <div className="mt-5 border-t border-divider pt-5">
        <div className="flex items-baseline justify-between gap-3 text-text-primary">
          <span className="text-[15px] font-medium">
            {shippingKnown ? "Total" : "Item total"}
          </span>
          <span
            className="text-[22px] font-semibold leading-none"
            data-testid="cart-total"
            data-value={total || 0}
          >
            {convertToLocale({ amount: shippingKnown ? total ?? 0 : item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!shippingKnown && (
          <p className="mt-1.5 text-caption text-text-secondary" data-testid="cart-total-caveat">
            + delivery &amp; tax, calculated at checkout
          </p>
        )}
      </div>
    </div>
  )
}

export default CartTotals
