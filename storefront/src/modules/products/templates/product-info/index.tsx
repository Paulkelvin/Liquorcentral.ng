import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

type ProductWithDetails = HttpTypes.StoreProduct & {
  wine_details?: {
    vintage?: number | null
    region?: string | null
  } | null
  food_details?: {
    spice_level?: number | null
    prep_time_minutes?: number | null
  } | null
}

const SPICE_LEVEL_LABELS: Record<number, string> = {
  0: "Not spicy",
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Very hot",
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §7 — "at most one or two defining
 * facts appropriate to the product... never the full fact sheet
 * compressed into this zone." Distinct from `ProductFacts`' full,
 * progressively-disclosed sheet (§10–§13) — this is the above-the-fold
 * summary line only, a vintage/region pairing for wine or a
 * spice-level/prep-time pairing for food, per §7's own examples.
 */
function KeyFacts({ product }: { product: HttpTypes.StoreProduct }) {
  const detailed = product as ProductWithDetails
  const wine = detailed.wine_details
  const food = detailed.food_details

  const facts: string[] = []

  if (wine) {
    if (wine.vintage) facts.push(String(wine.vintage))
    if (wine.region) facts.push(wine.region)
  } else if (food) {
    if (food.spice_level != null) {
      facts.push(SPICE_LEVEL_LABELS[food.spice_level] ?? `Spice level ${food.spice_level}`)
    }
    if (food.prep_time_minutes) facts.push(`~${food.prep_time_minutes} min prep`)
  }

  if (facts.length === 0) {
    return null
  }

  return (
    <Text as="p" size="caption" muted data-testid="product-key-facts">
      {facts.join(" · ")}
    </Text>
  )
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <KeyFacts product={product} />

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
