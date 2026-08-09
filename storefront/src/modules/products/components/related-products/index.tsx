import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"
import { CuratedMark } from "@modules/common/components/curated-mark"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false
  // The card's catalog-dependent bits (Food Central prep-time fact, and
  // which accent its quick-add CTA takes) resolve off `food_details`;
  // without asking for it here every dish in this rail would render as a
  // Wine & Spirits card. Additive — `listProducts` merges this on top of
  // its base field set rather than replacing it.
  queryParams.fields = "+food_details.*"

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      {/*
       * The site's own section-header pattern — gold mark, heading, one
       * line of subtitle, all left-aligned — the same shape "Featured
       * collection", "Shop by category" and "Today's Menu" already use.
       *
       * This was the one section still carrying the Medusa starter's
       * centred boilerplate ("You might also want to check out these
       * products."), set at 31px, which made a generic sentence the
       * largest and only centred text on the page — visually louder than
       * the product the customer actually came for, and the single place
       * on the site where a section announced itself that way.
       *
       * It also puts the Accent token on a commerce surface for the first
       * time: gold's documented job is "curated selections", and a
       * hand-scoped pairing rail is exactly that, but every gold mark on
       * the site sat on the homepage, blog or About page.
       */}
      <div className="mb-10 flex flex-col gap-3 small:mb-12">
        <CuratedMark />
        <h2 className="font-display text-[22px] leading-snug text-text-primary small:text-[31px] small:leading-[1.2]">
          Goes well with this
        </h2>
        <p className="max-w-[48ch] text-body text-text-secondary">
          From the same shelf, chosen by us.
        </p>
      </div>

      <ul className={PRODUCT_GRID}>
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
