import { ExclamationCircle } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

/**
 * `PRODUCT_CATALOG.md` distinguishes Food Central dishes from Wine &
 * Spirits products by which attribute module they're linked to — the same
 * cast pattern already established in FoodCentralSpotlight and
 * ProductPreview (Milestones 8/9).
 */
type WineDetails = {
  vintage?: number | null
  producer?: string | null
  region?: string | null
  bottle_size?: string | null
  tasting_notes?: string | null
  serving_temperature?: string | null
  abv?: number | null
}

type FoodDetails = {
  ingredients?: string[] | null
  allergens?: string[] | null
  dietary_flags?: string[] | null
  spice_level?: number | null
  prep_time_minutes?: number | null
  portion_size?: string | null
}

type ProductWithDetails = HttpTypes.StoreProduct & {
  wine_details?: WineDetails | null
  food_details?: FoodDetails | null
}

function Row({ label, value }: { label: string; value?: string | null }) {
  // §12/§23 — a field with no value is simply omitted, never rendered as
  // an empty or placeholder row.
  if (!value) {
    return null
  }
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <Text size="caption" muted>
        {label}
      </Text>
      <Text size="caption" className="text-right">
        {value}
      </Text>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text as="p" size="body" className="font-semibold">
        {title}
      </Text>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

const SPICE_LEVEL_LABELS: Record<number, string> = {
  0: "Not spicy",
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Very hot",
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §10 (Wine), §11 (Food), §12 (the
 * data model this presents), §13 (the presentation itself — "labeled
 * key-value pairs, grouped logically... a mix of short paragraphs and
 * scannable rows"). Rendered inside the existing accessible Accordion
 * disclosure pattern (`product-tabs/index.tsx`), not a second UI pattern.
 */
export default function ProductFacts({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const detailed = product as ProductWithDetails
  const wine = detailed.wine_details
  const food = detailed.food_details

  if (!wine && !food) {
    return (
      <Text size="caption" muted>
        No additional product facts are available for this item yet.
      </Text>
    )
  }

  if (wine) {
    return (
      <div className="flex flex-col gap-6 py-6" data-testid="wine-fact-sheet">
        <Section title="About this wine">
          <Row label="Producer" value={wine.producer} />
          <Row label="Region" value={wine.region} />
          <Row label="Vintage" value={wine.vintage ? String(wine.vintage) : null} />
          <Row label="Bottle size" value={wine.bottle_size} />
          <Row label="ABV" value={wine.abv != null ? `${wine.abv}%` : null} />
        </Section>
        {wine.tasting_notes && (
          <Section title="Tasting notes">
            <Text as="p" size="caption">
              {wine.tasting_notes}
            </Text>
          </Section>
        )}
        {wine.serving_temperature && (
          <Section title="Serving guidance">
            <Row label="Serving temperature" value={wine.serving_temperature} />
          </Section>
        )}
      </div>
    )
  }

  // food
  return (
    <div className="flex flex-col gap-6 py-6" data-testid="food-fact-sheet">
      <Section title="Preparation">
        <Text as="p" size="caption" className="mb-2">
          Cooked to order — not held stock.
        </Text>
        <Row
          label="Prep time"
          value={food?.prep_time_minutes ? `~${food.prep_time_minutes} min` : null}
        />
        <Row
          label="Spice level"
          value={
            food?.spice_level != null
              ? SPICE_LEVEL_LABELS[food.spice_level] ?? String(food.spice_level)
              : null
          }
        />
        <Row label="Portion" value={food?.portion_size} />
      </Section>

      {food?.ingredients && food.ingredients.length > 0 && (
        <Section title="Ingredients">
          <Text as="p" size="caption">
            {food.ingredients.join(", ")}
          </Text>
        </Section>
      )}

      {/* §11/§25 — allergen information is prominent, never color-alone:
          an icon paired with explicit text in every case. */}
      {food?.allergens && (
        <Section title="Allergens">
          {food.allergens.length > 0 ? (
            <div className="flex items-start gap-2 text-warning">
              <ExclamationCircle className="shrink-0 mt-0.5" aria-hidden="true" />
              <Text as="p" size="caption" className="text-text-primary">
                Contains: {food.allergens.join(", ")}
              </Text>
            </div>
          ) : (
            <Text as="p" size="caption">
              Verified to contain none of the declared allergens.
            </Text>
          )}
        </Section>
      )}

      {food?.dietary_flags && food.dietary_flags.length > 0 && (
        <Section title="Dietary">
          <Text as="p" size="caption">
            {food.dietary_flags.join(", ")}
          </Text>
        </Section>
      )}
    </div>
  )
}
