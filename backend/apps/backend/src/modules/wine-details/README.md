# wine-details

Structured Wine & Spirits attribute data, linked 1:1 to the native Product module. Implements `MEDUSA_EXTENSIONS.md` #1 per the architecture defined in `docs/implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md` (Approved, v1.0) — that document is the authoritative reference for this module's responsibilities, non-responsibilities, and boundaries; this file only orients a contributor to the code.

## What this module is

- A small module holding structured, per-product facts (vintage, ABV, producer, region, bottle size, tasting notes, serving temperature) for every Wine & Spirits product — see `models/wine-details.ts`.
- Linked to Product via `src/links/product-wine-details.ts`, never by editing Product's own tables (`ARCHITECTURE.md`).
- Written to via `POST /admin/products` and `POST /admin/products/:id`'s native `additional_data` extension point (see `src/api/middlewares.ts` and `src/workflows/wine-details`) — no custom API route exists or is needed for this module (`API_DECISIONS.md`).
- Read via Medusa's Query system (`fields=+wine_details.*` on `GET /admin/products` or `GET /store/products`) — also no custom route.
- Edited by staff through an admin widget on the product detail page (`src/admin/widgets/wine-details-widget.tsx`), shown unconditionally on every product (there is no native "product line" field to gate on — see the widget's own comment for why).

## What this module deliberately is not

Per `TIER_B_WINE_ATTRIBUTES_MODULE.md` §4 — this module does not: hold the "pairs with" cross-catalog relationship (that's the Product Relationship Module); hold presentation/formatting logic (that's `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Product Facts layer); perform search ranking or facet computation; determine availability, stock, or pricing; hold Food Central data (`food-details` is separate); or function as a review/rating system.

## Known engineering limitation

Deleting a Product via `DELETE /admin/products/:id` does not cascade-delete
its linked `wine_details` record or dismiss the link — Medusa does not do
this automatically for custom module links, and no hook exists here to do
it either (TIER_B_WINE_ATTRIBUTES_MODULE.md's integration points don't
name product-deletion cascade behavior, so adding one wasn't in this
milestone's scope). Deleting a product currently leaves an orphaned
`wine_details` row. Worth a `productsDeleted` hook in a future pass if
this proves operationally significant — not a data-safety issue today
(no product deletion happens in normal operation yet), but noted rather
than silently left undiscovered.

## Known open items (not resolved by this implementation)

- **The field list is provisional**, drawn from `PRODUCT_CATALOG.md`'s explicitly "proposed, not finalized" list. Paul's approval of the final field list is a standing open business decision (`MEDUSA_EXTENSIONS.md` #1). Changing a field later is an ordinary migration, not a crisis.
- **Product-vs-variant granularity** (bottle size, most likely) is unresolved (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §6/§18) — every field here is modeled at the Product level for now.
- **Attribute accuracy/verification ownership** — no document assigns who on staff is responsible for verifying a value is correct once entered (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §16).
