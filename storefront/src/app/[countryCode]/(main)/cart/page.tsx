import { sdk } from "@lib/config"
import { retrieveCart } from "@lib/data/cart"
import { getAuthHeaders } from "@lib/data/cookies"
import { retrieveCustomer } from "@lib/data/customer"
import { getGiftWrapProduct, getVariantInventoryMap } from "@lib/data/products"
import CartTemplate from "@modules/cart/templates"
import { isFoodCentralItem, isStockManaged } from "@lib/util/cart-fulfillment"
import { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * §5, §6, §15 — the linked-module fields (food_details/wine_details, for
 * fulfillment-group grouping) and gift-wrap metadata this page's grouping
 * and add-on logic depend on, additive to the app-wide default fields
 * string (`retrieveCart`'s own default replaces rather than merges, so
 * the full set has to be spelled out here).
 */
const CART_FIELDS =
  "*items, *region, *items.product, +items.product.food_details.*, +items.product.wine_details.*, *items.variant, *items.thumbnail, *items.metadata, +items.total, +items.original_total, *promotions, +shipping_methods.name"

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * §13 — a stock auto-adjustment discovered at cart view is a genuine
 * write, but it's happening as a side effect of rendering this page, not
 * from a Server Action. Next.js explicitly forbids `revalidateTag` during
 * render (confirmed by direct testing — it throws), so this calls the SDK
 * directly rather than the cache-tag-revalidating `updateLineItem` used by
 * every real user-initiated cart action, and takes the corrected cart
 * straight from the update response (already shaped by `CART_FIELDS`)
 * instead of re-fetching through the — now stale until a real mutation
 * revalidates it — `carts` cache tag.
 */
async function adjustLineItemQuantity(cartId: string, lineId: string, quantity: number) {
  const headers = { ...(await getAuthHeaders()) }
  const { cart } = await sdk.store.cart.updateLineItem(
    cartId,
    lineId,
    { quantity },
    { fields: CART_FIELDS },
    headers
  )
  return cart
}

export default async function Cart({ params }: Props) {
  const { countryCode } = await params

  let cart = await retrieveCart(undefined, CART_FIELDS).catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  if (!cart?.items?.length) {
    return <CartTemplate cart={cart} customer={customer} />
  }

  // §7, §13, §17 — re-validate Wine & Spirits' genuine available stock at
  // cart view (time has passed since add-to-cart, §12). `inventory_quantity`
  // isn't populated by the cart's own field expansion (see
  // `getVariantInventoryMap`'s doc comment), so it's looked up separately.
  const stockManagedItems = cart.items.filter(
    (item) => !isFoodCentralItem(item) && isStockManaged(item)
  )
  const stockByVariantId = await getVariantInventoryMap(
    stockManagedItems.map((item) => item.product_id).filter((id): id is string => !!id),
    countryCode
  )

  const notices: string[] = []
  let workingCart: HttpTypes.StoreCart = cart
  for (const item of stockManagedItems) {
    const available = item.variant_id ? stockByVariantId[item.variant_id] : undefined
    if (available == null || item.quantity <= available) {
      continue
    }
    if (available > 0) {
      // §13 — auto-adjust down to the largest amount still genuinely
      // purchasable. `available === 0` is handled separately below:
      // Medusa's own line-item update deletes the line item outright when
      // quantity hits zero (confirmed by direct testing), which would
      // silently remove it — exactly what §12/§13 forbid while any state
      // short of "the customer chose to remove this" applies. Zero-available
      // items are left with their quantity untouched and only labeled
      // unavailable in place (via `isItemUnavailable` client-side), never
      // quantity-adjusted.
      workingCart = await adjustLineItemQuantity(workingCart.id, item.id, available)
      notices.push(
        `${item.product_title}: quantity adjusted to ${available} (the largest amount currently available) — availability changed since this was added.`
      )
    } else {
      notices.push(
        `${item.product_title} is currently out of stock — please remove it or check back later.`
      )
    }
  }
  cart = workingCart

  const giftWrapProduct = await getGiftWrapProduct(countryCode)
  const giftWrapVariant = giftWrapProduct?.variants?.[0]
  const giftWrap =
    giftWrapVariant?.id && typeof giftWrapVariant.calculated_price?.calculated_amount === "number"
      ? {
          variantId: giftWrapVariant.id,
          price: giftWrapVariant.calculated_price.calculated_amount,
        }
      : undefined

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      giftWrap={giftWrap}
      stockByVariantId={stockByVariantId}
      notices={notices}
    />
  )
}
