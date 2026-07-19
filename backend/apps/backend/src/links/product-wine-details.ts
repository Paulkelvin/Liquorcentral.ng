import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import WineDetailsModule from "../modules/wine-details"

/**
 * One-to-one link: each Product has at most one wine_details record.
 * Cardinality is enforced by the workflow steps (create only when none
 * exists), not by this link definition — matching the pattern
 * ARCHITECTURE.md establishes platform-wide (module isolation via
 * defineLink + Query, never a foreign key on Product's own table).
 */
export default defineLink(
  ProductModule.linkable.product,
  WineDetailsModule.linkable.wineDetails
)
