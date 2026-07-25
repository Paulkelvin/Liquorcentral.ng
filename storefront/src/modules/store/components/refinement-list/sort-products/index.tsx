"use client"

import { ChevronDownMini } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export type SortOptions = "featured" | "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  /**
   * 03_SEARCH_SPECIFICATION.md §14 — search's default sort is labeled
   * "Relevance," distinct from 04_PRODUCT_LISTING_SPECIFICATION.md §11's
   * "Featured" default for category/collection listings, even though both
   * share the exact same underlying "featured" value and the same honest
   * no-op fallthrough (see the comment below) — only the label a customer
   * reads changes per context, since "Featured" would be a misleading
   * word to show on a search-results page.
   */
  defaultSortLabel?: string
  "data-testid"?: string
}

/**
 * 04_PRODUCT_LISTING_SPECIFICATION.md §11 — "Default sort order is
 * 'Featured'... not 'Relevance,' which only has meaning against a query."
 * "Featured" is meant to be a merchandising-curated position (the same
 * Category/Collection position field navigation already uses) — but no
 * such per-product manual-rank field exists in Medusa's native Product
 * model, and none has been added here (that would be inventing a data
 * model decision, not implementing one). "Featured" today is honestly
 * just the API's own natural/default order — see `sortProducts`' own
 * comment. It is still the correct *default selection*, matching §11's
 * explicit rule that Featured (not Newest) is what a listing opens on.
 * `03_SEARCH_SPECIFICATION.md` §10's own "Relevance" default is the
 * identical honest no-op, absent real Meilisearch-backed ranking — see
 * `defaultSortLabel` above for why the two contexts show different words
 * for the same value/behavior.
 */
const buildSortOptions = (defaultLabel: string) => [
  {
    value: "featured",
    label: defaultLabel,
  },
  {
    value: "created_at",
    label: "Newest",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  defaultSortLabel = "Featured",
}: SortProductsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Owns its own URL write now that it renders beside the results rather
  // than inside the sidebar. Changing the sort always returns to page 1 —
  // page 4 of the old ordering means nothing under a new one.
  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sortBy", value)
      params.delete("page")
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const options = buildSortOptions(defaultSortLabel)

  /**
   * A real <select> rather than the bulleted radio list this used to
   * render: sorting is a single-choice control, and a native select
   * collapses to one line, opens the platform's own picker on touch, and
   * is keyboard-operable for free.
   */
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-products"
        className="shrink-0 text-caption text-text-muted"
      >
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort-products"
          value={sortBy}
          onChange={(event) => handleChange(event.target.value)}
          data-testid={dataTestId}
          // Hairline `divider` rather than the heavier `border` step: at
          // 40px tall beside a page title, the darker rule read as a form
          // field demanding attention rather than a quiet control.
          className="min-h-[40px] w-full cursor-pointer appearance-none rounded-radius-md border border-divider bg-surface-elevated py-1.5 pl-3 pr-9 text-xs text-text-secondary transition-[border-color,box-shadow] duration-standard ease-in-out hover:border-text-muted focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_var(--color-focus-glow)]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownMini
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  )
}

export default SortProducts
