"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import DepartmentSwitcherTrack, {
  DEPARTMENT_SEGMENT,
  departmentSegmentState,
} from "@modules/layout/components/department-switcher-track"
import { usePathname } from "next/navigation"

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.2 — a persistent strip beneath the mobile
 * header showing the platform's top-level destinations "at all times... with
 * equal visual weight," directly protecting §2's equal-prominence requirement
 * on the smallest viewport. Deliberately just two equal-weight links (not a
 * dropdown/mega-menu trigger, which is desktop-specific, §6) — depth beneath
 * either branch lives in the drawer (§7.3), not this strip.
 *
 * Presented as a segmented control on Paul's direction, replacing the red
 * underline. The track, pill and shared classes come from
 * `DepartmentSwitcherTrack` so this and the desktop department bar cannot
 * drift apart; see that file for why the pill is built the way it is.
 *
 * These remain two real links, not tab buttons: activating one is a page
 * navigation, and `aria-current="page"` — not the pill — is what tells
 * assistive tech which is selected.
 */
export default function MobileWayfindingStrip() {
  const pathname = usePathname()
  const isFoodCentral = pathname?.includes("/food-central") ?? false

  return (
    <div
      className="sm:hidden border-b border-border bg-surface-elevated px-4 py-1.5"
      data-testid="mobile-wayfinding-strip"
    >
      <DepartmentSwitcherTrack
        className="mx-auto max-w-[22rem]"
        wineSlot={
          <LocalizedClientLink
            href="/store"
            aria-current={!isFoodCentral ? "page" : undefined}
            className={clx(
              DEPARTMENT_SEGMENT,
              departmentSegmentState(!isFoodCentral)
            )}
          >
            Wine &amp; Spirits
          </LocalizedClientLink>
        }
        foodSlot={
          <LocalizedClientLink
            href="/food-central"
            aria-current={isFoodCentral ? "page" : undefined}
            className={clx(
              DEPARTMENT_SEGMENT,
              departmentSegmentState(isFoodCentral)
            )}
          >
            Food Central
          </LocalizedClientLink>
        }
      />
    </div>
  )
}
