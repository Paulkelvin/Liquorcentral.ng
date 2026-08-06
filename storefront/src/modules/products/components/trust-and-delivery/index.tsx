import { CheckCircleSolid, MapPin, ShieldCheck, TruckFast } from "@medusajs/icons"
import { Container, Heading, Text } from "@modules/common/components/ui"

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
 *
 * **Redrawn into one card, not left as two bare bulleted lists under a
 * border-top.** Paul's read: sitting directly above the sitewide
 * `TrustBand` (four claims, same "sold directly," "secure checkout" ideas
 * in different words), this looked like the same information said twice
 * in two different styles. It is not fully redundant — the return policy
 * for a made-to-order dish and the exact delivery zone per catalog are
 * facts only this page states — so the fix is presentation, not deletion:
 * one bordered card, tinted icon circles matching the trust band's own
 * redrawn icon treatment, and tighter grouping, so it reads as this
 * product's own fine print rather than a second copy of the banner below
 * it.
 */
export default function TrustAndDelivery({
  isFoodCentral,
}: {
  isFoodCentral: boolean
}) {
  const items = [
    {
      Icon: TruckFast,
      text: isFoodCentral
        ? "Delivered within Lagos Island — same-day, scheduled, or pickup options available at checkout."
        : "Delivered across all of Lagos at launch.",
    },
    ...(isFoodCentral
      ? [
          {
            Icon: MapPin,
            text: "Pickup is available with equal convenience to delivery — a ready-time estimate is shown at checkout once your order is confirmed.",
          },
        ]
      : []),
    {
      Icon: CheckCircleSolid,
      text: "Sold and delivered directly by LiquorCentral.",
    },
    isFoodCentral
      ? {
          Icon: CheckCircleSolid,
          text: "Cooked to order, not held stock — as a made-to-order item, this dish is not eligible for return.",
        }
      : {
          Icon: ShieldCheck,
          text: "This order will be age-verified — you'll be asked to confirm you are 18 years or older at checkout.",
        },
  ]

  return (
    <Container
      className="flex flex-col gap-4 !rounded-radius-lg !p-6"
      data-testid="trust-and-delivery"
    >
      <Heading level="h3" className="!text-base font-semibold">
        Delivery{isFoodCentral ? " & pickup" : ""}, trust &amp; compliance
      </Heading>
      <ul className="flex flex-col gap-4">
        {items.map(({ Icon, text }, index) => (
          <li key={index} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-ink-100 text-text-secondary"
            >
              <Icon />
            </span>
            <Text as="span" className="pt-1">
              {text}
            </Text>
          </li>
        ))}
      </ul>
    </Container>
  )
}
