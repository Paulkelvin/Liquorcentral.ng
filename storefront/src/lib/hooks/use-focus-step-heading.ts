import { useEffect, useRef } from "react"

/**
 * 07_CHECKOUT_SPECIFICATION.md §22 — "moving between steps moves focus to
 * the new step's primary heading... never leaving focus on a control that
 * no longer exists on screen." Each checkout step (Addresses, Shipping,
 * Payment, Review) shares this exact requirement, so it's one hook rather
 * than four near-identical `useEffect`s.
 */
export default function useFocusStepHeading(isOpen: boolean) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus()
    }
  }, [isOpen])

  return headingRef
}
