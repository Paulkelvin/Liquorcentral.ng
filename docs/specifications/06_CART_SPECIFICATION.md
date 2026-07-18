# Cart Specification

**Status:** Not Started
**Version:** 0.1 (Placeholder)
**Owner:** Product
**Last Updated:** 2026-07-18

## Document Purpose

Defines cart behavior — adding, updating, and removing items; and specifically how a **mixed cart** (a Wine & Spirits item and a Food Central item together) is presented, since this is the direct consequence of the one-cart, one-checkout decision in `PRODUCT_BLUEPRINT.md` §9.

## Scope

Covers the cart itself (drawer/page, whichever is chosen) up to the start of checkout. Does **not** cover checkout/payment/delivery-slot selection (see `07_CHECKOUT_SPECIFICATION.md`).

## Dependencies

- `PRODUCT_BLUEPRINT.md` §9 (Checkout Strategy)
- `DELIVERY_MODEL.md` (per-line-item delivery-leg clarity)
- `DESIGN_SYSTEM.md` v2.0

## Planned Sections

Purpose · Cart Responsibilities · Business Goals · Customer Goals · Primary User Journeys · Mixed-Cart Presentation Behaviour · Quantity/Removal Behaviour · Backend Data Requirements · Delivery-Leg Clarity Per Line Item · Accessibility Considerations · Performance Expectations · Analytics Events · Empty/Loading/Error States · Version 1 Scope · Future Enhancements · Risks & Assumptions · Acceptance Criteria

## Status

Not Started — awaiting Phase 1 development sequencing.
