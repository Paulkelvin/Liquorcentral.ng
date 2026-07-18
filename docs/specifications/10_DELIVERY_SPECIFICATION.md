# Delivery Specification

**Status:** Not Started
**Version:** 0.1 (Placeholder)
**Owner:** Operations
**Last Updated:** 2026-07-18

## Document Purpose

Defines delivery, pickup, and scheduling UI end to end — nationwide Wine & Spirits delivery-estimate display, Lagos-only Food Central delivery-area validation, the slot picker, and post-order status communication.

## Scope

Covers the customer-facing delivery experience across checkout and post-purchase. Slot-picker mechanics specific to food ordering are detailed jointly with `09_FOOD_ORDERING_SPECIFICATION.md`; this document is the canonical source for delivery/pickup behavior shared across both product lines.

## Dependencies

- `DELIVERY_MODEL.md`, `PRODUCT_BLUEPRINT.md` §10
- `MEDUSA_EXTENSIONS.md` #3 (delivery slots), #5 (notification provider)
- `BUSINESS_RULES.md`

## Planned Sections

Purpose · Delivery Responsibilities · Business Goals · Customer Goals · Primary User Journeys · Delivery-Area Validation Behaviour · Slot Picker Behaviour (calendar-grid, not list/scroll-wheel) · Pickup Behaviour · Order Status/Tracking Communication · Backend Data Requirements · Accessibility Considerations · Performance Expectations · Analytics Events · Empty/Loading/Error States · Version 1 Scope · Future Enhancements · Risks & Assumptions · Acceptance Criteria

## Status

Not Started — awaiting Phase 1 development sequencing. Depends on the payment-provider, courier-mechanism, and notification-channel decisions in `PROJECT_STATUS.md` being resolved first.
