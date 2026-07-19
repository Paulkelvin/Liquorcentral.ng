"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"
import useToggleState from "@lib/hooks/use-toggle-state"

type MobileNavDrawerProps = {
  categories: HttpTypes.StoreProductCategory[]
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const FOOD_CENTRAL_DESTINATIONS = [
  { label: "Today's Menu", href: "/food-central" },
  { label: "Scheduled Orders", href: "/food-central/scheduled" },
  { label: "Pickup", href: "/food-central/pickup" },
]

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.3 — "a drawer (opened from a
 * clearly-labeled 'Menu' or 'All Categories' affordance, not an
 * unlabeled hamburger icon alone)... carries the full category tree
 * depth." Replaces the Phase 0c-era generic SideMenu (Home/Store/Account/
 * Cart only, no category depth) — its region/language selectors are
 * carried over unchanged, not dropped.
 *
 * Built the same disclosure way as MegaMenu/FoodCentralMenu (Popover +
 * `focus`): labeled trigger, `aria-expanded`, focus trapped while open,
 * `Escape` closes and returns focus to the trigger (§7, §21, §22).
 */
export default function MobileNavDrawer({
  categories,
  regions,
  locales,
  currentLocale,
}: MobileNavDrawerProps) {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  const topLevel = categories
    .filter((c) => !c.parent_category_id)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return (
    <Popover className="h-full flex">
      {({ close }) => (
        <>
          <PopoverButton
            data-testid="mobile-nav-menu-button"
            className="h-full flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Menu
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <PopoverPanel
              focus
              className="fixed inset-0 z-[60] bg-surface-elevated overflow-y-auto"
              data-testid="mobile-nav-drawer"
            >
              <div className="flex flex-col min-h-full p-6">
                <div className="flex justify-end">
                  <button
                    data-testid="close-mobile-nav-drawer"
                    aria-label="Close menu"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    onClick={() => close()}
                  >
                    <XMark />
                  </button>
                </div>

                <nav aria-label="Full navigation" className="flex-1 mt-4">
                  <ul className="flex flex-col gap-8">
                    <li>
                      <span className="txt-large-plus text-text-primary block mb-3">
                        Wine &amp; Spirits
                      </span>
                      <ul className="flex flex-col gap-4 pl-2">
                        {topLevel.map((category) => (
                          <li key={category.id}>
                            <LocalizedClientLink
                              href={`/categories/${category.handle}`}
                              className="txt-medium-plus text-text-primary hover:text-interactive"
                              onClick={() => close()}
                            >
                              {category.name}
                            </LocalizedClientLink>
                            {!!category.category_children?.length && (
                              <ul className="mt-2 pl-3 flex flex-col gap-2">
                                {category.category_children.map((child) => (
                                  <li key={child.id}>
                                    <LocalizedClientLink
                                      href={`/categories/${child.handle}`}
                                      className="txt-small text-text-secondary hover:text-text-primary"
                                      onClick={() => close()}
                                    >
                                      {child.name}
                                    </LocalizedClientLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li>
                      <span className="txt-large-plus text-text-primary block mb-3">
                        Food Central
                      </span>
                      <ul className="flex flex-col gap-2 pl-2">
                        {FOOD_CENTRAL_DESTINATIONS.map((destination) => (
                          <li key={destination.href}>
                            <LocalizedClientLink
                              href={destination.href}
                              className="txt-medium-plus text-text-primary hover:text-interactive"
                              onClick={() => close()}
                            >
                              {destination.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="border-t border-divider pt-6 flex flex-col gap-3">
                      <LocalizedClientLink
                        href="/account"
                        className="txt-medium-plus text-text-primary hover:text-interactive"
                        onClick={() => close()}
                      >
                        Account
                      </LocalizedClientLink>
                      <LocalizedClientLink
                        href="/cart"
                        className="txt-medium-plus text-text-primary hover:text-interactive"
                        onClick={() => close()}
                      >
                        Cart
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </nav>

                <div className="flex flex-col gap-y-6 border-t border-divider pt-6 mt-6">
                  {!!locales?.length && (
                    <div
                      className="flex justify-between"
                      onMouseEnter={languageToggleState.open}
                      onMouseLeave={languageToggleState.close}
                    >
                      <LanguageSelect
                        toggleState={languageToggleState}
                        locales={locales}
                        currentLocale={currentLocale}
                      />
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150",
                          languageToggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>
                  )}
                  <div
                    className="flex justify-between"
                    onMouseEnter={countryToggleState.open}
                    onMouseLeave={countryToggleState.close}
                  >
                    {regions && (
                      <CountrySelect
                        toggleState={countryToggleState}
                        regions={regions}
                      />
                    )}
                    <ArrowRightMini
                      className={clx(
                        "transition-transform duration-150",
                        countryToggleState.state ? "-rotate-90" : ""
                      )}
                    />
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
