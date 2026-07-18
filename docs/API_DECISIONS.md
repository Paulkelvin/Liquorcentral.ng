# API Decisions

**Status:** Draft (initial scoping based on the confirmed single-company model; no API routes implemented yet)
**Version:** 1.0
**Owner:** Engineering
**Last Updated:** 2026-07-18

## Principle

Use Medusa's native `/store/*` and `/admin/*` REST APIs as-is wherever possible. Add custom routes only where a genuine new capability is needed that Medusa's commerce primitives don't already expose — and even then, custom routes should be thin, delegating to workflows rather than containing business logic themselves (Medusa's own convention, followed throughout its codebase).

## Native APIs used as-is

Because LiquorCentral is a single company with no vendors, almost the entire storefront can be built directly against Medusa's existing Store API:

- Product listing/detail (`/store/products`) — for both Wine & Spirits and Food Central, distinguished by category/collection filters, not by a separate endpoint.
- Cart and checkout (`/store/carts`, `/store/carts/:id/complete`) — one cart, one checkout, no custom order-splitting endpoint (a direct consequence of the no-marketplace decision — see `PRODUCT_BLUEPRINT.md` §9).
- Customer accounts, guest checkout, order history (`/store/customers`, `/store/orders`) — native, no actor-type beyond the default customer.
- Regions, shipping options, payment methods — native, configured rather than extended.

## Where custom routes are anticipated

| Capability | Why native isn't enough | Anticipated route shape |
|---|---|---|
| Delivery slot availability/booking | No native concept of a bookable time slot (see `MEDUSA_EXTENSIONS.md` #3) | e.g. `GET /store/delivery-slots`, consumed during checkout |
| Wine/food attribute display in listings | Attribute data lives in linked custom modules, not the base Product response | Extended via Medusa's Query system (native mechanism for joining linked data), likely not a wholly separate route — to be confirmed during implementation |

No other custom routes are currently anticipated. This list should be updated the moment a new one is identified — do not build an undocumented route.

## Authentication

- **Customer-facing:** the native `customer` actor type, with guest checkout supported natively.
- **Admin-facing:** the native `user` actor type.
- **No custom actor type is needed** (unlike the retired marketplace model, which would have needed a `vendor` actor type). This is a direct simplification from the no-marketplace decision.

## What's explicitly not being built

- No vendor-scoped API routes (retired along with the marketplace model).
- No order-splitting endpoint or workflow.
- No per-vendor payout API.

## Open questions

- Exact shape of the delivery-slot API (query parameters, response shape) — to be defined when the delivery-slot module (`MEDUSA_EXTENSIONS.md` #3) is scoped for implementation.
- Whether wine/food attribute data is exposed via extended product `fields` queries (Medusa's native Query mechanism) or a dedicated endpoint — a technical decision to make at implementation time, not a business one.

No Paul approval is required for the technical shape of these routes — only the underlying business behavior they expose (e.g. delivery-slot rules) requires his input, and that's tracked in `DELIVERY_MODEL.md` and `MEDUSA_EXTENSIONS.md`.
