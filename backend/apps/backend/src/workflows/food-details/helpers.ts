/**
 * Pure helpers for turning a product create/update request's
 * `additional_data` into food-details field values. Kept separate from
 * the workflow steps so this logic is unit-testable without a Medusa
 * runtime or database (see __tests__/helpers.unit.spec.ts). Mirrors
 * src/workflows/wine-details/helpers.ts's pattern; kept as its own copy
 * rather than a shared generic, since the two modules' field sets and
 * completeness rules genuinely differ (TIER_B_FOOD_ATTRIBUTES_MODULE.md
 * §7's stricter allergen/dietary-flag standard has no wine-details
 * equivalent).
 */

export type FoodDetailsFields = {
  ingredients?: string[] | null
  allergens?: string[] | null
  dietary_flags?: string[] | null
  // Non-nullable, matching the schema (model.boolean().default(false) —
  // no .nullable()): "not verified" is represented by false, not null.
  safety_data_verified?: boolean
  spice_level?: number | null
  prep_time_minutes?: number | null
  portion_size?: string | null
}

const FOOD_DETAILS_FIELD_NAMES = [
  "ingredients",
  "allergens",
  "dietary_flags",
  "safety_data_verified",
  "spice_level",
  "prep_time_minutes",
  "portion_size",
] as const

/**
 * Picks only the known food-details fields out of an arbitrary
 * `additional_data` object, ignoring anything else another module (e.g.
 * wine-details) may have contributed to the same flat payload.
 */
export function pickFoodDetailsFields(
  additionalData?: Record<string, unknown> | null
): FoodDetailsFields {
  const result: FoodDetailsFields = {}

  if (!additionalData) {
    return result
  }

  for (const field of FOOD_DETAILS_FIELD_NAMES) {
    if (field in additionalData) {
      result[field] = additionalData[field] as never
    }
  }

  return result
}

/**
 * True when at least one food-details field carries a real (non-null,
 * non-undefined) value — used to decide whether a food_details record
 * should exist for a product at all. A plain Wine & Spirits product
 * never gets an empty record created for it.
 *
 * `safety_data_verified` is intentionally excluded from this check: it
 * defaults to `false` and is meaningless on its own without at least one
 * of allergens/dietary_flags/etc. actually being supplied — a request
 * that sends only `safety_data_verified: true` with no other field is
 * not a genuine attempt to describe a dish.
 */
export function hasAnyFoodDetailsValue(fields: FoodDetailsFields): boolean {
  return FOOD_DETAILS_FIELD_NAMES.filter(
    (field) => field !== "safety_data_verified"
  ).some((field) => fields[field] !== undefined && fields[field] !== null)
}

/**
 * `null` and `[]` are deliberately different states for an array field
 * (allergens, dietary_flags, ingredients), directly supporting TIER_B
 * §7's completeness requirement: `null` means "not yet entered/verified";
 * `[]` means "explicitly confirmed — none apply" (e.g. a dish verified to
 * contain none of the declared allergens). `hasAnyFoodDetailsValue` above
 * treats `[]` as a real value for exactly this reason — clearing a field
 * back to "not yet entered" requires sending `null`, not `[]`.
 */
