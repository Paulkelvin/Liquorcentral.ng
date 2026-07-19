# Tier B — Notification Provider Module

**Status:** Draft
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-19

This document is a Tier B (Module Data Planning) deliverable, per `IMPLEMENTATION_PLANNING.md` §4 and §6, defining the architecture of the notification provider module (`MEDUSA_EXTENSIONS.md` #5) — a custom Notification Provider module sending customer-facing order/delivery status updates via WhatsApp and/or SMS, wired into Medusa's existing event-driven notification system. `IMPLEMENTATION_PLANNING.md` §6 explicitly names this module alongside the local payment provider (now Approved) as the pair to follow delivery-slot in Tier B's creation order. A re-verification against the six standing selection criteria (§0) confirms this module remains the correct next choice, and this review surfaces a genuine correction to its recorded dependency count (§1).

**This document is purely architectural.** It defines the module's responsibilities, ownership, boundaries, business purpose, and integration points — nothing else. **It is not a database design, not an API specification, not implementation code, and not a UI component definition.** No table is named, no field is typed, no endpoint is shaped, no component is designed. No Approved — Frozen document is modified by this document.

**This document is deliberately channel-agnostic.** It does not choose WhatsApp Business API, SMS, or both — that choice remains Paul's explicit, open business decision (`MEDUSA_EXTENSIONS.md` #5), recorded here, not resolved. The specific channel's integration shape (WhatsApp Business API's own approval process and message-template mechanics, or an SMS gateway's own API) is out of scope for this document entirely — that is Tier D's (Integration Planning) job, once a channel is chosen, per `IMPLEMENTATION_PLANNING.md` §4's own tier boundary. This document defines the module architecture that Tier D's channel-specific integration will eventually sit behind.

---

## 0. Module Selection Verification

Before drafting, the six criteria established for prior Tier B selections were re-applied to the one remaining candidate in `MODULE_INVENTORY.md` — Saved-for-Later — per the prior recommendation review Paul approved, which concluded neither remaining Tier B module is strictly required before implementation, but the notification provider is the stronger candidate to draft next.

| Criterion | Notification provider | Saved-for-Later |
|---|---|---|
| Frozen specifications depending on it | **Four** — `07`, `08`, `09`, `10` (§1 corrects this from the previously-recorded three; see below) | **One** — `06` only |
| Launch criticality | Operationally important — `MODULE_INVENTORY.md` and `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14 Row 5 both confirm **not confirmed launch-blocking by any document** (unlike the local payment provider, the project's one genuine launch blocker, already Approved) | Optional — a genuine enhancement, deferrable past v1 without breaking anything else |
| Architectural centrality | Moderate — wraps a native, event-driven Medusa mechanism (`MEDUSA_EXTENSIONS.md` #5); no order-placement or fulfillment workflow depends on it completing, unlike the payment provider | Low — the smallest architectural footprint of any remaining candidate, a lightweight cart-adjacent convenience |
| Dependency ordering (`IMPLEMENTATION_PLANNING.md` §6) | Named alongside the local payment provider as the pair following delivery-slot in Tier B's creation order (§6 point 2); named second in Tier D's own integration-planning order, after the payment provider (§6 point 4) | Named last in §6 point 2's own ordering, after both provider modules |
| Tier A findings | Tracked at Row 5 of the definitive baseline (`TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14) — "Scoped, not built," blocked only on channel choice; §7 additionally clarifies this module must serve customer-facing notifications only, with a separate, not-yet-scoped staff-facing alerting mechanism (§16 below) | Row 9, "**Missing**" — not even scoped in `MEDUSA_EXTENSIONS.md`, requiring Paul's confirmation it is in scope for v1 at all before any Tier B document could meaningfully be drafted |
| Later implementation-planning work depending on it | Touches Tier C's Cart & Checkout, Account, and Food Ordering & Delivery API contract planning at the margins (confirmation/status-update triggers), though none of those plans are blocked from proceeding without it, per `IMPLEMENTATION_PLANNING.md` §5's explicit permission to plan ahead of a non-blocking open decision | No Tier C work currently references it, since it isn't yet confirmed in scope |

**Conclusion: the notification provider module is the correct next Tier B module to draft, though — consistent with the recommendation Paul approved before this draft began — neither remaining candidate is strictly required before implementation.** This document exists to have the architecture ready before Tier C reaches the surfaces that reference it (Order-status and Delivery-communication API contracts), not because any document treats it as a launch blocker. Saved-for-Later remains correctly deferred pending Paul's confirmation it is in scope at all.

---

## 1. Why This Module Exists

**Four frozen Product Specifications depend on this module — one more than previously recorded.** `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14 (Row 5) and `MODULE_INVENTORY.md` currently record the dependent list as `08`, `09`, `10`. Verifying each specification's own stated backend dependency directly, per the same discipline every prior Tier B document's own review applied to its dependency count, finds this list under-inclusive:

- **`07_CHECKOUT_SPECIFICATION.md` §26 (Backend Requirements)** — "Order confirmation notification (§17) | Custom Notification Provider (WhatsApp and/or SMS), wired to Medusa's native event system | `MEDUSA_EXTENSIONS.md` #5 | **Not yet built — channel undecided**." This is an explicit, table-level dependency `07` names directly, not merely a passing prose mention — and it is **not previously reflected in the baseline**. **This is a genuine, newly-discovered correction, not a mis-attribution to remove**: `07` is added as a fourth genuine dependent.
- **`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §25 (Backend Requirements)** — "Notification preferences (§16) | A preference field/entity associated with Customer, gated on the notification-provider decision | `MEDUSA_EXTENSIONS.md` #5 | Preference storage native; **channel(s) undecided**." Confirmed genuine.
- **`09_FOOD_ORDERING_SPECIFICATION.md` §12 (Delivery Workflow, Customer-Facing)** — "Proactive delivery communication (e.g., a 'your order is on its way' message) depends on the still-undecided notification-channel choice (`MEDUSA_EXTENSIONS.md` #5)... this document specifies the expectation, not the channel." This is a genuine, evidenced dependency stated directly in `09`'s own behavioral text, even though its own §25 Backend Requirements table does not carry a dedicated row for it — a minor completeness gap in that table (§21 records this, mirroring the identical recommendation the local payment provider module's own review made for `11_ADMIN_WORKFLOWS_SPECIFICATION.md`), not a reason to exclude `09` from the dependent list.
- **`10_DELIVERY_SPECIFICATION.md` §25 (Backend Requirements)** — "Proactive customer communication (§18) | Notification provider (WhatsApp/SMS) | `MEDUSA_EXTENSIONS.md` #5 | **Not yet built**; channel undecided." Confirmed genuine, and this specification's §18 (Customer Communication) is this module's richest, most detailed consuming surface — see §14 below.

**`11_ADMIN_WORKFLOWS_SPECIFICATION.md` does not, on inspection, carry a genuine dependency on this module, and is confirmed excluded.** Its own §25 Backend Requirements table cites `MEDUSA_EXTENSIONS.md` #5 once, but explicitly "(customer-facing, for contrast)" — naming this module only to distinguish it from `11`'s own, separate, not-yet-scoped staff-facing internal alerting mechanism (§19), never as a functional dependency of `11` itself. `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §7 already draws this same distinction directly: the notification provider "is now known, from `08`, `09`, `10`, `11`, to need to serve both customer-facing notifications and a separate, internal staff-facing alerting mechanism" — `11` is cited there as the *source of the boundary*, not as a dependent of the customer-facing module this document defines. No correction to `11`'s exclusion is warranted.

This document exists to hold the architecture no prior document defines: `MEDUSA_EXTENSIONS.md` #5, `TECH_STACK.md`, and `DELIVERY_MODEL.md` all correctly identify *that* this module is needed and sketch its shape and rationale in a few sentences each, but none defines its lifecycle, its relationship to Medusa's native event-driven notification system, or how it integrates with the four specifications that depend on it — the sixth Tier B module (after the Product Relationship Module, `wine-details`, `food-details`, delivery-slot, and the local payment provider) this project's Phase 2 work formalizes.

## 2. Business Justification

- **Directly implements `MEDUSA_EXTENSIONS.md` #5's stated reasoning** — "Proactive status messaging... is how delivery communication actually works well in the Nigerian market, and directly mitigates the addressing-ambiguity risk noted in `DELIVERY_MODEL.md`." This module is the mechanism that makes proactive, trustworthy customer communication possible at all.
- **Directly implements `DELIVERY_MODEL.md`'s explicit recommendation** — "Proactive status updates (e.g. via WhatsApp/SMS) are recommended over relying solely on an in-app order-status page, particularly given address ambiguity is a known challenge in the Nigerian delivery context (landmark-based rather than postal addressing)."
- **Protects the honesty principle every consuming specification already establishes** — `10_DELIVERY_SPECIFICATION.md` §18's own governing principle states this precisely: "a delivery message exists to remove uncertainty, never to create it... a customer who reads it knows more, and worries less, than before." An honest, timely status message is only possible if this module actually delivers it when the triggering event occurs, never a guess or a delay dressed up as a fact.
- **Reduces the "where is my order" support burden** and mitigates failed/delayed deliveries, per `MEDUSA_EXTENSIONS.md` #5's own stated business value — directly relevant given the addressing-ambiguity risk `DELIVERY_MODEL.md` names as a genuine Nigerian-market challenge.
- **Serves the Confident Buyer and Guided Browser customer intents specifically around order and delivery uncertainty** (`07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent table, `10_DELIVERY_SPECIFICATION.md`'s Delivery Intent table) — both need to know their order is progressing without having to check manually, which this module's proactive channel makes possible.

## 3. Responsibilities

- **Provide a stable, channel-agnostic notification-delivery capability to the rest of the platform**, wired into Medusa's existing event-driven notification system, so that Checkout, Customer Account, Food Ordering, and Delivery each trigger a notification through one consistent mechanism regardless of which channel (WhatsApp Business API, SMS, or both) ultimately carries it.
- **Send a customer-facing message when a triggering event occurs** (e.g., order confirmed, order dispatched, arriving soon, delivered, a failure/reschedule/cancellation) — the event itself is raised by the native Order/Cart/Delivery workflow or the specification governing that moment (§5); this module's responsibility is to deliver the resulting message faithfully once triggered, not to decide when a message is warranted.
- **Respect a customer's notification channel preference**, once the underlying channel-choice decision is made and a preference mechanism exists (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16) — this module is the delivery mechanism; the preference itself is Customer-associated data this module reads, not data it owns (§5).
- **Apply uniformly across both catalogs and all fulfillment-leg combinations** — a mixed Wine & Spirits + Food Central order's notifications are triggered by the same mechanism as either catalog's own order, with no catalog-specific notification system.
- **Remain the notification-delivery mechanism layer only** — never the decision that a message is warranted (the triggering specification's own concern), never the message's exact wording (§5), never the customer's account-level preference data (`08`'s own field), and never a staff-facing internal alert of any kind (§16). See §4 for the explicit boundaries this implies.

## 4. Explicit Non-Responsibilities

- **This module does not choose the notification channel.** Channel choice (WhatsApp Business API, SMS, or both) is an explicit, open business decision requiring Paul's approval (`MEDUSA_EXTENSIONS.md` #5) — this document does not propose, narrow, or invent an answer. The chosen channel's specific integration shape is Tier D's job (§0, intro).
- **This module does not perform staff-facing internal alerting.** `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19 and `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §7 both explicitly distinguish staff-facing notifications (a separate, not-yet-scoped mechanism, `MODULE_INVENTORY.md`'s own "Staff-facing internal notifications" row) from this module's customer-facing scope — this module has no role in alerting staff to a low-stock item, a kitchen-queue length, or a delivery exception. See §16.
- **This module does not decide which events trigger a notification, or what a notification says.** The triggering event (order confirmed, dispatched, delivered, etc.) and the message's substantive content are each the responsibility of the specification governing that moment (`07_CHECKOUT_SPECIFICATION.md` §17, `10_DELIVERY_SPECIFICATION.md` §18) — this module delivers the resulting message through the chosen channel; it does not compose or authorize it.
- **This module does not own the customer's notification preference data.** `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 establishes the preference as Customer-associated data — this module respects that preference at the moment of sending; it does not define, store, or manage the preference itself.
- **This module does not decide whether a specific notification is optional.** `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 already establishes that transactional, order-in-progress notifications are never optional — only the channel, and any non-transactional communication (if ever introduced), is a genuine preference; this module does not revisit that distinction.
- **This module does not perform delivery tracking, live location, or rider-dispatch coordination.** `10_DELIVERY_SPECIFICATION.md` §11 already establishes delivery tracking as status-based, explicitly not live GPS — this module sends the status message; it does not compute or hold the underlying delivery status itself (the native Order/Delivery record does).
- **This module does not fabricate urgency or artificial scarcity in any message.** `10_DELIVERY_SPECIFICATION.md` §18 and the platform-wide no-fake-urgency principle apply to whatever content this module ultimately carries — a constraint on the content the triggering specifications supply, not a behavior this module itself needs to enforce architecturally, but named here so it is never assumed away.
- **This module has no application beyond notification delivery itself** — it does not perform payment processing (the now-Approved local payment provider module), does not perform delivery scheduling (the now-Approved delivery-slot module), and does not hold product, attribute, or relationship data of any kind.
- **This module is not a database design, an API specification, implementation code, or a UI component definition**, per this document's explicit scope. It does not resolve the channel-choice open decision it depends on (§19, §22).

## 5. Notification Trigger, Channel, Content, and Preference — Related but Separate Concepts

Mirroring the boundary-drawing discipline `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` §5 established for its own domain, this document keeps four genuinely distinct concepts separate, so a future contributor does not silently collapse them into one:

- **Notification trigger** — the event that makes a message necessary (order confirmed, dispatched, delivered, a failure/reschedule/cancellation) — is raised by the native Order/Cart/Delivery workflow and the specification governing that moment (`07_CHECKOUT_SPECIFICATION.md` §17, `10_DELIVERY_SPECIFICATION.md` §18), never by this module itself.
- **Notification channel** — WhatsApp Business API, SMS, or both — is an entirely open business decision (`MEDUSA_EXTENSIONS.md` #5) this module does not make; this module's architecture must accommodate whichever channel(s) are eventually chosen.
- **This module (the notification-delivery mechanism)** — the channel-agnostic capability that actually sends the message once triggered — is this document's own subject.
- **Notification content** — what the message actually says — belongs to the triggering specification (`07` for order confirmation, `10` for delivery-status messages), governed by the same honesty and no-fake-urgency principles those specifications already establish; this module carries the content, it does not author it.
- **Notification preference** — a customer's chosen channel and, if ever introduced, any non-transactional opt-in — is Customer-associated data `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 owns; this module reads and respects it at the moment of sending, never owns or defines it.

## 6. Notification Lifecycle Responsibilities

Described here at a conceptual level only — no state-machine implementation, enum, or code construct is proposed; this section names the real-world stages a notification passes through so that Tier C's eventual API planning has an agreed conceptual sequence to build against:

- **Triggered** — a native workflow or the governing specification's own event (order confirmed, dispatched, delivered, a failure/reschedule/cancellation) occurs, and this module is invoked to deliver the resulting message.
- **Sent** — this module dispatches the message through whichever channel(s) the customer's preference and the platform's chosen channel(s) resolve to, restating `MEDUSA_EXTENSIONS.md` #5's "wired into Medusa's existing event-driven notification system" directly — the event-driven trigger and the send action are one coherent step, not two independently-timed operations.
- **Delivered or Failed** — where the eventual channel's own mechanics support a delivery confirmation (a common capability of both WhatsApp Business API and SMS gateways generally, though this document does not assume which is chosen), this module's architecture is capable of reporting that outcome; where a message cannot be delivered, that failure is reported faithfully, never silently absorbed.
- **No stage above is ever skipped or misreported to a customer**, restating the same integrity principle every prior specification's own status progression already establishes (`09_FOOD_ORDERING_SPECIFICATION.md` §7, `10_DELIVERY_SPECIFICATION.md` §10) — a triggering event that occurs but produces no message, or a message reported as sent when it was not, would defeat the entire honesty premise this module exists to serve (§2).

## 7. Provider Abstraction Responsibilities

- **This module exists specifically so that a channel choice, once made, does not ripple through the rest of the platform.** Checkout, Customer Account, Food Ordering, and Delivery each trigger a notification through this module's stable, channel-agnostic shape — never by calling a specific channel's own API, message-template format, or terminology directly.
- **This module is wired into Medusa's existing event-driven notification system**, restating `MEDUSA_EXTENSIONS.md` #5's own technical description directly — "Medusa's event/notification system is native and event-driven already; only the provider integration itself (WhatsApp Business API and/or an SMS gateway) is new work" — the same extension-point pattern `ARCHITECTURE.md` establishes as the rule for every custom module on this project: new capability behind an existing native mechanism, never a modification to Medusa core. (`ARCHITECTURE.md`'s own Data Model table does not separately enumerate a native Notification module the way it does Payment or Fulfillment; `MEDUSA_EXTENSIONS.md` #5 is the sole and sufficient source for this module's native-event-system framing.)
- **A future channel change (or supporting more than one channel simultaneously) is, architecturally, a new implementation behind this module's existing shape**, not a redesign of Checkout, Customer Account, Food Ordering, or Delivery — a capability this document's architecture leaves room for (§20), not something committed or scheduled today.
- **This module does not invent its own abstraction language independent of Medusa's** — per `IMPLEMENTATION_PLANNING.md` §2 principle 2 ("Medusa-native first... a plan that reaches for a custom mechanism where Medusa already provides one is a planning defect, not a preference"), this module's channel-agnostic shape rests on Medusa's own existing event/notification system, not a bespoke abstraction layered in front of it.

## 8. Scope: Customer-Facing Only, Across Both Catalogs

- **This module applies identically to Wine & Spirits, Food Central, and mixed orders.** No catalog-specific notification mechanism exists or is proposed — an order-confirmation or delivery-status message is triggered the same way regardless of what the order contains.
- **This module's scope is strictly customer-facing.** `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19's staff-facing internal alerting is an entirely separate, not-yet-scoped mechanism (§16) — this document does not propose extending this module to cover it, nor does it assume the two will ultimately share an implementation.
- **This document does not propose a second notification mechanism for any future business line.** If a future fulfillment model or business line is ever added, it would use this same customer-facing notification mechanism, not a parallel system.

## 9. Ownership

This module's governance is a two-way split, mirroring the local payment provider module's own narrower governance shape (`TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` §10), since a Provider Module has no field list or content-accuracy dimension of its own:

- **The module's existence, architecture, and channel-abstraction mechanism (this document) are an engineering/architecture decision.**
- **Which channel(s) are integrated is a business/operations decision requiring Paul's explicit approval**, restating `MEDUSA_EXTENSIONS.md` #5's own statement directly ("Paul's approval required: Yes — channel choice (WhatsApp vs. SMS vs. both) has direct budget implications"). This document does not narrow or resolve that requirement (§19, §22).
- **Notification content and wording belong to whichever specification governs the triggering moment** (`07_CHECKOUT_SPECIFICATION.md`, `10_DELIVERY_SPECIFICATION.md`), not to this module's own governance — this module's architecture must carry whatever content those specifications' eventual implementation supplies, without itself authoring or approving it.
- **Staff-facing internal alerting is explicitly not this module's governance to define** (§4, §16) — it is a separate, not-yet-scoped surface this document does not extend to cover.

## 10. Interaction with Medusa's Native Event-Driven Notification System

- **This module extends, not replaces, Medusa's native notification/event system.** Restating `MEDUSA_EXTENSIONS.md` #5 directly — "Medusa's event/notification system is native and event-driven already; only the provider integration itself... is new work" — this module is the specific WhatsApp/SMS-channel implementation behind that existing native mechanism, following the identical extension-point pattern `ARCHITECTURE.md` establishes as the rule for every custom module on this project: no core changes.
- **A notification is triggered by the same native, event-driven mechanism that already governs other workflow-driven behavior on this platform** (`ARCHITECTURE.md`'s description of the workflow engine's resumable, compensable step sequences) — this module's send action is invoked by that existing event system, not a separate, uncoordinated polling or scheduling mechanism this module invents.
- **This module does not introduce a new actor type, a new commerce module boundary, or a new database beyond what Medusa's existing notification system already expects** — consistent with `API_DECISIONS.md`'s stated preference for native mechanisms configured rather than extended, applied here to the one case (the specific channel integration) where genuine extension is actually required, per `MEDUSA_EXTENSIONS.md` #5's own assessment.

## 11. Integration with Checkout

`07_CHECKOUT_SPECIFICATION.md` §17 (Order Confirmation) and its own §26 Backend Requirements table together specify this module's first, most direct trigger:

- **An order-confirmation notification is sent the moment an order is successfully placed** (§17) — "A confirmation notification is sent (order number, summary, expected delivery/pickup information) via the notification mechanism this platform ultimately adopts... this document specifies that a confirmation is sent, not which channel carries it."
- **This is the earliest point in the customer relationship at which this module's mechanism is invoked** — every later trigger (`09`, `10`) follows the same customer's same order, already confirmed through this module once.
- **This module supplies the delivery mechanism; `07_CHECKOUT_SPECIFICATION.md` §17 remains the sole authority** on what the confirmation message must contain and when exactly it is considered sent from the customer's point of view.

## 12. Integration with Customer Account

`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 (Notification Preferences) is this module's governance-adjacent consumer — the surface that defines the preference this module must respect, not a triggering surface itself:

- **A customer can choose which order-related notifications they receive and through which channel(s), once the channel decision is made** (§16) — this module's architecture must be capable of respecting a per-customer channel preference, without this document specifying what that preference mechanism looks like at a data level (`08`'s own concern).
- **Transactional notifications tied to an order in progress are never optional** (§16) — a customer cannot opt out of being told their own order is progressing; only the channel, and any future non-transactional communication, is a genuine preference. This module's architecture reflects that non-optionality; it does not decide it.
- **Before a customer sets an explicit preference, the default is essential/transactional notifications only** (§16) — this module sends the transactional baseline by default, restating `08`'s own default directly, not inventing a separate default of its own.

## 13. Integration with Food Ordering

`09_FOOD_ORDERING_SPECIFICATION.md` §12 (Delivery Workflow, Customer-Facing) names this module's mechanism directly, though its own §25 Backend Requirements table does not carry a dedicated row for it (§1, §21):

- **Proactive delivery communication during Food Central ordering depends on this module's mechanism and the still-open channel decision** (§12) — "this document specifies the expectation, not the channel."
- **Post-order delivery status is part of the same cook-to-order status progression** (§7) this module's trigger ultimately serves — the operational mechanics behind generating that status belong to `10_DELIVERY_SPECIFICATION.md`, not to this module or to `09` itself.
- **This module does not redefine Food Central's own cook-to-order progression or its cutoff/scheduling mechanics** (`TIER_B_DELIVERY_SLOT_MODULE.md`'s own scope) — it only carries the resulting customer-facing message once a stage of that progression genuinely occurs.

## 14. Integration with Delivery

`10_DELIVERY_SPECIFICATION.md` §18 (Customer Communication) is this module's richest and most detailed consuming surface — the specification names every triggering moment and the governing tone principle directly:

- **"Proactive status messaging is the primary communication mechanism this document relies on"** (§18), restating `DELIVERY_MODEL.md`'s own recommendation directly — proactive updates are preferred over relying solely on an in-app status page, given the addressing-ambiguity challenge already named in the Nigerian delivery context.
- **A message is sent at each meaningful status transition** (§18, §10) — order confirmed (already this module's own §11 trigger), dispatched/out for delivery, arriving soon where genuinely known, delivered/completed, and any failure, reschedule, or cancellation — each message states plainly what happened, never a generic or ambiguous notice. This module's responsibility is to deliver each of these faithfully once `10`'s own status progression reaches that point; it does not define the progression itself.
- **The governing principle — "a delivery message exists to remove uncertainty, never to create it"** (§18) — is a constraint on message content and timing that `10` owns; this module's architectural obligation is to never introduce delay or ambiguity of its own into that already-honest message once handed to it.
- **A rider or dispatch-initiated contact to clarify an address** (§12, §18) uses the same channel and the same honest, non-alarming tone — this module supplies the channel; the clarifying contact itself is an operational, staff-initiated action `10_DELIVERY_SPECIFICATION.md` and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §13 govern.

## 15. Integration with Admin Workflows

**No functional integration exists for this module's own customer-facing scope, and the relationship that does exist is a confirmed boundary, not a dependency.** `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §25 (Backend Requirements) cites `MEDUSA_EXTENSIONS.md` #5 once, explicitly "(customer-facing, for contrast)" — naming this module only to distinguish it from `11`'s own separate, not-yet-scoped staff-facing internal alerting mechanism (§19). See §16 for the full boundary treatment. This document does not otherwise integrate with Admin Workflows: staff do not configure this module's channel choice (that is Paul's own approval, §9), and no admin-facing dashboard for this module's own send/delivery status is proposed here.

## 16. Boundary with Staff-Facing Notifications (Confirmed, Not Assumed)

**This is the single clearest architectural boundary this document draws, worth stating on its own rather than folding entirely into §4 or §15**, given how explicitly and repeatedly this distinction is already named across `/docs`:

- **`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19 (Notifications, Staff-Facing)** states the boundary directly: "This section is distinct from the customer-facing communication `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 and `10_DELIVERY_SPECIFICATION.md` §18 already specify — staff-facing notifications alert staff to something requiring their attention; they are never the mechanism for customer communication, which those documents already own."
- **`TIER_A_FOUNDATIONAL_RECONCILIATION.md` §7** independently confirms the same finding: the notification provider "is now known... to need to serve both customer-facing notifications and a separate, internal staff-facing alerting mechanism... `MEDUSA_EXTENSIONS.md` #5 currently describes only the customer-facing channel."
- **`MODULE_INVENTORY.md`'s own "Not yet scoped anywhere" table** carries "Staff-facing internal notifications" as its own, distinct row — a different item entirely from this module, with no `MEDUSA_EXTENSIONS.md` entry and no Tier B document of its own yet.
- **This document does not propose, design, or assume a shared implementation between the two.** Whether a future architecture eventually reuses part of this module's channel-delivery mechanism for staff-facing alerts (e.g., an internal Slack/email channel) is a plausible future question, not something this document decides — see §20.

## 17. Non-Integrations (Confirmed, Not Assumed)

Reviewed against every frozen specification; the following have **no dependency** on this module, stated explicitly so a future contributor does not assume one that was never specified:

- **Cart (`06_CART_SPECIFICATION.md`)** — no mention of notification anywhere in the specification; the cart's own Backend Requirements table (§26) has no notification-provider row.
- **Navigation, Homepage, Search, Product Listing, Product Details (`01`–`05`)** — none references notification in any functional capacity.
- **`wine-details`, `food-details`, the Product Relationship Module, delivery-slot, and the local payment provider** — no relationship. Each holds a different concern (descriptive product data, curated cross-product associations, fulfillment scheduling, payment-mechanism data); this module holds notification-delivery data. Each is read independently, never merged with this module's own data.
- **Staff-facing internal alerting** (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19) — see §16. A confirmed, deliberate non-integration, not an oversight.

## 18. CMS & Merchandising Responsibilities

**None.** Mirroring the local payment provider module's own precedent (`TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` §18): this module holds only notification-delivery mechanism and trigger/channel data. No specification proposes editorial content about a notification, and no merchandising curation applies to whether or how a transactional message is sent. This is stated explicitly, rather than left silent, so a future contributor does not assume this module needs a content-governance model it has no actual use for.

## 19. Operational Assumptions

- **A single notification channel, or a small fixed set (WhatsApp Business API and/or SMS), is assumed to be integrated first**, consistent with `MEDUSA_EXTENSIONS.md` #5's own framing — this document does not assume a channel architecture broader than what `MEDUSA_EXTENSIONS.md` #5 already names.
- **Message content and exact wording are assumed to be supplied by the triggering specification** (`07`, `10`) at implementation time — this module's architecture assumes it receives content to deliver, not that it authors content itself.
- **WhatsApp Business API's own approval timeline and cost are assumed to be a real, non-trivial project dependency**, restating `MEDUSA_EXTENSIONS.md` #5's own Risk directly — this document does not assume that dependency resolves quickly.
- **This module assumes a single, unified notification mechanism serves both catalogs and all four consuming specifications** (§8) — no separate notification system is assumed to exist or to be needed for Food Central versus Wine & Spirits, or for any one triggering surface versus another.
- **Staff-facing alerting is assumed to remain a separate, future mechanism** (§16) — this document does not assume the two will ultimately converge on one implementation, nor that they must remain forever separate; that is a future architectural question, not an assumption this document resolves either way.

## 20. Future Extensibility

Nothing in this section is built now — it documents capability this module's shape already leaves room for:

- **Supporting more than one channel simultaneously** (e.g., WhatsApp for some customers, SMS for others, per preference), should the business ever want both rather than choosing one — this module's channel-abstraction shape (§7) does not foreclose this, but no frozen specification currently requires it, and this document does not design it.
- **A future staff-facing alerting mechanism potentially reusing part of this module's channel-delivery capability** (§16) — a capability observation, not a proposal, since staff-facing alerting remains entirely unscoped today.
- **Richer, templated, or personalized message content**, should a future decision introduce it — explicitly out of scope for this document, which assumes only the transactional baseline `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16 already establishes.
- **Extension to a future business line or fulfillment model**, per `PRODUCT_BLUEPRINT.md` §17's general future-expansion framing — not authorized or scheduled by any document today, and this module's current scope remains both existing catalogs, undivided (§8).

## 21. Risks

- **Four specifications now depend on this module, one more than the previously-recorded baseline** — if a future implementation treats this module as a simple fire-and-forget message send rather than the trigger-aware, preference-respecting, honesty-preserving mechanism this document describes, several of the four integrations above (§11–§14) would require rework.
- **WhatsApp Business API's approval timeline and cost are outside engineering's control**, restating `MEDUSA_EXTENSIONS.md` #5's own Risk directly — "treat this as a real project with its own timeline, not a quick add-on." A future implementation that underscopes this as a trivial integration would repeat the same underscoping risk `MEDUSA_EXTENSIONS.md` #5 already warns against.
- **The customer-facing-vs-staff-facing boundary (§16) is easy to blur in practice** — a future contributor could plausibly extend this module to staff alerting by default, assuming a shared implementation is obviously correct, when no document has decided that; this document names the risk explicitly so it is decided on purpose rather than discovered as an inconsistency later.
- **`09_FOOD_ORDERING_SPECIFICATION.md`'s own Backend Requirements table does not name this module** despite `09`'s own behavioral text (§12) explicitly depending on it — a documentation completeness gap recorded in §1, worth closing in the same spirit as the local payment provider module's own `11_ADMIN_WORKFLOWS_SPECIFICATION.md` finding, so it is not rediscovered from scratch during Tier C's Food Ordering & Delivery API planning.
- **Channel choice remains open, and this module's four dependent specifications are all, to varying degrees, waiting on it** — none is blocked from being architected in the meantime, consistent with `IMPLEMENTATION_PLANNING.md` §5's explicit permission to plan ahead of an open business decision, but full implementation of `07`, `08`, `09`, and `10`'s notification-dependent behavior cannot complete until it resolves.

## 22. Dependencies

- **Depends on Medusa's native event-driven notification system**, already native and unaffected by this document.
- **Depends on Paul's explicit approval of the notification channel(s)** — an already-tracked open business decision (`PROJECT_STATUS.md`, `MEDUSA_EXTENSIONS.md` #5, `TECH_STACK.md`); this document does not propose, narrow, or invent an answer.
- **Depends on `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s eventual notification-preference mechanism** (§16) to know what a customer has chosen — this module's own architecture does not require that mechanism to be finalized, but full integration behavior (§12) does.
- **Blocks full implementation of `07`, `08`, `09`, and `10`'s notification-dependent sections**, though none of those specifications' own broader scope is blocked from Tier C planning in the meantime, per `IMPLEMENTATION_PLANNING.md` §5.
- **Recommends that `07_CHECKOUT_SPECIFICATION.md`'s existing Backend Requirements table entry be treated as this module's primary, confirmed dependency** and that `TIER_A_FOUNDATIONAL_RECONCILIATION.md`'s §6/§14 baseline and `MODULE_INVENTORY.md`'s dependent list both be corrected from `08,09,10` to `07,08,09,10` (§1) — applied in this document's own tracking-document updates, following the identical precedent every prior Tier B module's own review established for its own dependency-list corrections.
- **Recommends that `09_FOOD_ORDERING_SPECIFICATION.md`'s own Backend Requirements table (§25) eventually name this module as the mechanism behind its §12 proactive-delivery-communication expectation** (§1, §21) — a documentation completeness recommendation, not a further correction to any Tier A/`MODULE_INVENTORY.md` dependency count, since `09` is already being added to that list in this same change.
- **Depends on Tier D (Integration Planning) to plan the actual chosen channel's integration shape**, once Paul selects one — this document is explicitly not that plan (§0, intro).
- **Depends on Paul's explicit confirmation that this module proceeds into further Tier B/C planning** — per `IMPLEMENTATION_PLANNING.md` §2 principle 4, this document does not assume approval; it documents the architecture so that confirmation, when given, has something concrete to approve.

## 23. Quality Checklist

Every future addition to this module's planning must be able to answer **yes** to all of the following:

- [ ] **Does it remain channel-agnostic, naming no specific notification channel anywhere?** Checked against the intro, §0, §4, §7.
- [ ] **Does it keep the notification trigger and content (owned by the triggering specification) separate from this module's own delivery mechanism?** Checked against §5, §11, §14.
- [ ] **Does it keep the customer-facing scope of this module separate from staff-facing internal alerting?** Checked against §4, §15, §16.
- [ ] **Does it preserve a single, unified notification mechanism across both catalogs, never a per-catalog mechanism?** Checked against §8.
- [ ] **Does it avoid inventing an answer to the open channel-choice decision** rather than recording it? Checked against §4, §19, §22.
- [ ] **Does it treat the customer's notification preference as `08`'s own data, never this module's to define?** Checked against §5, §9, §12.
- [ ] **Does it stay purely architectural**, introducing no table, field type, endpoint, or code? Checked against this document's own scope statement.

## 24. Acceptance Criteria

- [ ] A notification is represented as triggered by an external event and delivered through a channel-agnostic mechanism — never a channel-specific implementation detail exposed to Checkout, Customer Account, Food Ordering, or Delivery.
- [ ] No specific notification channel is named, chosen, or implied anywhere in this document.
- [ ] Notification trigger, channel, content, and preference are each confirmed as distinct, separately-owned concepts.
- [ ] Staff-facing internal alerting is confirmed as an entirely separate, not-yet-scoped mechanism, never assumed to share this module's implementation.
- [ ] Channel choice is confirmed as an open business decision, not resolved, narrowed, or invented by this document.
- [ ] The corrected dependency list (`07`,`08`,`09`,`10`) is reflected consistently in `TIER_A_FOUNDATIONAL_RECONCILIATION.md` and `MODULE_INVENTORY.md` in the same change that approves this document.
- [ ] This document introduces no database table, field type, API endpoint, or UI component definition anywhere within it.
- [ ] The architectural boundary between this Tier B document and a future Tier D channel-integration document is stated explicitly and preserved throughout.

---

**Document status:** Draft (v1.0). This is the first architectural draft of the Notification Provider Module, reviewed against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `MODULE_INVENTORY.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `TECH_STACK.md`, `API_DECISIONS.md`, `DELIVERY_MODEL.md`, all relevant Approved Product Specifications, and all five existing Approved Tier B documents. Surfaces one genuine dependency-count correction (§1: `07` added, the previously-recorded list `08,09,10` corrected to `07,08,09,10`) and one documentation-completeness gap recorded, not resolved (`09_FOOD_ORDERING_SPECIFICATION.md`'s own Backend Requirements table does not name this module despite a genuine dependency in its own behavioral text, §1/§21). Per `DOCUMENTATION_GOVERNANCE.md` §5 and `IMPLEMENTATION_PLANNING.md` §7, this draft awaits Paul's explicit review before any refinement pass or freeze to Version 1.0 — Approved begins.
