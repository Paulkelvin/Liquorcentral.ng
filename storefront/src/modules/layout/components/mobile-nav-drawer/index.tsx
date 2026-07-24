"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { ArrowRightMini, BarsThree, ChevronDown, ShoppingBag, User, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { usePathname } from "next/navigation"
import { Fragment, useState } from "react"
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

/** A top-level category link — accent-bar + bold when it's the current page, never a filled background block. */
function TopLevelLink({
  href,
  isActive,
  onNavigate,
  children,
}: {
  href: string
  isActive: boolean
  onNavigate: () => void
  children: React.ReactNode
}) {
  return (
    <LocalizedClientLink
      href={href}
      onClick={onNavigate}
      className={clx(
        "flex-1 flex items-center min-h-[44px] pl-3 -ml-3 border-l-2 uppercase tracking-wide text-caption",
        isActive
          ? "border-l-primary text-text-primary font-semibold"
          : "border-l-transparent text-text-primary font-semibold hover:border-l-border"
      )}
    >
      {children}
    </LocalizedClientLink>
  )
}

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.3 — "a drawer (opened from a
 * clearly-labeled 'Menu' or 'All Categories' affordance, not an
 * unlabeled hamburger icon alone)... carries the full category tree
 * depth." Its own structural density/hierarchy pass, per direct
 * feedback against a real mobile screenshot:
 *  - fixed 100vh shell, only the middle category list scrolls — the
 *    header and the Account/Cart/shipping-region footer stay pinned;
 *  - multi-level categories collapse behind a real accordion (chevron
 *    toggle, closed by default), not an always-expanded flat list;
 *  - no decorative icons on section titles — text-only;
 *  - a left-border accent + bold weight marks the current page,
 *    replacing a filled hover/active background block.
 */
export default function MobileNavDrawer({
  categories,
  regions,
  locales,
  currentLocale,
}: MobileNavDrawerProps) {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const pathname = usePathname()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const topLevel = categories
    .filter((c) => !c.parent_category_id)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  const isCurrentPath = (href: string) => pathname?.includes(href)

  return (
    <Popover className="h-full flex">
      {({ close }) => (
        <>
          <PopoverButton
            data-testid="mobile-nav-menu-button"
            aria-label="Open menu"
            className="h-full min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <BarsThree width={24} height={24} aria-hidden="true" />
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
            {/* `h-dvh` (dynamic viewport height), not just `inset-0`'s
                implicit sizing — accounts for mobile Safari/Chrome's
                collapsing address-bar chrome so the drawer never sits
                taller than the real visible viewport. */}
            <PopoverPanel
              focus
              className="fixed inset-0 h-dvh z-[60] bg-surface flex flex-col overflow-hidden"
              data-testid="mobile-nav-drawer"
            >
              {/* Fixed header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-border bg-surface-elevated">
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

              {/* Scrollable main navigation — only this region scrolls */}
              <nav aria-label="Full navigation" className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col">
                  <div className="pb-6 mb-6 border-b border-border">
                    <h3 className="text-heading-3 font-display font-semibold text-text-primary mb-4">
                      Wine &amp; Spirits
                    </h3>
                    <ul className="flex flex-col">
                      {topLevel.map((category) => {
                        const hasChildren = !!category.category_children?.length
                        const isExpanded = expandedIds.has(category.id)
                        const active = isCurrentPath(`/categories/${category.handle}`)

                        return (
                          <li
                            key={category.id}
                            className="border-b border-divider last:border-b-0 py-1"
                          >
                            <div className="flex items-center">
                              <TopLevelLink
                                href={`/categories/${category.handle}`}
                                isActive={active}
                                onNavigate={() => close()}
                              >
                                {category.name}
                              </TopLevelLink>
                              {hasChildren && (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  aria-controls={`mobile-nav-subcategory-${category.id}`}
                                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
                                  onClick={() => toggleExpanded(category.id)}
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-radius-sm"
                                >
                                  <ChevronDown
                                    className={clx(
                                      "transition-transform duration-150",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </button>
                              )}
                            </div>
                            {hasChildren && isExpanded && (
                              <ul
                                id={`mobile-nav-subcategory-${category.id}`}
                                className="pl-4 pb-2 flex flex-col"
                              >
                                {category.category_children!.map((child) => {
                                  const childActive = isCurrentPath(
                                    `/categories/${child.handle}`
                                  )
                                  return (
                                    <li key={child.id}>
                                      <LocalizedClientLink
                                        href={`/categories/${child.handle}`}
                                        onClick={() => close()}
                                        className={clx(
                                          "flex items-center min-h-[40px] pl-3 border-l-2 text-body",
                                          childActive
                                            ? "border-l-primary text-text-primary font-medium"
                                            : "border-l-transparent text-text-secondary font-normal hover:border-l-border hover:text-text-primary"
                                        )}
                                      >
                                        {child.name}
                                      </LocalizedClientLink>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-heading-3 font-display font-semibold text-text-primary mb-4">
                      Food Central
                    </h3>
                    <ul className="flex flex-col">
                      {FOOD_CENTRAL_DESTINATIONS.map((destination) => {
                        const active = isCurrentPath(destination.href)
                        return (
                          <li
                            key={destination.href}
                            className="border-b border-divider last:border-b-0 py-1"
                          >
                            <TopLevelLink
                              href={destination.href}
                              isActive={active}
                              onNavigate={() => close()}
                            >
                              {destination.label}
                            </TopLevelLink>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </nav>

              {/* Fixed sticky footer — Account, Cart, and the shipping
                  (delivery region) selector stay anchored and visible
                  regardless of how far the category list above is
                  scrolled. */}
              <div className="shrink-0 border-t border-border bg-surface-elevated px-6 py-4">
                <div className="flex flex-col gap-1 pb-3 mb-3 border-b border-divider">
                  <LocalizedClientLink
                    href="/account"
                    className="flex items-center gap-2 min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:text-interactive"
                    onClick={() => close()}
                  >
                    <User className="text-text-secondary" aria-hidden="true" />
                    Account
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/cart"
                    className="flex items-center gap-2 min-h-[44px] px-3 -mx-3 rounded-radius-sm txt-medium-plus text-text-primary hover:text-interactive"
                    onClick={() => close()}
                  >
                    <ShoppingBag className="text-text-secondary" aria-hidden="true" />
                    Cart
                  </LocalizedClientLink>
                </div>

                <div className="flex flex-col gap-y-3">
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
                  {/* The "shipping selector" — the region a customer's
                      delivery/pricing is scoped to. */}
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
