import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortProducts, {
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"

  // Fetched here, server-side, rather than by RefinementList itself — see
  // that component's own comment on the client-side fetch this replaces.
  const categories = await listCategories({
    fields: "handle,name,parent_category_id",
    limit: 100,
  })
    .then((cats) => cats.filter((c) => !c.parent_category_id))
    .catch(() => [])

  return (
    <div
      className="flex flex-col gap-6 small:flex-row small:items-start small:gap-10 py-6 ds-container"
      data-testid="category-container"
    >
      <RefinementList categories={categories} />
      <div className="w-full min-w-0">
        {/* Title left, sort right, on one baseline. */}
        <div className="mb-3 flex items-center justify-between gap-3">
          {/* Same editorial title scale as the category listings — this
              page was still running the full 31px heading. */}
          <h1
            className="min-w-0 truncate text-[22px] font-semibold md:text-[28px]"
            data-testid="store-page-title"
          >
            All products
          </h1>
          <SortProducts sortBy={sort} data-testid="sort-by-container" />
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
