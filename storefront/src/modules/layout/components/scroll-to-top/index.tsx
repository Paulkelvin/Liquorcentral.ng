"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Forces a real page navigation (a pathname change — switching between
 * Wine & Spirits and Food Central, opening a product, going back) to
 * land at the top of the page.
 *
 * Next's own Link already tries to do this, but on a real mobile
 * connection it isn't reliable on this site's heavier pages (/store,
 * /food-central): their grids stream in over several Suspense
 * boundaries, and images finishing their load after the initial paint
 * shift layout above the fold — Safari's scroll anchoring then nudges
 * the page down to compensate, which is where "loads scrolled partway
 * down" actually comes from. This re-asserts scroll position 0 once the
 * new route has mounted, after that reflow has already happened.
 *
 * `history.scrollRestoration = "manual"` hands scroll control to the
 * app instead of the browser — otherwise Safari's own back/forward
 * scroll memory can restore a stale position at the same time this
 * component is trying to reset it, and the two fighting each other is
 * exactly the kind of "sometimes" flakiness this exists to close.
 *
 * Keyed on `pathname` only, not `searchParams` — Load More
 * (store/components/load-more) pushes the *same* pathname with a new
 * `?page=`, and it already owns scrolling to the newly-loaded batch
 * itself. Re-triggering a scroll-to-top on every page-param change
 * would fight that, so this only fires on an actual route change.
 */
export default function ScrollToTop() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      window.scrollTo(0, 0)
      previousPathname.current = pathname
    }
  }, [pathname])

  return null
}
