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
    queryParams: { handle, fields: "+categories.*,+wine_details.*,+food_details.*" },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §27 — a descriptive, unique meta
  // description per product, never a templated string identical across
  // the catalog; falls back to the product's own description when no
  // catalog-specific fact is available to summarize.
  const catalogProduct = product as HttpTypes.StoreProduct & {
    wine_details?: { region?: string | null; producer?: string | null } | null
    food_details?: { prep_time_minutes?: number | null } | null
  }
  const description =
    catalogProduct.wine_details?.region || catalogProduct.wine_details?.producer
      ? `${product.title} — ${[catalogProduct.wine_details.producer, catalogProduct.wine_details.region]
          .filter(Boolean)
          .join(", ")}. Order from LiquorCentral.`
      : catalogProduct.food_details?.prep_time_minutes
      ? `${product.title} — cooked to order, ready in ~${catalogProduct.food_details.prep_time_minutes} min. Order from LiquorCentral.`
      : `${product.title} — order from LiquorCentral.`

  return {
    title: `${product.title} | LiquorCentral`,
    description,
    openGraph: {
      title: `${product.title} | LiquorCentral`,
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
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,+categories.*,+wine_details.*,+food_details.*",
    },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}
