import { RefObject, useRef } from "react"

/**
 * 01_NAVIGATION_SPECIFICATION.md §10 — "opens on hover, with a click/tap
 * fallback." Headless UI's `Popover` only exposes `close()`, not an
 * imperative `open()`, so opening on hover means programmatically
 * clicking the trigger. Clicking it immediately on `mouseenter` races a
 * genuine, purposeful click on the same trigger: the browser always
 * fires `mouseenter` moments before a real `click` on the same element,
 * so an un-delayed synthetic click opens the panel first and the real
 * click that follows immediately toggles it straight back closed — a
 * flash-open-then-close bug confirmed with a real Playwright click, not
 * just imagined.
 *
 * The standard fix for this class of hover-menu bug is a short "hover
 * intent" delay: wait a beat before treating the hover as real intent
 * to open, and cancel that pending open if a genuine click arrives
 * first (which happens well inside the delay window, since a click
 * gesture's own mouseenter-to-click gap is a handful of milliseconds).
 */
export function useHoverIntentOpen(
  triggerRef: RefObject<HTMLButtonElement | null>,
  delayMs = 150
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPending = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  return {
    onMouseEnter: (open: boolean) => () => {
      if (open) {
        return
      }
      cancelPending()
      timeoutRef.current = setTimeout(() => {
        triggerRef.current?.click()
        timeoutRef.current = null
      }, delayMs)
    },
    onMouseLeaveCancel: cancelPending,
    onTriggerClick: cancelPending,
  }
}
