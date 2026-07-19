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
  disabled,
}: {
  quantity: number
  onChange: (quantity: number) => void
  /** Genuine available stock (Wine & Spirits only, §17); omit for Food Central. */
  max?: number
  disabled?: boolean
}) {
  const inputId = useId()
  const clamp = (value: number) => {
    const floor = Math.max(1, value)
    return max != null ? Math.min(floor, max) : floor
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={inputId}>Quantity</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={disabled || quantity <= 1}
          onClick={() => onChange(clamp(quantity - 1))}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-sm border border-border text-text-primary hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-50"
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={quantity}
          disabled={disabled}
          onChange={(event) => onChange(clamp(Number(event.target.value) || 1))}
          className="h-11 w-16 rounded-radius-sm border border-border bg-surface-elevated text-center text-body text-text-primary"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disabled || (max != null && quantity >= max)}
          onClick={() => onChange(clamp(quantity + 1))}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-sm border border-border text-text-primary hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  )
}
