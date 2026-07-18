# Information Architecture

**Status:** Structural decisions confirmed; specific category/collection contents still open pending merchandising input. Expands on `PRODUCT_BLUEPRINT.md` §5.

## Structure

One shared shell surrounds two purpose-built sections:

```
Home (shared brand shell: logo, search, cart, account)
├── Wine & Spirits
│   ├── Wine
│   ├── Spirits
│   ├── Gifting
│   └── Curated / Sommelier's Picks   ← occasion/editorial layer, see below
├── Food Central
│   ├── Today's Menu
│   ├── Scheduled Orders
│   └── Pickup
├── Account
│   ├── Order history (spans both product lines)
│   └── Saved addresses
└── Cart / Checkout (shared — one cart, one checkout)
    └── Delivery step (branches per line item: nationwide courier vs. Lagos rider/slot)
```

## Why this structure, and not two separate structures

A single, undifferentiated catalog would force wine's discovery-oriented browsing and food's speed-oriented ordering into the same interaction pattern, compromising one or the other. Two entirely separate microsites would satisfy the business rule that this must feel like "one cohesive brand" (see `BUSINESS_RULES.md`) far less well. One shared shell with two internally-distinct branches is the structure that serves both requirements at once.

## Three category systems for Wine & Spirits (not one)

Wine & Spirits' navigation runs three layers simultaneously, because expert and novice buyers browse differently:

1. **Formal taxonomy** — Wine, Spirits (and any further subdivision, e.g. by type).
2. **Varietal/style** — grape variety, spirit category (e.g. Cabernet, single malt) — implemented via the wine-attributes module (see `MEDUSA_EXTENSIONS.md`) and search facets, not a separate navigation tree.
3. **Occasion/curation** — editorial groupings such as "Gifting" or "Sommelier's Picks," independent of the formal taxonomy.

A buyer who knows exactly what they want (formal/varietal layer) and a buyer who doesn't (occasion/curation layer) are both served without either layer compromising the other.

## Food Central's navigation is deliberately simpler

Food Central's IA is menu-like, not catalog-like: "Today's Menu," "Scheduled Orders," and "Pickup" — optimized for fast decision-making, not exploration. This is a deliberate asymmetry with Wine & Spirits' three-layer structure, matching the business rule that food ordering prioritizes speed while wine shopping prioritizes discovery.

## Search spans both sections

One shared search bar returns results across both catalogs, clearly labeled by product line, rather than requiring the customer to already know which section a term belongs to. See `PRODUCT_BLUEPRINT.md` §8 and `MEDUSA_EXTENSIONS.md` for the search-engine decision.

## Medusa mapping

| IA element | Medusa mechanism |
|---|---|
| Wine / Spirits / Gifting / Curated | Product Categories + Collections |
| Varietal/style facets | Wine-attributes module fields, surfaced as search facets |
| Today's Menu / Scheduled / Pickup | Product Categories + Fulfillment (Shipping Options), not separate systems |
| Shared cart/account | Native Cart, Customer, and Order modules — one of each per customer |

No custom module is required for the IA structure itself — see `PRODUCT_BLUEPRINT.md` §5 (native).

## Open questions (not yet decided)

- The exact set of occasion/curated collections beyond the examples above (e.g. "Gifting," "Sommelier's Picks") — a merchandising decision, tracked in `PROJECT_STATUS.md`.
- Whether Food Central's menu is further subdivided (e.g. by meal type) once the initial menu size is known.
