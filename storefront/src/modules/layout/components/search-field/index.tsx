"use client"

import { useParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { MagnifyingGlassMini, XMark } from "@medusajs/icons"

/**
 * 01_NAVIGATION_SPECIFICATION.md §15 — "a visible text input in the
 * header, not an icon that must be tapped to reveal one, on desktop"
 * (research-grounded: field prominence itself shifts search vs. browse
 * usage). On mobile, §7/§15 allow an icon that expands to a full-viewport
 * input on tap, provided it's reachable in one tap without opening the
 * drawer first — this component is the drawer-independent header
 * affordance that satisfies that.
 *
 * Submits as a real GET form to `/search?q=` — a plain `<form>`, not a
 * JS-only handler, so it still works without client JS and produces a
 * real, bookmarkable, shareable URL (§20, §26). The results page itself
 * is a minimal bridge over native product search; ranking, facets, and
 * typo tolerance are `03_SEARCH_SPECIFICATION.md`'s own future
 * Meilisearch-backed implementation, not built here.
 */
export default function SearchField() {
  const router = useRouter()
  const { countryCode } = useParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) {
      return
    }
    setMobileOpen(false)
    router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      {/* Desktop: always-visible input (§15) */}
      <form
        role="search"
        onSubmit={submit}
        className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-radius-md border border-border bg-surface focus-within:ring-2 focus-within:ring-focus"
      >
        <MagnifyingGlassMini className="text-text-muted" aria-hidden="true" />
        <label htmlFor="header-search-desktop" className="sr-only">
          Search products
        </label>
        <input
          id="header-search-desktop"
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Wine & Spirits, Food Central..."
          className="bg-transparent outline-none txt-small text-text-primary placeholder:text-text-muted w-56"
        />
      </form>

      {/* Mobile: one-tap icon that expands to a full-viewport input (§7, §15) */}
      <div className="sm:hidden flex items-center h-full">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="header-search-mobile-panel"
          aria-label="Search"
          data-testid="mobile-search-trigger"
          className="h-11 w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          onClick={() => setMobileOpen(true)}
        >
          <MagnifyingGlassMini aria-hidden="true" />
        </button>

        {mobileOpen && (
          <div
            id="header-search-mobile-panel"
            className="fixed inset-0 z-[60] bg-surface-elevated flex flex-col p-4"
          >
            <div className="flex items-center gap-3">
              <form role="search" onSubmit={submit} className="flex-1 flex items-center gap-2 h-11 px-3 rounded-radius-md border border-border">
                <MagnifyingGlassMini className="text-text-muted" aria-hidden="true" />
                <label htmlFor="header-search-mobile" className="sr-only">
                  Search products
                </label>
                <input
                  id="header-search-mobile"
                  type="search"
                  name="q"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setMobileOpen(false)
                    }
                  }}
                  placeholder="Search Wine & Spirits, Food Central..."
                  className="bg-transparent outline-none txt-small text-text-primary placeholder:text-text-muted w-full"
                />
              </form>
              <button
                type="button"
                aria-label="Close search"
                className="h-11 w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                onClick={() => setMobileOpen(false)}
              >
                <XMark aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
