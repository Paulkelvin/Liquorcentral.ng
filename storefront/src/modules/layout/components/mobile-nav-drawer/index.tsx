"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { ArrowRightMini, MapPin, ShoppingBag, TruckFast, User, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, clx } from "@modules/common/components/ui"
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
              className="fixed inset-0 z-[60] bg-surface overflow-y-auto"
              data-testid="mobile-nav-drawer"
            >
              <div className="flex flex-col min-h-full">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-elevated">
                  <span className="font-display text-heading-4 font-semibold tracking-tight text-text-primary">
                    LiquorCentral
                  </span>
                  <button
                    data-testid="close-mobile-nav-drawer"
                    aria-label="Close menu"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-radius-sm"
                    onClick={() => close()}
                  >
                    <XMark />
                  </button>
                </div>

                <nav aria-label="Full navigation" className="flex-1 px-6 py-6">
                  <ul className="flex flex-col gap-8">
                    <li>
                      <div className="flex items-center gap-2 mb-3">
                        <TruckFast className="text-secondary" aria-hidden="true" />
                        <Heading level="h3" display className="text-body-lg">
                          Wine &amp; Spirits
                        </Heading>
                      </div>
                      <ul className="flex flex-col gap-1 pl-1">
                        {topLevel.map((category) => (
                          <li key={category.id}>
                            <LocalizedClientLink
                              href={`/categories/${category.handle}`}
                              className="flex items-center min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:bg-ink-100 hover:text-interactive"
                              onClick={() => close()}
                            >
                              {category.name}
                            </LocalizedClientLink>
                            {!!category.category_children?.length && (
                              <ul className="pl-4 flex flex-col gap-1">
                                {category.category_children.map((child) => (
                                  <li key={child.id}>
                                    <LocalizedClientLink
                                      href={`/categories/${child.handle}`}
                                      className="flex items-center min-h-[40px] px-3 -mx-3 rounded-radius-sm txt-small text-text-secondary hover:bg-ink-100 hover:text-text-primary"
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
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="text-secondary" aria-hidden="true" />
                        <Heading level="h3" display className="text-body-lg">
                          Food Central
                        </Heading>
                      </div>
                      <ul className="flex flex-col gap-1 pl-1">
                        {FOOD_CENTRAL_DESTINATIONS.map((destination) => (
                          <li key={destination.href}>
                            <LocalizedClientLink
                              href={destination.href}
                              className="flex items-center min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:bg-ink-100 hover:text-interactive"
                              onClick={() => close()}
                            >
                              {destination.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="border-t border-border pt-6 flex flex-col gap-1">
                      <LocalizedClientLink
                        href="/account"
                        className="flex items-center gap-2 min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:bg-ink-100 hover:text-interactive"
                        onClick={() => close()}
                      >
                        <User className="text-text-secondary" aria-hidden="true" />
                        Account
                      </LocalizedClientLink>
                      <LocalizedClientLink
                        href="/cart"
                        className="flex items-center gap-2 min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:bg-ink-100 hover:text-interactive"
                        onClick={() => close()}
                      >
                        <ShoppingBag className="text-text-secondary" aria-hidden="true" />
                        Cart
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </nav>

                <div className="flex flex-col gap-y-6 border-t border-border px-6 py-6">
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
