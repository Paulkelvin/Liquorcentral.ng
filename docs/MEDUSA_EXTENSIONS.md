# Medusa Extensions

**Status:** Identified and scoped; none yet built. This is the authoritative list of every custom Medusa extension LiquorCentral needs, and the only list that should be treated as "the plan" — if a future task considers building something not listed here, it should be added here first, following the same format.

**Working rule:** every extension listed follows Medusa's documented customization patterns (custom modules, module links, workflow hooks, custom API routes, provider modules). None require modifying `medusa/` core. See `ARCHITECTURE.md` for why that constraint exists and how these mechanisms work.

---

## 1. Wine attributes module

**What:** A small custom module (`wine-details`) holding structured wine/spirit attributes (vintage, ABV, region, tasting notes, etc.), linked 1:1 to the native Product module via `defineLink`.

- **Why:** Wine's core discovery and trust features (filtering by vintage/region/ABV, a structured fact sheet, "pairs with" suggestions) all require this data to exist as real, validated fields — not free-text description.
- **Business value:** Directly enables the Product Philosophy (`PRODUCT_BLUEPRINT.md` §3) and Wine & Spirits' discovery/education goal (`BUSINESS_RULES.md`).
- **Technical impact:** New module + migration + module link to Product. No core changes. Admin dashboard needs a widget to edit these fields on the product page (also a documented extension point, not a core change).
- **Implementation difficulty:** Low–moderate. This is the standard, well-documented "linked custom module" pattern.
- **Risks:** Field list changing after launch means a migration; get the field list right (or extensible) before storefront/search work depends on it.
- **Assumptions:** Field list in `PRODUCT_CATALOG.md` is a starting point, not final.
- **Paul's approval required:** Yes — final field list.

## 2. Food attributes module

**What:** A small custom module (`food-details`) holding structured Food Central attributes (ingredients, allergens, spice level, prep time, dietary flags), linked 1:1 to Product.

- **Why:** Same reasoning as the wine module — allergen/dietary data specifically is compliance-sensitive and needs to be a real, queryable field, not metadata.
- **Business value:** Supports trust and speed for Food Central; allergen/dietary accuracy is a customer-safety matter, not just a UX nicety.
- **Technical impact:** Same pattern as the wine module — new module, migration, module link. No core changes.
- **Implementation difficulty:** Low–moderate.
- **Risks:** Getting allergen data wrong or incomplete has real customer-safety consequences, not just a UX cost — this data needs an operational verification process, not just a data-entry field.
- **Assumptions:** Field list in `PRODUCT_CATALOG.md` is a starting point, not final.
- **Paul's approval required:** Yes — final field list, and who is operationally responsible for keeping allergen/ingredient data accurate.

## 3. Delivery slot scheduling module

**What:** A custom module tracking bookable, capacity-limited delivery/pickup time slots (date, time window, capacity, booked count), linked to Shipping Options, enforced during checkout via a workflow hook.

- **Why:** No native Medusa entity models a time slot — this is the one real gap in an otherwise fully native fulfillment story (see `DELIVERY_MODEL.md`).
- **Business value:** Directly required for Food Central's same-day and scheduled delivery — a core, explicitly stated business requirement.
- **Technical impact:** New module + a workflow hook on checkout (reject if slot full; increment booked count as part of the same transaction, preserving Medusa's compensation/rollback guarantees). No core changes.
- **Implementation difficulty:** Moderate — this is genuine new logic, not just data modeling, and needs to be correct under concurrent bookings.
- **Risks:** Race conditions on slot capacity if not implemented carefully; needs to reuse Medusa's existing locking mechanism (used elsewhere for inventory reservation) rather than inventing a new one.
- **Assumptions:** Slot capacity is set operationally (kitchen throughput), not calculated automatically from anything else in the system.
- **Paul's approval required:** No, on the mechanism itself — but yes on operational parameters (slot length, cutoff times, capacity per slot), which are business/ops decisions.

## 4. Local payment provider

**What:** A custom Payment Provider module wrapping a Nigerian payment service provider (e.g. Paystack or Flutterwave), supporting bank transfer and/or USSD alongside card payment.

- **Why:** Nigerian buyers rely heavily on bank transfer and USSD, and trust these more than card-only checkout from an unfamiliar store — a card-only checkout is a real trust and conversion barrier in this market.
- **Business value:** Directly serves "trustworthy" and "confident enough to purchase immediately" for the Nigerian market specifically.
- **Technical impact:** A genuine backend build, comparable in scope to Medusa's own first-party Stripe integration — implements Medusa's documented Payment Provider interface. No core changes.
- **Implementation difficulty:** Moderate–significant. This should not be underscoped as "just add a provider" — it is real, standalone backend work.
- **Risks:** Reconciliation complexity if cash-on-delivery is also supported (see `BUSINESS_RULES.md` open question); provider API reliability/documentation quality varies.
- **Assumptions:** None yet — provider choice is entirely open.
- **Paul's approval required:** Yes — which provider, and whether cash-on-delivery is supported at all.

## 5. Notification provider (delivery updates)

**What:** A custom Notification Provider module sending order/delivery status updates via WhatsApp and/or SMS, wired into Medusa's existing event-driven notification system.

- **Why:** Proactive status messaging (e.g. confirming an ambiguous landmark-based address, or a "rider is close" update) is how delivery communication actually works well in the Nigerian market, and directly mitigates the addressing-ambiguity risk noted in `DELIVERY_MODEL.md`.
- **Business value:** Reduces failed/delayed deliveries and "where is my order" support burden; can read as care rather than pure logistics if written well.
- **Technical impact:** Medusa's event/notification system is native and event-driven already; only the provider integration itself (WhatsApp Business API and/or an SMS gateway) is new work.
- **Implementation difficulty:** Moderate. WhatsApp Business API specifically carries real setup/approval overhead and ongoing cost; SMS is simpler but less rich.
- **Risks:** WhatsApp Business API approval timelines and cost are outside engineering's control; treat this as a real project with its own timeline, not a quick add-on.
- **Assumptions:** None yet — channel choice is entirely open.
- **Paul's approval required:** Yes — channel choice (WhatsApp vs. SMS vs. both) has direct budget implications.

## 6. Search integration

**What:** Meilisearch, indexing the unified product catalog (both product lines) with facets driven by the wine/food attribute modules above.

- **Why:** Combinable, instant, faceted filtering is core to both wine discovery and food-menu browsing; Meilisearch is open-source and has an official Medusa integration guide, the lowest-risk option of the alternatives considered.
- **Business value:** Directly supports the Search Strategy (`PRODUCT_BLUEPRINT.md` §8).
- **Technical impact:** Standard event-subscriber sync pattern (documented by Medusa) keeping the search index current as products change. No core changes.
- **Implementation difficulty:** Low–moderate, and depends on the wine/food attribute modules being finalized first (indexing a still-changing schema wastes rework).
- **Risks:** None significant, given the official integration guide exists.
- **Assumptions:** Meilisearch over Algolia/Elasticsearch/Typesense — reasoned in earlier research, not yet formally signed off.
- **Paul's approval required:** Yes, formally — this has not been explicitly confirmed, only recommended.

## 7. CMS integration (future, not urgent)

**What:** Sanity, for editorial/marketing content (tasting stories, seasonal campaigns) — not for core commerce data, which stays in Medusa.

- **Why:** Medusa is not an editorial tool; a premium brand needs richer content authoring than product descriptions alone provide.
- **Business value:** Supports the Content Strategy (`PRODUCT_BLUEPRINT.md` §12) but is not on the critical path to launch.
- **Technical impact:** One-way sync from Medusa to Sanity (commerce data flows out, never back in) — a documented Medusa integration pattern.
- **Implementation difficulty:** Low–moderate, and low urgency.
- **Risks:** Low priority; the main risk is scope creep if pulled forward before it's needed.
- **Assumptions:** Sanity over Contentful/Strapi/Payload — reasoned in earlier research, not yet formally signed off.
- **Paul's approval required:** Not urgently — see `ROADMAP.md` for sequencing.

---

## Summary table

| Extension | Type | Difficulty | Paul's approval needed? |
|---|---|---|---|
| Wine attributes module | Custom module | Low–moderate | Yes (field list) |
| Food attributes module | Custom module | Low–moderate | Yes (field list + data ownership) |
| Delivery slot scheduling | Custom module + workflow hook | Moderate | Partially (operational parameters) |
| Local payment provider | Custom payment provider | Moderate–significant | Yes (provider + COD policy) |
| Notification provider | Custom notification provider | Moderate | Yes (channel choice) |
| Search (Meilisearch) | Native module config + sync | Low–moderate | Yes (formal sign-off) |
| CMS (Sanity) | Integration, one-way sync | Low–moderate | Not urgently |

None of these require modifying Medusa core. All follow patterns already documented and used elsewhere in the Medusa codebase itself.
