import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CategoriesSidebar from "@modules/store/components/refinement-list/categories-sidebar"
import RefinementListSkeleton from "@modules/store/components/refinement-list/skeleton"
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

  return (
    <div
      className="flex flex-col gap-6 small:flex-row small:items-start small:gap-10 py-6 ds-container"
      data-testid="category-container"
    >
      {/* Its own boundary — see CategoriesSidebar's own comment for why
          this can't share the grid's Suspense (or worse, block on
          nothing at all) any longer. */}
      <Suspense fallback={<RefinementListSkeleton />}>
        <CategoriesSidebar />
      </Suspense>
      <div className="w-full min-w-0">
        {/* Title left, sort right, on one baseline. */}
        <div className="mb-3 flex items-center justify-between gap-3">
          {/* Same editorial title scale as the category listings — this
              page was still running the full 31px heading. */}
          <h1
            className="min-w-0 truncate text-[22px] font-semibold md:text-[28px]"
            data-testid="store-page-title"
          >
            Liquor
          </h1>
          <SortProducts sortBy={sort} data-testid="sort-by-container" />
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            excludeFoodCentral
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
