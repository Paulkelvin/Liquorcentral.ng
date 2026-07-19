"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          ...queryParams,
          // Additive, not a replacement: a caller-supplied `fields` (e.g.
          // FoodCentralSpotlight's "+food_details.*") used to silently
          // override this default and drop pricing/variant data from the
          // response, which broke `getProductPrice` for any caller that
          // asked for extra fields. Every caller gets the base field set
          // plus whatever extra fields it asked for.
          fields: [
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags",
            queryParams?.fields,
          ]
            .filter(Boolean)
            .join(","),
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
  cumulative = false,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  /**
   * 04_PRODUCT_LISTING_SPECIFICATION.md §13 — "Load More" appends to the
   * existing grid rather than replacing one page window with another.
   * When true, `page` means "how many pages are currently loaded," and
   * this returns every product from the start through that many pages
   * (re-fetched and re-sliced on every request, not cached client-side
   * state) — so a shared/reloaded URL with `?page=3` server-renders
   * pages 1–3 concatenated, satisfying §26's "first-loaded state must be
   * complete, server-rendered content."
   */
  cumulative?: boolean
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const filteredCount = products.length

  const windowStart = cumulative ? 0 : (page - 1) * limit
  const windowEnd = cumulative ? page * limit : page * limit

  const nextPage = filteredCount > windowEnd ? page + 1 : null

  const paginatedProducts = sortedProducts.slice(windowStart, windowEnd)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §16 — Gift Wrap as a v1-appropriate,
 * order-time add-on (`PRODUCT_CATALOG.md`'s existing recommendation: a
 * priced line item, not a product attribute). No such product has ever
 * been seeded in this catalog (the same standing zero-product state every
 * prior milestone has documented), so this deliberately returns `null`
 * today and the add-on renders nothing — the same graceful-absence
 * discipline `02_HOMEPAGE_SPECIFICATION.md`'s Curated Collections/Food
 * Central Spotlight already established, not a broken or placeholder
 * feature. Looked up by the well-known handle `gift-wrap`, so creating one
 * real product with that handle in the Admin is the only step needed to
 * light this feature up — no code change required.
 */
export const getGiftWrapProduct = async (
  countryCode: string
): Promise<HttpTypes.StoreProduct | null> => {
  const { response } = await listProducts({
    countryCode,
    queryParams: { handle: "gift-wrap", limit: 1 },
  })

  return response.products[0] ?? null
}
