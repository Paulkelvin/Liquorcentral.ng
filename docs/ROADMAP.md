# Roadmap

**Status:** Draft (sequencing proposal; not yet approved as a committed schedule — no dates are attached, this defines order and dependency, not timing)
**Version:** 1.2
**Owner:** Program
**Last Updated:** 2026-07-18

Based on the confirmed no-marketplace, single-company model.

## Sequencing logic

Prove ordinary commerce first, then layer in scheduling sophistication, then discovery/content polish, then mobile, then operational hardening. Each phase is a prerequisite for the one after it.

> This roadmap supersedes the marketplace-oriented rollout considered in earlier research (which included vendor onboarding and payout phases). Those phases are removed entirely — see `PRODUCT_BLUEPRINT.md` supersession notice.

## Phase 0 — Brand & design foundation ✅ Complete

- `BRAND_IDENTITY.md` v1 — vision, personality, voice, color-usage hierarchy, and visual/typography/photography principles for the four already-approved brand colors. **Approved in full by Paul, 2026-07-18.**
- `EXPERIENCE_PRINCIPLES.md` v1.0 — 15 principles defining how customers should experience every screen and interaction, plus a product vision and competitive positioning. **Approved in full by Paul, 2026-07-18.**

### Phase 0b — Design System Foundations — Draft v1, one open item

`DESIGN_SYSTEM.md` has been elevated from principles-only to concrete, agreed foundations — **foundational rules, not page layouts**, deliberately not jumping straight to designing buttons, cards, or screens. Covers:

- **Typography scale** — the specific size/weight/line-height steps implementing `BRAND_IDENTITY.md` §14's direction.
- **Spacing scale** — the specific numeric steps implementing `BRAND_IDENTITY.md` §20's white-space philosophy.
- **Grid system** — concrete column/gutter rules for the mobile-first responsive grid already established in principle.
- **Elevation/shadows** — how depth and layering are expressed (modals, cards, dropdowns).
- **Border radius** — a consistent corner-rounding scale, one part of visual consistency.
- **Color roles** — semantic roles (primary, secondary, success, warning, danger, info, disabled, etc.) mapped onto the four approved brand colors and their approved hierarchy/contrast rules from `BRAND_IDENTITY.md` §13 — not raw hex values used ad hoc.
- **Motion timing** — concrete durations/easings implementing `BRAND_IDENTITY.md` §17's "calm, confident gesture" principle.
- **Breakpoints** — the specific screen-width steps the mobile-first grid responds to.
- **Icon sizing** — a consistent size scale implementing `BRAND_IDENTITY.md` §18's clarity-first iconography principle.
- **Form behaviors** — validation states, error messaging patterns, focus/input states — directly serving `EXPERIENCE_PRINCIPLES.md` principles 1, 11, and 12 (Confidence Before Complexity, Consistency Creates Confidence, Reduce Cognitive Load).
- **Accessibility tokens** — minimum contrast ratios (already computed for the brand colors), minimum touch-target size, focus-ring specification — the concrete, testable expression of `BRAND_IDENTITY.md` §22 and `EXPERIENCE_PRINCIPLES.md` principle 13.

Every item above is a foundational rule every future component and screen will draw from — not a page design. Building actual UI after these are agreed should require far fewer ad hoc decisions, since every component follows the same language.

**Status:** All of the above is drafted in `DESIGN_SYSTEM.md` Part B. One open item remains: five new functional colors proposed to complete the color-role system (a neutral grayscale plus distinct danger/warning/info colors) — see `DESIGN_SYSTEM.md` §B6 and `PROJECT_STATUS.md`. Everything else in Phase 0b can be treated as settled; actual UI component/screen design should wait only on that one item.

- This phase can run in parallel with Phase 1's backend work below; it blocks visual/frontend work specifically, not backend/architecture work.

## Phase 1 — Foundation: single-catalog commerce, end to end

- Stand up Medusa on Postgres + Redis (production-mode from day one, never launched on in-memory dev defaults).
- Install and configure the storefront (see `TECH_STACK.md`), regions/currency/tax for Nigeria.
- Connect a payment provider (see `MEDUSA_EXTENSIONS.md` #4 — this decision is a launch blocker, not a nice-to-have).
- Build and ship **Wine & Spirits only** end to end: browse → age-gate → PDP → cart → guest checkout → payment → nationwide delivery.
- Include age verification here, not later — it's a legal gate on checkout, not an add-on.

## Phase 2 — Product data foundation

- Build the wine-attributes module (`MEDUSA_EXTENSIONS.md` #1) and its admin editing widget.
- This must happen before search (Phase 6) — indexing a still-changing schema wastes rework.

## Phase 3 — Food Central catalog and delivery foundation

- Build the food-attributes module (`MEDUSA_EXTENSIONS.md` #2).
- Configure Lagos-scoped fulfillment (Service Zone/Geo Zone) and pickup — both native, no new module required (see `DELIVERY_MODEL.md`).
- Ship ordinary (non-scheduled) Food Central ordering and pickup before adding time-slot scheduling on top.

## Phase 4 — Delivery scheduling

- Build the delivery-slot module (`MEDUSA_EXTENSIONS.md` #3) for same-day and scheduled Food Central delivery — the highest-complexity fulfillment feature, deliberately sequenced after the basics are proven.

## Phase 5 — Delivery communication

- Integrate the notification provider (WhatsApp/SMS — `MEDUSA_EXTENSIONS.md` #5) for proactive delivery updates, once real order volume exists to communicate about.

## Phase 6 — Search

- Integrate Meilisearch (`MEDUSA_EXTENSIONS.md` #6) now that both attribute modules' schemas are stable.

## Phase 7 — Content and CMS

- Integrate Sanity (`MEDUSA_EXTENSIONS.md` #7) for editorial content. Off the checkout critical path; can run in parallel with other phases once bandwidth allows.

## Phase 8 — Mobile app

- Build a mobile app only once the web storefront's data layer and checkout flow are proven — reduces rework since the underlying API contracts are already validated by then.

## Phase 9 — Operational hardening

- Admin-side tooling refinement, reporting, and any process gaps identified from real operational volume (e.g. whether a dedicated rider-dispatch module becomes justified — see `PRODUCT_BLUEPRINT.md` §17).

## Explicitly out of scope (do not schedule without a new decision)

- Any marketplace/vendor functionality.
- Loyalty/subscription mechanics (noted as a future opportunity, not committed).
- Third-party carrier integration (company riders only, per `BUSINESS_RULES.md`).

## Open questions blocking Phase 0 and Phase 1

See `PROJECT_STATUS.md` for the current, consolidated list. As of this version: `BRAND_IDENTITY.md` and `EXPERIENCE_PRINCIPLES.md` approval together gate all visual/frontend work (Phase 0 onward), and the payment provider choice (`MEDUSA_EXTENSIONS.md` #4) is the most launch-critical open decision blocking backend Phase 1. None of these block each other.
