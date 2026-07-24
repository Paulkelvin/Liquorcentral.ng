import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.2 — a persistent, horizontally-
 * scrollable strip beneath the mobile header showing the platform's
 * top-level destinations "at all times... with equal visual weight,"
 * directly protecting §2's equal-prominence requirement on the smallest
 * viewport. Deliberately just two equal-weight links here (not a
 * dropdown/mega-menu trigger, which is desktop-specific, §6) — depth
 * beneath either branch lives in the drawer (§7.3), not this strip.
 */
export default function MobileWayfindingStrip() {
  return (
    <div
      className="sm:hidden flex items-center gap-6 overflow-x-auto px-4 h-11 border-b border-border bg-surface-elevated"
      data-testid="mobile-wayfinding-strip"
    >
      <LocalizedClientLink
        href="/store"
        className="txt-small-plus text-text-primary whitespace-nowrap hover:text-interactive"
      >
        Wine &amp; Spirits
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/food-central"
        className="txt-small-plus text-text-primary whitespace-nowrap hover:text-interactive"
      >
        Food Central
      </LocalizedClientLink>
    </div>
  )
}
