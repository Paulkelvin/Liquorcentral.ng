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
}

/**
 * 04_PRODUCT_LISTING_SPECIFICATION.md §13 — "Load More," not classic
 * pagination: `page` here means "how many pages are currently loaded"
 * (reflected in the URL), and every render returns every product from
 * the start through that many pages (`listProductsWithSort`'s
 * `cumulative` mode), so the grid never loses previously-shown items.
 */
export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  emptyStateFallbackHref,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  /** §21 — "nothing available right now" links to a sibling category/collection. */
  emptyStateFallbackHref?: string
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
    // §21 — a genuinely empty category/collection, distinct from a
    // facet-induced zero-result set (no facets are applied by this
    // route yet — see storefront/README.md's Milestone 9 section).
    return (
      <EmptyState
        title="Nothing available right now"
        description="Check back soon, or browse another category."
        action={
          emptyStateFallbackHref ? (
            <LocalizedClientLink
              href={emptyStateFallbackHref}
              className="inline-flex gap-2 items-center justify-center rounded-radius-md font-medium bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active px-4 py-2 text-body"
            >
              Shop Wine &amp; Spirits
            </LocalizedClientLink>
          ) : undefined
        }
      />
    )
  }

  const previousCount = Math.min((page - 1) * PRODUCT_LIMIT, count)
  const newlyLoadedCount = page > 1 ? products.length - previousCount : 0
  const hasMore = count > products.length

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
        aria-label={`${count} product${count === 1 ? "" : "s"}`}
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
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
