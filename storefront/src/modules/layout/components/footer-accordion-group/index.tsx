"use client"

import { ChevronDown } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useId, useState } from "react"

/**
 * A footer link group that is a collapsible accordion on a phone and a plain
 * always-open column from `small:` up.
 *
 * **The links are always in the DOM, at every width.** Collapsed state is
 * `max-height: 0` plus `invisible`, not conditional rendering and not
 * `display: none`, for two reasons that both matter here:
 *
 * - **Crawlability.** `01_NAVIGATION_SPECIFICATION.md` §8 exists because the
 *   footer is this site's secondary sitemap; §26 requires real `<a href>`s.
 *   Unmounting the links on mobile would take them out of the mobile-first
 *   crawl, which is the one Google actually uses.
 * - **The slide.** Height can only animate between two resolved values, so
 *   the panel has to exist to move. `invisible` (not just zero height) is
 *   what keeps a collapsed panel's links out of the tab order, which
 *   `overflow-hidden` alone would not do — a keyboard user would otherwise
 *   tab into a panel they cannot see.
 *
 * The desktop path is not merely "always expanded": the button is
 * `small:hidden` and a real heading takes its place, so no assistive
 * technology is told there is a control where there is none.
 */
export default function FooterAccordionGroup({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const panelId = `footer-group-${useId().replace(/:/g, "")}`

  const headingClass =
    "text-caption font-medium uppercase tracking-wider text-text-primary"

  return (
    <div className="border-b border-divider small:border-0">
      {/* Mobile: the heading is the control. */}
      <h3 className="small:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          data-testid="footer-accordion-toggle"
          className={clx(
            headingClass,
            "flex min-h-[44px] w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          )}
        >
          {heading}
          <ChevronDown
            aria-hidden="true"
            className={clx(
              "shrink-0 text-text-muted transition-transform duration-standard ease-in-out",
              open && "rotate-180"
            )}
          />
        </button>
      </h3>

      {/* Desktop: a plain heading, no control. */}
      <h3 className={clx(headingClass, "hidden small:block")}>{heading}</h3>

      <div
        id={panelId}
        className={clx(
          "overflow-hidden transition-[max-height,opacity] duration-standard ease-in-out small:!visible small:max-h-none small:opacity-100",
          open ? "max-h-[60rem] opacity-100" : "invisible max-h-0 opacity-0"
        )}
      >
        <div className="pb-4 pt-1 small:pb-0 small:pt-3">{children}</div>
      </div>
    </div>
  )
}
