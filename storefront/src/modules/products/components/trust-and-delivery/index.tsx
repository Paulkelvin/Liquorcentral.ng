import { CheckCircleSolid, MapPin, ShieldCheck, TruckFast } from "@medusajs/icons"
import { Heading, Text } from "@modules/common/components/ui"

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §19–§21 — Trust Signals, Delivery
 * Information, and Pickup Information, stated plainly on every PDP rather
 * than assumed already seen on the homepage (§4, §20). Every statement
 * here is honest by construction (§1, §19): no fabricated urgency, no
 * exaggerated claim, and the alcohol return policy is deliberately left
 * unstated (still an open business decision, `PROJECT_STATUS.md`) rather
 * than invented — Food Central's return statement is stated because it is
 * a factual consequence of the "cooked to order" business model, not an
 * open question.
 *
 * Delivery scope reflects Paul's most recent, specific launch-scope
 * decision (`DECISION_LOG.md`, "Batch of business decisions" entry) —
 * Wine & Spirits across all of Lagos, Food Central within Lagos Island —
 * rather than `BUSINESS_RULES.md`'s older "nationwide" framing, which
 * that same decision records as a launch-scope narrowing of the
 * long-term intent, not a reversal of it. Stating the older, less precise
 * framing here would risk exactly the "post-purchase disappointment" §2
 * asks this page to prevent.
 */
export default function TrustAndDelivery({
  isFoodCentral,
}: {
  isFoodCentral: boolean
}) {
  return (
    <div className="flex flex-col gap-6 border-t border-divider pt-8">
      <div>
        <Heading level="h3" className="mb-3">
          Delivery{isFoodCentral ? " & pickup" : ""}
        </Heading>
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-2">
            <TruckFast className="mt-0.5 shrink-0 text-text-secondary" aria-hidden="true" />
            <Text as="span">
              {isFoodCentral
                ? "Delivered within Lagos Island — same-day, scheduled, or pickup options available at checkout."
                : "Delivered across all of Lagos at launch."}
            </Text>
          </li>
          {isFoodCentral && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 shrink-0 text-text-secondary" aria-hidden="true" />
              <Text as="span">
                Pickup is available with equal convenience to delivery — a ready-time
                estimate is shown at checkout once your order is confirmed.
              </Text>
            </li>
          )}
        </ul>
      </div>

      <div>
        <Heading level="h3" className="mb-3">
          Trust &amp; compliance
        </Heading>
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-2">
            <CheckCircleSolid className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
            <Text as="span">Sold and delivered directly by LiquorCentral.</Text>
          </li>
          {isFoodCentral ? (
            <li className="flex items-start gap-2">
              <CheckCircleSolid className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              <Text as="span">
                Cooked to order, not held stock — as a made-to-order item, this dish is
                not eligible for return.
              </Text>
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 shrink-0 text-text-secondary" aria-hidden="true" />
              <Text as="span">
                This order will be age-verified — you&apos;ll be asked to confirm you
                are 18 years or older at checkout.
              </Text>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
