"use client"

import { useSearchParams } from "next/navigation"

// Kept in one place so `ProgressSteps` (the visual stepper) and this gate
// can never silently drift out of sync on step count/order.
//
// The URL key stays "address" (not renamed to "contact") — every step
// component, plus the cart drawer's own "Go to checkout" link, already
// reads/writes that exact string, and renaming it would touch every one
// of them for a purely cosmetic reason. Only the *visible* label changed
// to "Contact" (Addresses' and ProgressSteps' own copy) — Paul: "it's
// just contact and then payment."
export const STEP_ORDER = ["address", "payment"] as const
export type CheckoutStep = (typeof STEP_ORDER)[number]

/**
 * Which step a URL with no `?step=` at all means — reaching `/checkout`
 * directly (a typed URL, a bookmark, the browser's back button from the
 * order page) rather than through the cart's own link, which always
 * carries one.
 *
 * Exported because three separate components have to agree on it, and
 * two of them silently didn't: `StepGate` and `ProgressSteps` both
 * defaulted a missing param to "address", while `Addresses` compared
 * `searchParams.get("step") === "address"` with no fallback. On
 * `/checkout` with no param that left the Contact step *rendered but
 * collapsed* — its card visible and marked active by the stepper, but
 * showing the read-only recap (a bare spinner, before any address
 * exists) with no form and no way forward. A dead end reachable by
 * simply typing the URL.
 */
export const DEFAULT_STEP: CheckoutStep = "address"

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
  const activeStep = searchParams.get("step") ?? DEFAULT_STEP
  const activeIndex = STEP_ORDER.indexOf(activeStep as CheckoutStep)
  const stepIndex = STEP_ORDER.indexOf(step)

  const reached = activeIndex === -1 ? stepIndex === 0 : stepIndex <= activeIndex

  if (!reached) {
    return null
  }

  return <>{children}</>
}
