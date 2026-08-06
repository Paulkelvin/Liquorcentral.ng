import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { demoImageFor } from "@lib/util/demo-product-images"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

/**
 * Deliberately not statically generated (no `generateStaticParams`),
 * despite the catalog being small enough to make that tempting.
 *
 * The shared `(main)` layout reads `cookies()` on every request (the age
 * gate, `02_HOMEPAGE_SPECIFICATION.md` §24) — a dynamic API. Pairing that
 * with a page that Next prerenders via `generateStaticParams` is the
 * documented `DYNAMIC_SERVER_USAGE` bailout condition, and in production
 * it surfaced as every `/products/*` URL returning a bare 500 (confirmed
 * from the Railway runtime logs: `digest: 'DYNAMIC_SERVER_USAGE'`) while
 * the *dynamic* sibling routes under the same layout — `/store`,
 * `/categories/*`, `/search` — served correctly throughout. Rendering
 * this route the same way those already-working routes render removes
 * the mismatch rather than working around it.
 */
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

  // Same `fields` string the page body's own `listProducts` call below
  // uses (deliberately — the two used to differ, so Next's fetch
  // request memoization couldn't recognize them as the same request and
  // this page paid for two separate `/store/products` round trips per
  // visit instead of one).
  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,+categories.*,+wine_details.*,+food_details.*",
    },
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

  /**
   * **The null check has to come before `getImagesForVariant`, and this
   * ordering was a live 500 on production.**
   *
   * It used to read the images first. When the lookup returned nothing,
   * `getImagesForVariant` dereferenced `product.variants` on `undefined` and
   * threw `TypeError: Cannot read properties of undefined (reading 'images')`
   * — so a product that simply did not exist produced a **500 Internal Server
   * Error** instead of a 404, and, worse, so did any condition that left the
   * lookup empty. Every `/products/*` URL on production was returning 500
   * while `/categories/*` correctly returned 404 for a bad handle; that
   * asymmetry is what identified this line.
   *
   * A 404 here is not merely tidier than a 500, it is diagnostic: a 500 says
   * "the code broke" and hides everything, a 404 says "the lookup came back
   * empty" and points at data or configuration.
   */
  if (!pricedProduct) {
    // Named deliberately. Production was returning 500 for *every* product
    // URL while the same build against the same backend returned 200 here,
    // so the remaining variable is that environment's data or configuration.
    // A silent 404 would hide that; this puts the handle and region in the
    // server log so the next occurrence is one line to diagnose.
    console.error(
      `Product lookup returned nothing: handle="${params.handle}" ` +
        `country="${params.countryCode}" region="${region.id}"`
    )
    notFound()
  }

  /**
   * `demoImageFor` (see `demo-product-images.ts`) is what the listing
   * cards use in place of real (currently mismatched-brand) product
   * photography — but until this fix it was *only* applied there.
   * Landing on this page after clicking a card meant the real
   * `product.images` took over instead, a different bottle than the one
   * just clicked: exactly the "I clicked a product and saw a different
   * image" report. Applying the same override here keeps the card and
   * the page the customer lands on in agreement — still not the
   * product's real photography (that's the catalog-photography gap
   * `demo-product-images.ts` documents and Paul already has), but no
   * longer a second, contradicting mismatch layered on top of it.
   */
  const demo = demoImageFor(pricedProduct.handle)
  const images = demo
    ? [{ id: `demo-${pricedProduct.handle}`, url: demo.src } as HttpTypes.StoreProductImage]
    : getImagesForVariant(pricedProduct, selectedVariantId)

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}
