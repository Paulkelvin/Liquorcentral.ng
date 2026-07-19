"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useHoverIntentOpen } from "@lib/hooks/use-hover-intent-open"
import { Fragment, useRef } from "react"

/**
 * 01_NAVIGATION_SPECIFICATION.md §14 — "deliberately the simplest
 * navigation surface on the platform": a lightweight dropdown, never a
 * mega menu, three fixed destinations with "no deeper formal taxonomy
 * layer beneath them at launch." Unlike Wine & Spirits' mega menu, this
 * is intentionally NOT data-driven — §14 names the three destinations
 * directly, and no Product Category models them (see
 * navigation-category-seed.ts's own comment on why Food Central isn't
 * seeded as a category).
 */
const FOOD_CENTRAL_DESTINATIONS = [
  { label: "Today's Menu", href: "/food-central" },
  { label: "Scheduled Orders", href: "/food-central/scheduled" },
  { label: "Pickup", href: "/food-central/pickup" },
]

export default function FoodCentralMenu() {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const hoverIntent = useHoverIntentOpen(triggerRef)

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
            data-testid="food-central-menu-trigger"
            onClick={hoverIntent.onTriggerClick}
          >
            Food Central
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
              className="absolute top-full left-0 z-40 min-w-[220px] bg-surface-elevated border border-border shadow-elevation-2 rounded-radius-md"
              data-testid="food-central-menu-panel"
            >
              <nav
                aria-label="Food Central"
                className="flex flex-col p-4 gap-3"
              >
                {FOOD_CENTRAL_DESTINATIONS.map((destination) => (
                  <LocalizedClientLink
                    key={destination.href}
                    href={destination.href}
                    className="txt-small-plus text-text-primary hover:text-interactive"
                    onClick={() => close()}
                  >
                    {destination.label}
                  </LocalizedClientLink>
                ))}
              </nav>
            </PopoverPanel>
          </Transition>
        </div>
      )}
    </Popover>
  )
}
