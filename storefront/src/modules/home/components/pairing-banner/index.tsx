import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { PAIRING_SLIDES, type PairingSlide } from "./pairings"
import PairingCarousel, { type ResolvedPairing } from "./pairing-carousel"

type PricedVariant = HttpTypes.StoreProductVariant & {
  calculated_price?: { calculated_amount?: number | null } | null
  inventory_quantity?: number
}

function purchasableVariant(
  product?: HttpTypes.StoreProduct
): PricedVariant | undefined {
  const variants = (product?.variants ?? []) as PricedVariant[]
  // A pairing adds without asking anything, so it can only use a product
  // whose variant is unambiguous. A multi-variant product would mean
  // silently choosing a size on the customer's behalf.
  if (variants.length !== 1) {
    return undefined
  }
  const variant = variants[0]
  if (typeof variant.calculated_price?.calculated_amount !== "number") {
    return undefined
  }
  if (
    variant.manage_inventory &&
    !variant.allow_backorder &&
    (variant.inventory_quantity || 0) < 1
  ) {
    return undefined
  }
  return variant
}

/**
 * "The Perfect Pairing" — a two-slide editorial banner between the Featured
 * Collection and Today's Menu, pairing one Food Central dish with one Wine &
 * Spirits bottle and adding both in a single action.
 *
 * **This is the only place on the homepage that spans both catalogs in one
 * transaction**, which is the point: `PRODUCT_BLUEPRINT.md`'s whole reason for
 * running a kitchen next to a bottle shop is that the two are bought together.
 *
 * ---
 *
 * **Every price shown is computed here, from the exact variants the button is
 * about to add.** Nothing is hardcoded, in this file or in `pairings.ts`. The
 * brief supplied fixed figures (₦53,500 and ₦113,000); neither matched any
 * real combination in the catalog, and a CTA that announces one total while
 * adding another is a misleading price representation. See `pairings.ts` for
 * the arithmetic and the two open decisions this raised.
 *
 * **A slide whose products are missing or unbuyable does not render.** Not a
 * disabled button, not a placeholder price — it is simply absent, because a
 * pairing that cannot be added is an advertisement for something the shop
 * cannot sell. If that leaves fewer than one slide, the whole section is
 * absent too (§21: a section fails on its own, never taking the page with it).
 */
export default async function PairingBanner({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const handles = Array.from(
    new Set(PAIRING_SLIDES.flatMap((s) => [s.dishHandle, s.drinkHandle]))
  )

  const { response } = await listProducts({
    regionId: region.id,
    queryParams: {
      handle: handles,
      limit: handles.length,
      fields: "*variants.calculated_price",
    },
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[] } }))

  const byHandle = new Map(
    (response.products ?? []).map((p) => [p.handle, p])
  )

  const resolve = (slide: PairingSlide): ResolvedPairing | null => {
    const dish = byHandle.get(slide.dishHandle)
    const drink = byHandle.get(slide.drinkHandle)
    const dishVariant = purchasableVariant(dish)
    const drinkVariant = purchasableVariant(drink)

    if (!dish || !drink || !dishVariant || !drinkVariant) {
      return null
    }

    const total =
      (dishVariant.calculated_price!.calculated_amount as number) +
      (drinkVariant.calculated_price!.calculated_amount as number)

    return {
      ...slide,
      variantIds: [dishVariant.id, drinkVariant.id],
      // Whole naira, narrow symbol: "₦63,500", not "NGN 63,500.00". These
      // totals run to five and six figures where trailing kobo is noise,
      // and the price shares a ~110px row with the CTA on a small phone —
      // the three-letter code alone consumed most of it and pushed the
      // button off the card.
      totalLabel: convertToLocale({
        amount: total,
        currency_code: region.currency_code,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      // Named in the accessible label so a screen-reader user knows what a
      // single "Add pairing" press is about to put in their cart.
      itemsLabel: `${dish.title} and ${drink.title}`,
    }
  }

  const slides = PAIRING_SLIDES.map(resolve).filter(
    (s): s is ResolvedPairing => s !== null
  )

  if (slides.length === 0) {
    return null
  }

  return <PairingCarousel slides={slides} countryCode={countryCode} />
}
