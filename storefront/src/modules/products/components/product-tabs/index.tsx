import { HttpTypes } from "@medusajs/types"
import Accordion from "./accordion"
import WineFactSheet, { WineDetails } from "@modules/products/components/wine-fact-sheet"
import FoodFactSheet, { FoodDetails } from "@modules/products/components/food-fact-sheet"

type ProductWithCatalogDetails = HttpTypes.StoreProduct & {
  wine_details?: WineDetails | null
  food_details?: FoodDetails | null
}

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §5, §7, §25 — the progressively-
 * disclosed structured fact sheet, built as an accessible disclosure
 * pattern (Radix's Accordion primitive, already used platform-wide —
 * genuine `aria-expanded`/keyboard support, not a re-implementation).
 *
 * Replaces the vendored DTC Starter's generic apparel-oriented tab
 * ("Material" / "Country of origin" / "Weight" / "Dimensions" — none of
 * which applies to a bottle of wine or a cooked dish) and its fabricated,
 * inapplicable "Shipping & Returns" copy ("no questions asked" refunds,
 * apparel exchanges) — the alcohol return policy is a genuinely open
 * business decision (`PROJECT_STATUS.md`) this document must not invent
 * an answer to.
 */
const ProductTabs = ({ product }: ProductTabsProps) => {
  const catalogProduct = product as ProductWithCatalogDetails
  const wineDetails = catalogProduct.wine_details
  const foodDetails = catalogProduct.food_details

  if (!wineDetails && !foodDetails) {
    return null
  }

  return (
    <div className="w-full">
      {/* Closed by default — Paul's direction. Open-by-default put the
          full fact sheet (ingredients, tasting notes, ABV, region) in
          front of every visitor whether they asked for it or not; a
          progressively-disclosed accordion should start disclosed. */}
      <Accordion type="multiple" defaultValue={[]}>
        <Accordion.Item
          title={wineDetails ? "About this wine" : "Ingredients & preparation"}
          headingSize="medium"
          value="fact-sheet"
        >
          {wineDetails && <WineFactSheet details={wineDetails} />}
          {foodDetails && <FoodFactSheet details={foodDetails} />}
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

export default ProductTabs
