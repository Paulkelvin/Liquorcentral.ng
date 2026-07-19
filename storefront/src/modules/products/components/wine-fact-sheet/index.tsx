import { Text } from "@modules/common/components/ui"

export type WineDetails = {
  vintage?: number | null
  producer?: string | null
  region?: string | null
  bottle_size?: string | null
  tasting_notes?: string | null
  serving_temperature?: string | null
  abv?: number | null
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §10, §12, §13 — the Wine & Spirits
 * structured fact sheet, reading `wine-details` module fields
 * (`MEDUSA_EXTENSIONS.md` #1). Facts render as labeled key-value pairs,
 * grouped logically ("About this wine" / "Tasting"); a field with no
 * value for this product is simply omitted (§7, §23) — never a blank or
 * placeholder row. Vintage specifically is only shown where it applies
 * (a non-vintage spirit/blend omits it, per §10 and Acceptance Criteria).
 * ABV is always shown where applicable — a compliance-relevant fact, not
 * optional the way serving guidance is.
 */
export default function WineFactSheet({ details }: { details: WineDetails }) {
  const aboutRows = [
    { label: "Vintage", value: details.vintage ? String(details.vintage) : null },
    { label: "Producer", value: details.producer },
    { label: "Region", value: details.region },
    { label: "Bottle size", value: details.bottle_size },
    { label: "ABV", value: details.abv != null ? `${details.abv}%` : null },
  ].filter((row) => row.value)

  const tastingRows = [
    { label: "Tasting notes", value: details.tasting_notes },
    { label: "Serving temperature", value: details.serving_temperature },
  ].filter((row) => row.value)

  if (aboutRows.length === 0 && tastingRows.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 py-8 text-body">
      {aboutRows.length > 0 && (
        <div>
          <Text className="mb-3 font-semibold text-text-primary">About this wine</Text>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
            {aboutRows.map((row) => (
              <div key={row.label}>
                <dt className="text-caption text-text-muted">{row.label}</dt>
                <dd className="text-body text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {tastingRows.length > 0 && (
        <div>
          <Text className="mb-3 font-semibold text-text-primary">Tasting</Text>
          <dl className="flex flex-col gap-3">
            {tastingRows.map((row) => (
              <div key={row.label}>
                <dt className="text-caption text-text-muted">{row.label}</dt>
                <dd className="text-body text-text-primary whitespace-pre-line">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
