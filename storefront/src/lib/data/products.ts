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
 * The largest number of products this will ever pull into memory to sort
 * or filter locally. Only reached on a price sort or an option filter —
 * see `listProductsWithSort` for why those two cannot be delegated to
 * the API. At 100 per request that is 10 requests, all cached.
 *
 * If a catalog ever grows past this, the fix is to move price sorting
 * server-side (a Medusa capability gap today, see `sortProducts`), not
 * to raise this number indefinitely.
 */
const MAX_LOCALLY_SORTED_PRODUCTS = 1000
const API_PAGE_SIZE = 100

/**
 * Fetches every product matching `queryParams`, following the API's own
 * pagination rather than assuming one request covers the catalog.
 *
 * The first response carries the true total, so the remaining pages are
 * requested together instead of one after another.
 */
export async function listAllProducts({
  queryParams,
  countryCode,
}: {
  queryParams?: ProductListQueryParams
  countryCode: string
}) {
  const first = await listProducts({
    pageParam: 1,
    queryParams: { ...queryParams, limit: API_PAGE_SIZE },
    countryCode,
  })

  const total = Math.min(first.response.count, MAX_LOCALLY_SORTED_PRODUCTS)

  if (first.response.products.length >= total) {
    return { products: first.response.products, count: first.response.count }
  }

  const remainingPages = []
  for (
    let pageParam = 2;
    (pageParam - 1) * API_PAGE_SIZE < total;
    pageParam++
  ) {
    remainingPages.push(
      listProducts({
        pageParam,
        queryParams: { ...queryParams, limit: API_PAGE_SIZE },
        countryCode,
      })
    )
  }

  const rest = await Promise.all(remainingPages)

  return {
    products: [
      ...first.response.products,
      ...rest.flatMap((page) => page.response.products),
    ],
    count: first.response.count,
  }
}

/**
 * Resolves one "Load More" window.
 *
 * Two paths, because they have genuinely different costs:
 *
 * - **Price sorts and option filters** have to happen in memory — the
 *   Store API cannot order by calculated price (`sortProducts`' own
 *   comment) and option filtering is applied after the fetch. Sorting a
 *   partial set produces the wrong order, so this path pulls the whole
 *   matching set (bounded by `MAX_LOCALLY_SORTED_PRODUCTS`).
 * - **Everything else** — the default order and "newest" — the API can
 *   do itself, so this asks for exactly the window on screen and takes
 *   the total from the response.
 *
 * The previous implementation always fetched a single page of 100 and
 * then used `products.length` as the total. That silently capped every
 * listing at 100 items: past that, `count` equalled the number already
 * on screen, "Load More" concluded there was nothing left and
 * disappeared, and the rest of the catalog became unreachable. It also
 * meant a price sort only ever ordered the first 100 products.
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

  const windowStart = cumulative ? 0 : (page - 1) * limit
  const windowEnd = page * limit

  const needsLocalSort = sortBy === "price_asc" || sortBy === "price_desc"
  const needsLocalFilter = optionFilters.length > 0

  if (needsLocalSort || needsLocalFilter) {
    const { products, count } = await listAllProducts({
      queryParams: {
        ...queryParams,
        ...(needsLocalFilter ? { option_value_id: optionFilters } : {}),
      },
      countryCode,
    })

    const sortedProducts = sortProducts(products, sortBy)
    // The fetched set is the filtered set — an option filter is applied
    // by the API, so `products.length` and `count` agree unless the
    // catalog exceeded the local ceiling above.
    const filteredCount = Math.max(products.length, Math.min(count, MAX_LOCALLY_SORTED_PRODUCTS))

    return {
      response: {
        products: sortedProducts.slice(windowStart, windowEnd),
        count: filteredCount,
      },
      nextPage: filteredCount > windowEnd ? page + 1 : null,
      queryParams,
    }
  }

  /**
   * The API can order this itself, so ask for exactly the window being
   * shown. `pageParam: 1` with a window-sized limit yields offset 0 —
   * which is what cumulative "Load More" wants: every product from the
   * start through the current page, in one request.
   */
  const {
    response: { products, count },
  } = await listProducts({
    pageParam: cumulative ? 1 : page,
    queryParams: {
      ...queryParams,
      limit: cumulative ? windowEnd : limit,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  return {
    response: {
      products: sortedProducts,
      // Medusa's own total for the query — not the number of rows this
      // request happened to return, which is what made "Load More"
      // vanish at 100 items.
      count,
    },
    nextPage: count > windowEnd ? page + 1 : null,
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

/**
 * 06_CART_SPECIFICATION.md §7, §13 — re-validating a Wine & Spirits line
 * item's genuine available stock at cart view. `StoreProductVariant`'s
 * `inventory_quantity` is a computed field the Store API only resolves
 * when queried through `/store/products` with a `*variants` expansion
 * present alongside it (confirmed by direct testing) — the cart module's
 * own `items.variant` expansion never populates it, regardless of the
 * field string requested, because the cart route doesn't run the same
 * inventory-decoration step the products route does. This looks the
 * value up the same way the PDP already does (`listProducts`) rather than
 * inventing a new decoration path on the cart itself.
 */
export const getVariantInventoryMap = async (
  productIds: string[],
  countryCode: string
): Promise<Record<string, number>> => {
  const ids = Array.from(new Set(productIds))
  if (!ids.length) {
    return {}
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { id: ids, limit: ids.length },
  })

  const map: Record<string, number> = {}
  for (const product of response.products) {
    for (const variant of product.variants ?? []) {
      if (variant.id && typeof variant.inventory_quantity === "number") {
        map[variant.id] = variant.inventory_quantity
      }
    }
  }
  return map
}
