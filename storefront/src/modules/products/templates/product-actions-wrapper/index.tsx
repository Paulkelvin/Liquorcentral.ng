import { getGiftWrapProduct, listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  countryCode,
}: {
  id: string
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [product, giftWrapProduct] = await Promise.all([
    listProducts({
      queryParams: { id: [id], fields: "+food_details.*" },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    getGiftWrapProduct(countryCode),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      giftWrapProduct={giftWrapProduct}
    />
  )
}
