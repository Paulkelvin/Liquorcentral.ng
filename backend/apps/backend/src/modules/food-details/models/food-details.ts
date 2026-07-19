import { model } from "@medusajs/framework/utils"

/**
 * Structured Food Central attribute data — one record per Product, linked
 * 1:1 via src/links/product-food-details.ts.
 *
 * Field list is PRODUCT_CATALOG.md's proposed starting point (ingredients,
 * allergens, spice level, prep time, dietary flags), plus two additions
 * grounded directly in TIER_B_FOOD_ATTRIBUTES_MODULE.md rather than
 * invented here — see that document's §6/§7/§21 and the field-level
 * comments below. Paul's final approval of the field list is still an
 * open business decision (MEDUSA_EXTENSIONS.md #2).
 *
 * Unlike wine-details, there is no product-vs-variant open question here
 * (TIER_B §7 — no dish variants exist), so this is a settled default, not
 * a flagged gap.
 *
 * Deliberately excluded, per TIER_B §4/§5's explicit non-responsibilities:
 * Food Central's live availability state, kitchen operating hours,
 * capacity, "pairs with", inventory, and pricing all live elsewhere.
 */
export const FoodDetails = model.define("food_details", {
  id: model.id().primaryKey(),

  /** Composition (TIER_B §6) */
  ingredients: model.array().nullable(),

  /**
   * Safety-critical / compliance-adjacent (TIER_B §6). Held to a
   * stricter completeness standard than ordinary descriptive attributes
   * (TIER_B §7) — every dish has a true, verifiable answer, which may
   * genuinely be "none of the declared allergens are present."
   */
  allergens: model.array().nullable(),
  dietary_flags: model.array().nullable(),

  /**
   * Records whether allergens/dietary_flags have actually been verified
   * for this dish, distinct from whether they're merely populated —
   * TIER_B §7's explicit instruction: "a field left blank because no one
   * has verified it yet is a data-completeness failure this module's
   * design should make visible, not a silent, acceptable absence." This
   * field makes that state visible; it does not decide who is
   * responsible for verifying it — that ownership question remains open
   * (TIER_B §8/§18/§20, MEDUSA_EXTENSIONS.md #2).
   */
  safety_data_verified: model.boolean().default(false),

  /** Sensory (TIER_B §6) — a single consistent scale (integer level);
   * the specific label wording per level (e.g. "mild") is a
   * presentation-layer/content decision, not this module's (TIER_B §5).
   */
  spice_level: model.number().nullable(),

  /** Preparation-adjacent (TIER_B §6) — a typical-duration estimate in
   * minutes, never the live availability state it feeds into (TIER_B §5).
   */
  prep_time_minutes: model.number().nullable(),

  /**
   * Carried forward per TIER_B §6/§21's explicit instruction: required
   * by 05_PRODUCT_DETAILS_SPECIFICATION.md §11 ("Portion information: a
   * factual serving/portion-size description") but absent from
   * PRODUCT_CATALOG.md's proposed list — a genuine gap TIER_B says
   * should not be "rediscovered from scratch," not a field this
   * implementation invented independently.
   */
  portion_size: model.text().nullable(),
})
