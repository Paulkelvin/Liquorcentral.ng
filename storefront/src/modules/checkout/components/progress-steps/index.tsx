"use client"

import { useSearchParams } from "next/navigation"
import { clx } from "@modules/common/components/ui"

const STEPS = [
  { key: "address", label: "Address" },
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
] as const

/**
 * Design Audit Phase 3 roadmap item 14 ("Checkout visual polish... add
 * progress indicator") — a lightweight, read-only stepper showing where the
 * customer is among the 4 accordion steps each already drive independently
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
      // Responsive audit (Phase 4 roadmap item 18) — 4 steps with connector
      // lines don't fit a narrow mobile viewport at full label width; the
      // row scrolls horizontally within itself (no-scrollbar) rather than
      // overflowing the page, which was a real, confirmed layout bug.
      className="flex items-center gap-2 small:gap-4 text-caption overflow-x-auto no-scrollbar -mx-4 px-4 small:mx-0 small:px-0"
    >
      {STEPS.map((step, index) => {
        const isActive = index === activeIndex
        const isPast = activeIndex >= 0 && index < activeIndex
        return (
          <li key={step.key} className="flex items-center gap-2 small:gap-4 shrink-0">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={clx(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold shrink-0",
                  isActive
                    ? "bg-primary text-surface-elevated"
                    : isPast
                    ? "bg-secondary text-surface-elevated"
                    : "bg-ink-100 text-text-muted"
                )}
              >
                {index + 1}
              </span>
              <span
                aria-current={isActive ? "step" : undefined}
                className={isActive ? "text-text-primary font-semibold" : "text-text-muted"}
              >
                {step.label}
              </span>
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden="true" className="w-4 small:w-8 h-px bg-border" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
