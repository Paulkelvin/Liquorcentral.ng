import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type ProductWithCatalog = HttpTypes.StoreProduct & {
  food_details?: unknown
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §19 (Trust Signals), §20 (Delivery
 * Information), §21 (Pickup Information) — stated plainly on every PDP,
 * "not assumed already seen on the homepage" (§4), catalog-specific.
 *
 * Delivery-area wording reflects the launch-scope business decision
 * approved 2026-07-19 (`DECISION_LOG.md`) — Food Central within Lagos
 * Island, Wine & Spirits across all of Lagos — a narrower launch
 * configuration than `BUSINESS_RULES.md`'s longer-term "nationwide"
 * framing for Wine & Spirits, not a reversal of it; this page states the
 * launch configuration, since that is what's actually true for a
 * customer ordering today.
 *
 * The alcohol return/refund policy remains a genuinely open business
 * decision — §19 is explicit that a Wine & Spirits PDP "states only what
 * is actually decided," so no returns claim renders for that catalog at
 * all here, rather than a fabricated placeholder. Food Central's returns
 * statement is a factual consequence of the cooked-to-order business
 * model (§19's own guidance), not an invented policy.
 */
export default function TrustDeliveryInfo({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const isFoodCentral = !!(product as ProductWithCatalog).food_details

  if (isFoodCentral) {
    return (
      <div className="flex flex-col gap-3 py-6" data-testid="trust-delivery-food">
        <Text as="p" size="caption">
          Cooked to order — not held stock.
        </Text>
        <Text as="p" size="caption">
          Delivered within Lagos Island. Same-day delivery is available
          during our operating hours, 9:00 AM – 11:00 PM.
        </Text>
        <Text as="p" size="caption">
          Pickup is also available, with a ready-time estimate shown at
          checkout.
        </Text>
        <Text as="p" size="caption" muted>
          As a cooked-to-order item, this dish is not eligible for return.
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 py-6" data-testid="trust-delivery-wine">
      <Text as="p" size="caption">
        Sold and delivered by LiquorCentral directly.
      </Text>
      <Text as="p" size="caption">
        Delivered across Lagos.
      </Text>
      <Text as="p" size="caption" muted>
        Alcohol orders require confirming you are 18 years or older.
      </Text>
    </div>
  )
}
