"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { usePathname } from "next/navigation"

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.2 — a persistent, horizontally-
 * scrollable strip beneath the mobile header showing the platform's
 * top-level destinations "at all times... with equal visual weight,"
 * directly protecting §2's equal-prominence requirement on the smallest
 * viewport. Deliberately just two equal-weight links here (not a
 * dropdown/mega-menu trigger, which is desktop-specific, §6) — depth
 * beneath either branch lives in the drawer (§7.3), not this strip.
 *
 * The currently-selected department reads in the primary text color;
 * the other stays in the muted/secondary color — everywhere else (not
 * "/food-central") is treated as Wine & Spirits' own territory, since
 * that's this platform's primary catalog.
 */
export default function MobileWayfindingStrip() {
  const pathname = usePathname()
  const isFoodCentral = pathname?.includes("/food-central") ?? false

  return (
    <div
      className="sm:hidden flex items-center justify-center gap-8 overflow-x-auto px-4 py-2 border-b border-border bg-surface-elevated"
      data-testid="mobile-wayfinding-strip"
    >
      <LocalizedClientLink
        href="/store"
        aria-current={!isFoodCentral ? "page" : undefined}
        className={clx(
          "txt-small-plus whitespace-nowrap border-b-2 pb-1 transition-colors duration-standard ease-in-out",
          !isFoodCentral
            ? "border-b-primary text-text-primary font-semibold"
            : "border-b-transparent text-text-muted hover:text-text-primary"
        )}
      >
        Wine &amp; Spirits
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/food-central"
        aria-current={isFoodCentral ? "page" : undefined}
        className={clx(
          "txt-small-plus whitespace-nowrap border-b-2 pb-1 transition-colors duration-standard ease-in-out",
          isFoodCentral
            ? "border-b-primary text-text-primary font-semibold"
            : "border-b-transparent text-text-muted hover:text-text-primary"
        )}
      >
        Food Central
      </LocalizedClientLink>
    </div>
  )
}
