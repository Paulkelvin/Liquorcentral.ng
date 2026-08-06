"use client"

import { useId } from "react"
import { Label, clx } from "@modules/common/components/ui"

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
  size = "default",
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
  /**
   * `"default"` is the 44px-tall pill used wherever the stepper is a
   * primary control (the PDP's add-to-cart row, the cart page's own line
   * items). `"compact"` is a visually lower-profile pill for dense
   * surfaces — today only the cart drawer, where a full-size stepper
   * dominated a line item it should sit quietly beside.
   *
   * **The tap target does not shrink with the visual.** `DESIGN_SYSTEM.md`
   * §B11 fixes a 44×44px minimum "regardless of visual size" and
   * explicitly anticipates this case ("a small visual icon can still sit
   * inside a larger tap area"), so the compact pill draws at 36px but each
   * button still *hit-tests* at 44px tall via an invisible expanded area
   * (see the `before:` utilities below). Note this is why the compact
   * variant cannot use `overflow-hidden` on the pill the way the default
   * one does — clipping the overflow would clip the expanded hit area with
   * it, silently undoing the thing it exists for — so its end caps are
   * rounded on the buttons themselves instead.
   */
  size?: "default" | "compact"
}) {
  const inputId = useId()
  const clamp = (value: number) => {
    const floor = Math.max(min, value)
    return max != null ? Math.min(floor, max) : floor
  }

  const isCompact = size === "compact"

  // Expands the button's hit area to the full 44px height without
  // affecting layout. A pseudo-element is part of its own button for
  // hit-testing, so this is a real tap target, not a visual trick.
  const tapAreaExpansion = isCompact
    ? "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']"
    : ""

  const buttonClass = clx(
    "inline-flex h-full items-center justify-center text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none disabled:text-text-muted",
    isCompact ? "w-9 text-[15px] leading-none" : "w-11 text-body",
    tapAreaExpansion
  )

  return (
    // `w-fit`: the PDP's call site sits inside a `flex flex-col` column
    // (product actions) whose default `align-items: stretch` was
    // stretching this component's own root to the column's full width —
    // and, one level down, stretching the pill itself the same way, since
    // it is in turn a flex child of this root. The three buttons don't
    // grow to fill that width, so they packed to the left inside a pill
    // whose border kept going: the "+" read as pushed toward the far
    // right edge of a mostly-empty control. `w-fit` sizes this component
    // to its own content — the same ~136px the "−" button already draws
    // at — regardless of the parent's stretch. `self-start` would do the
    // same for a column parent, but the cart line item's call site sits
    // in a `flex items-center` *row*, where `self-start` means something
    // else entirely (top-aligned instead of centred beside the spinner);
    // `w-fit` is the one fix that is inert in both layouts.
    <div className="flex w-fit flex-col gap-1">
      <Label htmlFor={inputId} className={hideLabel ? "sr-only" : undefined}>
        Quantity
      </Label>
      {/* One control, not three floating boxes: a single pill with
          hairline internal dividers. In the default size each segment also
          *draws* at the 44px touch minimum (§B11); in the compact size the
          drawn height comes down to 36px while the hit area stays 44px. */}
      <div
        className={clx(
          "inline-flex items-center divide-x divide-divider rounded-radius-full border border-divider bg-surface-elevated",
          isCompact ? "h-9" : "h-11 overflow-hidden"
        )}
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={disabled || quantity <= min}
          onClick={() => onChange(clamp(quantity - 1))}
          className={clx(buttonClass, isCompact && "rounded-l-radius-full")}
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
          className={clx(
            "h-full appearance-none border-0 bg-transparent text-center font-medium text-text-primary focus:outline-none focus:ring-0 disabled:text-text-muted [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            isCompact ? "w-8 text-[13px]" : "w-12 text-[14px]"
          )}
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disabled || (max != null && quantity >= max)}
          onClick={() => onChange(clamp(quantity + 1))}
          className={clx(buttonClass, isCompact && "rounded-r-radius-full")}
        >
          +
        </button>
      </div>
    </div>
  )
}
