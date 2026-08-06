import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"

  return (
    <>
      <Breadcrumbs
        segments={[{ label: "Home", href: "/" }, { label: collection.title }]}
      />
      <div className="flex flex-col gap-6 small:flex-row small:items-start small:gap-10 py-6 ds-container">
      <RefinementList hideOptionsPicker />
      <div className="w-full min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-heading-2 font-semibold">{collection.title}</h1>
          <SortProducts sortBy={sort} data-testid="sort-by-container" />
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            emptyStateFallbackHref="/store"  // no route exists for a bare /categories index
          />
        </Suspense>
      </div>
      </div>
    </>
  )
}
