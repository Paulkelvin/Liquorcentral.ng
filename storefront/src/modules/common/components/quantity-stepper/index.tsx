"use client"

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §17 / 06_CART_SPECIFICATION.md §7 —
 * "the cart does not introduce a second quantity-control pattern," reusing
 * the PDP's exact stepper control and touch-target requirements
 * (`DESIGN_SYSTEM.md` §B11) verbatim. Extracted here so both surfaces
 * share one implementation instead of two parallel ones.
 */
export default function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  disabled,
  labelId,
  "data-testid": dataTestId,
}: {
  value: number
  min?: number
  max?: number
  onDecrease: () => void
  onIncrease: () => void
  disabled?: boolean
  labelId: string
  "data-testid"?: string
}) {
  return (
    <div className="flex items-center border border-border rounded-radius-md">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrease}
        disabled={disabled || value <= min}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        −
      </button>
      <span
        role="spinbutton"
        aria-labelledby={labelId}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        data-testid={dataTestId}
        className="min-w-[2.5rem] text-center txt-compact-medium"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onIncrease}
        disabled={disabled || (max !== undefined && value >= max)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        +
      </button>
    </div>
  )
}
