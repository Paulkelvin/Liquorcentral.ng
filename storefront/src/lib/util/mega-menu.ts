import { HttpTypes } from "@medusajs/types"

export type MegaMenuCategoryGroup = {
  heading: HttpTypes.StoreProductCategory
  links: HttpTypes.StoreProductCategory[]
}

export type MegaMenuColumn = MegaMenuCategoryGroup[]

/**
 * 01_NAVIGATION_SPECIFICATION.md §10 — 3-4 labeled columns, each group
 * with a clear heading, capped around 30 links total. §11 is explicit
 * that the exact grouping (which categories nest under which column) is
 * "a merchandising decision, not an engineering one" — so this function
 * makes no assumption about which top-level category belongs with which
 * other one. It only does the mechanical, content-agnostic part:
 * distribute whatever top-level categories currently exist round-robin
 * across `columnCount` columns (ordered by their admin-configured rank),
 * one group per top-level category, that category's own children as its
 * group's links. This is the direct mechanism behind §28's "new
 * categories require zero navigation code changes" — as the category
 * count grows or shrinks, the same rule keeps distributing them without
 * this function (or any caller) needing to change.
 */
export function groupCategoriesForMegaMenu(
  topLevelCategories: HttpTypes.StoreProductCategory[],
  columnCount = 3
): MegaMenuColumn[] {
  const candidates = [...topLevelCategories]
    .filter((c) => !c.parent_category_id)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  if (candidates.length === 0) {
    return []
  }

  const resolvedColumnCount = Math.min(columnCount, candidates.length)
  const columns: MegaMenuColumn[] = Array.from(
    { length: resolvedColumnCount },
    () => []
  )

  candidates.forEach((category, index) => {
    const columnIndex = index % resolvedColumnCount
    columns[columnIndex].push({
      heading: category,
      links: category.category_children ?? [],
    })
  })

  return columns
}
