# Delivery Model

**Status:** Strategy confirmed; specific slot/geo-zone configuration and payment/logistics providers still open. Expands on `PRODUCT_BLUEPRINT.md` §10.

## Two fulfillment models, one checkout

| | Wine & Spirits | Food Central |
|---|---|---|
| Coverage | Nationwide | Lagos only |
| Fulfillment model | Standard warehouse dispatch | Cooked to order, dispatched by company-owned riders |
| Timing options | Standard delivery windows | Same-day, scheduled slot, or pickup |
| Third-party carrier | Not yet decided (see `BUSINESS_RULES.md`) | None — company-owned riders only |

A single checkout handles both — see `PRODUCT_BLUEPRINT.md` §9. There is no order-splitting; a mixed cart is one order with two fulfillment legs attached to different line items.

## What's already native in Medusa (no custom module needed)

- **Multiple warehouses/locations** — Medusa's Stock Location concept already supports this; the wine warehouse and the Food Central kitchen(s) are simply separate stock locations.
- **Geographic delivery restriction** — a Service Zone can be scoped to specific geo-zones (country-wide for Wine & Spirits; Lagos-specific postal patterns for Food Central). This is how "nationwide" vs. "Lagos only" is enforced at the fulfillment layer, not the catalog layer.
- **Pickup** — modeled as an ordinary Shipping Option (often free) tied to a Service Zone covering the kitchen's own location. No new code required.

## What needs a small custom module

- **Delivery slots** (same-day cutoff, scheduled time windows) — no core Medusa entity models a bookable, capacity-limited time slot. A small custom module tracks slot date/time window, capacity, and bookings, linked to Shipping Options and enforced during checkout (rejecting a booking if a slot is full, incrementing the booked count as part of the same transaction). See `MEDUSA_EXTENSIONS.md`.

## Same-day delivery, specifically

- The ordering cutoff for same-day delivery should be shown explicitly and dynamically (e.g. a countdown), not as a vague "same-day where available" promise — vague promises measurably underperform explicit cutoffs in delivery-scheduling UX.
- Same-day is, mechanically, just a delivery slot dated today with a cutoff time — it does not need a separate mechanism from scheduled delivery.

## Scheduled delivery, specifically

- Present slot selection as a calendar-style date grid plus time-of-day options — long dropdown lists and scroll-wheel pickers are a documented worse pattern for this specific interaction.

## Pickup, specifically

- Present pickup with equal visual weight to delivery, including a clear ready-time estimate — pickup is frequently under-designed relative to delivery despite being operationally simpler and often faster for the customer.

## Rider dispatch

Because riders are company-owned, no third-party carrier API integration is required for v1. Rider assignment and live tracking can be handled operationally (e.g. manual dispatch, WhatsApp/SMS status updates to the customer) rather than through a dedicated software module at launch. A lightweight internal rider/dispatch module is a reasonable future addition once delivery volume justifies the investment — see `PRODUCT_BLUEPRINT.md` §17 (Future Expansion).

## Delivery communication

Proactive status updates (e.g. via WhatsApp/SMS) are recommended over relying solely on an in-app order-status page, particularly given address ambiguity is a known challenge in the Nigerian delivery context (landmark-based rather than postal addressing). This requires a custom notification-provider integration — see `MEDUSA_EXTENSIONS.md`.

## Open questions (not yet decided)

- Wine & Spirits' nationwide delivery mechanism: in-house fleet, third-party courier, or a mix.
- Whether cash-on-delivery is offered at all, and if so, how it's reconciled operationally for alcohol specifically.
- Which local payment provider is integrated (Paystack/Flutterwave-class — see `MEDUSA_EXTENSIONS.md`).
- Which notification channel(s) are committed to for delivery updates (WhatsApp Business API has real cost/approval overhead; SMS is simpler but less rich).
- Exact Lagos delivery-area definition: postal-pattern-based geo-zones, or true radius-from-point geofencing if postal patterns prove insufficiently precise.

These are tracked in `PROJECT_STATUS.md`.
