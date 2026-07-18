# Checkout Specification

**Status:** Not Started
**Version:** 0.1 (Placeholder)
**Owner:** Product
**Last Updated:** 2026-07-18

## Document Purpose

Defines the checkout flow end to end — guest checkout, address capture (including freeform/landmark support per the Nigerian-context findings), delivery-slot selection, payment, the age-verification backstop, and order confirmation.

## Scope

Covers everything from "proceed to checkout" through order confirmation. Does **not** cover the cart itself (see `06_CART_SPECIFICATION.md`) or post-purchase account/order-history behavior (see `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`).

## Dependencies

- `PRODUCT_BLUEPRINT.md` §9 (Checkout Strategy), §11 (Trust Strategy)
- `BUSINESS_RULES.md` (guest checkout, age confirmation)
- `DELIVERY_MODEL.md`
- `MEDUSA_EXTENSIONS.md` #3 (delivery slots), #4 (local payment provider)
- `DESIGN_SYSTEM.md` v2.0 §B9 (form behaviors)

## Planned Sections

Purpose · Checkout Responsibilities · Business Goals · Customer Goals · Primary User Journeys · Guest Checkout Behaviour · Address Capture Behaviour · Delivery Slot Selection Behaviour · Payment Behaviour · Age-Verification Backstop · Backend Data Requirements · Accessibility Considerations · Performance Expectations · Analytics Events · Empty/Loading/Error States · Version 1 Scope · Future Enhancements · Risks & Assumptions · Acceptance Criteria

## Status

Not Started — awaiting Phase 1 development sequencing. Depends on the payment-provider decision in `PROJECT_STATUS.md` being resolved first.
