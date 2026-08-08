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
  /**
   * The flat "Standard delivery" rate (major units, no shipping method
   * attached yet), fetched by the caller before this cart's own
   * `shipping_methods` exist — e.g. on `/cart`, or on `/checkout` before
   * Contact is submitted. Site-wide there is exactly one shipping option
   * (a flat nationwide rate — see `shipping-options-seed.ts`), so it's
   * knowable and correct the moment a cart exists, not an estimate. Once
   * `shipping_methods` is actually populated (`shippingKnown` below), the
   * real `shipping_subtotal` from the server takes over instead — this is
   * only a stand-in for the window before that happens. Paul: "so that
   * users are notified that this is the exact amount they are going to be
   * paying for delivery."
   */
  knownDeliveryFee?: number | null
  /**
   * True while a quantity/remove change is in flight elsewhere on the
   * page. **Accepted but no longer rendered** — see the note above the
   * `return` for why these figures stopped needing a "settling" signal.
   * Kept on the type so callers already passing it don't break, and
   * because it's the right hook if a genuinely unknowable figure ever
   * needs marking here.
   */
  isPending?: boolean
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
const CartTotals: React.FC<CartTotalsProps> = ({
  totals,
  knownDeliveryFee,
}) => {
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
  // Delivery reads as known either because a real shipping method is
  // attached (shippingKnown — the exact server figure) or because the
  // caller already fetched the site's one flat rate (knownDeliveryFee).
  // Tax is never estimated this way — it isn't a single site-wide
  // constant the way delivery is, so it stays "Calculated at checkout"
  // until shippingKnown.
  const deliveryAmount = shippingKnown
    ? shipping_subtotal ?? 0
    : knownDeliveryFee
  const deliveryKnown = shippingKnown || knownDeliveryFee != null

  /*
   * **No longer dimmed while a change is in flight.** `isPending` used to
   * fade this whole block to 50% opacity, because the figures really were
   * stale until the server answered. They aren't any more — the cart the
   * caller passes now carries the in-flight change already scaled into it
   * (see `scaleLineMoney` in cart-context), so what renders here is the
   * settled number. Greying an already-correct total made the panel look
   * like it was still catching up, which is the exact impression this
   * change exists to remove.
   */
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
          {deliveryKnown ? (
            <span data-testid="cart-shipping" data-value={deliveryAmount || 0}>
              {convertToLocale({ amount: deliveryAmount ?? 0, currency_code })}
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
            {shippingKnown ? "Total" : deliveryKnown ? "Estimated total" : "Item total"}
          </span>
          <span
            className="text-[22px] font-semibold leading-none"
            data-testid="cart-total"
            data-value={total || 0}
          >
            {convertToLocale({
              amount: shippingKnown
                ? total ?? 0
                : (item_subtotal ?? 0) + (deliveryKnown ? deliveryAmount ?? 0 : 0),
              currency_code,
            })}
          </span>
        </div>
        {!shippingKnown && (
          <p className="mt-1.5 text-caption text-text-secondary" data-testid="cart-total-caveat">
            {deliveryKnown
              ? "+ tax, calculated at checkout"
              : "+ delivery & tax, calculated at checkout"}
          </p>
        )}
      </div>
    </div>
  )
}

export default CartTotals
