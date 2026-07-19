import { model } from "@medusajs/framework/utils"

/**
 * Structured Wine & Spirits attribute data — one record per Product, linked
 * 1:1 via src/links/product-wine-details.ts.
 *
 * Field list is PRODUCT_CATALOG.md's proposed starting point (Paul's final
 * approval is still an open business decision — see MEDUSA_EXTENSIONS.md
 * #1 and TIER_B_WINE_ATTRIBUTES_MODULE.md §5/§19). Every field is nullable:
 * TIER_B_WINE_ATTRIBUTES_MODULE.md §3 requires the module to tolerate a
 * field genuinely not applying to a given product (e.g. no vintage on a
 * non-vintage spirit) without treating that as an error.
 *
 * All fields are modeled at the Product level, matching TIER_B §6's stated
 * default assumption. Whether bottle_size specifically should eventually
 * move to the Product Variant level is an explicitly open question
 * (TIER_B §6/§18) — not resolved here.
 *
 * Deliberately excluded: "pairs with" (TIER_B §4 — that is the Product
 * Relationship Module's responsibility, not this module's), and any
 * review/rating field (TIER_B §4 — tasting notes are curated fact, not a
 * review system).
 */
export const WineDetails = model.define("wine_details", {
  id: model.id().primaryKey(),

  /** Identity and provenance (TIER_B §5) */
  vintage: model.number().nullable(),
  producer: model.text().nullable(),
  region: model.text().nullable(),
  bottle_size: model.text().nullable(),

  /** Sensory and educational (TIER_B §5) */
  tasting_notes: model.text().nullable(),

  /** Serving and storage guidance (TIER_B §5) */
  serving_temperature: model.text().nullable(),

  /** Compliance-adjacent (TIER_B §5) — always shown where applicable, per 05_PRODUCT_DETAILS_SPECIFICATION.md §10 */
  abv: model.float().nullable(),
})
