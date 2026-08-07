"use client"

import { useSearchParams } from "next/navigation"
import { clx } from "@modules/common/components/ui"

const STEPS = [
  { key: "address", label: "Address" },
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
] as const

/**
 * Design Audit Phase 3 roadmap item 14 ("Checkout visual polish... add
 * progress indicator") — a lightweight, read-only stepper showing where the
 * customer is among the 3 accordion steps each already drive independently
 * via the same `?step=` URL param (07_CHECKOUT_SPECIFICATION.md's own
 * accordion-step pattern). Purely a visual orientation aid: it does not
 * duplicate or reimplement any step's own open/complete logic, does not
 * navigate on click, and reads the identical `?step=` values each existing
 * step component already reads.
 */
export default function ProgressSteps() {
  const searchParams = useSearchParams()
  const activeStep = searchParams.get("step") ?? "address"
  const activeIndex = STEPS.findIndex((s) => s.key === activeStep)

  return (
    <ol
      aria-label="Checkout progress"
      // The row scrolls horizontally on a phone but holds no focusable
      // children, so a keyboard user had no way to reach the steps past
      // the right edge (axe: scrollable-region-focusable). Making the
      // region itself focusable gives it arrow-key scrolling; it already
      // carries an accessible name from `aria-label`.
      tabIndex={0}
      // Responsive audit (Phase 4 roadmap item 18) — steps with connector
      // lines don't fit a narrow mobile viewport at full label width; the
      // row scrolls horizontally within itself (no-scrollbar) rather than
      // overflowing the page.
      //
      // The bleed-and-repad values below have to track `ds-container`'s
      // own responsive padding exactly (`px-4 md:px-6 lg:px-8` —
      // globals.css) at every breakpoint it changes, not just the ends —
      // this is what was actually behind "the progress bar... step four
      // seems to extend beyond the right edge": between 768px and 1023px
      // `ds-container` steps up to 24px of padding, but this row was still
      // only compensating for the base 16px, so the last step sat 8px
      // short of where the page's own edge actually was and read as
      // clipped. `small:` (1024px) coincides with `ds-container`'s own
      // `lg:`, so both change together there and need no separate step.
      className="flex items-center gap-2.5 small:gap-4 text-[13px] overflow-x-auto no-scrollbar -mx-4 px-4 md:-mx-6 md:px-6 small:mx-0 small:px-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
    >
      {STEPS.map((step, index) => {
        const isActive = index === activeIndex
        const isPast = activeIndex >= 0 && index < activeIndex
        return (
          <li key={step.key} className="flex items-center gap-2.5 small:gap-4 shrink-0">
            <span className="flex items-center gap-2">
              {/* Brand vocabulary rather than a generic green: the step
                  you are on takes the accent, steps behind you take ink
                  with a tick, steps ahead stay a quiet outline. A filled
                  bright-green "done" chip competed with the active step
                  for attention. */}
              <span
                aria-hidden="true"
                className={clx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors duration-standard ease-in-out",
                  isActive
                    ? "bg-primary text-surface-elevated"
                    : isPast
                    ? "bg-ink-900 text-surface-elevated"
                    : "border border-divider bg-surface-elevated text-text-muted"
                )}
              >
                {isPast ? (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                aria-current={isActive ? "step" : undefined}
                className={clx(
                  "whitespace-nowrap",
                  isActive
                    ? "font-semibold text-text-primary"
                    : isPast
                    ? "font-medium text-text-secondary"
                    : "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden="true" className="h-px w-5 small:w-10 bg-divider" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
