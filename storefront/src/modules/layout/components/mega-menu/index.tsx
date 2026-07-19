"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { groupCategoriesForMegaMenu } from "@lib/util/mega-menu"
import { useHoverIntentOpen } from "@lib/hooks/use-hover-intent-open"
import { Fragment, useRef } from "react"

type MegaMenuProps = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
}

/**
 * 01_NAVIGATION_SPECIFICATION.md §10/§22 — Wine & Spirits' mega menu,
 * built as a disclosure pattern (a trigger with `aria-expanded`,
 * controlling a panel of ordinary `<nav>`/`<a>` links), not an ARIA
 * `menu` widget — deliberately not using `role="menu"`/`menuitem`, per
 * §22's explicit research-grounded instruction. Headless UI's `Popover`
 * with the `focus` prop supplies exactly this: a labeled trigger with
 * `aria-expanded`, focus moved into the panel on open, focus trapped
 * within it, `Escape` closes it and returns focus to the trigger (§21,
 * §22) — no custom focus-trap code needed.
 *
 * §10's "hover, with a click/tap fallback" is implemented via a ref to
 * the trigger button plus `useHoverIntentOpen` — hovering schedules a
 * delayed open (cancelled if the mouse leaves or a real click arrives
 * first, see that hook's own comment for why the delay is necessary),
 * while the trigger remains fully keyboard-operable through Popover's
 * own native Enter/Space handling.
 */
export default function MegaMenu({ categories, collections }: MegaMenuProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const hoverIntent = useHoverIntentOpen(triggerRef)
  const columns = groupCategoriesForMegaMenu(categories, 3)

  if (columns.length === 0) {
    // §24 — a category-tree fetch/empty failure falls back to the plain
    // structural link rather than a broken or missing menu.
    return (
      <LocalizedClientLink
        href="/categories"
        className="h-full flex items-center hover:text-interactive"
      >
        Wine &amp; Spirits
      </LocalizedClientLink>
    )
  }

  return (
    <Popover className="h-full flex relative" as="div">
      {({ open, close }) => (
        <div
          className="h-full flex"
          onMouseEnter={hoverIntent.onMouseEnter(open)}
          onMouseLeave={() => {
            hoverIntent.onMouseLeaveCancel()
            close()
          }}
        >
          <PopoverButton
            ref={triggerRef}
            className="h-full flex items-center hover:text-interactive focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            data-testid="mega-menu-trigger"
            onClick={hoverIntent.onTriggerClick}
          >
            Wine &amp; Spirits
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              focus
              className="absolute inset-x-0 top-full z-40 bg-surface-elevated border-b border-border shadow-elevation-2"
              data-testid="mega-menu-panel"
            >
              <nav
                aria-label="Wine & Spirits categories"
                className="content-container py-8 grid grid-cols-1 sm:grid-cols-3 gap-8"
              >
                {columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-6">
                    {column.map((group) => (
                      <div key={group.heading.id}>
                        <LocalizedClientLink
                          href={`/categories/${group.heading.handle}`}
                          className="txt-small-plus text-text-primary hover:text-interactive"
                          onClick={() => close()}
                        >
                          {group.heading.name}
                        </LocalizedClientLink>
                        {group.links.length > 0 && (
                          <ul className="mt-2 flex flex-col gap-2">
                            {group.links.map((link) => (
                              <li key={link.id}>
                                <LocalizedClientLink
                                  href={`/categories/${link.handle}`}
                                  className="txt-small text-text-secondary hover:text-text-primary"
                                  onClick={() => close()}
                                >
                                  {link.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {collections.length > 0 && (
                  <div className="col-span-full border-t border-divider pt-6 flex flex-wrap gap-x-8 gap-y-2">
                    {collections.map((collection) => (
                      <LocalizedClientLink
                        key={collection.id}
                        href={`/collections/${collection.handle}`}
                        className="txt-small-plus text-text-primary hover:text-interactive"
                        onClick={() => close()}
                      >
                        {collection.title}
                      </LocalizedClientLink>
                    ))}
                  </div>
                )}
              </nav>
            </PopoverPanel>
          </Transition>
        </div>
      )}
    </Popover>
  )
}
