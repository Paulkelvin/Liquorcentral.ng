/**
 * Pure helpers for turning a product create/update request's
 * `additional_data` into wine-details field values. Kept separate from
 * the workflow steps so this logic is unit-testable without a Medusa
 * runtime or database (see __tests__/helpers.unit.spec.ts).
 */

export type WineDetailsFields = {
  vintage?: number | null
  producer?: string | null
  region?: string | null
  bottle_size?: string | null
  tasting_notes?: string | null
  serving_temperature?: string | null
  abv?: number | null
}

const WINE_DETAILS_FIELD_NAMES = [
  "vintage",
  "producer",
  "region",
  "bottle_size",
  "tasting_notes",
  "serving_temperature",
  "abv",
] as const

/**
 * Picks only the known wine-details fields out of an arbitrary
 * `additional_data` object, ignoring anything else another module (e.g.
 * a future food-details) may have contributed to the same flat payload.
 */
export function pickWineDetailsFields(
  additionalData?: Record<string, unknown> | null
): WineDetailsFields {
  const result: WineDetailsFields = {}

  if (!additionalData) {
    return result
  }

  for (const field of WINE_DETAILS_FIELD_NAMES) {
    if (field in additionalData) {
      result[field] = additionalData[field] as never
    }
  }

  return result
}

/**
 * True when at least one wine-details field carries a real (non-null,
 * non-undefined) value — used to decide whether a wine_details record
 * should exist for a product at all. A product with no wine-details
 * values supplied (e.g. a Food Central dish) never gets an empty record
 * created for it.
 */
export function hasAnyWineDetailsValue(fields: WineDetailsFields): boolean {
  return WINE_DETAILS_FIELD_NAMES.some(
    (field) => fields[field] !== undefined && fields[field] !== null
  )
}
