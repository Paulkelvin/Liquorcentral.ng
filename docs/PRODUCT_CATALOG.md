# Product Catalog

**Status:** Draft (strategy confirmed; exact attribute field lists still open pending Paul/merchandising input)
**Version:** 1.0
**Owner:** Product
**Last Updated:** 2026-07-18

Expands on `PRODUCT_BLUEPRINT.md` §6 and §13.

## Two catalogs, one Product module

Wine & Spirits and Food Central are both modeled as ordinary Medusa Products — there is no separate catalog system for each. What differs is configuration:

| | Wine & Spirits | Food Central |
|---|---|---|
| Inventory tracking | On — real stock counts per warehouse | Off — made-to-order, availability is a kitchen-capacity/time question, not a stock count |
| Delivery scope | Nationwide | Lagos only (enforced at the fulfillment layer, not the catalog layer — see `DELIVERY_MODEL.md`) |
| Typical lifespan | Vintages/products come and go; some items genuinely sell out | Menu items are largely evergreen; specials rotate |

## Product data strategy: two tiers

1. **Simple/optional data** (rarely filtered on) can use Medusa's native `additional_data`/`metadata` mechanism — fast to add, but not efficiently filterable or facetable.
2. **Structured, filterable, or compliance-sensitive data** belongs in a dedicated custom module, linked 1:1 to Product. This is the tier both catalogs' core attributes fall into — see `MEDUSA_EXTENSIONS.md` for the two modules this implies (`wine-details`, `food-details`).

Two separate modules, not one shared one — a wine has no spice level, a dish has no vintage, and forcing both into one schema produces a module full of irrelevant nullable fields for whichever catalog isn't being described.

## Wine & Spirits attributes (proposed — not finalized)

- Vintage
- Alcohol percentage (ABV)
- Bottle size
- Winery / producer
- Country of origin / region
- Tasting notes
- Serving temperature
- "Pairs with" (a simple reference to related Food Central dishes or general pairing suggestions)

## Food Central attributes (proposed — not finalized)

- Ingredients
- Allergens
- Spice level
- Prep time
- Dietary flags (e.g. halal, vegan status) — authoritative boolean/enum fields in the module; optionally *mirrored* to Product Tags for cheap storefront filter chips, with the module remaining the source of truth for compliance-sensitive claims.
- Expiry/best-by consideration is generally not applicable to made-to-order dishes; if pre-prepared items are ever introduced, this would need revisiting.

> **Open question for Paul:** the exact final field list for each module — the above is a proposed starting point drawn from earlier product research, not a finalized spec. Confirm before the modules are built.

## Categorization

See `INFORMATION_ARCHITECTURE.md` for the full three-layer wine categorization (formal taxonomy, varietal/style, occasion/curation) and Food Central's simpler menu-style structure.

## Gift wrapping (a special case)

Gift wrapping is not a product attribute — it's an order-time choice. Recommended treatment: model it as an addable, priced line item (e.g. a "Gift Wrap" product), which requires no custom module or core changes, rather than a product-level field.

## Photography standard

A consistent shot-list (including a label-detail shot for bottles, since the label is often a non-expert buyer's primary trust cue) should be defined and applied to every product from launch — this is an operational/content standard, not a technical build. See `BRAND_GUIDELINES.md` once photography direction is decided.

## Medusa impact summary

- Catalog structure itself: **native** (Product, Category, Collection).
- Structured attributes: **two small custom modules**, linked via `defineLink` — see `MEDUSA_EXTENSIONS.md`.
- No core changes required for any of the above.
