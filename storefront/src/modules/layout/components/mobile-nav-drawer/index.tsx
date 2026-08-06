"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import {
  CategoryIcon,
  IconAccount,
  IconArrowRight,
  IconBag,
  IconCalendar,
  IconChevronDown,
  IconCloche,
  IconClose,
  IconMenu,
  IconSearch,
  IconStorefront,
} from "@modules/common/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Fragment, FormEvent, useState } from "react"
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
  { label: "Today's Menu", href: "/food-central", Icon: IconCloche },
  { label: "Scheduled Orders", href: "/food-central/scheduled", Icon: IconCalendar },
  { label: "Pickup", href: "/food-central/pickup", Icon: IconStorefront },
]

type NavIcon = React.ComponentType<{ className?: string }>

/**
 * Categories come from the backend, so their icons are matched on handle,
 * with a wine-glass fallback inside `CategoryIcon` — an unmapped or
 * newly-added category still renders a correctly-aligned row rather than a
 * gap where an icon should be.
 *
 * **This used to be its own map, pointing at `@medusajs/icons`: a beaker for
 * wines, a flame for spirits, a database cylinder for beer.** So the same
 * category carried one glyph in this drawer and a different one in the
 * homepage's category row, and the drawer's version was also wrong about what
 * it was selling. Both surfaces now read the single set in
 * `@modules/common/icons`.
 */
const CATEGORY_NAV_ICONS = new Map<string, NavIcon>()

const iconFor = (handle?: string | null): NavIcon => {
  const key = handle ?? ""
  // Cached per handle so the component identity is stable across renders —
  // returning a fresh closure each time would remount the icon on every keystroke
  // in the search field above it.
  let Cached = CATEGORY_NAV_ICONS.get(key)
  if (!Cached) {
    Cached = function CategoryNavIcon(props: { className?: string }) {
      return <CategoryIcon handle={key} {...props} />
    }
    CATEGORY_NAV_ICONS.set(key, Cached)
  }
  return Cached
}

/**
 * A top-level navigation row: line icon, then a sentence-case label —
 * no uppercasing, and deliberately no rule beneath it. The current page
 * is marked by a filled, rounded, tinted block rather than a divider or
 * an edge bar.
 */
function NavRow({
  href,
  isActive,
  onNavigate,
  Icon,
  children,
}: {
  href: string
  isActive: boolean
  onNavigate: () => void
  Icon: NavIcon
  children: React.ReactNode
}) {
  return (
    <LocalizedClientLink
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={clx(
        "flex-1 flex items-center gap-3 min-h-[44px] px-3 rounded-radius-md text-body transition-colors duration-standard ease-in-out",
        isActive
          // Ink on the tint, not the interactive colour on it: brand
          // green over its own 10% wash measures ~3.3:1, well under the
          // 4.5:1 AA floor (axe-core flags it). The filled tinted block
          // carries the "selected" signal; the label stays legible.
          ? "bg-interactive-tint text-text-primary font-semibold"
          : "text-text-primary hover:bg-ink-100"
      )}
    >
      <Icon className="shrink-0" />
      <span>{children}</span>
    </LocalizedClientLink>
  )
}

/**
 * 01_NAVIGATION_SPECIFICATION.md §7.3 — "a drawer (opened from a
 * clearly-labeled 'Menu' or 'All Categories' affordance, not an
 * unlabeled hamburger icon alone)... carries the full category tree
 * depth."
 *
 * **Second pass — Paul's read of the previous version: it didn't look
 * great, and Account/Cart/the shipping selector read as "other stuff"
 * bolted on below the actual menu rather than part of it.** Two changes:
 *
 * 1. **Slides in from the left as a ~90%-width panel over a dimmed scrim,
 *    not a full-bleed screen that fades in place.** An edge-anchored panel
 *    that pushes in from off-screen, with the rest of the page visibly
 *    dimmed behind it, is the pattern most considered mobile storefronts
 *    settle on — it reads as *a panel opened over the page* rather than
 *    *a second page*, and the sliver of dimmed content at the right edge
 *    gives a spatial cue (this closes back to where you were) a full-bleed
 *    fade doesn't.
 * 2. **Account, Cart, and the shipping-region selector are rows in the
 *    same list as the categories, not a separate bordered block in a
 *    different background colour underneath.** That block was the "those
 *    ones below" — visually a different section, even though it opened
 *    with the same drawer. They're the same `NavRow` treatment as
 *    everything above them, one hairline group break, nothing else marking
 *    them as a different kind of thing.
 *
 * What's unchanged from the first pass: the fixed shell with only the
 * middle list scrolling, the accordion for multi-level categories, and
 * text-only section labels.
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
  const router = useRouter()
  const { countryCode } = useParams()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState("")

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
      {({ close }) => {
        const submitSearch = (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          if (!query.trim()) {
            return
          }
          close()
          router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
        }

        return (
        <>
          <PopoverButton
            data-testid="mobile-nav-menu-button"
            aria-label="Open menu"
            className="h-full min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <IconMenu aria-hidden="true" />
          </PopoverButton>

          {/* The scrim. A separate fade from the panel's own slide — a
              dimmed page behind an edge-anchored panel is what makes this
              read as "opened over the page" rather than "a second page." */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              aria-hidden="true"
              className="fixed inset-0 z-[60] bg-ink-900/50"
              onClick={() => close()}
            />
          </Transition>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-250"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            {/* `h-dvh` (dynamic viewport height), not just `inset-0`'s
                implicit sizing — accounts for mobile Safari/Chrome's
                collapsing address-bar chrome so the drawer never sits
                taller than the real visible viewport. Capped at 22rem and
                90vw rather than the full screen width, so the dimmed scrim
                stays visible at the right edge as the "this is a panel,
                not a new page" cue the redesign is built around. */}
            <PopoverPanel
              focus
              className="fixed inset-y-0 left-0 h-dvh z-[61] w-[90vw] max-w-[22rem] bg-surface shadow-2xl flex flex-col overflow-hidden"
              data-testid="mobile-nav-drawer"
            >
              {/* Fixed header — the display serif, same weight the wordmark
                  uses in the header bar underneath, so the panel still
                  reads as this store's rather than a generic UI drawer. */}
              <div className="shrink-0 flex items-center justify-between px-5 py-5">
                <span className="font-display text-heading-4 font-semibold tracking-tight text-text-primary">
                  Menu
                </span>
                <button
                  data-testid="close-mobile-nav-drawer"
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-radius-sm"
                  onClick={() => close()}
                >
                  <IconClose aria-hidden="true" />
                </button>
              </div>

              {/* Fixed search row — mobile search now lives here instead
                  of a second icon in the header row itself (direct
                  product feedback: one entry point, reachable the
                  moment the drawer opens, not a nested overlay). Real
                  GET form to /search?q=, same as the desktop-only
                  header search field. */}
              <form
                role="search"
                onSubmit={submitSearch}
                className="shrink-0 flex items-center gap-2 h-11 mx-4 my-4 px-3 rounded-radius-md bg-ink-100"
              >
                <IconSearch size={18} className="shrink-0 text-text-muted" aria-hidden="true" />
                <label htmlFor="mobile-nav-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="mobile-nav-search"
                  type="search"
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent outline-none txt-small text-text-primary placeholder:text-text-muted w-full"
                />
              </form>

              {/* Scrollable main navigation — only this region scrolls */}
              <nav aria-label="Full navigation" className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="flex flex-col gap-8">
                  <div>
                    {/* A quiet uppercase group label carries the section
                        break — no horizontal rules anywhere in this list. */}
                    <h3 className="px-3 mb-2 text-caption font-medium uppercase tracking-wider text-text-muted">
                      Wine &amp; Spirits
                    </h3>
                    <ul className="flex flex-col gap-0.5">
                      {topLevel.map((category) => {
                        const hasChildren = !!category.category_children?.length
                        const isExpanded = expandedIds.has(category.id)
                        const active = isCurrentPath(`/categories/${category.handle}`)

                        return (
                          <li key={category.id} className="flex flex-col">
                            <div className="flex items-center">
                              <NavRow
                                href={`/categories/${category.handle}`}
                                isActive={active}
                                onNavigate={() => close()}
                                Icon={iconFor(category.handle)}
                              >
                                {category.name}
                              </NavRow>
                              {hasChildren && (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  aria-controls={`mobile-nav-subcategory-${category.id}`}
                                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
                                  onClick={() => toggleExpanded(category.id)}
                                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-radius-md text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                >
                                  <IconChevronDown
                                    className={clx(
                                      "transition-transform duration-150",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </button>
                              )}
                            </div>
                            {hasChildren && isExpanded && (
                              /* Subcategories hang off a tree spine: one
                                 vertical rule down the group, with a short
                                 tick reaching across to each child row. */
                              <ul
                                id={`mobile-nav-subcategory-${category.id}`}
                                className="mt-0.5 ml-6 flex flex-col gap-0.5 border-l border-divider"
                              >
                                {category.category_children!.map((child) => {
                                  const childActive = isCurrentPath(
                                    `/categories/${child.handle}`
                                  )
                                  return (
                                    <li
                                      key={child.id}
                                      className="relative before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:bg-divider"
                                    >
                                      <LocalizedClientLink
                                        href={`/categories/${child.handle}`}
                                        onClick={() => close()}
                                        aria-current={childActive ? "page" : undefined}
                                        className={clx(
                                          "flex items-center min-h-[40px] ml-5 px-3 rounded-radius-md text-body transition-colors duration-standard ease-in-out",
                                          childActive
                                            ? "bg-interactive-tint text-text-primary font-semibold"
                                            : "text-text-secondary hover:bg-ink-100 hover:text-text-primary"
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
                    <h3 className="px-3 mb-2 text-caption font-medium uppercase tracking-wider text-text-muted">
                      Food Central
                    </h3>
                    <ul className="flex flex-col gap-0.5">
                      {FOOD_CENTRAL_DESTINATIONS.map((destination) => {
                        const active = isCurrentPath(destination.href)
                        return (
                          <li key={destination.href} className="flex items-center">
                            <NavRow
                              href={destination.href}
                              isActive={active}
                              onNavigate={() => close()}
                              Icon={destination.Icon}
                            >
                              {destination.label}
                            </NavRow>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Account and Cart, as rows in this same list — not a
                      separate bordered block in a different background,
                      which is what read as "other stuff below the menu."
                      Same `NavRow`, same group-label treatment as Wine &
                      Spirits and Food Central above. */}
                  <div>
                    <h3 className="px-3 mb-2 text-caption font-medium uppercase tracking-wider text-text-muted">
                      My Account
                    </h3>
                    <ul className="flex flex-col gap-0.5">
                      <li className="flex items-center">
                        <NavRow
                          href="/account"
                          isActive={isCurrentPath("/account")}
                          onNavigate={() => close()}
                          Icon={IconAccount}
                        >
                          Account
                        </NavRow>
                      </li>
                      <li className="flex items-center">
                        <NavRow
                          href="/cart"
                          isActive={isCurrentPath("/cart")}
                          onNavigate={() => close()}
                          Icon={IconBag}
                        >
                          Cart
                        </NavRow>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>

              {/* Fixed footer — only the shipping-region (and, where
                  offered, language) selector now lives here, since it's
                  genuinely a setting rather than a destination. Deliberately
                  quiet: no distinct background, a hairline top border only,
                  small type — furniture, not another menu section. */}
              <div className="shrink-0 border-t border-divider px-4 py-3">
                <div className="flex flex-col gap-y-2">
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
                      <IconArrowRight
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
                    <IconArrowRight
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
        )
      }}
    </Popover>
  )
}
