"use client"

import { useId } from "react"
import { Label } from "@modules/common/components/ui"

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §17, §25 — a numeric stepper beside
 * add-to-cart, meeting the 44×44px touch-target minimum on mobile
 * (`DESIGN_SYSTEM.md` §B11) and using proper number-input semantics with a
 * visible, associated label — not a bare pair of unlabeled buttons.
 */
export default function QuantityStepper({
  quantity,
  onChange,
  max,
  min = 1,
  disabled,
  hideLabel = false,
}: {
  quantity: number
  onChange: (quantity: number) => void
  /** Genuine available stock (Wine & Spirits only, §17); omit for Food Central. */
  max?: number
  /**
   * 06_CART_SPECIFICATION.md §7 — "reducing a line item's quantity to zero
   * removes it," an immediate action, not a blocking dialog. The cart
   * passes `min={0}` so the decrement button reaches zero (the caller
   * treats that as a removal); every other surface (add-to-cart on the
   * PDP) keeps the default floor of 1, where zero has no meaning.
   */
  min?: number
  disabled?: boolean
  /**
   * Hides the "Quantity" label visually while keeping it associated with
   * the input for screen readers — for dense contexts like the cart
   * drawer, where a visible label on every row is noise. §17/§25 require
   * a real associated label, not that it always be on screen.
   */
  hideLabel?: boolean
}) {
  const inputId = useId()
  const clamp = (value: number) => {
    const floor = Math.max(min, value)
    return max != null ? Math.min(floor, max) : floor
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={inputId} className={hideLabel ? "sr-only" : undefined}>
        Quantity
      </Label>
      {/* One control, not three floating boxes: a single pill with
          hairline internal dividers. Each segment still holds the 44px
          touch minimum (§B11) — the pill is 44px tall and each button
          44px wide, so nothing is lost by grouping them. */}
      <div className="inline-flex h-11 items-center divide-x divide-divider overflow-hidden rounded-radius-full border border-divider bg-surface-elevated">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={disabled || quantity <= min}
          onClick={() => onChange(clamp(quantity - 1))}
          className="inline-flex h-full w-11 items-center justify-center text-body text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none disabled:text-text-muted"
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={quantity}
          disabled={disabled}
          onChange={(event) => onChange(clamp(Number(event.target.value) || min))}
          // The native spinners would put a second set of arrows inside
          // a control that already has its own.
          className="h-full w-12 appearance-none border-0 bg-transparent text-center text-[14px] font-medium text-text-primary focus:outline-none focus:ring-0 disabled:text-text-muted [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disabled || (max != null && quantity >= max)}
          onClick={() => onChange(clamp(quantity + 1))}
          className="inline-flex h-full w-11 items-center justify-center text-body text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none disabled:text-text-muted"
        >
          +
        </button>
      </div>
    </div>
  )
}
