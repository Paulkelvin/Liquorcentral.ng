# Tier B — Local Payment Provider Module

**Status:** Draft
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-19

This document is a Tier B (Module Data Planning) deliverable, per `IMPLEMENTATION_PLANNING.md` §4 and §6, defining the architecture of the local payment provider module (`MEDUSA_EXTENSIONS.md` #4) — a custom Payment Provider module wrapping a Nigerian payment service provider, implementing Medusa's documented Payment Provider interface so the platform can accept payment methods Nigerian buyers actually rely on (bank transfer and/or USSD alongside card) rather than a card-only checkout. `IMPLEMENTATION_PLANNING.md` §6 explicitly names this module next in Tier B's creation order, immediately after the delivery-slot module (now Approved). A re-verification against the six standing selection criteria (§0) confirms this module remains the correct next choice.

**This document is purely architectural.** It defines the module's responsibilities, ownership, boundaries, business purpose, and integration points — nothing else. **It is not a database design, not an API specification, not implementation code, and not a UI component definition.** No table is named, no field is typed, no endpoint is shaped, no component is designed. No Approved — Frozen document is modified by this document.

**This document is deliberately provider-agnostic.** It does not choose Paystack, Flutterwave, Stripe, or any other payment service provider — that choice remains Paul's explicit, open business decision (`MEDUSA_EXTENSIONS.md` #4, `BUSINESS_RULES.md`), recorded here, not resolved. The specific provider's integration shape (its API, webhook handling, settlement mechanics) is out of scope for this document entirely — that is Tier D's (Integration Planning) job, once a provider is chosen, per `IMPLEMENTATION_PLANNING.md` §4's own tier boundary. This document defines the module architecture that Tier D's provider-specific integration will eventually sit behind.

---

## 0. Module Selection Verification

Before drafting, the six criteria established for prior Tier B selections were re-applied to every remaining candidate in `MODULE_INVENTORY.md` — the local payment provider, the notification provider, and Saved-for-Later — rather than assuming `IMPLEMENTATION_PLANNING.md` §6's original ordering is automatically still correct.

| Criterion | Local payment provider | Next-closest candidate |
|---|---|---|
| Frozen specifications depending on it | **One** — `07` (§1 confirms this count directly against `07`'s own Backend Requirements table; no correction needed) | Notification provider: three (`08`, `09`, `10`) |
| Launch criticality | **Yes — the project's sole confirmed launch-blocking open decision**, per `MODULE_INVENTORY.md` and `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14 Row 4 | Notification provider: "operationally important — not confirmed launch-blocking by any document" (`MODULE_INVENTORY.md`) |
| Architectural centrality | Highest possible — no order can be placed at all without a payment step completing; this module wraps the one native Medusa capability (Payment) every single checkout, regardless of catalog, must pass through | Notification provider: proactive, supplementary messaging — an order can be placed and fulfilled without it; Saved-for-Later: a lightweight cart-adjacent convenience, the smallest architectural footprint of any remaining candidate |
| Dependency ordering (`IMPLEMENTATION_PLANNING.md` §6) | Named immediately after delivery-slot in Tier B's creation order (§6 point 2); named first among Tier D's own integration-planning order once a provider is chosen (§6 point 4) | Notification provider: named alongside the payment provider in §6 point 2, but explicitly *after* it in §6 point 4's Tier D ordering |
| Tier A findings | Already tracked at Row 4 of the definitive baseline (`TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14) — "Scoped, not built," blocked on provider choice, COD policy, **and** now known to need a materially larger state surface (pending/failed/cancelled/expired/retry) than originally scoped | Notification: Row 5, blocked only on channel choice — a narrower open surface; Saved-for-Later: Row 9, "**Missing**" — not even scoped in `MEDUSA_EXTENSIONS.md`, requiring Paul's confirmation it is in scope for v1 at all before any Tier B document could meaningfully be drafted |
| Later implementation-planning work depending on it | Blocks Tier C's Cart & Checkout API contract planning directly — no checkout API plan can specify a payment step without this module's architecture existing first | Notification/Saved-for-Later: narrower, secondary blocking relationships to Tier C work |

**Conclusion: the local payment provider module is the correct next Tier B module.** It wins decisively on launch criticality and architectural centrality despite the lowest raw dependency count of any Tier B module drafted so far — a deliberate, structural fact about Provider Modules generally (§1), not a sign of lower priority. Per `IMPLEMENTATION_PLANNING.md` §4 and §6 point 2, this document is itself a Tier B document (the module's architecture) — a separate, later Tier D document will plan the actual chosen provider's integration shape once Paul selects one; drafting that Tier D document now would be premature, not merely lower-priority.

---

## 1. Why This Module Exists

**Exactly one frozen Product Specification names this module directly in its own Backend Requirements table: `07_CHECKOUT_SPECIFICATION.md`.** Verified directly against `07`'s own §26 Backend Requirements table — "Payment processing (§14) | Custom Payment Provider module wrapping a local Nigerian payment service | `MEDUSA_EXTENSIONS.md` #4 | **Not yet built — provider undecided, launch-blocking**" — this matches `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §14 Row 4 and `MODULE_INVENTORY.md`'s existing dependent list (`07`) exactly. Checking every other frozen specification's own Backend Requirements table directly (the same discipline every prior Tier B document's own review applied to its dependency count) confirms no correction is required here:

- **`06_CART_SPECIFICATION.md`** names "payment provider" only as an open business decision in passing prose (its Purpose section, its §28 Risks & Assumptions) — its own §26 Backend Requirements table has no payment-provider row; the cart explicitly defers payment entirely to checkout ("`07_CHECKOUT_SPECIFICATION.md`, once drafted, will own exact delivery-fee/tax calculation, slot selection, and payment").
- **`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`** displays a masked payment-method reference in order history (§14) — but its own §25 Backend Requirements table sources this from the **native Order module** ("Order history / order details | Native Order module, queried by Customer | Platform-wide | Native"), not from this module directly. A customer's account reads what checkout already recorded on the order; it does not query this module.
- **`09_FOOD_ORDERING_SPECIFICATION.md`** mentions "payment was charged" once, in a Food Ordering Recovery scenario describing Checkout's own responsibility — its own §25 Backend Requirements table has no payment-provider row.
- **`02_HOMEPAGE_SPECIFICATION.md`** mentions "secure payment" once, as a single word in the Trust & Delivery Band's static trust copy — not a functional dependency of any kind.
- **`11_ADMIN_WORKFLOWS_SPECIFICATION.md`** does not mention "payment" anywhere, though §11 (Order Management) names a staff refund-processing workflow once the open return/refund policy is decided — a genuine architectural touchpoint with this module's eventual refund-execution responsibility (§16), but one `11`'s own §25 Backend Requirements table does not yet name. **This is a genuine, newly-discovered documentation gap, recorded here and not resolved**: `11` assumes a mechanism exists to execute a refund without naming what that mechanism is. It is not a correction to this module's dependency count (`11`'s own Backend Requirements table still has no payment-provider row, so the formal dependent list remains `07` alone), but it is a real completeness gap worth surfacing for whenever `11` is next revisited or its own Tier C API plan is drafted.
- **`10_DELIVERY_SPECIFICATION.md`** names a refund as one *possible* outcome of an undecided failed-delivery or cancellation policy (§13, §14) — its own §25 Backend Requirements table has no payment-provider row; this is a business-policy mention, not a backend dependency.

**This module's genuinely low dependency count is a structural fact about Provider Modules, not a weakness or a sign of lower priority (§0).** Unlike the four Custom Modules drafted so far (`wine-details`, `food-details`, the Product Relationship Module, delivery-slot), each of which is read directly by many consuming surfaces (navigation, search, listings, product pages, admin tooling), a Provider Module implementing a native Medusa interface is invoked once, by one workflow, at one moment — payment capture during order placement. Every other surface that ever needs to know something about a payment (a customer's order history, a staff member's order view) reads the **native Order module's own resulting payment status and reference**, never this module directly (§13, §14). This module's real significance is not breadth of consumption — it is that a single order, of either catalog, cannot be placed at all without it.

This document exists to hold the architecture no prior document defines: `MEDUSA_EXTENSIONS.md` #4 and `TECH_STACK.md` both correctly identify *that* this module is needed and sketch its shape in a few sentences, but neither defines its lifecycle, its state model, its relationship to Medusa's native Payment module, or how it integrates with the specifications and native modules that depend on it — the fifth Tier B module (after the Product Relationship Module, `wine-details`, `food-details`, and delivery-slot) this project's Phase 2 work formalizes.

## 2. Business Justification

- **Directly implements `MEDUSA_EXTENSIONS.md` #4's stated reasoning** — "Nigerian buyers rely heavily on bank transfer and USSD, and trust these more than card-only checkout from an unfamiliar store — a card-only checkout is a real trust and conversion barrier in this market." This module is the mechanism that makes a trustworthy, locally-appropriate payment step possible at all.
- **Directly implements `TECH_STACK.md`'s Payments recommendation** — "card-only checkout is insufficient for the Nigerian market; bank transfer/USSD support is required" — naming the rationale this module's architecture must satisfy, without yet choosing the provider that satisfies it.
- **Protects the honesty principle every checkout-adjacent specification already establishes** — `07_CHECKOUT_SPECIFICATION.md` §1 and its Payment State Behaviour appendix both depend on a payment attempt's true state (pending, failed, cancelled, expired) being known and shown accurately; an honest "payment pending" or "payment failed" message is only possible if this module reports the provider's real state faithfully, never a guess.
- **Directly serves `PRODUCT_BLUEPRINT.md` §9's one-cart-one-checkout decision** — "one payment for the entire order, regardless of how many fulfillment groups it contains" (`07_CHECKOUT_SPECIFICATION.md` §14) is only achievable if this module treats a mixed Wine & Spirits + Food Central order as a single payment event, never two.
- **Serves the Confident Buyer customer intent specifically at the platform's single highest-stakes step** (`07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent table, Payment Behaviour §19's Trust Signals) — the payment step is "the point at which a customer is asked to share the most sensitive information in the entire journey," and this module is the mechanism that must make that moment trustworthy regardless of which specific provider is eventually chosen.

## 3. Responsibilities

- **Provide a stable, provider-agnostic payment capability to the rest of the platform**, implementing Medusa's documented Payment Provider interface so that Checkout, Cart/Order, and every future consumer interact with one consistent shape regardless of which Nigerian payment service provider sits behind it.
- **Initiate, track, and report the state of a payment attempt** for a given order, across every catalog and fulfillment-leg combination the platform supports — a mixed Wine & Spirits + Food Central order is one payment attempt, never two, restating `PRODUCT_BLUEPRINT.md` §9 directly.
- **Support the payment methods Nigerian buyers actually rely on** — bank transfer and/or USSD alongside card — as a category of capability this module's architecture must accommodate, without this document specifying which methods a specific chosen provider ultimately supports (that is Tier D's job, once a provider is chosen).
- **Faithfully report a payment attempt's true state** (pending, authorized/succeeded, failed, cancelled, expired) to the native Order/Cart workflow that initiated it, so that workflow can honestly reflect what has actually happened — never a status inferred, guessed, or optimistically assumed.
- **Support capture and refund as native Payment module capabilities**, per `ARCHITECTURE.md`'s own description of the native Payment module ("payment sessions, captures, refunds"), implemented against whichever provider is chosen — this module is the thing that makes that native capability real for a Nigerian payment method, not a new capability invented on top of it (§16).
- **Remain the payment mechanism layer only** — never the payment method *choice* a customer makes (Checkout's UI concern), never the order's own recorded payment status (the native Order module's own field), never the refund *policy* (a business decision), and never the order placement workflow itself. See §4 for the explicit boundaries this implies.

## 4. Explicit Non-Responsibilities

- **This module does not choose which Nigerian payment service provider is integrated.** Provider choice (e.g., a Paystack-class or Flutterwave-class provider) is an explicit, open business decision requiring Paul's approval (`MEDUSA_EXTENSIONS.md` #4, `BUSINESS_RULES.md`) — this document does not propose, narrow, or invent an answer. The chosen provider's specific integration shape is Tier D's job (§0, intro).
- **This module does not decide whether cash-on-delivery is offered at all.** `BUSINESS_RULES.md` and `07_CHECKOUT_SPECIFICATION.md` §14 both name this as a genuinely open decision, distinct from and unrelated to this module's own architecture — if adopted, cash-on-delivery would be a separate payment method selected at the same checkout step, not a capability this module provides, since it involves no provider transaction at all.
- **This module does not perform reconciliation or accounting.** Settlement, ledger-matching, and financial reporting against the chosen provider's own settlement reports are operational/finance functions that consume this module's transaction records — this module is not itself a reconciliation or accounting system, and does not propose one.
- **This module does not decide the refund or return policy.** The alcohol return/refund policy remains an explicit open business/legal decision (`PRODUCT_BLUEPRINT.md` §9, `BUSINESS_RULES.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11) — this module supplies the mechanism to execute a refund once one is authorized elsewhere; it does not decide when a refund is warranted, does not compute a refund amount, and does not decide policy. See §16.
- **This module does not determine the delivery-fee or tax amount charged.** `07_CHECKOUT_SPECIFICATION.md` §13 already establishes fee/tax calculation as the native Fulfillment/Tax modules' own responsibility — this module charges whatever amount checkout's own pricing calculation has already confirmed; it does not calculate that amount itself.
- **This module does not hold or display a customer's full payment details.** `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14 already establishes that only a masked reference is ever shown back to a customer, "consistent with standard PCI-adjacent handling of payment data" — this module's architecture must support that constraint, not weaken it, and full payment credentials are never this platform's own data to hold.
- **This module does not perform age verification or compliance checks.** `07_CHECKOUT_SPECIFICATION.md` §15's age-verification backstop is an entirely separate mechanism; this module's only relationship to it is that both happen to occur near the same checkout step.
- **This module does not decide the customer-facing payment method wording, sequencing, or interaction pattern.** `07_CHECKOUT_SPECIFICATION.md` §9/§14 remain the sole authority on how the payment step is presented; this module supplies the underlying capability and state data only.
- **This module has no application beyond the payment step itself** — it does not perform notification (a separate, not-yet-approved provider, `MEDUSA_EXTENSIONS.md` #5), does not perform delivery scheduling (the now-Approved delivery-slot module), and does not hold product, attribute, or relationship data of any kind.
- **This module is not a database design, an API specification, implementation code, or a UI component definition**, per this document's explicit scope. It does not resolve the operational-parameter and business-policy open decisions it depends on (§18, §22).

## 5. Payment Method, Payment Status, and Refund Policy — Related but Separate Concepts

Mirroring the boundary-drawing discipline `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §5 established for its own domain, this document keeps four genuinely distinct concepts separate, so a future contributor does not silently collapse them into one:

- **Payment method selection** — the customer-facing choice made at checkout (card, bank transfer, USSD, and eventually cash-on-delivery if adopted) — is `07_CHECKOUT_SPECIFICATION.md`'s own UI/UX responsibility, not this module's.
- **This module (the payment mechanism)** — the provider-agnostic capability that actually initiates, tracks, and reports a payment attempt's state against whichever provider is chosen — is this document's own subject.
- **Payment status recorded on the Order** — the native Order module's own field, reflecting what this module last reported — is read by every other consuming surface (§13, §14); it is not this module's own data store to query directly.
- **Refund policy** — the business/legal decision of when a refund is warranted and how much is owed — is an entirely separate, open decision (`BUSINESS_RULES.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11) this module does not make; this module only supplies the mechanism to execute a refund once that policy authorizes one (§16).

## 6. Payment Lifecycle Responsibilities

Described here at a conceptual level only — no state-machine implementation, enum, or code construct is proposed; this section names the real-world stages a payment attempt passes through so that Tier C's eventual API planning has an agreed conceptual sequence to build against, reusing `07_CHECKOUT_SPECIFICATION.md`'s own Payment State Behaviour vocabulary directly rather than inventing a parallel one:

- **Initiated** — a payment attempt has begun against the chosen provider, tied to a specific order (or cart, prior to order placement), for the full order total regardless of catalog mix.
- **Pending** — the customer has submitted payment (e.g., a bank transfer or USSD instruction) but confirmation has not yet been received. Restating `07_CHECKOUT_SPECIFICATION.md`'s Payment State Behaviour directly: the order is held, not placed, while pending, and the customer sees an explicit "payment pending" state, never one indistinguishable from success or failure.
- **Authorized / Captured** — the provider has confirmed the payment; funds are authorized and, per the native Payment module's own capture mechanism, captured. This is the point at which order placement can proceed to completion.
- **Failed** — the provider declined or could not complete the attempt. The specific reason, where the provider supplies one, is this module's responsibility to report faithfully — not to soften, generalize, or hide.
- **Cancelled** — the customer abandoned the attempt before completing it (e.g., closed an external payment page). This module reports this distinctly from Failed, since nothing went wrong — the attempt was simply not completed.
- **Expired** — a Pending attempt that never resolved within a genuinely reasonable window. This module is responsible for surfacing this state rather than leaving an attempt pending indefinitely with no resolution.
- **Retry** — available from Failed, Cancelled, and Expired alike — this module supports initiating a fresh attempt for the same order without requiring the rest of checkout's already-confirmed information to be re-entered.
- **Refunded** — a previously captured payment has funds returned via the provider, following the native Payment module's own refund capability (§16). This module's responsibility is limited to executing the refund transaction accurately and reporting its outcome; the decision to refund is never this module's own (§4, §16).

**No stage above is ever skipped or misreported to a customer or to staff**, restating the same integrity principle every prior specification's own status progression already establishes (`09_FOOD_ORDERING_SPECIFICATION.md` §7, `10_DELIVERY_SPECIFICATION.md` §10).

## 7. Payment-State Responsibilities

- **This module is the single source of truth for a payment attempt's actual state**, and the native Order/Checkout workflow's own recorded status must never diverge from what this module last reported — restating `07_CHECKOUT_SPECIFICATION.md`'s own Payment State Behaviour finding that these states are "behavioral states any payment method can occupy, specified so the eventual payment-provider integration has a clear contract to implement against, not a gap discovered only once that integration begins."
- **This module does not assume which payment methods are ultimately integrated** — restating `07_CHECKOUT_SPECIFICATION.md`'s own explicit statement directly — the Pending/Failed/Cancelled/Expired/Retry states apply regardless of whether the eventual provider supports card, bank transfer, USSD, or some combination.
- **A state transition is reported the moment it is genuinely known**, never batched, delayed, or inferred from elapsed time alone (except Expired, which is inherently time-based per §6) — the same "a status is only shown once it is genuinely true" discipline every other specification's own status progression already follows.
- **This module's state reporting must be resilient to asynchronous confirmation** — `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §7 already names this as a genuine, newly-clarified requirement: local payment methods (bank transfer, USSD) commonly involve an asynchronous confirmation step a simple card charge does not, and this module's architecture must accommodate that asynchrony as a first-class case, not an edge case.

## 8. Provider Abstraction Responsibilities

- **This module exists specifically so that a provider choice, once made, does not ripple through the rest of the platform.** Checkout, Cart/Order, Customer Account, and Admin Workflows each interact with this module's stable, provider-agnostic shape — never with a specific provider's own API, webhook format, or terminology directly.
- **This module implements Medusa's documented Payment Provider interface**, restating `MEDUSA_EXTENSIONS.md` #4's own technical description directly — "implements Medusa's documented Payment Provider interface... comparable in scope to Medusa's own first-party Stripe integration" — the same extension pattern `ARCHITECTURE.md` establishes as the rule for every custom module on this project: new capability as a defined extension point, never a modification to Medusa core.
- **A future provider change (or the addition of a second provider) is, architecturally, a new implementation behind this module's existing shape**, not a redesign of Checkout, Order, or any other consuming surface — a capability this document's architecture leaves room for (§19), not something committed or scheduled today.
- **This module does not invent its own abstraction language independent of Medusa's** — per `IMPLEMENTATION_PLANNING.md` §2 principle 2 ("Medusa-native first... a plan that reaches for a custom mechanism where Medusa already provides one is a planning defect, not a preference"), this module's provider-agnostic shape is Medusa's own existing Payment Provider interface, not a bespoke abstraction layered in front of it.

## 9. Scope: One Unified Payment Step, Both Catalogs

- **This module applies identically to Wine & Spirits, Food Central, and mixed orders.** Unlike the delivery-slot module (Food Central only, `TIER_B_DELIVERY_SLOT_MODULE.md` §8) or the two attribute modules (each scoped to one catalog), this module has no catalog boundary — `PRODUCT_BLUEPRINT.md` §9's one-cart-one-checkout decision means a single order, regardless of what it contains, is a single payment event.
- **This is a deliberate consequence of the no-order-splitting decision, not an oversight.** `07_CHECKOUT_SPECIFICATION.md` §14 states this directly: "one payment for the entire order, regardless of how many fulfillment groups it contains... payment is the step where a temptation to split by fulfillment leg would otherwise be strongest." This module's architecture must resist that temptation structurally, not merely by convention.
- **This document does not propose a second payment mechanism for any future business line.** If a future fulfillment model or business line is ever added (`PRODUCT_BLUEPRINT.md` §17), it would use this same unified payment step, per the identical one-cart-one-checkout principle — not a parallel payment system.

## 10. Ownership

This module's governance is a two-way split, narrower than the three- and four-way splits the descriptive-data Tier B modules required (`TIER_B_WINE_ATTRIBUTES_MODULE.md` §7, `TIER_B_FOOD_ATTRIBUTES_MODULE.md` §8), since a Provider Module has no field list or content-accuracy dimension of its own:

- **The module's existence, architecture, and provider-abstraction mechanism (this document) are an engineering/architecture decision.**
- **Which provider is integrated, and whether cash-on-delivery is supported at all, are business/operations decisions requiring Paul's explicit approval**, restating `MEDUSA_EXTENSIONS.md` #4's own statement directly ("Paul's approval required: Yes — which provider, and whether cash-on-delivery is supported at all"). This document does not narrow or resolve that requirement (§18, §22).
- **Refund policy — when a refund is warranted, and for how much — is a business/legal decision belonging to whoever owns the alcohol return/refund policy generally** (`PRODUCT_BLUEPRINT.md` §9, `BUSINESS_RULES.md`), not to this module's own governance. This module's governance covers only the mechanism that executes an authorized refund (§16), never the authorization itself.
- **Reconciliation and settlement accounting are an operational/finance function, not this module's governance to define** (§4) — this module supplies transaction records; how those records are reconciled against the provider's own settlement reports is a separate operational responsibility this document does not extend to cover.

## 11. Interaction with Medusa's Native Payment Module

- **This module extends, not replaces, Medusa's native Payment module.** Restating `ARCHITECTURE.md` directly — "Payment sessions, captures, refunds — extended with a local payment provider" — the native Payment module already provides the session/capture/refund concepts; this module is the Nigerian-provider-specific implementation behind Medusa's own Payment Provider interface, following the identical extension-point pattern `ARCHITECTURE.md` establishes as the rule for every custom module on this project: no core changes.
- **Payment capture attaches to the order-placement workflow**, restating `MEDUSA_EXTENSIONS.md` #4's own framing that this is "a genuine backend build, comparable in scope to Medusa's own first-party Stripe integration" — the workflow engine's resumable, compensable step-sequence guarantee (`ARCHITECTURE.md`'s description of `completeCartWorkflow`) governs how a payment step's success or failure interacts with the rest of order placement, not a separate, uncoordinated mechanism this module invents.
- **This module does not introduce a new actor type, a new commerce module boundary, or a new database beyond what Medusa's Payment Provider interface already expects** — consistent with `API_DECISIONS.md`'s stated preference for native mechanisms configured rather than extended, applied here to the one case where genuine extension (not mere configuration) is actually required, per `MEDUSA_EXTENSIONS.md` #4's own assessment.

## 12. Integration with Checkout

**This is the module's primary and, per §1's dependency finding, its only directly-evidenced consumer.** `07_CHECKOUT_SPECIFICATION.md` §14 (Payment Behaviour) and its Payment State Behaviour appendix together specify the customer-facing mechanics this module's data and mechanism support:

- **The payment method(s) available are not yet determined, and this module's architecture must not assume any specific set** — restating `07_CHECKOUT_SPECIFICATION.md` §14 directly: "this document specifies checkout's behavioral requirement... without assuming which provider or exact method set is ultimately integrated."
- **A failed payment returns the customer to the payment step with a clear, specific reason and a retry path** (`07_CHECKOUT_SPECIFICATION.md` §14, §21) — this module's responsibility is to supply that specific reason faithfully when the provider furnishes one, never to substitute a generic message where a real one exists.
- **Every payment-state change is announced via the platform's existing polite live-region mechanism** (`07_CHECKOUT_SPECIFICATION.md` §22) — this module supplies the state changes; the announcement mechanism itself is `07`'s own accessibility responsibility, not this module's.
- **Focus returns predictably after an external payment redirect** (`07_CHECKOUT_SPECIFICATION.md` §22) — a consequence of how this module's provider interaction is structured (a redirect-based flow, common to bank transfer/USSD confirmation) that `07`'s own interaction design must account for; this module does not itself define the redirect UX.
- **This module supplies the data and the payment mechanism; `07_CHECKOUT_SPECIFICATION.md` §14 and its Payment State Behaviour appendix remain the sole authority** on the customer-facing sequencing, wording, and interaction pattern around it.

## 13. Integration with Customer Account

**A narrower, read-only relationship, mediated entirely through the native Order module — not a direct dependency.** `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14 states this precisely: an order's permanent record shows "the payment method (not full payment details)... consistent with standard PCI-adjacent handling of payment data regardless of which payment provider is ultimately integrated." Concretely:

- **Customer Account never queries this module directly.** It reads whatever masked payment-method reference the native Order module already recorded at the time this module last reported a state to it (§7) — confirmed by `08`'s own §25 Backend Requirements table, which sources order details from "Native Order module," not from this module.
- **This module's architecture must support a masked-reference-only display constraint** — full payment credentials are never held by this platform at all (§4), so Customer Account's own restraint is a consequence of what this module makes available, not an independent policy layered on top.
- **Reordering re-validates price and availability, never payment** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §15, `06_CART_SPECIFICATION.md` §12/§13) — a reorder initiates a fresh payment attempt through this module exactly as any new order would; it does not reuse or replay a prior payment attempt's state.

## 14. Integration with Order Management

Distinct from Customer Account's read-only relationship, this section describes this module's architectural relationship with the **native Order module itself** — a module-to-module relationship, not a specification-consumer one:

- **A payment attempt's state (§6, §7) is the signal the order-placement workflow uses to decide whether an order can be confirmed.** An order is never confirmed while a payment attempt remains Pending, Failed, Cancelled, or Expired — restating `PRODUCT_BLUEPRINT.md` §9's and `07_CHECKOUT_SPECIFICATION.md` §21's shared discipline that a customer is never left uncertain whether they were charged.
- **This module's refund capability (§16) is invoked against an already-placed order's existing payment record**, never against a cart or an unconfirmed attempt — a refund is, by definition, a reversal of something the native Order module has already recorded as captured.
- **This module holds no order-level data of its own** (line items, fulfillment legs, delivery status) — it holds only the payment attempt and its state, linked to the order via Medusa's native Order–Payment association; every other fact about the order remains the native Order module's own responsibility.

## 15. Integration with Admin Workflows

**A narrower relationship than the four Custom Modules drafted so far, and one this review found only partially reflected in the frozen specification itself.** `11_ADMIN_WORKFLOWS_SPECIFICATION.md` does not mention "payment" anywhere, though its §11 (Order Management) names a staff-facing refund workflow directly: "this document specifies that staff need a workflow to process a return/refund once that policy is decided, not what the policy is." This module is the mechanism that eventual staff-initiated refund action would invoke, once the refund policy (§4, §16) authorizes one — but `11`'s own §25 Backend Requirements table does not currently name this module as that mechanism's source, a genuine, newly-discovered documentation gap recorded in §1 and §21, not resolved here by editing the frozen specification. Additionally:

- **`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §21 (Security)** names "processing a refund" as an example of a sensitive, hard-to-reverse action requiring staff re-confirmation before it completes — this module's refund-execution responsibility (§16) is the underlying mechanism that action would ultimately invoke.
- **Staff visibility into a payment's current state** (whether an order's payment succeeded, is pending, or failed) is read through the same unified order view §11 already describes — this module does not propose a separate staff-facing payment dashboard; whatever staff need to see is surfaced through the native Order record this module reports into (§14), not through a direct integration of its own.

## 16. Integration with Refund Workflow (Architectural Boundary Only)

**This module supplies the refund mechanism; it never supplies, computes, or decides the refund policy.** This is the single clearest architectural boundary this document draws, and it is worth stating on its own rather than folding entirely into §4 or §15, given how central and how frequently open-ended the alcohol return/refund policy question already is across `/docs`:

- **Refunds are a native Medusa Payment module capability** (`ARCHITECTURE.md`: "payment sessions, captures, refunds") — this module's responsibility is to correctly implement that capability against whichever provider Tier D eventually integrates, not to invent a new refund concept.
- **The decision that a refund is warranted, for how much, and under what circumstances, belongs entirely to the open alcohol return/refund policy** (`PRODUCT_BLUEPRINT.md` §9, `BUSINESS_RULES.md`, `05_PRODUCT_DETAILS_SPECIFICATION.md` §19, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14/§27, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11) — a genuinely open business/legal decision this document does not narrow, invent, or resolve.
- **Once a refund is authorized elsewhere** (by whatever staff workflow `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11 eventually specifies, once that policy exists), **this module executes the refund transaction against the provider and reports its outcome** — success, failure, or a partial/complete distinction if the eventual policy requires one — faithfully, using the same honesty discipline as every other state this module reports (§7).
- **This module does not decide whether a refund is full or partial, does not compute a refund amount, and does not decide the delivery-fee or tax treatment of a refunded order** — all of that is policy and calculation belonging elsewhere (§4); this module's architecture only needs to be capable of executing whatever amount it is instructed to refund.
- **This is a distinct concern from cancellation and delivery rescheduling** (`10_DELIVERY_SPECIFICATION.md` §14) — a cancellation or reschedule may or may not trigger a refund depending on the still-open cancellation-cutoff policy; this module's refund mechanism is one possible downstream consequence of that policy, not the thing that decides when it applies.

## 17. Non-Integrations (Confirmed, Not Assumed)

Reviewed against every frozen specification; the following have **no dependency** on this module, stated explicitly so a future contributor does not assume one that was never specified:

- **Cart (`06_CART_SPECIFICATION.md`)** — see §1's dependency confirmation — no functional integration exists; the cart defers payment entirely to checkout.
- **Food Ordering (`09_FOOD_ORDERING_SPECIFICATION.md`) and Delivery (`10_DELIVERY_SPECIFICATION.md`)** — both mention payment or refund only as a passing reference to checkout's or an open policy's own responsibility; neither has a Backend Requirements table row naming this module.
- **Navigation, Homepage, Search, Product Listing, Product Details (`01`–`05`)** — none references payment in any functional capacity; `02`'s single "secure payment" trust-copy mention is static content, not a data dependency.
- **`wine-details`, `food-details`, the Product Relationship Module, and delivery-slot** — no relationship. Each holds a different concern (descriptive product data, curated cross-product associations, fulfillment scheduling); this module holds payment-mechanism data. Each is read independently, never merged with this module's own data.
- **The notification provider** (`MEDUSA_EXTENSIONS.md` #5) — a separate, not-yet-approved Provider Module; this document does not assume how or whether a payment-state change eventually triggers a customer notification, since the notification provider's own channel and architecture are not yet decided.

## 18. CMS & Merchandising Responsibilities

**None.** Mirroring delivery-slot's own precedent (`TIER_B_DELIVERY_SLOT_MODULE.md` §17): this module holds only payment-mechanism and transaction-state data. No specification proposes editorial content about a payment method, and no merchandising curation applies to how or whether a payment step is offered. This is stated explicitly, rather than left silent, so a future contributor does not assume this module needs a content-governance model it has no actual use for.

## 19. Operational Assumptions

- **A single Nigerian payment service provider is assumed to be integrated first**, consistent with `MEDUSA_EXTENSIONS.md` #4's own singular framing ("a local payment service provider") — this document does not assume a multi-provider architecture is needed at launch, though it does not foreclose one later (§8, §20).
- **Cash-on-delivery's existence is not assumed** (§4, §9) — this module's architecture accommodates it as one possible future payment method if adopted, without assuming it will be.
- **Reconciliation and settlement accounting are assumed to be an operational/finance function outside this module** (§4, §10) — this document assumes this module's transaction records are sufficient input to that function without itself being that function.
- **Asynchronous confirmation (bank transfer, USSD) is assumed to be the common case, not the exception**, for whichever Nigerian provider is chosen (§7) — this module's architecture is built around that assumption from the outset, not retrofitted to it later.
- **This module assumes a single, unified payment step serves both catalogs and all fulfillment-leg combinations** (§9) — no separate payment mechanism is assumed to exist or to be needed for Food Central versus Wine & Spirits.

## 20. Future Extensibility

Nothing in this section is built now — it documents capability this module's shape already leaves room for:

- **A second payment provider**, should the business ever want to offer more than one (e.g., a backup provider, or a provider better suited to a specific method) — this module's provider-abstraction shape (§8) does not foreclose this, but no frozen specification currently requires it, and this document does not design it.
- **Cash-on-delivery as an additional payment method**, should Paul confirm it is adopted (§4, §9, §19) — a capability observation, not a proposal, since the decision itself remains open.
- **Saved/tokenized payment methods for returning customers**, per `07_CHECKOUT_SPECIFICATION.md` §28's own Future Expansion section — not authorized or scheduled by any document today.
- **Split or partial payments**, also named in `07_CHECKOUT_SPECIFICATION.md` §28 as a future-expansion capability — this module's transaction-per-attempt shape does not foreclose this, but it is not designed here.
- **Extension to a future business line or fulfillment model**, per `PRODUCT_BLUEPRINT.md` §17's general future-expansion framing — not authorized or scheduled by any document today, and this module's current scope remains both existing catalogs, undivided (§9).

## 21. Risks

- **A single frozen specification depends on this module directly, but the platform cannot place any order at all without it — the inverse risk profile from every other Tier B module drafted so far.** A future implementation team could under-prioritize this module's own architectural rigor precisely because its dependency count looks small next to `wine-details` or `food-details` (§0, §1); this document names that risk explicitly so it is not repeated.
- **Asynchronous, multi-state payment confirmation is genuinely more complex than a simple card charge**, restating `MEDUSA_EXTENSIONS.md` #4's own assessment directly — "Implementation difficulty: Moderate–significant. This should not be underscoped as 'just add a provider' — it is real, standalone backend work." A future implementation that treats this module as a simple synchronous success/failure boolean would fail every one of §6's and §7's genuine state distinctions.
- **Reconciliation complexity is a named risk specifically if cash-on-delivery is also adopted**, restating `MEDUSA_EXTENSIONS.md` #4's own Risk directly — a mixed cash/provider payment landscape would materially complicate the reconciliation function this module's data feeds (§4, §10), though that complexity belongs to the reconciliation function itself, not this module's own architecture.
- **The refund-mechanism-vs-refund-policy boundary (§16) is easy to blur in practice** — a future contributor could plausibly build refund *policy* logic into this module by default, assuming the two belong together, when the policy itself remains a genuinely separate, unresolved business/legal decision; this document names the risk explicitly so it is decided on purpose rather than discovered as an inconsistency later.
- **The newly-discovered `11_ADMIN_WORKFLOWS_SPECIFICATION.md` gap (§1, §15)** — a staff refund workflow is named without naming this module as its underlying mechanism — risks being rediscovered from scratch during Tier C's Admin Workflow API planning if not carried forward from this document.
- **Provider API reliability and documentation quality varies**, restating `MEDUSA_EXTENSIONS.md` #4's own Risk directly — a risk inherent to whichever provider is eventually chosen, not something this module's own architecture can eliminate, only accommodate through faithful, honest state reporting (§7).

## 22. Dependencies

- **Depends on the native Payment module** (sessions, captures, refunds), already native and unaffected by this document.
- **Depends on Paul's explicit approval of the payment service provider choice** — an already-tracked, sole confirmed launch-blocking open business decision (`PROJECT_STATUS.md`, `MEDUSA_EXTENSIONS.md` #4, `BUSINESS_RULES.md`); this document does not propose, narrow, or invent an answer.
- **Depends on Paul's explicit decision on whether cash-on-delivery is supported at all** (`BUSINESS_RULES.md`, `07_CHECKOUT_SPECIFICATION.md` §14) — a separate, related, and equally open decision.
- **Depends on a future decision on the alcohol return/refund policy** (`PRODUCT_BLUEPRINT.md` §9, `BUSINESS_RULES.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11) to fully specify when this module's refund mechanism (§16) is actually invoked — this module's own architecture does not require that policy to be resolved, but full integration behavior (§15, §16) does.
- **Blocks Tier C's Cart & Checkout API contract planning**, per `IMPLEMENTATION_PLANNING.md` §6's own sequencing logic — that plan cannot specify a payment step without this module's architecture existing first.
- **Recommends that `11_ADMIN_WORKFLOWS_SPECIFICATION.md`'s own Backend Requirements table (§25) eventually name this module as the mechanism behind its §11 refund-processing workflow** (§1, §15) — a documentation completeness recommendation, not a correction to any Tier A/`MODULE_INVENTORY.md` dependency count, since `11`'s own table currently has no payment-provider row to correct.
- **Depends on Tier D (Integration Planning) to plan the actual chosen provider's integration shape**, once Paul selects one — this document is explicitly not that plan (§0, intro).
- **Depends on Paul's explicit confirmation that this module proceeds into further Tier B/C planning** — per `IMPLEMENTATION_PLANNING.md` §2 principle 4, this document does not assume approval; it documents the architecture so that confirmation, when given, has something concrete to approve.

## 23. Quality Checklist

Every future addition to this module's planning must be able to answer **yes** to all of the following:

- [ ] **Does it remain provider-agnostic, naming no specific payment service provider anywhere?** Checked against the intro, §0, §4, §8.
- [ ] **Does it keep payment method selection (Checkout's concern) separate from this module's own mechanism?** Checked against §5, §12.
- [ ] **Does it keep refund policy (a business/legal decision) separate from refund execution (this module's mechanism)?** Checked against §5, §16.
- [ ] **Does it preserve a single, unified payment step across both catalogs, never a per-catalog payment mechanism?** Checked against §9.
- [ ] **Does it faithfully report every payment state rather than collapsing them into a simple success/failure boolean?** Checked against §6, §7.
- [ ] **Does it avoid inventing an answer to any open business decision** (provider choice, cash-on-delivery, refund policy) rather than recording it? Checked against §4, §18, §22.
- [ ] **Does it treat reconciliation/accounting as a separate, consuming function, never this module's own responsibility?** Checked against §4, §10.
- [ ] **Does it stay purely architectural**, introducing no table, field type, endpoint, or code? Checked against this document's own scope statement.

## 24. Acceptance Criteria

- [ ] A payment attempt is represented as a stateful, provider-agnostic entity — never a simple success/failure boolean — capable of Initiated, Pending, Authorized/Captured, Failed, Cancelled, Expired, and Refunded states.
- [ ] No specific payment service provider is named, chosen, or implied anywhere in this document.
- [ ] A mixed Wine & Spirits + Food Central order is represented as a single payment event, never two.
- [ ] Payment method selection, payment mechanism, payment status on the Order, and refund policy are each confirmed as distinct, separately-owned concepts.
- [ ] Refund is represented as a mechanism this module executes once authorized elsewhere, never a policy this module decides.
- [ ] Cash-on-delivery, provider choice, and refund policy are each confirmed as open business decisions, none resolved, narrowed, or invented by this document.
- [ ] This module's relationship to Customer Account and Admin Workflows is confirmed as read-only/mediated through the native Order module, never a direct query surface of its own.
- [ ] The newly-discovered `11_ADMIN_WORKFLOWS_SPECIFICATION.md` documentation gap (a refund workflow named without naming this module as its mechanism) is recorded as a completeness recommendation, not silently fixed by editing the frozen specification.
- [ ] This document introduces no database table, field type, API endpoint, or UI component definition anywhere within it.
- [ ] The architectural boundary between this Tier B document and a future Tier D provider-integration document is stated explicitly and preserved throughout.

---

**Document status:** Draft (v1.0). This is the first architectural draft of the Local Payment Provider Module, reviewed against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `MODULE_INVENTORY.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `TECH_STACK.md`, `API_DECISIONS.md`, all relevant Approved Product Specifications, and all four existing Approved Tier B documents. Confirms this module's dependency count (`07` only) is accurate and requires no correction — a genuine finding in itself, the first Tier B module whose baseline needed no swap-or-add adjustment. Surfaces one newly-discovered documentation gap (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11 names a staff refund workflow without naming this module as its underlying mechanism, §1/§15/§21/§24) — recorded as a completeness recommendation, not resolved here and not fixed by editing the frozen specification. Preserves the architectural boundary between this Tier B document (the module's provider-agnostic architecture) and a future Tier D document (the specific chosen provider's integration shape) throughout. Per `DOCUMENTATION_GOVERNANCE.md` §5 and `IMPLEMENTATION_PLANNING.md` §7, this draft awaits Paul's explicit review before any refinement pass or freeze to Version 1.0 — Approved begins.
