# Delivery Specification

**Status:** In Progress
**Version:** 0.1
**Owner:** Operations
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for delivery *operations* and the customer's delivery experience once an order has been placed — everything that happens between order confirmation and the item genuinely being in the customer's hands (or collected by them), for both catalogs. It defines *customer behavior, operational logic, business rules, trust, accessibility, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §10 (Delivery Strategy), `BUSINESS_RULES.md`'s delivery rules, `DELIVERY_MODEL.md`, `USER_FLOWS.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0, and none of it contradicts them. It integrates directly with the nine already-frozen specifications it sits beside, none of which it redefines: `06_CART_SPECIFICATION.md` §5/§6 already establishes the two-fulfillment-leg mixed-cart model and the cart-level delivery messaging this document's operational reality must honor; `07_CHECKOUT_SPECIFICATION.md` §7–§13 already establishes address capture, delivery-method and slot-selection mechanics, address-based eligibility enforcement, and fee calculation; `09_FOOD_ORDERING_SPECIFICATION.md` §9–§13 already establishes Food Central's customer-facing same-day/scheduling/pickup/delivery messaging and its cook-to-order status progression. **This document does not reopen or redefine any of that pre-order, customer-facing checkout and ordering behavior.** Its job is what those documents each explicitly defer to it: the operational reality of actually getting an order to the customer (or the customer to the order, for pickup) — rider workflow, delivery status progression after confirmation, tracking expectations, address/landmark handling in practice, failed-delivery and rescheduling/cancellation behavior, proof of delivery, and the delivery-specific trust and communication mechanisms that follow order confirmation.

**Scope boundary:** where this document touches something already specified elsewhere (delivery-method selection, slot-picker mechanics, the mixed-order two-group structure, delivery fee calculation, the pre-order age-verification gate), it restates or extends only the operational consequence of that existing decision — it does not re-derive or alter the decision itself.

**Explicitly out of scope for this document, per direct instruction:** third-party courier integrations, live GPS tracking, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, and locker pickup are not introduced here as committed v1 behavior. Where referenced at all, they appear only as future considerations or explicitly out-of-scope items (§27), never as assumed v1 mechanisms.

**Where this document depends on a business or operational decision that has not yet been made** (Wine & Spirits' delivery mechanism, the exact Lagos delivery-area definition, delivery-fee schedule, failed-delivery-attempt policy, cancellation-cutoff policy, and whether age is physically re-verified at the point of hand-off), **it says so explicitly rather than inventing an answer.**

Where a decision is grounded in external UX research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend/operations lead should understand exactly what data and process it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Delivery Philosophy

**Delivery is where every promise this platform has made so far is either kept or broken — nothing said at checkout matters if the delivery itself is confusing, silent, or dishonest.** Three commitments follow, extending rather than restating `06_CART_SPECIFICATION.md` §1's "prepare, never surprise" discipline into the physical, operational world:

1. **Every delivery status shown is honest and current, never a guess dressed up as a fact.** A delivery window is a window, not a precise promise; a status is only shown once it is genuinely true.
2. **Nothing about delivery is silently escalated to a third party.** `BUSINESS_RULES.md` states plainly that Food Central is delivered exclusively by company-owned riders, and `PRODUCT_BLUEPRINT.md` §11 names "sold and delivered by us directly" as a genuine trust asset — a claim only true because delivery is never quietly outsourced.
3. **Operational realism over invented convenience.** This document specifies what delivery genuinely requires operationally, at the company's actual current scale (manual/operational rider coordination, not a dispatch platform) — it does not invent logistics capability the business has not built or approved (§6 of the direct instructions this document follows).

## 2. Business Objectives

- **Make good on every delivery-related promise made earlier in the customer's journey** (cart estimates, checkout slot confirmation, food-ordering cutoff/scheduling messaging) — this document is judged by whether the delivery experience matches what was promised, not by inventing new promises of its own.
- **Protect the "sold and delivered by us directly" trust claim** (`PRODUCT_BLUEPRINT.md` §11) by ensuring every delivery interaction — rider conduct, communication, proof of delivery — reflects a single accountable company, never a disconnected third-party experience.
- **Minimize failed and rescheduled deliveries** through honest upfront communication (address/landmark confirmation, realistic windows) rather than absorbing the cost of avoidable failures after the fact.
- **Keep Food Central's and Wine & Spirits' delivery realities operationally distinct** — a same-day, company-rider, Lagos-only cooked delivery and a multi-day, nationwide, warehouse-dispatched delivery are genuinely different operations, and this document does not force them into one shared process where doing so would misrepresent either.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to the post-order delivery experience specifically:

| Customer type | Delivery objective |
|---|---|
| Confident Buyer | Know exactly when their order will arrive or be ready, without needing to ask, and have that estimate hold. |
| Guided Browser | Understand, before committing, what delivery will actually look like for their specific order (§5). |
| Repeat Household | Experience predictable, consistent delivery behavior across repeat orders, including for a recurring mixed wine-and-food order (§15). |
| Gifter | Trust that a gift delivered to a third party arrives with the same care and communication as an order delivered to themselves. |

Every customer additionally needs: to know a delivery status is genuinely current, not stale (§10); to be told promptly and honestly if something goes wrong (§13); and to have a clear, low-friction path to fix an address problem, a missed delivery, or a scheduling conflict (§12, §13, §14) rather than being left to guess what happens next.

## 4. Entry Points & Scope Boundary

- **The order confirmation page** (`07_CHECKOUT_SPECIFICATION.md` §17) is the natural handoff point into this document's scope — everything from that moment until the order is genuinely delivered or picked up is this document's responsibility.
- **The order detail / order history view** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14) is where a logged-in customer checks delivery status after the fact — this document specifies what that view must be able to show (§10, §11), not the account-area page itself, which `08` already owns.
- **Proactive customer communication** (§18) is an entry point in its own right — a customer may first learn of a delivery-status change via a message rather than by returning to the site.
- **This document does not introduce a new pre-order entry point** — delivery-method and slot selection remain checkout's and Food Central ordering's responsibility (`07_CHECKOUT_SPECIFICATION.md` §9/§10, `09_FOOD_ORDERING_SPECIFICATION.md` §9–§12), restated here only where the operational consequence of that earlier choice needs specifying.

## 5. Delivery Coverage: Lagos vs. Nationwide

- **Wine & Spirits ships nationwide; Food Central delivers Lagos only** — restating `BUSINESS_RULES.md`'s non-negotiable rule directly, not re-deciding it. This document's job is the operational behavior that follows from the rule, not the rule itself.
- **One order, two fulfillment legs, never a split order** — restating `PRODUCT_BLUEPRINT.md` §9 and `06_CART_SPECIFICATION.md` §6 exactly: a mixed cart produces one order with two independent fulfillment legs attached to different line items, not two separate orders requiring two separate deliveries to be independently invented here.
- **The authoritative address-eligibility check happens at checkout** (`07_CHECKOUT_SPECIFICATION.md` §11) — this document does not re-run or redefine that check; it picks up only once an order already exists with a confirmed, eligible delivery configuration for each leg present.
- **The exact Lagos delivery-area definition (postal-pattern zones vs. true radius/geofencing) remains an open business decision** (`DELIVERY_MODEL.md`, `PROJECT_STATUS.md`), not resolved here — this document specifies operational behavior that holds regardless of which definition is eventually adopted.

## 6. Wine & Spirits Delivery Workflow (Nationwide)

- **Standard warehouse dispatch**, per `DELIVERY_MODEL.md` — an order is picked and dispatched from the relevant stock location (native Medusa Stock Location/Fulfillment behavior, `PRODUCT_BLUEPRINT.md` §10), not a cook-to-order process.
- **Delivery timing is a window, not a slot** — Wine & Spirits does not use the bookable, capacity-limited slot mechanism Food Central uses (`07_CHECKOUT_SPECIFICATION.md` §10); it uses standard delivery windows appropriate to nationwide dispatch, consistent with `DELIVERY_MODEL.md`'s explicit distinction between the two fulfillment models.
- **The exact delivery mechanism — in-house fleet, third-party courier, or a mix — remains an open business decision** (`BUSINESS_RULES.md`, `PROJECT_STATUS.md`) already flagged by `07_CHECKOUT_SPECIFICATION.md` §9; this document specifies the customer-facing and operational behavior that must hold regardless of which mechanism is chosen (an honest window, an honest status progression, §10), not the mechanism itself.
- **Nationwide delivery is never described using Food Central's same-day/scheduled language** — the two are genuinely different operational products, and conflating their vocabulary would misrepresent both, restating `06_CART_SPECIFICATION.md` §6's "never merged into one promise" discipline at the operational level.

## 7. Food Central Delivery Workflow (Lagos, Company-Owned Riders)

- **All Food Central deliveries are made by company-owned riders — no third-party courier or dispatch platform is used**, restating `BUSINESS_RULES.md`'s non-negotiable rule directly.
- **The operational workflow, at the level this document specifies it**: an order finishes preparation (`09_FOOD_ORDERING_SPECIFICATION.md` §7's "Ready" stage) → a rider is assigned and collects the order from the kitchen → the rider travels to the delivery address → the order is handed off (§17) → the order is marked Completed. This is a minimum, honest sequence; the exact internal assignment/dispatch mechanics beneath it are an operational detail, not fixed by this document.
- **Rider assignment and dispatch are currently an operational process (manual/staff-coordinated), not a dedicated software module** — directly restating `DELIVERY_MODEL.md`'s "Rider dispatch" section and `PRODUCT_BLUEPRINT.md` §17: because riders are company-owned, no third-party carrier API integration is required for v1, and a dedicated dispatch module is a reasonable future investment only once delivery volume justifies it (§27), not built now.
- **This workflow does not require or assume live GPS rider tracking** (§27) — status communication (§10, §18) is the mechanism this document specifies for keeping the customer informed, not a live map.

## 8. Pickup Workflow (Operational)

- **Pickup is Food Central's exclusive-to-date pickup option** — restating `05_PRODUCT_DETAILS_SPECIFICATION.md` §21 and `06_CART_SPECIFICATION.md` §11's finding directly: pickup is not assumed for Wine & Spirits anywhere in `/docs`, and this document does not invent it.
- **Pickup carries equal operational care to delivery**, not just equal visual weight (already established at checkout, `07_CHECKOUT_SPECIFICATION.md` §9) — a ready-time estimate is honored the same way a delivery window is (§1), and a customer arriving at the stated ready time is not kept waiting as a matter of routine.
- **Pickup confirmation at handoff is a plain identity check** (e.g., order number and name) — sufficient for an ordinary pickup, with the same age-verification question (§17) applying if the order contains Wine & Spirits items being picked up in a mixed order.
- **Pickup location details (address, hours) are informational content**, not specified behaviorally here — a `DELIVERY_MODEL.md`/operational detail, consistent with `09_FOOD_ORDERING_SPECIFICATION.md` §11's identical treatment.

## 9. Same-Day & Scheduled Delivery Fulfillment

- **The customer-facing mechanics of same-day cutoffs and scheduled-slot selection are entirely `07_CHECKOUT_SPECIFICATION.md` §10's and `09_FOOD_ORDERING_SPECIFICATION.md` §9/§10's responsibility — this document does not redefine either.** This section specifies only what happens operationally once a slot is booked.
- **A confirmed slot becomes an operational commitment the moment it is booked** — kitchen preparation timing (`09_FOOD_ORDERING_SPECIFICATION.md` §7, §8) and rider availability (§7, above) are both planned against the booked slot, not against an approximate or best-effort timeframe.
- **A same-day order's fulfillment timeline is compressed but follows the identical status progression** (§10) as a scheduled order — same-day is not a separate operational process, consistent with `DELIVERY_MODEL.md`'s explicit finding that same-day requires no separate mechanism from scheduled delivery.
- **If a booked slot's capacity genuinely cannot be honored after booking** (a kitchen or rider-capacity shortfall discovered after confirmation), this is treated as a failed-delivery-adjacent scenario (§13) requiring proactive, honest communication — never a silent no-show. The exact operational threshold for when this is deemed unavoidable is not specified here (§28).

## 10. Delivery Status Progression & Delivery Windows

- **Food Central reuses its own already-established progression exactly** (`09_FOOD_ORDERING_SPECIFICATION.md` §7): Order Received → Preparing → Ready (pickup) or Out for Delivery → Completed. This document does not redefine it.
- **Wine & Spirits uses its own equivalent progression**, specified here for the first time since `09_FOOD_ORDERING_SPECIFICATION.md` explicitly deferred nationwide dispatch status to this document: Order Placed → Dispatched → In Transit → Delivered. No stage is skipped or shown out of order, mirroring `09` §7's identical rule for the same reason — a skipped stage misrepresents the operational reality it exists to communicate honestly.
- **A delivery window is shown as an honest range, never a single misleadingly precise time**, unless the fulfillment model genuinely supports precision (e.g., Food Central's same-day slot) — restating `DELIVERY_MODEL.md`'s explicit finding that vague promises underperform explicit ones, applied here as the general rule governing how any window, precise or ranged, is communicated: whichever precision is genuinely true is what's shown, never rounded toward false confidence.
- **A status is only shown once it is genuinely true** — restating §1 directly: "Dispatched" is not shown before an order has genuinely left the warehouse; "Out for Delivery" is not shown before a rider has genuinely collected the order.

## 11. Delivery Tracking Expectations

- **Tracking, in this document's scope, means an accurate, promptly-updated status view and proactive messaging (§18) — not a live GPS map or minute-by-minute rider location.** Live GPS tracking is explicitly out of scope for v1 (§27), per direct instruction; this document specifies the honest, lower-fidelity tracking experience that does not depend on it.
- **The order detail view** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14) **shows the current delivery status at all times**, using the same status progression (§10) — a customer should never need to contact support to learn something the interface already knows.
- **A guest customer's tracking access is order-number-based** (e.g., an order-confirmation link), consistent with guest checkout remaining fully supported throughout the platform (`BUSINESS_RULES.md`, `07_CHECKOUT_SPECIFICATION.md` §6) — tracking is never gated behind account creation.
- **Real-time-feeling status updates use the same live-region accessibility mechanism already established platform-wide** (§21), reusing rather than reinventing the pattern `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, and `09_FOOD_ORDERING_SPECIFICATION.md` each already use for their own dynamic updates.

## 12. Address Validation & Landmark Handling

- **Address capture itself is checkout's job, not redefined here** (`07_CHECKOUT_SPECIFICATION.md` §7) — freeform, landmark-friendly fields, minimum-necessary field set, already specified in full.
- **This document's job is the operational consequence of a landmark-based address**: where an address is genuinely ambiguous, the rider or dispatch coordinator may contact the customer directly (§18) to confirm it before or during delivery — a normal, expected operational step in the Nigerian addressing context `DELIVERY_MODEL.md` already names, not a sign that something has gone wrong.
- **No automated address-validation or geocoding service is assumed** — this document does not invent one; address confirmation, where genuinely needed, happens through direct customer communication (§18), consistent with the operational-realism principle (§1).
- **A landmark-based address is never treated as invalid or rejected outright** — the same non-rigid acceptance already established at checkout (`07_CHECKOUT_SPECIFICATION.md` §7) holds through to actual delivery; an ambiguous address is clarified, never refused.

## 13. Failed Delivery & Customer-Unavailable Scenarios

- **A failed delivery attempt is communicated honestly and promptly** (§18) — never a silent retry with no customer awareness, and never indistinguishable from a successful delivery in the order's status history (§10).
- **A customer genuinely unavailable at the time of delivery is contacted directly where possible** (§18) before the attempt is recorded as failed — giving the customer a real chance to resolve it in the moment (e.g., a short wait, an alternate contact at the address) rather than an immediate, avoidable failure.
- **Food Central's failed-delivery handling carries a different urgency than Wine & Spirits'**, since a cooked dish is perishable and a failed attempt cannot simply be reattempted hours later the way a bottle of wine can — this document names the distinction; the exact operational policy for a failed Food Central delivery (a second same-day attempt, a refund, a redelivery charge) **is a genuine open business decision, not resolved here.**
- **The exact number of delivery attempts, and what happens after the final attempt, are operational parameters** not specified by this document — flagged as open (§28), consistent with the treatment already given to other operational parameters throughout `/docs`.
- **A failed delivery never silently cancels the order** — the customer is told what happened and what their options are (reschedule, §14; a support-assisted resolution) rather than being left to notice the order simply stopped progressing.

## 14. Delivery Rescheduling & Cancellation

- **Rescheduling a Food Central order reuses the same slot-selection mechanism already established at checkout** (`07_CHECKOUT_SPECIFICATION.md` §10), not a separate rescheduling interface — a rescheduled order is, mechanically, a new slot booked against the same existing order.
- **Rescheduling a Wine & Spirits delivery is a lower-stakes operation**, since nationwide delivery uses windows rather than capacity-limited slots (§6) — this document specifies that rescheduling is possible where the chosen delivery mechanism allows it, without inventing slot mechanics Wine & Spirits does not use.
- **Customer-initiated cancellation is meaningfully different before and after fulfillment has genuinely begun** — cancelling before a Wine & Spirits order has been dispatched, or before a Food Central order has entered "Preparing" (`09_FOOD_ORDERING_SPECIFICATION.md` §7), is operationally straightforward; cancelling after that point is not, since a dispatched package or a dish already being cooked cannot be un-shipped or un-cooked. **The exact cancellation cutoff and policy (a refund, a partial charge, or no cancellation at all past a given stage) is a genuine open business decision, not resolved here.**
- **Neither rescheduling nor cancellation is ever silent** — both are confirmed back to the customer explicitly (§18), consistent with §1's "nothing said matters if not honored, and nothing changes without being said" discipline.

## 15. Mixed Wine & Food Delivery Handling

- **This document reuses the exact two-fulfillment-leg model already established in `06_CART_SPECIFICATION.md` §6 and carried through `07_CHECKOUT_SPECIFICATION.md` §8 and `09_FOOD_ORDERING_SPECIFICATION.md` §13 — it does not redefine that model.** A mixed order's two legs may arrive through genuinely different delivery events (a same-day Food Central delivery and a multi-day nationwide Wine & Spirits delivery), and this is expected, not an inconsistency to paper over.
- **Each leg's delivery status, tracking, and failure handling is independent of the other** — restating the same independence principle `09_FOOD_ORDERING_SPECIFICATION.md` §13 established for mixed-order re-validation, applied here to post-order delivery specifically: a failed or delayed Food Central delivery does not affect the Wine & Spirits leg's own independent progress, and vice versa.
- **No delivery communication ever merges the two legs into one combined status or one combined ETA** — restating `06_CART_SPECIFICATION.md` §6's and `07_CHECKOUT_SPECIFICATION.md` §8's "never one merged promise" discipline at the point where it matters most: the moment a customer is actually checking on or being notified about their order.
- **A mixed order's order-detail view presents both legs' delivery status side by side, clearly labeled**, exactly as the cart and checkout already presented them as distinct groups (`06_CART_SPECIFICATION.md` §5, `07_CHECKOUT_SPECIFICATION.md` §8) — this document does not introduce a new visual structure, only carries the existing one through to delivery.

## 16. Delivery Fees

- **Delivery fees are confirmed at checkout, not recalculated or re-decided here** (`07_CHECKOUT_SPECIFICATION.md` §13) — this document's role is limited to the operational consequence: the confirmed fee for each fulfillment leg is honored exactly as charged, never adjusted after the fact without the same honest-communication standard (§18) applied to any other change.
- **A mixed order's delivery fee is never shown or communicated as a single combined figure post-order** where the two legs have genuinely distinct fees — restating the "never merged" discipline (§15) applied specifically to cost rather than status.
- **The exact fee schedule (flat fee, distance-based, free-above-threshold, or another structure) is an operational/business parameter**, not invented by this document — flagged as open (§28), consistent with the delivery-slot capacity and cutoff parameters already left open by `07_CHECKOUT_SPECIFICATION.md` and `09_FOOD_ORDERING_SPECIFICATION.md`.

## 17. Proof of Delivery & Age Verification at Delivery

- **A delivery or pickup is marked Completed (§10) only once a genuine handoff has occurred** — a rider or pickup-counter confirmation of handoff is the operational trigger for this status change, not an assumption made once a rider is simply near the address.
- **The exact proof-of-delivery mechanism (a rider's manual confirmation, a photograph, a recipient signature/name capture) is an operational/backend detail not fixed by this document** (§25) — this document specifies that some honest confirmation exists before Completed is shown, not which specific mechanism captures it.
- **Whether age is physically re-verified at the point of hand-off for an order containing Wine & Spirits items is a genuine open business and legal decision, not established anywhere in `/docs` today.** `07_CHECKOUT_SPECIFICATION.md` §15 already flags whether a hard compliance re-check happens at *order confirmation*; this is a related but distinct question — whether a rider or pickup staff member checks ID *at the moment of physical handoff* — and this document does not assume an answer either way. If adopted, the natural place for it is within this section's proof-of-delivery step, since that is the last point before an age-restricted product changes hands — but this document does not build that check now, only names where it would attach if the decision is made.
- **This section is deliberately conservative**, mirroring `07_CHECKOUT_SPECIFICATION.md` §15's own treatment of the equivalent open question: it specifies what already exists (a confirmed handoff) and where an additional requirement would attach if approved, rather than assuming the stricter path is already policy.

## 18. Customer Communication

- **Proactive status messaging is the primary communication mechanism this document relies on** — restating `DELIVERY_MODEL.md`'s "Delivery communication" section directly: proactive updates (via WhatsApp and/or SMS) are recommended over relying solely on an in-app status page, particularly given the addressing-ambiguity challenge already named in the Nigerian delivery context (§12).
- **A message is sent at each meaningful status transition** (§10): order confirmed (already specified by `07_CHECKOUT_SPECIFICATION.md` §17), dispatched/out for delivery, arriving soon where genuinely known, delivered/completed, and any failure, reschedule, or cancellation (§13, §14) — each message states plainly what happened, never a generic or ambiguous notice.
- **The exact notification channel (WhatsApp Business API, SMS, or both) remains an open business decision** (`MEDUSA_EXTENSIONS.md` #5), already flagged by `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 and `09_FOOD_ORDERING_SPECIFICATION.md` §12 — this document specifies that proactive communication exists and what it must say, not which channel carries it.
- **No fabricated urgency or artificial scarcity ever appears in a delivery communication** (e.g., no manufactured "hurry, your rider is waiting" pressure) — consistent with `EXPERIENCE_PRINCIPLES.md` #15 and the identical rule already established in every prior specification.
- **A rider or dispatch-initiated contact to clarify an address (§12) uses the same honest, non-alarming tone** — a clarifying question, not an implication that something has gone wrong.

## 19. Customer Decision States

This document reuses the same five-state taxonomy already established in `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, and `09_FOOD_ORDERING_SPECIFICATION.md` — informational, recommendation, warning, blocking condition, recoverable error — instantiated with delivery-specific triggers, rather than inventing a new vocabulary:

| State | Delivery-specific trigger | Customer impact | Expected customer action |
|---|---|---|---|
| **Informational** | A delivery window or status shown in the order-detail view (§10, §11); a proactive status message (§18). | None. | None required. |
| **Recommendation** | Not currently used in delivery — no cross-sell or optional suggestion is introduced post-order, consistent with the platform-wide restraint principle. | N/A | N/A |
| **Warning** | A delivery window shifts after confirmation for a genuine operational reason (§9, §13), acknowledged before it affects the customer's plans. | The customer's original expectation has changed; they should notice. | Review the updated window; the order itself still proceeds. |
| **Blocking condition** | A rider cannot locate the address and cannot reach the customer (§12, §13); a slot capacity issue discovered after booking (§9). | Cannot proceed until resolved. | Provide clarifying address information, or choose a resolution path (reschedule, alternate contact) once reached. |
| **Recoverable error** | A failed delivery attempt (§13); a failed proof-of-delivery step. | Temporary — the affected attempt did not complete. | Reschedule (§14) or await a follow-up contact; the order itself is not cancelled. |

## 20. Empty, Loading & Error States

- **An order with no delivery activity yet shows a clear "Order confirmed, preparing to dispatch" (or equivalent) state** — never a blank tracking view or an implication that nothing is happening.
- **Loading states use skeleton placeholders, not spinners**, for the order-status/tracking view, consistent with the platform-wide discipline already established in every prior specification.
- **A failure to load current delivery status is shown honestly and specifically** (e.g., "status temporarily unavailable, try again") — never presented as if the delivery itself has failed when only the status *display* has.
- **No blank white space or broken layout is an acceptable failure mode anywhere in the delivery-tracking experience** — the same standard already set platform-wide.

## 21. Accessibility

- **Every delivery-status element follows `DESIGN_SYSTEM.md` §B9 and §B11 exactly** — no delivery-specific exception to platform-wide form, contrast, and touch-target requirements.
- **Delivery status changes are announced to assistive technology via a live region as they occur**, reusing the identical mechanism already established in `06_CART_SPECIFICATION.md` §23, `07_CHECKOUT_SPECIFICATION.md` §22, and `09_FOOD_ORDERING_SPECIFICATION.md` §21 — a status updating visually from "Dispatched" to "In Transit" is not silently invisible to a screen-reader user.
- **No delivery notice, status, or urgency signal is conveyed by color alone** — an icon or explicit text always accompanies a color cue, the same never-color-alone rule already established platform-wide.
- **Every interactive control in this document's scope** (a reschedule action, a cancellation request, a "contact support" link) **meets the 44×44px touch-target minimum** (`DESIGN_SYSTEM.md` §B11) and is fully keyboard-operable.

## 22. Delivery Operations Considerations

*Distinct from the generic product "Operational Behaviour" concept in `04_PRODUCT_LISTING_SPECIFICATION.md`/`06_CART_SPECIFICATION.md` (product availability) and from `09_FOOD_ORDERING_SPECIFICATION.md`'s "Kitchen Operational Considerations" (kitchen hours/capacity) — this section addresses the operational realities specific to the rider/delivery-fleet side of fulfillment, which neither of those sections covers.*

- **Rider capacity is a genuine, finite operational constraint** — a fixed number of company-owned riders means delivery capacity is not infinitely elastic, particularly during peak same-day demand (`09_FOOD_ORDERING_SPECIFICATION.md` §9). This document does not specify a capacity number; it specifies that capacity constraints are communicated honestly (§9, §13) rather than papered over.
- **Geographic edge cases at the boundary of Lagos coverage are a normal, expected operational reality**, not an error — an address near but outside the defined coverage area is handled by the same address-eligibility check already established at checkout (`07_CHECKOUT_SPECIFICATION.md` §11), not a separate exception process invented here.
- **Nationwide Wine & Spirits delivery and Lagos-only Food Central delivery are operationally independent** — a disruption to one (e.g., a courier delay) has no bearing on the other, consistent with §15's mixed-order independence principle.
- **Exact rider staffing levels, shift patterns, and capacity-planning mechanics are operational parameters**, not specified behaviorally beyond: they exist, and a customer is never left guessing why a delivery is delayed for capacity reasons (§28).

## 23. Analytics Events

- `delivery_status_viewed` (value: order id, current stage)
- `delivery_status_updated` (value: order id, fulfillment leg, new stage) — fires for both Wine & Spirits and Food Central status transitions
- `delivery_failed` (value: order id, fulfillment leg, reason where known)
- `delivery_rescheduled` (value: order id, fulfillment leg)
- `delivery_cancelled` (value: order id, fulfillment leg, stage at cancellation)
- `pickup_completed` (value: order id)
- `proof_of_delivery_recorded` (value: order id, fulfillment leg)
- `mixed_order_delivery_diverged` (value: order id) — fires when a mixed order's two legs reach genuinely different delivery outcomes (e.g., one delivered, one delayed), directly measuring how often §15's independence principle is exercised in practice

Each ties back to §2's business objectives — `delivery_failed` and `delivery_rescheduled` together measure how often a delivery promise made earlier in the journey could not be kept, directly informing whether address-handling (§12), capacity (§22), or communication (§18) needs operational attention.

## 24. SEO Considerations

- **No page owned by this document is a public, indexable surface** — the order-status/tracking view is customer-specific and session-bound, restating the same `noindex` treatment already established for every equivalent surface platform-wide (`06_CART_SPECIFICATION.md` §25, `07_CHECKOUT_SPECIFICATION.md` §25, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §24, `09_FOOD_ORDERING_SPECIFICATION.md` §24).
- **This is a restatement, not a new decision** — this section confirms no delivery-specific exception to that platform-wide rule exists.

## 25. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Two fulfillment models, mixed-order legs (§5, §15) | Native multi-fulfillment-leg Order, Stock Location, Service/Geo Zone | `PRODUCT_BLUEPRINT.md` §10 | Native |
| Delivery-slot booking and capacity enforcement (§9) | Delivery-slot module, workflow hook | `MEDUSA_EXTENSIONS.md` #3 | **Not yet built** (shared dependency with `07`, `09`) |
| Delivery/order status progression (§10) | Order status field/workflow, two vocabularies (Wine & Spirits, Food Central) | Platform-wide | Native mechanism; Wine & Spirits vocabulary **specified here for the first time**; exact granularity beneath both **not yet decided** |
| Proactive customer communication (§18) | Notification provider (WhatsApp/SMS) | `MEDUSA_EXTENSIONS.md` #5 | **Not yet built**; channel undecided |
| Rider assignment/dispatch (§7) | Operational process, not a software module for v1 | `DELIVERY_MODEL.md` | Operational; **no module built or planned for v1** |
| Proof of delivery (§17) | Data capture mechanism (confirmation, photo, or signature) | Not yet established | **Not yet scoped** |
| Address/landmark data (§12) | Native freeform address fields, already captured at checkout | `07_CHECKOUT_SPECIFICATION.md` §7 | Native |
| Analytics events (§23) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 26. Performance Expectations

- **The order-status/tracking view loads quickly and reflects current status without a manual refresh feeling necessary** — reusing the same live-region and update discipline already established in `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, and `09_FOOD_ORDERING_SPECIFICATION.md`, without inventing a new performance budget beyond the platform-wide LCP target already set in `02_HOMEPAGE_SPECIFICATION.md` §17.
- **A status change (§10) is reflected in the customer-facing view as promptly as the underlying operational event is known** — this document does not require sub-second precision, only that no artificial delay is introduced between an event being true and it being shown.

## 27. Future Expansion & Explicitly Out of Scope

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, and explicitly names what this document deliberately does not introduce, per direct instruction:

**Explicitly out of scope for v1, not established elsewhere in `/docs`:**

- **Third-party courier integration** — Wine & Spirits' nationwide delivery mechanism remains an open business decision (§6, §28); if a courier partner is eventually adopted, integrating its API is new work this document does not build or assume today. Food Central never uses one, per `BUSINESS_RULES.md`.
- **Live GPS tracking** — not established anywhere in `/docs`; this document specifies status-based tracking (§11) as the v1 mechanism instead.
- **Route optimisation** — a plausible future investment once delivery volume justifies a dedicated dispatch module (`PRODUCT_BLUEPRINT.md` §17, `DELIVERY_MODEL.md`), not built or assumed here.
- **Delivery marketplace features** (e.g., third-party riders bidding on deliveries) — directly contradicts the single-company, no-marketplace model (`BUSINESS_RULES.md`); not introduced here or anywhere in `/docs`.
- **AI dispatch** — not established anywhere in `/docs`; rider assignment remains an operational, staff-coordinated process (§7).
- **Autonomous delivery** — not established anywhere in `/docs`; not a plausible near-term consideration given the company's current operational model.
- **Locker pickup** — Food Central's only pickup model established anywhere in `/docs` is at the kitchen/pickup location itself (§8); a locker network is not introduced here.

**Plausible future capability, not built now:**

- A lightweight internal rider-dispatch/assignment module, once delivery volume genuinely justifies the investment (`PRODUCT_BLUEPRINT.md` §17, `DELIVERY_MODEL.md`).
- Richer delivery-status granularity beneath the minimum progressions specified here (§10), once real operational data shows where customers need more detail.
- A formal proof-of-delivery capture mechanism (photo or signature), once the exact requirement is scoped (§25).

None of the above is authorized or scoped work — this section exists solely to confirm the architecture chosen for v1 does not foreclose any of it, and to make the deliberate exclusions explicit rather than silent.

## 28. Risks & Assumptions

**Risks:**

- **Several genuine open operational and business decisions this document depends on, none resolved here**: Wine & Spirits' delivery mechanism (in-house fleet, courier, or both, §6); the exact Lagos delivery-area definition (§5); the delivery-fee schedule (§16); the failed-delivery-attempt policy, especially for perishable Food Central orders (§13); the cancellation-cutoff policy (§14); and whether age is physically re-verified at the point of hand-off (§17). None block this document's own behavioral scope, but each will directly shape implementation once resolved.
- **The delivery-slot module and notification provider are not yet built** (`MEDUSA_EXTENSIONS.md` #3, #5) — §9, §10, and §18's behavioral requirements assume both exist; their absence is a backend dependency, not a specification gap.
- **Address ambiguity is a known, real risk in the Nigerian delivery context** (`DELIVERY_MODEL.md`) — this document's reliance on direct customer contact to resolve it (§12, §18) is a mitigation, not an elimination, of that risk.
- **Rider capacity is genuinely finite** (§22) — a same-day demand spike that exceeds real capacity is a legitimate operational risk this document specifies honest communication for (§9, §13), not a guarantee that it cannot happen.
- **A dishonest or stale delivery status carries a real trust cost, not just a UX cost** — this document's honesty requirements (§1, §10, §11) are load-bearing for the "sold and delivered by us directly" trust claim (`PRODUCT_BLUEPRINT.md` §11), not aspirational.

**Assumptions:**

- Native Medusa Fulfillment, Stock Location, and Service/Geo Zone functionality is sufficient for this document's behavioral requirements (§25), consistent with `PRODUCT_BLUEPRINT.md` §10's own findings.
- `06_CART_SPECIFICATION.md`'s mixed-cart model and `07_CHECKOUT_SPECIFICATION.md`'s delivery-method/slot-selection mechanics are the correct foundation this document builds on, not something this document should be read as re-deciding.
- The notification-channel decision (`MEDUSA_EXTENSIONS.md` #5), once made, will carry the proactive communication this document specifies (§18) without requiring a change to this document's own behavioral requirements.
- Rider dispatch remains a manual, operational process for the scope of this document — if a future dispatch module is built (§27), this document's status-progression and communication requirements (§10, §18) are expected to hold regardless of what generates them.

## 29. Delivery Quality Checklist

Every future change to delivery operations or the customer delivery experience — a new status stage, a new communication touchpoint, a layout adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline every prior frozen specification already applies to its own domain:

- [ ] **Does every delivery status shown reflect something genuinely true at the moment it's shown?** Checked against §1, §10.
- [ ] **Does it protect the "sold and delivered by us directly" trust claim**, never introducing an unstated third party into delivery? (§1, §2, §7)
- [ ] **Does a mixed order's two fulfillment legs remain independently tracked and communicated**, never merged into one status or promise? (§15)
- [ ] **Is a failed delivery, rescheduling, or cancellation always communicated honestly and promptly**, never silent? (§13, §14, §18)
- [ ] **Does it avoid introducing third-party courier integration, live GPS tracking, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, or locker pickup** not already established elsewhere? (§27)
- [ ] **Does it avoid inventing an operational or business decision** (§6, §13, §14, §16, §17, §28) that hasn't actually been made, instead of flagging it explicitly?
- [ ] **Does it remain accessible?** Live-region announcements, touch targets, and color-independent status signaling all meet §21's requirements with no exceptions.
- [ ] **Is the customer decision-state vocabulary reused, not reinvented?** (§19)
- [ ] **Does an address or delivery ambiguity get resolved through honest, direct communication**, never an automated assumption? (§12, §18)
- [ ] **Does it avoid any manufactured urgency or pressure** in delivery communication? (§18)

## 30. Acceptance Criteria

- [ ] Every delivery status shown to a customer reflects a genuinely current, true operational state — never a status shown before it is true.
- [ ] Wine & Spirits and Food Central each progress through their own distinct, honest status sequence, never skipping or reordering a stage.
- [ ] A mixed order's two fulfillment legs are tracked, communicated, and resolved independently, with no merged or averaged delivery status or ETA.
- [ ] A failed delivery attempt is never silently retried or left unexplained — the customer is told what happened and what their options are.
- [ ] A landmark-based or ambiguous address is clarified through direct communication, never rejected or silently guessed at.
- [ ] Rescheduling and cancellation are always confirmed back to the customer explicitly, with the operational distinction between pre- and post-fulfillment-start cancellation honored.
- [ ] Proof of delivery (in whatever form ultimately implemented) is captured before an order is marked Completed.
- [ ] No feature named as explicitly out of scope in §27 (third-party courier integration, live GPS tracking, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, locker pickup) appears anywhere in the delivery experience.
- [ ] No operational or business decision named as open in §6, §13, §14, §16, §17, §28 (delivery mechanism, failed-attempt policy, cancellation cutoff, fee schedule, doorstep age verification, Lagos-area definition) is silently assumed or resolved by this document or its implementation.
- [ ] Every delivery status change is announced to assistive technology via a live region, not only shown visually.
- [ ] Every interactive delivery-related control (reschedule, cancel, contact support) is fully keyboard-operable and meets the 44×44px touch-target minimum.
- [ ] All analytics events listed in §23 fire correctly and exactly once per corresponding operational event.

---

**Document status:** In Progress (v0.1). This is the first full draft — ready for review, not yet approved. Upon approval, this specification becomes the reference for delivery-operations implementation, alongside `06_CART_SPECIFICATION.md` §5/§6, `07_CHECKOUT_SPECIFICATION.md` §7–§13 (whose pre-order mechanics it builds on without redefining), and `09_FOOD_ORDERING_SPECIFICATION.md` §7–§13 (whose customer-facing food-ordering mechanics it extends operationally), and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` (not yet drafted, which will own the internal/staff-facing side of order and delivery management this document does not specify).

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary interactions were referenced or copied):

- [6 Order Confirmation Page Best Practices — Baymard Institute](https://baymard.com/blog/order-confirmation-page)
- [3 High-Level UX Takeaways from 1,100+ Hours of Testing Leading Food Delivery and Takeout Sites — Baymard Institute](https://baymard.com/blog/food-delivery-takeout-launch)
- [8 'Food Delivery & Takeout' Sites Ranked by User Experience Performance — Baymard Institute](https://baymard.com/ux-benchmark/collections/online-food-delivery)
