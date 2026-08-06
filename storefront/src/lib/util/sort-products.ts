import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices, `id` breaking
    // any tie. `listProductsWithSort`'s cumulative "Load More" re-fetches
    // and re-sorts the *entire* list fresh on every request rather than
    // appending pages — deliberately, so a shared `?page=3` URL still
    // renders correctly (its own comment). Without a deterministic
    // tiebreaker, two products priced identically had no guaranteed
    // relative order beyond whatever the database happened to return
    // that particular request — which is not guaranteed to repeat between
    // one fetch and the next. A product could silently swap pagination
    // windows between "Load More" clicks: reappearing on a page it was
    // already shown on while another quietly drops out. `id` is stable
    // and unique, so identically-priced products always land in the same
    // relative order regardless of what order the database handed them
    // back in.
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      if (diff !== 0) {
        return sortBy === "price_asc" ? diff : -diff
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      const diff =
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      if (diff !== 0) {
        return diff
      }
      // Same tiebreaker rationale as price_asc/price_desc above — two
      // products created in the same second need a deterministic order
      // too.
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    })
  }

  // "featured" (04_PRODUCT_LISTING_SPECIFICATION.md §11) intentionally
  // has no *meaningful* order here — see sort-products/index.tsx's own
  // comment on why no merchandising-rank field exists yet to sort by —
  // but it still needs a *deterministic* one, and used to have none at
  // all: this is this platform's default sort, so every category,
  // collection and search listing paginates under it unless a customer
  // picks something else. The same tie problem the other three branches
  // above were just given a fix for applied to every product here, all
  // the time, since nothing was breaking ties to begin with. Sorting by
  // `id` doesn't fabricate a merchandising rank — it's still an
  // arbitrary order, "honest" in the same sense the no-op was — it just
  // makes that arbitrary order the *same* arbitrary order on every
  // request, which is what "Load More" needs to avoid reshuffling
  // pagination windows between clicks.
  if (sortBy === "featured") {
    sortedProducts.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  }

  return sortedProducts
}
