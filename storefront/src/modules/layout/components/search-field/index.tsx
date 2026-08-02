"use client"

import { useParams, useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { IconSearch } from "@modules/common/icons"

/**
 * 01_NAVIGATION_SPECIFICATION.md §15 — "a visible text input in the
 * header, not an icon that must be tapped to reveal one, on desktop"
 * (research-grounded: field prominence itself shifts search vs. browse
 * usage). Desktop-only: the mobile header no longer carries a search
 * icon of its own — per direct product feedback, mobile search now
 * lives inside the hamburger drawer (MobileNavDrawer's own search form)
 * instead of a second header-row affordance.
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
  const [query, setQuery] = useState("")

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) {
      return
    }
    router.push(`/${countryCode}/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-radius-md border border-border bg-surface focus-within:ring-2 focus-within:ring-focus"
    >
      <IconSearch size={18} className="shrink-0 text-text-muted" aria-hidden="true" />
      <label htmlFor="header-search-desktop" className="sr-only">
        Search products
      </label>
      <input
        id="header-search-desktop"
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="bg-transparent outline-none txt-small text-text-primary placeholder:text-text-muted w-56"
      />
    </form>
  )
}
