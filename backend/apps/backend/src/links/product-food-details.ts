import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import FoodDetailsModule from "../modules/food-details"

/**
 * One-to-one link: each Product has at most one food_details record.
 * Cardinality is enforced by the workflow steps (create only when none
 * exists), not by this link definition — same pattern as
 * src/links/product-wine-details.ts.
 */
export default defineLink(
  ProductModule.linkable.product,
  FoodDetailsModule.linkable.foodDetails
)
