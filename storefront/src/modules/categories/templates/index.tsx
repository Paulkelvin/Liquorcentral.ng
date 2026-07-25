import { notFound } from "next/navigation"
import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "featured"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    { label: "Wine & Spirits", href: "/categories" },
    ...parents
      .slice()
      .reverse()
      .map((parent) => ({
        label: parent.name,
        href: `/categories/${parent.handle}`,
      })),
    { label: category.name },
  ]

  return (
    <>
      <Breadcrumbs segments={breadcrumbSegments} />
      <div
        className="flex flex-col gap-6 small:flex-row small:items-start small:gap-10 py-6 ds-container"
        data-testid="category-container"
      >
      <RefinementList hideOptionsPicker />
      <div className="w-full min-w-0">
        {/* Title and sort share one row at every width — stacking them
            on mobile cost a whole band of vertical space above the grid.
            `min-w-0` lets the heading truncate rather than wrap the sort
            control onto its own line. */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1
            className="min-w-0 truncate text-heading-3 font-semibold small:text-heading-2"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          <SortProducts sortBy={sort} data-testid="sort-by-container" />
        </div>
        {category.description && (
          <div className="mb-4 text-body">
            <p>{category.description}</p>
          </div>
        )}
        {/* Subcategories as a single scrollable row of pills. Stacked
            vertically they pushed the products themselves well below the
            fold on a phone — seven children cost seven rows before a
            customer saw a single item. The negative margin lets the row
            bleed to the viewport edge so the last pill reads as
            scrollable rather than clipped. */}
        {!!category.category_children?.length && (
          <nav
            aria-label={`${category.name} subcategories`}
            className="mb-5 -mx-4 px-4 small:mx-0 small:px-0"
          >
            <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {category.category_children.map((c) => (
                <li key={c.id} className="shrink-0">
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="inline-flex min-h-[36px] items-center rounded-radius-full bg-ink-100 px-3 text-xs font-medium text-text-secondary transition-colors duration-standard ease-in-out hover:bg-ink-900 hover:text-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    data-testid="subcategory-pill"
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            emptyStateFallbackHref="/categories"
          />
        </Suspense>
      </div>
      </div>
    </>
  )
}
