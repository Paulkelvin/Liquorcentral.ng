import { Metadata } from "next"
import { Suspense } from "react"

import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "Search",
  // §25 — internal search-results pages are `noindex, follow`: thin,
  // near-duplicate query-string content that would dilute rather than
  // help organic visibility, while still linking out to the real
  // indexable category/collection/product pages results point to.
  robots: { index: false, follow: true },
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string; sortBy?: SortOptions; page?: string }>
}

/**
 * 03_SEARCH_SPECIFICATION.md — the results/behavior layer
 * `01_NAVIGATION_SPECIFICATION.md` §15's search entry point leads to.
 *
 * Built entirely against the native Store API `q` parameter, reusing
 * Product Listing's own card/sort/Load-More/empty-state infrastructure
 * (04_PRODUCT_LISTING_SPECIFICATION.md §9's "same card hierarchy... across
 * search results" rule) rather than a parallel implementation. What this
 * page does NOT implement, because each is explicitly Meilisearch-backed
 * (`MEDUSA_EXTENSIONS.md` #6, still not formally approved — see
 * `DECISION_LOG.md`): typo tolerance (§8), a synonym dictionary (§9),
 * autocomplete (§7 — a native-only, non-typo-tolerant autocomplete would
 * risk feeling broken rather than helpful, the opposite of what §7
 * exists for), editorial boosting (§11), faceted filtering (§13, also
 * blocked on the wine/food attribute field lists), "pairs with" cross-sell
 * (§17, unbuilt data model), and true typo-corrected zero-result recovery
 * (§18 tier 1) — the zero-result state here offers tier 2/3 recovery only
 * (a browse link), honestly, rather than fabricating a "did you mean"
 * without real typo-distance data behind it.
 *
 * What genuinely doesn't need Meilisearch and is built here: one unified
 * result list spanning both catalogs (§5), a small catalog-identity badge
 * per result (Food Central vs. Wine & Spirits — the new business
 * requirement this milestone implements, `DECISION_LOG.md`), real
 * Load-More pagination and sort (Price, Newest; "Relevance" honestly
 * labeled as the API's own default order, mirroring Product Listing's
 * identical "Featured" no-op — see sort-products/index.tsx), a real
 * empty state distinguishing "no query yet" from "zero results" (§18,
 * §19), an announced result count (§22), and `noindex, follow` SEO (§25).
 */
export default async function SearchPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const query = searchParams.q?.trim() ?? ""
  const sort = searchParams.sortBy || "featured"
  const pageNumber = searchParams.page ? parseInt(searchParams.page) : 1

  return (
    <div className="content-container py-6">
      <h1 className="txt-2xl-semi mb-2" data-testid="search-page-title">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>

      {!query && (
        // §19 — before any query is typed/submitted, this is not an
        // error state, it simply hasn't been asked anything yet.
        <p className="text-body text-text-secondary mt-4" data-testid="search-no-query">
          Search for a product, dish, producer, or ingredient using the
          search field above.
        </p>
      )}

      {query && (
        <div className="flex flex-col small:flex-row small:items-start py-2">
          <RefinementList
            sortBy={sort}
            defaultSortLabel="Relevance"
            hideOptionsPicker
            data-testid="sort-by-container"
          />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                query={query}
                showCatalogBadge
                countryCode={params.countryCode}
                itemNoun="result"
                emptyStateFallbackHref="/categories"
                emptyStateTitle={`No results for "${query}"`}
                emptyStateDescription="Try a different search term, or browse Wine & Spirits or Food Central from the navigation."
                emptyStateActionLabel="Browse Wine & Spirits"
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
