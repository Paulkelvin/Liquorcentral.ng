# food-details

Structured Food Central attribute data, linked 1:1 to the native Product module. Implements `MEDUSA_EXTENSIONS.md` #2 per the architecture defined in `docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md` (Approved, v1.0) — that document is the authoritative reference for this module's responsibilities, non-responsibilities, and boundaries; this file only orients a contributor to the code.

## What this module is

- A small module holding structured, per-dish facts (ingredients, allergens, dietary flags, spice level, prep-time estimate, portion size) for every Food Central dish — see `models/food-details.ts`.
- Linked to Product via `src/links/product-food-details.ts`, never by editing Product's own tables (`ARCHITECTURE.md`).
- Written to via `POST /admin/products` and `POST /admin/products/:id`'s native `additional_data` extension point (see `src/api/middlewares.ts`, combined with `wine-details`' fields into one schema, and `src/workflows/food-details`) — no custom API route.
- Read via Medusa's Query system (`fields=+food_details.*`) — also no custom route.
- Edited by staff through an admin widget on the product detail page (`src/admin/widgets/food-details-widget.tsx`), shown unconditionally on every product — same reasoning as `wine-details`' widget (no native "product line" field to gate on).

## How this module genuinely differs from wine-details

Reuses the *pattern* `wine-details` established (module/link/steps/workflows/hooks/widget shape), not its content — `TIER_B_FOOD_ATTRIBUTES_MODULE.md` repeatedly emphasizes these are not symmetrical modules:

- **No product-vs-variant question.** Unlike `wine-details` (still open), `TIER_B` §7 explicitly confirms food attributes are Product-level only — no dish variants exist (no modifiers/substitutions in v1).
- **A stricter completeness standard for allergens/dietary flags** (`TIER_B` §7): an unverified field is a data-completeness failure, not an acceptable "not applicable" case the way a wine's missing vintage is. This module adds `safety_data_verified` (boolean, default `false`) to make that distinction visible at the data layer — it records *whether* verification happened, not *who* is responsible for it (that stays open, see below). `null` vs. `[]` on `allergens`/`dietary_flags` are deliberately different states: `null` means not yet entered; `[]` means explicitly confirmed — none apply.
- **`portion_size` is included even though it's absent from `PRODUCT_CATALOG.md`'s proposed list** — `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §6/§21 explicitly and repeatedly instructs this gap (required by `05_PRODUCT_DETAILS_SPECIFICATION.md` §11) be "carried forward... not rediscovered from scratch." This is the one field in this module not drawn directly from `PRODUCT_CATALOG.md`.
- **No inventory coexistence at all** — Food Central has no stock count of any kind (unlike `wine-details`, which coexists with an active native Inventory module).
- **The sharpest boundary this module must never blur**: it holds a prep-time *estimate* only. It never holds, computes, or stores Food Central's live availability state (available-now / schedulable / unavailable), kitchen operating hours, or capacity — a fast-changing, event-driven mechanism with its own not-yet-built logic (`09_FOOD_ORDERING_SPECIFICATION.md` §6, §22, `TIER_B` §4/§5/§16).

## What this module deliberately is not

Per `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §4 — this module does not: hold the "pairs with" cross-catalog relationship; hold presentation/formatting logic (`05_PRODUCT_DETAILS_SPECIFICATION.md`'s Product Facts layer); perform search ranking or facet computation; determine inventory (none exists for Food Central) or pricing; hold Wine & Spirits data; function as a review/rating system; or hold any dish customization/modifier/substitution option.

## Known engineering limitation

Same as `wine-details`: deleting a Product via `DELETE /admin/products/:id` does not cascade-delete its linked `food_details` record — no `productsDeleted` hook exists for either module. Not fixed here (out of this milestone's scope); worth addressing for both modules together in a future pass if orphaned rows prove operationally significant.

## Known open items (not resolved by this implementation)

- **The field list is provisional**, drawn from `PRODUCT_CATALOG.md`'s explicitly "proposed, not finalized" list plus the `portion_size` gap `TIER_B` names. Paul's approval of the final field list is a standing open business decision (`MEDUSA_EXTENSIONS.md` #2).
- **Allergen/ingredient data accuracy ownership is unresolved** — a safety-critical gap, not merely a trust/accuracy one (`TIER_B_FOOD_ATTRIBUTES_MODULE.md` §18). `safety_data_verified` makes the verification *state* visible; it does not answer who is responsible for setting it, or the process by which they do.
