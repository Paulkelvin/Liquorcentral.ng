"use client"

import { clx } from "@modules/common/components/ui"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

/**
 * Whether a path unambiguously belongs to one department, and which.
 * `null` means the path itself doesn't say — a product page is the
 * clearest case: `/products/[handle]` is shared by both catalogs, so
 * nothing about the URL alone reveals which one this particular product
 * is. Cart, checkout, account, and search are the same kind of neutral
 * territory.
 */
function departmentFor(pathname: string | null): "food" | "wine" | null {
  if (!pathname) {
    return null
  }
  if (pathname.includes("/food-central")) {
    return "food"
  }
  if (
    pathname.includes("/store") ||
    pathname.includes("/categories") ||
    pathname.includes("/collections")
  ) {
    return "wine"
  }
  return null
}

/**
 * The segmented-control track shared by the desktop department bar and the
 * mobile wayfinding strip, replacing the red underline indicator on Paul's
 * direction.
 *
 * Both surfaces show the same two destinations and must not drift apart, so
 * the track, the pill and the active/inactive logic live here once. Callers
 * supply the two controls; this owns everything around them.
 *
 * Three things here are load-bearing:
 *
 * 1. **The pill is a grid item, not an absolutely-positioned one — and that
 *    is a hard requirement, not a style choice.** The obvious build is
 *    `relative` on the track plus `absolute` on the pill. That would break
 *    the desktop mega-menu: its panel is `absolute inset-x-0 top-full` and
 *    has to resolve against the full-width `<header>`. A `relative` track
 *    would become a nearer positioning context ~22rem wide and squeeze the
 *    panel down to that — a real bug this project has already hit once and
 *    documented in `mega-menu/index.tsx`. Putting the pill in the same grid
 *    cell as the first control and translating it needs no positioning
 *    context at all. **Do not "simplify" this to `relative`/`absolute`.**
 *
 * 2. **`grid-cols-2` with equal columns is what makes the movement exact.**
 *    The pill occupies column 1 and moves by `translate-x-full` — its own
 *    width, one column. Let the two controls size to their own content and
 *    the pill stops lining up with them.
 *
 * 3. **The pill is decoration; `aria-current` on the controls carries the
 *    state.** It is `aria-hidden`, and the controls stay real links (or, on
 *    desktop, real menu triggers) rather than becoming tab buttons — these
 *    are page navigations, and assistive tech should hear that.
 *
 * The slide is genuine: the App Router navigates client-side, so this
 * re-renders with the new `pathname` and the transform animates. Colouring
 * the active control instead would cut between states with no movement.
 *
 * **Sticky, not recomputed fresh on every path.** The obvious build reads
 * `isFoodCentral` straight off `usePathname()` on every render — and that
 * was itself the bug: `/products/[handle]` is shared by both catalogs, so
 * landing on a Food Central *product* page (no `/food-central` in the
 * URL) made the pill slide back to Wine & Spirits, then slide again on
 * the next real navigation. Paul's own report: "it should just stay on
 * Food Central." This component is mounted once in the persistent
 * `(main)` layout and never remounts between page navigations, so a
 * `useState` here survives across them — the pill only moves on a path
 * that unambiguously says which department it is (`departmentFor`), and
 * simply holds its position on neutral ground (a product page, cart,
 * checkout, account, search) rather than snapping to a default.
 */
export default function DepartmentSwitcherTrack({
  wineSlot,
  foodSlot,
  className,
}: {
  wineSlot: ReactNode
  foodSlot: ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const [department, setDepartment] = useState<"food" | "wine">(
    () => departmentFor(pathname) ?? "wine"
  )

  useEffect(() => {
    const next = departmentFor(pathname)
    if (next) {
      setDepartment(next)
    }
  }, [pathname])

  const isFoodCentral = department === "food"

  return (
    <div
      className={clx(
        "grid grid-cols-2 rounded-radius-full bg-ink-100 p-1",
        className
      )}
      data-testid="department-switcher-track"
    >
      <span
        aria-hidden="true"
        className={clx(
          "pointer-events-none col-start-1 row-start-1 rounded-radius-full bg-surface-elevated shadow-elevation-1 transition-transform duration-standard ease-in-out",
          isFoodCentral ? "translate-x-full" : "translate-x-0"
        )}
      />
      {/* `z-10` lifts the controls above the pill sharing their cell. Grid
          items honour `z-index` without needing `position`. */}
      <div className="z-10 col-start-1 row-start-1 flex">{wineSlot}</div>
      <div className="z-10 col-start-2 row-start-1 flex">{foodSlot}</div>
    </div>
  )
}

/**
 * The class every control inside the track shares, so the two never drift.
 * `min-h-[44px]` is `DESIGN_SYSTEM.md` §B11's tap-target floor, met outright
 * rather than with a hit-area expansion — there is room here for it.
 */
export const DEPARTMENT_SEGMENT =
  "inline-flex w-full min-h-[44px] items-center justify-center whitespace-nowrap rounded-radius-full px-3 text-caption transition-colors duration-standard ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"

/** Text weight/colour for the selected vs unselected segment. */
export function departmentSegmentState(isActive: boolean) {
  return isActive
    ? "font-semibold text-text-primary"
    : "text-text-secondary hover:text-text-primary"
}
