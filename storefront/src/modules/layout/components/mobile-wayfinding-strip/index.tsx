"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import DepartmentSwitcherTrack, {
  DEPARTMENT_SEGMENT,
  departmentSegmentState,
} from "@modules/layout/components/department-switcher-track"
import Image from "next/image"
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
      {/* The two destinations read as their own logo marks here rather
          than as plain text — same links, same href/aria-current/click
          behaviour as before, only the visible label changed. Each
          image is capped at a fixed height with `w-auto` so it scales
          to fit its own aspect ratio rather than being stretched, and
          `object-contain` keeps it from cropping inside the pill.
          `DEPARTMENT_SEGMENT` already centers its content
          (`items-center justify-center`), so the swap needed no layout
          changes beyond it. The image's own `alt` carries the same
          accessible name the text used to. */}
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
            <Image
              src="/brand/logos/liquorcentral-logo.png"
              alt="Liquor"
              width={665}
              height={196}
              // A little larger than Food Central's own mark on purpose —
              // Paul's direct instruction, a small "zoomed in" bump from
              // h-6. Left Food Central's own sizing alone; only this one
              // was asked for.
              className="h-7 w-auto object-contain"
              priority
            />
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
            <Image
              src="/brand/logos/foodcentral-logo.png"
              alt="Food Central"
              width={697}
              height={150}
              className="h-5 w-auto object-contain"
              priority
            />
          </LocalizedClientLink>
        }
      />
    </div>
  )
}
