import { HttpTypes } from "@medusajs/types"

type LineItemWithCatalog = HttpTypes.StoreCartLineItem & {
  product?: HttpTypes.StoreProduct & {
    food_details?: unknown
    wine_details?: unknown
  }
  variant?: HttpTypes.StoreProductVariant & {
    inventory_quantity?: number
  }
}

export type GiftWrapMetadata = { gift_wrap_for?: string }

/**
 * 06_CART_SPECIFICATION.md §5, §6 — "line items are grouped by fulfillment
 * leg... not interleaved in add-order." Uses the same `food_details`
 * presence check established in Product Listing/Search/Product Details —
 * no new backend field, no new module. Reads from the line item's own
 * `product` (populated by `retrieveCart`'s `*items.product` expansion),
 * not `variant.product` — the two are separate expansions and only the
 * former was ever requested, confirmed by direct testing against a real
 * cart (the latter is always empty of linked-module fields here).
 */
export function isFoodCentralItem(item: HttpTypes.StoreCartLineItem): boolean {
  return !!(item as LineItemWithCatalog).product?.food_details
}

/**
 * §15 — Gift Wrap is its own distinct line item (metadata-linked to the
 * product line it wraps via `gift_wrap_for`, since Medusa has no native
 * "line item add-on" relationship), not folded invisibly into the
 * product's price. This separates real product lines from their
 * associated gift-wrap lines so each renders nested under the item it
 * belongs to, per §15's "shown as its own distinct, priced line within
 * the relevant group."
 */
export function splitGiftWrapLines(items: HttpTypes.StoreCartLineItem[]) {
  const productLines: HttpTypes.StoreCartLineItem[] = []
  const giftWrapByParent = new Map<string, HttpTypes.StoreCartLineItem>()

  for (const item of items) {
    const giftWrapFor = (item.metadata as GiftWrapMetadata | null)?.gift_wrap_for
    if (giftWrapFor) {
      giftWrapByParent.set(giftWrapFor, item)
    } else {
      productLines.push(item)
    }
  }

  return { productLines, giftWrapByParent }
}

/**
 * §17 — whether a line item's quantity is genuinely stock-capped at all
 * (Wine & Spirits with tracked inventory and no backorder). Food Central,
 * and any variant with backorder allowed or inventory untracked, is never
 * capped by a stock count (§7).
 */
export function isStockManaged(item: HttpTypes.StoreCartLineItem): boolean {
  const variant = (item as LineItemWithCatalog).variant
  return !!variant?.manage_inventory && !variant.allow_backorder
}

/**
 * §17 — Wine & Spirits' genuine available stock, re-validated at cart view
 * (§12). `inventory_quantity` is a Store API *computed* field that the
 * cart module's own `items.variant` expansion never populates (confirmed
 * by direct testing — it only resolves via `/store/products`'s decoration
 * step), so the real count must be looked up separately
 * (`getVariantInventoryMap`) and passed in here as `knownQuantity`.
 * Returns `undefined` — uncapped — whenever the item isn't stock-managed
 * at all, or the real count genuinely isn't known yet; it deliberately
 * never defaults to 0, since an unknown count is not the same claim as a
 * confirmed zero and must never be presented as one.
 */
export function getAvailableStock(
  item: HttpTypes.StoreCartLineItem,
  knownQuantity?: number
): number | undefined {
  if (!isStockManaged(item)) {
    return undefined
  }
  return knownQuantity
}

/**
 * 07_CHECKOUT_SPECIFICATION.md §8, §11 — the authoritative Lagos-only
 * eligibility check for Food Central, run against a real address for the
 * first time (the cart could only state the rule informally, §10). The
 * exact geo-zone definition — postal-pattern zones vs. true radius
 * geofencing — is an explicitly open business decision this document
 * doesn't invent (§11); this is a plain-language proxy (does the
 * customer's own state/city name Lagos) honest enough to surface the
 * conflict without pretending to a geographic precision nobody has
 * approved yet.
 */
export function isLagosAddress(
  address: Pick<HttpTypes.StoreCartAddress, "province" | "city"> | null | undefined
): boolean {
  if (!address) {
    return false
  }
  const haystack = `${address.province ?? ""} ${address.city ?? ""}`.toLowerCase()
  return haystack.includes("lagos")
}

/** §8 — whether any Food Central item exists anywhere in the cart. */
export function hasFoodCentralItems(items: HttpTypes.StoreCartLineItem[]): boolean {
  return items.some((item) => isFoodCentralItem(item))
}

/**
 * §9 — "pickup leads to a ready-time estimate instead." This checkout's
 * shipping-method model is one method for the whole cart (see
 * `06_CART_SPECIFICATION.md`/checkout README notes on why true per-group
 * selection isn't built yet), so detecting pickup by the option's own name
 * is a pragmatic proxy rather than reading a dedicated fulfillment-set-type
 * field the cart's default shipping-method expansion doesn't carry.
 */
export function isPickupShippingMethod(
  shippingMethod: { name?: string | null } | null | undefined
): boolean {
  return !!shippingMethod?.name?.toLowerCase().includes("pickup")
}

/**
 * §8, §11 — the address/eligibility blocking condition: a real conflict
 * exists only while all three hold — the order actually has a Food Central
 * item, the address genuinely doesn't look like Lagos, and the customer
 * hasn't already resolved it by choosing pickup. Reused identically by the
 * conflict banner (to decide whether to show) and the payment step (to
 * decide whether to allow placing the order) so the two can never disagree.
 */
export function hasUnresolvedDeliveryConflict(cart: {
  items?: HttpTypes.StoreCartLineItem[] | null
  shipping_address?: Pick<HttpTypes.StoreCartAddress, "province" | "city"> | null
  shipping_methods?: { name?: string | null }[] | null
}): boolean {
  if (!hasFoodCentralItems(cart.items ?? [])) {
    return false
  }
  if (isLagosAddress(cart.shipping_address)) {
    return false
  }
  const activeMethod = cart.shipping_methods?.at(-1)
  return !isPickupShippingMethod(activeMethod)
}

function lineItemAmount(item: HttpTypes.StoreCartLineItem): number {
  return item.total ?? item.unit_price * item.quantity
}

/**
 * §5 — "a per-group subtotal appears beneath each fulfillment-leg group,
 * in addition to the cart-wide total" — includes each product line's own
 * associated gift-wrap line, so the group subtotal reflects everything
 * actually attributed to that catalog.
 */
export function groupSubtotal(
  productLines: HttpTypes.StoreCartLineItem[],
  giftWrapByParent: Map<string, HttpTypes.StoreCartLineItem>
): number {
  return productLines.reduce((sum, item) => {
    const giftWrap = giftWrapByParent.get(item.id)
    return sum + lineItemAmount(item) + (giftWrap ? lineItemAmount(giftWrap) : 0)
  }, 0)
}
