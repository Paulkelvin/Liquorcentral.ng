"use client"

import { useSearchParams } from "next/navigation"

// Kept in one place so `ProgressSteps` (the visual stepper) and this gate
// can never silently drift out of sync on step count/order.
export const STEP_ORDER = ["address", "delivery", "payment"] as const
export type CheckoutStep = (typeof STEP_ORDER)[number]

/**
 * Hides a step's whole card until the customer has actually reached it.
 *
 * Every step component (`Addresses`, `Shipping`, `Payment`) always
 * rendered its own bordered, padded card regardless of progress — a
 * step you hadn't gotten to yet still showed up as an inert, muted-
 * headline box taking up page space. That's what read as "the window":
 * up to three empty-feeling cards stacked below whichever one you were
 * actually filling in. Paul: "I don't think we need the window... once
 * on the checkout page and the user enters their information, clicking
 * continue... should take them to the next stage" — a step-by-step
 * reveal, not everything stacked at once.
 *
 * Trusts the URL's own `?step=` param as the record of progress, the
 * same source `ProgressSteps` already reads — each step's own "Continue"
 * button is what advances it, and that button is already disabled until
 * that step is genuinely complete, so there's no separate validation to
 * duplicate here.
 */
export default function StepGate({
  step,
  children,
}: {
  step: CheckoutStep
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const activeStep = searchParams.get("step") ?? "address"
  const activeIndex = STEP_ORDER.indexOf(activeStep as CheckoutStep)
  const stepIndex = STEP_ORDER.indexOf(step)

  const reached = activeIndex === -1 ? stepIndex === 0 : stepIndex <= activeIndex

  if (!reached) {
    return null
  }

  return <>{children}</>
}
