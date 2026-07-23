import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle, fields: "+categories.*" },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §27 — "descriptive, unique meta
  // title and description per product — never a templated string
  // identical across the catalog." The description falls back to the
  // title only when the product genuinely has no description yet (a
  // data-completeness gap, not something this page invents copy for).
  const title = `${product.title} — LiquorCentral`
  const description = product.description || product.title || "LiquorCentral"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle: params.handle,
      // §12/§13 — the wine/food fact sheet's data source, on top of the
      // starter's own default fields (pricing, variant options/images).
      fields:
        "+categories.*,+food_details.*,+wine_details.*",
    },
  }).then(({ response }) => response.products[0])

  // §24 — "a product genuinely not found... a graceful, plain-language
  // page... never a raw, dead-end error." A genuine pre-existing crash
  // bug, found via real click-through testing of this exact state: the
  // vendored starter called `getImagesForVariant(pricedProduct, ...)`
  // *before* this check, so a nonexistent handle threw
  // "Cannot read properties of undefined (reading 'images')" instead of
  // ever reaching `notFound()` — the graceful not-found page was
  // unreachable in practice. Fixed by checking first.
  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  // §27 — Product/Offer structured data, kept in sync with the page's own
  // displayed price/availability/currency rather than a separately
  // maintained copy.
  const cheapestVariant = pricedProduct.variants?.find(
    (v) => (v as { calculated_price?: { calculated_amount?: number } }).calculated_price
  ) as
    | (HttpTypes.StoreProductVariant & {
        calculated_price?: { calculated_amount: number; currency_code: string }
        inventory_quantity?: number
      })
    | undefined
  const anyVariantAvailable = pricedProduct.variants?.some((v) => {
    const variant = v as HttpTypes.StoreProductVariant & {
      inventory_quantity?: number
    }
    if (!variant.manage_inventory) return true
    if (variant.allow_backorder) return true
    return (variant.inventory_quantity || 0) > 0
  })
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    description: pricedProduct.description || pricedProduct.title,
    image: pricedProduct.thumbnail ? [pricedProduct.thumbnail] : undefined,
    offers: cheapestVariant?.calculated_price
      ? {
          "@type": "Offer",
          priceCurrency: cheapestVariant.calculated_price.currency_code?.toUpperCase(),
          price: (cheapestVariant.calculated_price.calculated_amount / 100).toFixed(2),
          availability: anyVariantAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}
