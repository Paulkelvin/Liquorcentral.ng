import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"

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
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-body text-text-secondary mb-6">
          Related products
        </span>
        {/* Was a fixed `text-heading-2` (31px) at every width — this
            sentence wrapped to three heavy lines on a phone. Same scale
            step as the product title above it: smaller on mobile, full
            size from `small:` up. */}
        <p className="!text-[22px] leading-snug text-text-primary max-w-lg small:!text-[31px] small:leading-[1.2]">
          You might also want to check out these products.
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
