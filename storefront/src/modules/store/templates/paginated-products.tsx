import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductPreview from "@modules/products/components/product-preview"
import LoadMore from "@modules/store/components/load-more"
import EmptyState from "@modules/common/components/empty-state"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  fields?: string
  q?: string
}

/**
 * 04_PRODUCT_LISTING_SPECIFICATION.md §13 — "Load More," not classic
 * pagination: `page` here means "how many pages are currently loaded"
 * (reflected in the URL), and every render returns every product from
 * the start through that many pages (`listProductsWithSort`'s
 * `cumulative` mode), so the grid never loses previously-shown items.
 *
 * Also reused, unmodified, by `03_SEARCH_SPECIFICATION.md`'s search
 * results page (`query` param below) — the same card, sort, Load More,
 * and empty-state infrastructure spans both, per Product Listing §9's
 * own "the same card hierarchy holds... across search results" rule.
 */
export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  query,
  showCatalogBadge,
  countryCode,
  optionValueIds,
  emptyStateFallbackHref,
  emptyStateTitle = "Nothing available right now",
  emptyStateDescription = "Check back soon, or browse another category.",
  emptyStateActionLabel = "Shop Wine & Spirits",
  itemNoun = "product",
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  /** 03_SEARCH_SPECIFICATION.md §5 — a unified, unscoped full-text query. */
  query?: string
  /** §5/new cross-catalog-labeling decision — see product-preview's own comment. */
  showCatalogBadge?: boolean
  countryCode: string
  optionValueIds?: OptionValueIds
  /** §21 — "nothing available right now" links to a sibling category/collection. */
  emptyStateFallbackHref?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateActionLabel?: string
  /** "product" (listings) vs. "result" (search) — §22's announced count wording. */
  itemNoun?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
    // Product Card Information Hierarchy's catalog-specific supporting
    // fact (Food Central prep-time) and quick-add's variant-count check
    // both need this — same `+food_details.*` mechanism already
    // established by FoodCentralSpotlight, extended to `wine_details` for
    // symmetry even though no wine card fact is surfaced today (see
    // product-preview/index.tsx's own comment on why).
    fields: "+food_details.*,+wine_details.*",
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (query) {
    queryParams["q"] = query
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
    cumulative: true,
  })

  if (count === 0) {
    // §21 (listings) / §18 (search) — a genuinely empty result set,
    // distinct from a facet-induced zero-result set (no facets are
    // applied by this route yet — see storefront/README.md).
    return (
      <EmptyState
        title={emptyStateTitle}
        description={emptyStateDescription}
        action={
          emptyStateFallbackHref ? (
            <LocalizedClientLink
              href={emptyStateFallbackHref}
              className="inline-flex gap-2 items-center justify-center rounded-radius-md font-medium bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active px-4 py-2 text-body"
            >
              {emptyStateActionLabel}
            </LocalizedClientLink>
          ) : undefined
        }
      />
    )
  }

  const previousCount = Math.min((page - 1) * PRODUCT_LIMIT, count)
  const newlyLoadedCount = page > 1 ? products.length - previousCount : 0
  const hasMore = count > products.length
  const countLabel = `${count} ${itemNoun}${count === 1 ? "" : "s"}`

  return (
    <>
      {/* §22/§6 — result count announced to assistive technology once the
          query resolves. A full page navigation's live region is not
          guaranteed to be announced on *first* paint by every screen
          reader (a documented ARIA limitation, not a bug) — Load More's
          own live region (below) reliably announces subsequent changes. */}
      <div role="status" aria-live="polite" className="sr-only">
        {countLabel}
      </div>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
        aria-label={countLabel}
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region}
                showCatalogBadge={showCatalogBadge}
              />
            </li>
          )
        })}
      </ul>
      <LoadMore
        hasMore={hasMore}
        nextPage={page + 1}
        newlyLoadedCount={newlyLoadedCount}
      />
    </>
  )
}
