import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { rateLimit } from "./middlewares/rate-limit"

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
    // Credential attacks: tight, since a legitimate customer never needs
    // more than a handful of these in a few minutes.
    {
      method: "POST",
      matcher: "/auth/customer/emailpass",
      middlewares: [rateLimit({ name: "login", windowMs: 5 * 60_000, max: 10 })],
    },
    {
      method: "POST",
      matcher: "/auth/customer/emailpass/register",
      middlewares: [rateLimit({ name: "register", windowMs: 15 * 60_000, max: 5 })],
    },
    // Reset-password request also sends an email — unlimited requests
    // here is a way to email-bomb someone else's inbox, not just a
    // credential-guessing risk.
    {
      method: "POST",
      matcher: "/auth/customer/emailpass/reset-password",
      middlewares: [rateLimit({ name: "reset-password", windowMs: 15 * 60_000, max: 5 })],
    },
    {
      method: "POST",
      matcher: "/auth/customer/emailpass/update",
      middlewares: [rateLimit({ name: "reset-password-confirm", windowMs: 15 * 60_000, max: 10 })],
    },
    // Order placement: card-testing and order-spam guard. Generous
    // enough that a real customer retrying after a declined card is
    // never the one who hits it.
    {
      method: "POST",
      matcher: "/store/carts/:id/complete",
      middlewares: [rateLimit({ name: "checkout-complete", windowMs: 10 * 60_000, max: 15 })],
    },
  ],
})
