import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

/**
 * Validates every custom module's fields accepted on `additional_data` by
 * the native product create/update endpoints (flat keys on
 * `additional_data`, per Medusa's own additionalDataValidator convention
 * — not nested under a module-specific key). This is the only API-surface
 * change these modules make — no new route, per API_DECISIONS.md's "use
 * native routes as-is wherever possible" principle.
 *
 * Deliberately combined into one schema per route rather than one
 * `additionalDataValidator` route entry per module: Medusa's router
 * resolves a route's validator via a routes-finder lookup whose merge
 * behavior across multiple matching entries for the identical
 * method+matcher isn't part of the documented contract — combining
 * schemas explicitly here is verifiable by reading this file, not by
 * trusting undocumented multi-registration behavior.
 */

/** TIER_B_WINE_ATTRIBUTES_MODULE.md §3 — every field optional/nullish,
 * tolerating genuine inapplicability per product. */
const wineDetailsSchema = {
  vintage: z.number().int().nullish(),
  producer: z.string().nullish(),
  region: z.string().nullish(),
  bottle_size: z.string().nullish(),
  tasting_notes: z.string().nullish(),
  serving_temperature: z.string().nullish(),
  abv: z.number().nullish(),
}

/** TIER_B_FOOD_ATTRIBUTES_MODULE.md §6/§7 — every field optional/nullish
 * at the API layer (the stricter allergen/dietary-flag completeness
 * standard §7 requires is an operational/data-entry discipline, not a
 * schema-level requirement this validator can itself enforce). */
const foodDetailsSchema = {
  ingredients: z.array(z.string()).nullish(),
  allergens: z.array(z.string()).nullish(),
  dietary_flags: z.array(z.string()).nullish(),
  safety_data_verified: z.boolean().nullish(),
  spice_level: z.number().nullish(),
  prep_time_minutes: z.number().nullish(),
  portion_size: z.string().nullish(),
}

const combinedSchema = {
  ...wineDetailsSchema,
  ...foodDetailsSchema,
}

export default defineMiddlewares({
  routes: [
    {
      method: "POST",
      matcher: "/admin/products",
      additionalDataValidator: combinedSchema,
    },
    {
      method: "POST",
      matcher: "/admin/products/:id",
      additionalDataValidator: combinedSchema,
    },
  ],
})
