import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import EmptyState from "@modules/common/components/empty-state"

export const metadata: Metadata = {
  title: "Search",
  // §26 — search results are `noindex, follow`, the same treatment
  // 03_SEARCH_SPECIFICATION.md's own future implementation will apply.
  robots: { index: false, follow: true },
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string }>
}

/**
 * 01_NAVIGATION_SPECIFICATION.md §15 — the entry point's landing target,
 * kept deliberately minimal. This is NOT `03_SEARCH_SPECIFICATION.md`'s
 * implementation: no ranking philosophy, no typo tolerance/synonyms, no
 * facets, no search-within-category, no "labeled by product line"
 * behavior — all of that is explicitly Meilisearch-backed (`MEDUSA_EXTENSIONS.md`
 * #6), still pending formal approval. This page exists only so the
 * header search field (§15) never leads to a 404 (§24) — a plain,
 * native `q`-filtered product list, replaced wholesale when 03 is
 * implemented for real.
 */
export default async function SearchPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const query = searchParams.q?.trim() ?? ""

  const region = await getRegion(params.countryCode)

  const products = query
    ? await listProducts({
        countryCode: params.countryCode,
        queryParams: { q: query, limit: 24 },
      }).then(({ response }) => response.products)
    : []

  return (
    <div className="content-container py-6">
      <h1 className="txt-2xl-semi mb-8" data-testid="search-page-title">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>

      {query && products.length === 0 && (
        <EmptyState
          title="No results found"
          description="Try a different search term, or browse Wine & Spirits or Food Central from the navigation."
        />
      )}

      {products.length > 0 && region && (
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="search-results-list"
        >
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
