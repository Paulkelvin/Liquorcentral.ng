import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

/**
 * Validates the wine-details fields accepted on `additional_data` by the
 * native product create/update endpoints (flat keys on `additional_data`,
 * per Medusa's own additionalDataValidator convention — not nested under
 * a module-specific key). This is the only API-surface change wine-details
 * makes — no new route, per API_DECISIONS.md's "use native routes as-is
 * wherever possible" principle. Every field is optional/nullish:
 * TIER_B_WINE_ATTRIBUTES_MODULE.md §3 requires the module to tolerate a
 * field genuinely not applying to a given product.
 */
const wineDetailsSchema = {
  vintage: z.number().int().nullish(),
  producer: z.string().nullish(),
  region: z.string().nullish(),
  bottle_size: z.string().nullish(),
  tasting_notes: z.string().nullish(),
  serving_temperature: z.string().nullish(),
  abv: z.number().nullish(),
}

export default defineMiddlewares({
  routes: [
    {
      method: "POST",
      matcher: "/admin/products",
      additionalDataValidator: wineDetailsSchema,
    },
    {
      method: "POST",
      matcher: "/admin/products/:id",
      additionalDataValidator: wineDetailsSchema,
    },
  ],
})
