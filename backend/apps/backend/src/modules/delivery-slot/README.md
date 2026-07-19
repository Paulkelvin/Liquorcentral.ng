# delivery-slot

A bookable, capacity-limited Food Central delivery/pickup time-window scheduling module. Implements `MEDUSA_EXTENSIONS.md` #3 per the architecture defined in `docs/implementation-planning/TIER_B_DELIVERY_SLOT_MODULE.md` (Approved, v1.0) — that document is the authoritative reference for this module's responsibilities, non-responsibilities, and boundaries; this file only orients a contributor to the code.

## What this module is

- A small module holding a bookable time window (`starts_at`, `ends_at`), an optional same-day cutoff (`cutoff_at`), and two operational numbers — `capacity` and `booked_count` — per slot. See `models/delivery-slot.ts`.
- Linked to the native Fulfillment module's Shipping Option via `src/links/delivery-slot-shipping-option.ts` — many slots to one Shipping Option, not 1:1 (`TIER_B` §10).
- Same-day and scheduled delivery are one mechanism, not two: a same-day slot is simply a slot whose `starts_at` falls on today's date and carries an active `cutoff_at`; nothing in the model distinguishes them beyond that (`TIER_B` §5).
- **Capacity is enforced atomically**, reusing Medusa's own Locking Module (the `locking-redis` provider medusa-config.ts already configures for this project) rather than inventing new concurrency control (`TIER_B` §6, §10):
  - `src/workflows/delivery-slot/lib/capacity.ts` — `bookDeliverySlotCapacity`/`releaseDeliverySlotCapacity`, the atomic check-and-increment/decrement, both wrapped in `ILockingModule.execute()`.
  - `src/workflows/delivery-slot/steps/book-delivery-slot-capacity.ts` — a `createStep` wrapper around the same logic, for use in ordinary workflow composition.
  - `src/workflows/hooks/complete-cart-validate.ts` — wires the atomic check into Medusa's native `completeCartWorkflow` via its `validate` hook, with a genuine `compensateFn` (not just an invoke handler), so that if a later step in cart completion fails (inventory reservation, payment authorization), this hook's own compensation releases the capacity it booked — the same compensation guarantee `reserveInventoryStep` gets natively. See that file's own comment for why `validate` was chosen over the workflow's other two hooks (`beforePaymentAuthorization`, `orderCreated`).
- A delivery slot is attached to a cart the same way any fulfillment provider attaches custom data to a shipping method selection — the native `data` JSON field on the cart's shipping method (`src/workflows/delivery-slot/lib/extract-delivery-slot-id.ts`) — no new cart field, no Cart module schema change.

## What this module deliberately is not

Per `TIER_B_DELIVERY_SLOT_MODULE.md` §4 — this module does not: define kitchen operating hours or capacity-driven early closure; compute Food Central's live product-availability state; determine delivery status progression; perform rider assignment/dispatch; calculate or hold delivery fees; perform address-based delivery-eligibility enforcement; decide rescheduling/cancellation policy; or set its own operational parameters (slot length, cutoff timing, capacity are staff-configured inputs this module stores, never proposes). It has no application to Wine & Spirits (§8).

## The pickup boundary — deliberately unresolved

`TIER_B` §5/§19 states explicitly that this module's shape must not foreclose whether pickup is ever booked through this same capacity mechanism. Consistent with that: **no `delivery_vs_pickup` or `is_same_day` discriminator field exists on the model.** "Same-day" is a read-time computation (`starts_at` vs. the current date), not stored data; whether pickup ever uses this mechanism is an open question this implementation does not answer either way.

## Known engineering limitation — residual compensation gap

The `validate` hook runs before order creation, inventory reservation, and payment authorization begin — deliberately, since a slot at capacity is then rejected before any of that side-effecting work starts (cheaper, and satisfies `TIER_B` §12's "must be caught before payment is charged" as directly as this workflow allows). The `compensateFn` registered on this hook means a *later* step's failure (inventory reservation, payment authorization) correctly releases the capacity this hook booked — verified by this module's own concurrency tests exercising the underlying `bookDeliverySlotCapacity`/`releaseDeliverySlotCapacity` pair directly.

What is **not** covered by any automatic Medusa mechanism: if the `validate` hook's own booking succeeds but the *hook step itself* is retried by the workflow engine for an unrelated transient reason before the workflow's own compensation would run, no double-decrement guard exists beyond the lock's own atomicity. This is a narrow, low-probability edge case common to any hook-based extension of a native workflow (hooks are plain invoke/compensate pairs registered into the same step graph, not a bespoke transactional boundary this module invented) — named here explicitly rather than silently assumed away, per this project's "honest, labeled, not hidden" documentation discipline.

## Known open items (not resolved by this implementation)

- **Operational parameters remain open business decisions**: slot length, cutoff timing, and capacity-per-slot values are not proposed, narrowed, or invented anywhere in this module — it stores whatever a future admin workflow (not yet built) supplies (`TIER_B` §9, §18, §21, `MEDUSA_EXTENSIONS.md` #3).
- **Kitchen operating-hours configuration** is a distinct, not-yet-scoped surface this module's slot offerings must eventually respect as an external constraint — not built here (`TIER_B` §4, §18).
- **No admin-facing slot-management UI or API route exists yet** — this milestone builds the data model, the link, and the capacity-enforcement mechanism only, per `IMPLEMENTATION_PLANNING.md`'s Tier B → Tier C sequencing (API contract planning for Checkout and Food Ordering is explicitly named as blocked on this module, `TIER_B` §21).
- **The pickup-slot boundary** (see above) and **the kitchen-capacity-vs-rider-capacity reconciliation question** (`TIER_B` §6, §18) both remain open, exactly as `TIER_B_DELIVERY_SLOT_MODULE.md`'s own finalization pass left them.
