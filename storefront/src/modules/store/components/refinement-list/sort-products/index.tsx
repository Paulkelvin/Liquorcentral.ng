"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions = "featured" | "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
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
 */
const sortOptions = [
  {
    value: "featured",
    label: "Featured",
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
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
