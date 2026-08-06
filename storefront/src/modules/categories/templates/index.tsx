import { notFound } from "next/navigation"
import { Suspense } from "react"
import clsx from "clsx"

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
  siblingCategories,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  /** Only populated for a leaf category — see the page's own comment. */
  siblingCategories?: HttpTypes.StoreProductCategory[]
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

  // Children when this category has them, siblings when it is a leaf.
  const pills = category.category_children?.length
    ? category.category_children
    : siblingCategories ?? []
  const parentName = category.parent_category?.name ?? category.name

  const breadcrumbSegments = [
    { label: "Home", href: "/" },
    // There is no route for a bare `/categories` index — only
    // `/categories/[handle]` exists — so this dead-ended in a 404 for
    // every category page's breadcrumb. `/store` is the site's
    // established "everything, unfiltered" destination (the same one
    // "Shop by category"'s own "View all" link uses on the homepage).
    { label: "Wine & Spirits", href: "/store" },
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
        <div className="mb-3 flex items-center justify-between gap-3">
          {/* Editorial scale, not the display scale: 25/31px read as a
              magazine cover line above a grid of small cards. Off the
              1.25 modular scale on purpose — 20px is too quiet for a
              page title and 25px too loud. */}
          <h1
            className="min-w-0 truncate text-[22px] font-semibold md:text-[28px]"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          <SortProducts sortBy={sort} data-testid="sort-by-container" />
        </div>
        {category.description && (
          <div className="mb-3 text-body">
            <p>{category.description}</p>
          </div>
        )}
        {/* Subcategories as a single scrollable row of pills. Stacked
            vertically they pushed the products themselves well below the
            fold on a phone — seven children cost seven rows before a
            customer saw a single item. The negative margin lets the row
            bleed to the viewport edge so the last pill reads as
            scrollable rather than clipped. */}
        {!!pills.length && (
          <nav
            aria-label={`${
              category.category_children?.length ? category.name : parentName
            } subcategories`}
            className="mb-5 -mx-4 px-4 small:mx-0 small:px-0"
          >
            <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {pills.map((c) => {
                const isActive = c.handle === category.handle
                return (
                  <li key={c.id} className="shrink-0">
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        // A hairline chip on the page's own surface, not
                        // a filled grey oval — a row of solid fills read
                        // as seven competing buttons above the grid.
                        "inline-flex min-h-[36px] items-center rounded-radius-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-standard ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                        isActive
                          ? // Ink rather than the green tint the spec
                            // offered as its first option: green on
                            // interactive-tint measures 4.38:1, under
                            // AA's 4.5:1 floor for 12px text. Ink is the
                            // spec's own second option and clears it at
                            // 16.1:1.
                            "border-ink-900 bg-ink-900 text-surface-elevated"
                          : "border-divider bg-surface-elevated text-text-secondary hover:border-text-muted hover:text-text-primary"
                      )}
                      data-testid="subcategory-pill"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                )
              })}
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
            emptyStateFallbackHref="/store"  // no route exists for a bare /categories index
          />
        </Suspense>
      </div>
      </div>
    </>
  )
}
