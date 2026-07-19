import { Text } from "@modules/common/components/ui"
import { CheckCircleSolid } from "@medusajs/icons"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.7/§13 — states plainly, before checkout,
 * what §13 calls out by name: "sold and delivered directly by
 * LiquorCentral (no third-party sellers); Wine & Spirits ships
 * nationwide; Food Central delivers in Lagos only, same-day/scheduled/
 * pickup available; secure payment." The four statements below are that
 * list verbatim, not paraphrased — the spec supplies the exact required
 * content, so there's nothing here for engineering to invent. Each pairs
 * an icon with text, never icon-only (§8.7 accessibility requirement).
 */
const STATEMENTS = [
  "Sold and delivered directly by LiquorCentral — no third-party sellers",
  "Wine & Spirits ships nationwide",
  "Food Central delivers in Lagos only — same-day, scheduled, or pickup",
  "Secure payment",
]

export default function TrustDeliveryBand() {
  return (
    <div className="w-full border-t border-divider bg-surface">
      <div className="content-container py-12">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATEMENTS.map((statement) => (
            <li key={statement} className="flex items-start gap-3">
              <CheckCircleSolid
                className="text-success shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <Text className="txt-small text-text-secondary">
                {statement}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
