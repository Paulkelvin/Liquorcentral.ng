"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Makes a *forward* page navigation (tapping Wine & Spirits, opening a
 * product, following a category link) land at the top of the page.
 *
 * Next's own Link already tries to do this, but on a real mobile
 * connection it isn't reliable on this site's heavier pages (/store,
 * /food-central): their grids stream in over several Suspense
 * boundaries, and images finishing their load after the initial paint
 * shift layout above the fold — mobile Safari's scroll anchoring then
 * nudges the page down to compensate, which is where "loads scrolled
 * partway down" actually comes from. Re-asserting scroll position 0
 * once the new route has mounted lands after that reflow.
 *
 * **Back and forward are deliberately excluded.** A `popstate`
 * navigation is the one case where the previous scroll position is the
 * *right* answer — scrolling halfway down a category grid, opening a
 * bottle, then going back should return you to that bottle, not to the
 * top of the grid. So this listens for `popstate`, and skips the reset
 * for the navigation that follows one; the browser's own scroll
 * restoration (left at its default `auto`, never forced to `manual`)
 * handles those. An earlier version of this file did force `manual` and
 * reset unconditionally, which silently broke exactly that.
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

  /**
   * The pathname the most recent `popstate` was headed for, or `null`.
   *
   * Recording the *target* rather than a bare "this was a back" boolean
   * is what makes this independent of timing, and that matters: the
   * first version of this file set a boolean and cleared it on a 100ms
   * timer, but a back navigation has to fetch and render the previous
   * route's RSC payload before React re-runs the effect below — reliably
   * longer than 100ms. The flag was therefore already cleared by the
   * time the effect ran, so every slow back navigation fell through to
   * `scrollTo(0, 0)` and clobbered the restored position. Matching on
   * the pathname instead means the effect recognises the pop whenever it
   * eventually runs.
   */
  const popStateTarget = useRef<string | null>(null)

  useEffect(() => {
    const onPopState = () => {
      popStateTarget.current = window.location.pathname
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }
    previousPathname.current = pathname

    const cameFromPopState = popStateTarget.current === pathname
    // Cleared on every route change, not only on a match, so a
    // `popstate` that never produced one (a search-param-only history
    // entry, e.g. Load More's own `?page=`) can't sit around and
    // suppress the reset on some later forward navigation.
    popStateTarget.current = null

    if (cameFromPopState) {
      return
    }

    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
