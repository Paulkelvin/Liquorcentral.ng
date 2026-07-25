import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortProducts, {
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
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
      <RefinementList />
      <div className="w-full min-w-0">
        {/* Title left, sort right, on one baseline. */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-heading-2 font-semibold" data-testid="store-page-title">
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
