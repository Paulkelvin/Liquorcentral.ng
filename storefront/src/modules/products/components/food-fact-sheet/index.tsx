import { CircleWarningSolid, Clock, FireSolid } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"

export type FoodDetails = {
  ingredients?: string[] | null
  allergens?: string[] | null
  dietary_flags?: string[] | null
  spice_level?: number | null
  prep_time_minutes?: number | null
  portion_size?: string | null
}

const SPICE_LABELS: Record<number, string> = {
  0: "Not spicy",
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Very hot",
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §11, §12, §13 — the Food Central
 * structured fact sheet, reading `food-details` module fields
 * (`MEDUSA_EXTENSIONS.md` #2). Allergen information is prominent and never
 * conveyed by color alone — an icon paired with explicit text in every
 * case (§11, §25), the same never-color-alone rule this platform applies
 * everywhere else. A field with no value is simply omitted (§7, §23).
 */
export default function FoodFactSheet({ details }: { details: FoodDetails }) {
  const hasIngredients = !!details.ingredients?.length
  const hasAllergens = !!details.allergens?.length
  const hasDietaryFlags = !!details.dietary_flags?.length

  const prepRows = [
    {
      label: "Prep time",
      value:
        details.prep_time_minutes != null
          ? `~${details.prep_time_minutes} min`
          : null,
      icon: <Clock aria-hidden="true" />,
    },
    {
      label: "Spice level",
      value:
        details.spice_level != null
          ? SPICE_LABELS[details.spice_level] ?? `Level ${details.spice_level}`
          : null,
      icon: <FireSolid aria-hidden="true" />,
    },
    { label: "Portion", value: details.portion_size, icon: null },
  ].filter((row) => row.value)

  if (!hasIngredients && !hasAllergens && !hasDietaryFlags && prepRows.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 py-8 text-body">
      <Text className="text-text-secondary">Cooked to order, not held stock.</Text>

      {(hasIngredients || hasAllergens || hasDietaryFlags) && (
        <div>
          <Text className="mb-3 font-semibold text-text-primary">
            Ingredients &amp; Allergens
          </Text>
          {hasIngredients && (
            <p className="mb-3 text-body text-text-primary">
              {details.ingredients!.join(", ")}
            </p>
          )}
          {hasAllergens && (
            <div className="mb-3 flex items-start gap-2" data-testid="allergen-info">
              <CircleWarningSolid className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-body text-text-primary">
                <span className="font-medium">Contains: </span>
                {details.allergens!.join(", ")}
              </p>
            </div>
          )}
          {hasDietaryFlags && (
            <ul className="flex flex-wrap gap-2">
              {details.dietary_flags!.map((flag) => (
                <li
                  key={flag}
                  className="rounded-radius-full bg-ink-100 px-3 py-1 text-caption text-text-secondary"
                >
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {prepRows.length > 0 && (
        <div>
          <Text className="mb-3 font-semibold text-text-primary">Preparation</Text>
          <dl className="flex flex-col gap-3">
            {prepRows.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                {row.icon}
                <dt className="sr-only">{row.label}</dt>
                <dd className="text-body text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
