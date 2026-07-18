# Roadmap

**Status:** Sequencing proposal based on the confirmed no-marketplace, single-company model. Not yet approved as a committed schedule — no dates are attached; this defines order and dependency, not timing.

## Sequencing logic

Prove ordinary commerce first, then layer in scheduling sophistication, then discovery/content polish, then mobile, then operational hardening. Each phase is a prerequisite for the one after it.

> This roadmap supersedes the marketplace-oriented rollout considered in earlier research (which included vendor onboarding and payout phases). Those phases are removed entirely — see `PRODUCT_BLUEPRINT.md` supersession notice.

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

## Open questions blocking Phase 1

See `PROJECT_STATUS.md` for the current, consolidated list — as of this version, the payment provider choice (`MEDUSA_EXTENSIONS.md` #4) is the most launch-critical open decision.
