import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

/**
 * The other children of a category's parent — i.e. its siblings,
 * including itself. Needed because the store API will not expand
 * `parent_category.category_children` (verified: the field comes back
 * empty at that depth), so a leaf category cannot see its own siblings
 * from its own record. This reuses `listCategories`' force-cached
 * request with a trimmed field set rather than issuing a second
 * uncached lookup per page.
 */
export const listSiblingCategories = async (parentCategoryId: string) =>
  listCategories({
    fields: "handle,name,rank,parent_category_id",
    limit: 100,
  }).then((categories) =>
    categories
      .filter((category) => category.parent_category_id === parentCategoryId)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  )

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
