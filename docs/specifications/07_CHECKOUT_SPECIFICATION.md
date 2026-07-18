# Checkout Specification

**Status:** In Progress
**Version:** 0.1
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for the LiquorCentral checkout flow — everything from the moment a customer selects "Proceed to Checkout" through order confirmation. It defines *customer behavior, operational logic, business rules, trust, accessibility, scalability, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §9 (Checkout Strategy) and §11 (Trust Strategy), `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, `USER_FLOWS.md` (Flow 5, Flow 6), `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0 §B9 (form behaviors), and none of it contradicts them. It integrates directly with the six already-frozen specifications it sits beside: `06_CART_SPECIFICATION.md` hands off exactly at the point this document begins — the cart's two fulfillment-leg groups (§5, §6 of that document), its Pricing Transparency table's "unknown/estimated" delivery fee and tax, and its explicit deferral of slot selection all become this document's responsibility, not a restatement of the cart's own scope. `01_NAVIGATION_SPECIFICATION.md` §17 already establishes the navigation-level rules checkout must obey (linear, backward-navigable, no skip-ahead, no new discovery surface mid-checkout) — this document does not redefine those rules, only the steps that exist within them. **Where this document depends on a business decision that has not yet been made (payment provider, cash-on-delivery, Wine & Spirits' delivery mechanism, the exact Lagos delivery-area definition, delivery-slot operational parameters, whether a hard age/compliance re-check is added), it says so explicitly rather than inventing an answer.**

Where a decision is grounded in external UX or conversion research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Checkout Philosophy

**Checkout confirms what the cart already prepared — it should never introduce a new surprise.** `06_CART_SPECIFICATION.md` §1 establishes that the cart's job is to prepare customers for checkout, not surprise them during it; this document's governing responsibility is to honor that preparation, not undo it. Two commitments follow, and nothing below may violate them:

1. **Every cost, delivery promise, and constraint the cart already stated is carried forward unchanged, then completed** — checkout's distinct job is to resolve what the cart could not yet know (a real address, a chosen delivery slot, the resulting delivery fee and tax), never to contradict what the cart already told the customer.
2. **Checkout narrows navigation in service of completion, but never traps the customer.** Consistent with `01_NAVIGATION_SPECIFICATION.md` §17: a customer may always step backward to review or correct a completed step, and may always leave to keep shopping without losing progress — but may not skip ahead of an unresolved prerequisite.

## 2. Business Objectives

- **Convert prepared intent into a completed order** with the minimum friction that honesty allows — reducing abandonment specifically at the step where it is most costly to the business, since a customer reaching checkout has already cleared every earlier decision point.
- **Resolve, honestly and exactly once, what the cart could not yet calculate** — a real delivery address, a chosen delivery/pickup option, the resulting delivery fee and tax — completing `06_CART_SPECIFICATION.md`'s Pricing Transparency table rather than leaving it open indefinitely.
- **Enforce Food Central's Lagos-only delivery scope authoritatively**, against a real address, for the first time in the customer's journey (`06_CART_SPECIFICATION.md` §10, §6 already flagged this as checkout's responsibility).
- **Protect the platform's compliance posture** (age verification) at the single highest-stakes commercial moment on the platform, without resolving the still-open question of exactly how.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to checkout specifically:

| Customer type | Checkout objective |
|---|---|
| Confident Buyer | Complete checkout in as few steps as possible, with no forced account creation and no surprise costs. |
| Guided Browser | Trust that the final total and delivery promise match what was already shown in the cart, with no last-step reversal of what was implied earlier. |
| Repeat Household | Understand, clearly, how a mixed order's two fulfillment legs are each confirmed — one address decision, two delivery outcomes (§8). |
| Gifter | Confirm gift-wrapped items (already selected in the cart, `06_CART_SPECIFICATION.md` §15) carry through checkout unchanged, with no re-selection required. |

Every customer type additionally needs: to never be forced to create an account (`BUSINESS_RULES.md`), to understand exactly what happens after payment (`EXPERIENCE_PRINCIPLES.md` #1, Confidence Before Complexity), and to reach a clear, unambiguous confirmation that the order was placed successfully (§18).

## 4. Entry Points

- **The single entry point is the cart's "Proceed to Checkout" action** (`06_CART_SPECIFICATION.md` §5), available once the cart contains at least one active line item and no unresolved blocking condition (per that document's Customer Decision States classification).
- **Checkout is not reachable with an empty cart or with a blocking condition unresolved** — attempting to do so (e.g., via a stale bookmark or back-navigation) returns the customer to the cart with the specific condition still visible (§20), never a broken or partially-rendered checkout.
- **There is exactly one checkout entry point regardless of cart composition** — a single-catalog cart and a mixed cart (§8) both proceed through the same entry action; mixed composition changes what checkout asks for, not how checkout is entered.

## 5. Checkout Information Architecture

Checkout is a linear sequence of logical steps, per `01_NAVIGATION_SPECIFICATION.md` §17's navigation rule (backward-navigable, not skippable ahead):

1. **Order Summary** — a carried-forward view of the cart's contents and per-group subtotals (`06_CART_SPECIFICATION.md` §5), not a re-entry of information already confirmed.
2. **Contact & Delivery Address** — one address, one contact detail set, per order (§8 explains why one address, not one per fulfillment group, is v1's model).
3. **Delivery Method & Slot Selection** — branches per fulfillment group present in the order (§9, §10).
4. **Payment** — a single payment for the entire order (§14), regardless of how many fulfillment groups it contains.
5. **Review & Confirm** — a final, complete view of everything above, including the delivery fee and tax now known (§13), before submission (§17).
6. **Order Confirmation** — the terminal state (§18).

This is a description of logical steps and their sequence, not a prescription of how many screens or pages implement them — that is an implementation decision this document does not make, consistent with the no-UI-mockups constraint governing this tier of documentation.

## 6. Guest Checkout Behaviour

- **Guest checkout is available at every step, with no account required at any point** — per `BUSINESS_RULES.md`'s non-negotiable rule and `USER_FLOWS.md` Flow 6. No step in §5 requires authentication to proceed.
- **Account creation, if offered at all, is offered only after order confirmation (§18), never before or during checkout** — consistent with `USER_FLOWS.md` Flow 6 step 4, and validated by current research finding that moving account setup to the post-purchase confirmation page (where most fields can already be pre-filled from the completed order) converts better than asking for it beforehand, since the purchase itself is not made contingent on it (Baymard Institute, cited below).
- **A logged-in customer's checkout differs only by pre-filling** already-known information (saved address, prior contact details) — the step sequence itself (§5) is identical for guest and logged-in customers.
- **Guest checkout's prominence is a checkout-flow requirement, not just a policy statement** — current research finds a majority of shoppers abandon when guest checkout isn't clearly and immediately visible as an option, and that many sites undermine an existing guest-checkout policy simply by not surfacing it prominently at the point a customer must choose (Baymard Institute, cited below). This document requires guest checkout to be the presented default, not an option a customer must discover.

## 7. Address Capture Behaviour

- **Address capture uses freeform, landmark-friendly fields, not a rigid street-address/postal-code structure** — directly implementing the Nigerian-context finding already noted in `USER_FLOWS.md` Flow 6 and `DELIVERY_MODEL.md`'s addressing-ambiguity risk: postal addressing is inconsistent in this market, and landmark-based directions ("behind the blue gate, opposite the filling station") are how customers actually communicate location. A rigid form that rejects this input is a checkout-completion barrier, not a data-quality safeguard.
- **The minimum field set genuinely needed is requested — nothing more.** Current research is explicit that checkout form length directly predicts abandonment, and recommends collecting only what a step genuinely requires (Baymard Institute, cited below) — consistent with `DESIGN_SYSTEM.md` §B9's existing principle that required fields are minimized to what checkout genuinely needs.
- **Every field label is meaningful read in isolation** (e.g., "Delivery Contact Phone," not "Phone") — the same field-labeling discipline current research finds most sites still get wrong, applied here deliberately (Baymard Institute, cited below).
- **Field-level validation follows `DESIGN_SYSTEM.md` §B9 exactly**: labels always visible (never placeholder-only), validation on blur rather than every keystroke, and a plain-language error identifying exactly what's wrong and how to fix it — no checkout-specific exception to this platform-wide rule.
- **A logged-in customer may select a saved address** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, not yet drafted) as a shortcut, but manual entry remains fully available and identically capable — saved addresses are a convenience layer over this section's behavior, not a replacement for it.
- **This is the one point in the customer's journey where a real delivery address first exists** — everything §9–§13 depend on this section's output.

## 8. Mixed-Order Checkout Behaviour (Wine & Spirits + Food Central)

Directly answering the risk `06_CART_SPECIFICATION.md` §28 named explicitly: *"Mixed-cart delivery clarity depends on checkout reinforcing, not undermining, the same distinction... or the cart's own careful separation is undone at the very next step."*

- **One address applies to the whole order in v1** — no prior document (`PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`) establishes a multi-address, split-destination checkout, and this document does not invent one. This is the simpler default consistent with `PRODUCT_BLUEPRINT.md` §9's one-cart, one-checkout decision — a mixed order still resolves to one delivery conversation with the customer, even though it produces two fulfillment outcomes.
- **The two fulfillment-leg groups established in the cart (`06_CART_SPECIFICATION.md` §5, §6) persist visually and functionally through every checkout step** — Order Summary, delivery/slot selection, and Review & Confirm all present the Wine & Spirits and Food Central portions as distinct groups with their own subtotals and their own delivery outcomes, never merged into one line or one promise, extending the exact discipline the cart already established rather than restating it from scratch.
- **The address entered in §7 is checked against Food Central's Lagos-only scope (§11) as soon as it exists** — this is the authoritative eligibility check `06_CART_SPECIFICATION.md` §10 explicitly deferred to checkout, because only checkout has a real address to check it against.
- **If the entered address is outside Lagos and the order contains Food Central items, this is a blocking condition** (per `06_CART_SPECIFICATION.md`'s Customer Decision States vocabulary, extended here to checkout) — the customer must resolve it before proceeding to payment: switch the Food Central portion to pickup (if genuinely available), remove the Food Central items and continue with Wine & Spirits alone, or change the delivery address. **Food Central items are never silently dropped or silently re-routed** — the customer decides, with the specific conflict named plainly.
- **Delivery Method & Slot Selection (§9, §10) is presented per fulfillment group, not once for the whole order** — Wine & Spirits' nationwide delivery method and Food Central's same-day/scheduled/pickup choice are independent decisions, since they are genuinely independent fulfillment questions.
- **The final Review & Confirm step (§17) states each group's confirmed delivery outcome separately**, exactly as the cart stated them as estimates (`06_CART_SPECIFICATION.md` §17) — never collapsed into one combined delivery statement at the moment of final confirmation, which is precisely the moment such a collapse would be most damaging to trust.

## 9. Delivery Method Selection

- **Wine & Spirits**: a standard delivery method appropriate to nationwide dispatch (`DELIVERY_MODEL.md`) is selected or confirmed here. The exact mechanism — in-house fleet, third-party courier, or both — **remains an open business decision** (`PROJECT_STATUS.md`); this document specifies that a method is selected at this step, not which method(s) exist to select from.
- **Food Central**: delivery or pickup is chosen here, with equal visual and procedural weight given to both — directly implementing `DELIVERY_MODEL.md`'s explicit finding that pickup is frequently under-designed relative to delivery despite being operationally simpler and often faster, and equally implementing `PRODUCT_BLUEPRINT.md` §10's stated requirement that pickup carry equal weight.
- **Selecting delivery for Food Central leads directly into slot selection (§10)**; selecting pickup leads to a ready-time estimate instead, with no slot picker needed.
- **This step's selection determines the delivery fee**, which becomes confirmed information for the first time at this point in the customer's journey (§13).

## 10. Delivery Slot Selection Behaviour

Applies to Food Central only — Wine & Spirits' nationwide delivery uses standard delivery windows, not a bookable slot (`DELIVERY_MODEL.md`).

- **Same-day delivery** is presented with an explicit, dynamic ordering cutoff (e.g., a stated cutoff time, ideally shown as a live countdown) — directly implementing `DELIVERY_MODEL.md`'s finding that vague "same-day where available" promises measurably underperform explicit cutoffs. Mechanically, same-day is simply a delivery slot dated today with a cutoff time, not a separate system from scheduled delivery.
- **Scheduled delivery** is presented as a calendar-style date selection plus time-of-day options — directly implementing `DELIVERY_MODEL.md`'s explicit rejection of long dropdown lists or scroll-wheel pickers for this interaction, which it names as a documented worse pattern.
- **Slot capacity is enforced at the moment of selection and again at final submission (§17)** — a slot that fills between selection and payment must be caught before payment is charged, not after, requiring the delivery-slot module's capacity check to run as part of the same transaction as order placement (`MEDUSA_EXTENSIONS.md` #3).
- **Slot length, cutoff times, and capacity per slot are operational parameters, not specified here** — flagged as an open item throughout `/docs` (`PROJECT_STATUS.md`) and not invented in this document.
- **Pickup's ready-time estimate (§9) is shown with the same clarity and prominence as a delivery slot** — never presented as an afterthought relative to delivery.

## 11. Address-Based Delivery Eligibility Enforcement

- **This is the authoritative version of the eligibility check the cart could only state informally** (`06_CART_SPECIFICATION.md` §10, §6) — Wine & Spirits is eligible nationwide with no exclusions currently established anywhere in `/docs`; Food Central is eligible only within Lagos, checked against the real address captured in §7.
- **The exact Lagos delivery-area definition — postal-pattern-based zones versus true radius/geofencing precision — is an open business decision** (`DELIVERY_MODEL.md`, `PROJECT_STATUS.md`) and is not resolved by this document; this section specifies that a check happens and what happens when it fails (§8's blocking condition), not the precise geographic logic behind it.
- **A Wine & Spirits-only order is never subject to this check** — the check applies exclusively to the presence of Food Central items in the order, consistent with Wine & Spirits' unrestricted nationwide eligibility.

## 12. Availability Re-validation at Checkout

- **Every line item is re-validated against current availability one final time before payment is charged** — extending `06_CART_SPECIFICATION.md` §12's cart-view re-validation to the moment that matters most, since additional time has passed between the cart being reviewed and checkout being completed.
- **A change discovered at this point follows the identical labeling and customer-decides discipline already established in the cart** (`06_CART_SPECIFICATION.md` §12, §13, §19) — never a silent removal, never charging for a quantity that is no longer available.
- **If a change here would alter the final total or delivery outcome, the customer sees the updated Review & Confirm state (§17) before payment proceeds** — a customer is never charged based on information that was already known to be stale at the moment of charging.

## 13. Pricing and Fee Calculation

- **This document completes `06_CART_SPECIFICATION.md`'s Pricing Transparency table.** Delivery fee and tax — both listed there as "unknown / estimated" — become **confirmed** exactly here, once a real address (§7) and, for Food Central, a chosen delivery method or slot (§9, §10) exist to calculate them against.
- **The confirmed item total carried forward from the cart is never recalculated or reinterpreted at checkout** — only delivery fee and tax are newly resolved; nothing about the item-level pricing the customer already reviewed in the cart changes silently at this stage.
- **The final total shown at Review & Confirm (§17) is the first and only point in the customer's journey where a single, complete, final figure is presented** — consistent with `06_CART_SPECIFICATION.md`'s explicit statement that the cart itself never shows a number that looks final but isn't.
- **Delivery fee and tax calculation logic itself (rates, zones, tax rules) is an implementation and operational detail**, not specified in behavioral terms beyond: it is calculated once a real address and delivery selection exist, and it is shown before payment is requested, never after.

## 14. Payment Behaviour

- **One payment for the entire order, regardless of how many fulfillment groups it contains** — a direct consequence of `PRODUCT_BLUEPRINT.md` §9's no-order-splitting decision, restated here because payment is the step where a temptation to split by fulfillment leg would otherwise be strongest.
- **The payment method(s) available are not yet determined** — `MEDUSA_EXTENSIONS.md` #4 flags the local payment provider (e.g. Paystack- or Flutterwave-class) as an open, launch-blocking decision. This document specifies checkout's behavioral requirement — a clear, trustworthy payment step supporting methods Nigerian buyers actually rely on (bank transfer and/or USSD alongside card, per `MEDUSA_EXTENSIONS.md` #4's own reasoning that a card-only checkout is a real trust barrier in this market) — without assuming which provider or exact method set is ultimately integrated.
- **Cash-on-delivery is not assumed to exist.** Whether it is offered at all — and if so, how it is reconciled operationally for alcohol specifically — is an explicit open business decision (`BUSINESS_RULES.md`, `DELIVERY_MODEL.md`). If adopted, it would appear here as one payment method among others, selected at this same step; this document does not invent its mechanics ahead of that decision.
- **A failed payment returns the customer to this step with a clear, specific reason and a retry path**, never silently discarding the rest of the completed checkout information (§22).
- **Payment trust signals are shown at this step specifically** (§19) — this is the point at which a customer is asked to share the most sensitive information in the entire journey.

## 15. Age-Verification Backstop

- **The age-confirmation gate already completed at first browse (`PRODUCT_BLUEPRINT.md` §11, `02_HOMEPAGE_SPECIFICATION.md` §8.2) is not re-litigated at checkout by default** — a customer who already confirmed their age earlier in the session is not asked to do so again as a matter of course.
- **A lightweight, non-blocking reminder appears when an order contains age-restricted (Wine & Spirits) items**, reusing the identical reminder-not-a-second-gate treatment already established in `05_PRODUCT_DETAILS_SPECIFICATION.md` §19 and `06_CART_SPECIFICATION.md` §19 — restating, not re-confirming, that the order is age-verified.
- **Whether a hard compliance re-check happens at order confirmation, in addition to the entry pop-up, is an explicit open business and legal decision** (`PRODUCT_BLUEPRINT.md` §9, §11; `PROJECT_STATUS.md`) — this document does not assume an answer either way. If adopted, the natural place for it is an explicit confirmation step within Review & Confirm (§17), since that is the last point before an order is placed — but this document does not build that step now, only names where it would belong if the decision is made.
- **This section is deliberately conservative**: it specifies what already exists (the reminder) and where an additional requirement would attach if approved, rather than assuming the stricter path is already policy.

## 16. Order Review Step

- **A complete, final view of the entire order before submission** — every line item (grouped by fulfillment leg, per §8), the confirmed delivery method and slot/pickup choice per group, the delivery address, the payment method selected, and the now-fully-confirmed total (§13) — presented together, in one place, before the customer commits.
- **Nothing in this step is new information the customer hasn't already seen or decided** — its purpose is confirmation and a last chance to catch a mistake, not a new decision point. Current research finds that displaying the complete order and confirming successful payment gives customers confidence their order will be fulfilled correctly, and that this reassurance function matters as much post-decision as it does pre-decision (Baymard Institute, cited below, discussing the equivalent confirmation-page function — the same principle applies one step earlier, before submission).
- **Any change made from this step (e.g., editing the address) returns the customer to the relevant earlier step and back to an updated Review & Confirm afterward** — never a silent in-place edit that skips re-confirmation of what changed.
- **Submission from this step is the single action that places the order** — there is no additional hidden step between "confirm" and an order existing.

## 17. Order Confirmation

- **The terminal state of checkout** — reached only after successful payment (§14) and successful order placement, including final slot-capacity confirmation where relevant (§10).
- **Displays the complete, final order** — the same information reviewed in §16, now stated as fact rather than as a pending review, per current research finding this reassurance (correct items, correct delivery expectations, confirmed payment) is a core function of this page (Baymard Institute, cited below).
- **States each fulfillment group's confirmed delivery or pickup outcome distinctly** — the final expression of the same never-merge-the-two-legs discipline running through this entire document (§8).
- **Account creation may be offered here, optionally, for a guest customer** — never mandatory, and never gating the fact that the order has already been placed (§6). Current research validates this placement specifically: most of the needed information already exists from the completed order, making post-purchase account creation lower-friction than asking for it beforehand (Baymard Institute, cited below).
- **A confirmation notification is sent** (order number, summary, expected delivery/pickup information) via the notification mechanism this platform ultimately adopts — `MEDUSA_EXTENSIONS.md` #5 (WhatsApp and/or SMS) remains an open channel decision; this document specifies that a confirmation is sent, not which channel carries it.
- **Support/contact information is present on this page** — a direct implementation of `PRODUCT_BLUEPRINT.md` §11's trust strategy, giving a customer with any post-order concern an immediate, visible path to help rather than having to search for it.

## 18. Trust Signals

Every trust mechanism checkout must honor, extending `06_CART_SPECIFICATION.md` §19's cart-level list to the steps and stakes specific to checkout:

- **Payment security**: the payment step (§14) visibly communicates that payment is processed securely, consistent with `BRAND_IDENTITY.md`'s trust principles — the specific mechanism (badges, provider-supplied trust indicators) depends on the payment provider ultimately chosen (`MEDUSA_EXTENSIONS.md` #4).
- **Sold-and-delivered-direct claim**: restated at checkout, not only on the homepage, reinforcing `PRODUCT_BLUEPRINT.md` §11's genuine differentiator — there is no third-party seller anywhere in this transaction.
- **Final pricing transparency**: the fully confirmed total (§13, §16) is shown before payment is requested, never after — the single most important trust moment in the entire checkout flow, since this is precisely where hidden costs discovered late are most damaging to trust and most cited as a cause of abandonment (Baymard Institute, already cited by `06_CART_SPECIFICATION.md`).
- **Delivery/pickup expectation clarity**: each fulfillment group's confirmed outcome (§8, §16, §17) is stated plainly, never merged or vague.
- **No fabricated urgency or scarcity at any checkout step** — restated from `06_CART_SPECIFICATION.md` §9 and §19, and if anything more critical here than in the cart: checkout is the point of maximum commitment pressure, and `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions) explicitly rules out manipulative urgency devices regardless of how close a customer is to completing a purchase.
- **Age-restriction and Lagos-only scope are never discovered for the first time at checkout** (§8, §15) — both were already communicated earlier in the journey (homepage, cart); checkout restates rather than introduces them, preserving the "no surprise" philosophy (§1).

## 19. Empty/Invalid Checkout States

- **An attempt to reach checkout with an empty cart** returns the customer to the cart's own empty state (`06_CART_SPECIFICATION.md` §20) rather than rendering any part of the checkout flow — checkout has nothing to act on and does not pretend otherwise.
- **An attempt to reach checkout with an unresolved blocking condition** (a zero-purchasable line item, per `06_CART_SPECIFICATION.md`'s Customer Decision States) returns the customer to the cart with that specific condition still visible, not a checkout screen that silently omits the problem.
- **An address/eligibility conflict discovered mid-checkout (§8, §11)** is itself treated as a blocking condition local to checkout — the customer is shown the conflict and the available resolutions (switch to pickup, remove the item, change the address), never allowed to proceed past it silently.
- **No checkout state is ever a dead end** — every invalid or empty state names what happened and offers a specific, actionable path forward, the same standard established platform-wide.

## 20. Loading States

- **Skeleton placeholders are preferred over spinners** for the Order Summary and Review & Confirm steps, consistent with the platform-wide "skeletons communicate structure and are perceived as faster" discipline already established in every prior specification.
- **Address validation, slot-capacity checks (§10), and payment processing (§14) each show a localized, specific loading state** — a customer submitting payment sees that payment specifically is processing, not a generic full-page spinner offering no indication of what's happening or how long it might take.
- **Once payment processing has begun, the submit action is disabled to prevent a duplicate charge from a repeated click** — a baseline behavioral requirement for any payment step, not specific to this platform but non-negotiable here given the direct financial consequence of getting it wrong.

## 21. Error States

- **Every step fails independently and specifically** — a failed address validation does not discard payment information not yet entered; a failed payment does not discard the address and delivery selections already made (§14).
- **A failed payment states, in plain language, what went wrong (where the payment provider supplies that information) and offers an immediate retry** — never a generic "something went wrong" with no path forward.
- **A slot that fills between selection (§10) and final submission (§17) is caught before payment is charged**, with the customer returned to slot selection with a clear explanation, never charged for a slot that was never actually secured.
- **A backend or network failure during order placement, after payment has been authorized, is the single highest-stakes error state in this document** — the customer must never be left uncertain whether they were charged; this requires the order-placement and payment-confirmation logic to be transactionally reliable (§26), with a clear, honest status shown even in a genuine failure case, rather than an ambiguous blank result.
- **No blank white space or broken layout is an acceptable failure mode for any checkout step** — the same standard already set platform-wide.

## 22. Accessibility

- **Every form field in Address Capture (§7) and Payment (§14) follows `DESIGN_SYSTEM.md` §B9 and §B11 exactly** — visible labels, blur-triggered validation, plain-language errors identifying the specific field, no checkout-specific exception.
- **Step transitions (§5) are announced to assistive technology** — moving from one checkout step to the next is communicated as a real navigation event, not a silent DOM change a screen-reader user could miss entirely.
- **Every touch target** (date/slot selection controls, delivery-method choices, the final submit action) **meets the 44×44px minimum** (`DESIGN_SYSTEM.md` §B11), with particular attention to the calendar-style slot picker (§10), which current research explicitly flags as a common source of small, hard-to-target controls on mobile checkout flows (Baymard Institute, cited below).
- **Keyboard navigation**: every step is fully operable by keyboard alone, including the calendar-style date/slot picker (§10) and the final Review & Confirm submission — no keyboard trap anywhere in the flow.
- **Focus management**: moving between steps (§5) moves focus to the new step's primary heading or first field, never leaving focus on a control that no longer exists on screen.
- **No error, warning, or trust notice (§18, §21) is conveyed by color alone** — the same platform-wide rule, applied with particular emphasis to payment errors and the address/eligibility blocking condition (§19), where a customer must not be left guessing what specifically is wrong.
- **The blocking-condition resolution options (§8, §19)** are each a distinct, individually labeled, keyboard-operable action — never a single ambiguous "fix it" control.

## 23. Responsive Behaviour

- **Checkout is designed mobile-first, per `EXPERIENCE_PRINCIPLES.md` #8** — every step in §5 is fully functional and equally complete on mobile, never a reduced version of a desktop-first flow.
- **Form field count and complexity are held to the same minimum on mobile as desktop** (§7) — current research specifically flags mobile checkout as the environment where excess form fields and unclear labels cost the most, since typing is inherently more effortful (Baymard Institute, cited below).
- **The primary forward action (continue/submit) remains reachable without excessive scrolling at each step**, and is never obscured by an on-screen keyboard while a field is focused — a documented mobile checkout usability concern this document requires be actively avoided, not merely permitted to occur (Baymard Institute, cited below).
- **The calendar-style slot picker (§10) is designed for touch first** — adequate spacing between selectable dates/times, no reliance on hover states that don't exist on a touch device.

## 24. Analytics Events

- `checkout_started` (value: cart total, fulfillment groups present)
- `checkout_step_completed` (value: step name, per §5)
- `guest_checkout_selected` / `account_login_used_at_checkout`
- `address_submitted`
- `delivery_eligibility_conflict_shown` (value: fulfillment group) — §8, §11
- `delivery_method_selected` (value: fulfillment group, method)
- `delivery_slot_selected` / `pickup_selected` (value: fulfillment group)
- `payment_method_selected`
- `payment_failed` (value: reason, where available)
- `order_placed` (value: order total, fulfillment groups, delivery methods)
- `post_purchase_account_creation_offered` / `post_purchase_account_created` (§6, §17)

Each ties back to §2's business objectives — abandonment can be diagnosed precisely by comparing `checkout_started` against `order_placed` and identifying which `checkout_step_completed` value appears last before drop-off; `delivery_eligibility_conflict_shown` is the direct measure of how often §8's mixed-order conflict actually occurs in practice.

## 25. SEO Considerations

- **No checkout page is indexed.** Like the cart (`06_CART_SPECIFICATION.md` §25), every checkout step is customer-specific, session-bound, and served `noindex` — the same treatment already established for the cart and for search results pages, for the identical underlying reason: this content has no stable, shareable meaning to a search engine.
- **This is a brief, deliberate scope note**, not a gap — checkout carries none of the platform's organic-acquisition responsibility, which belongs entirely to category, collection, and product pages already specified elsewhere.

## 26. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Order placement from cart | Native Cart → Order conversion | Platform-wide, `PRODUCT_BLUEPRINT.md` §9 | Native |
| Mixed-order, multi-fulfillment-leg order placement | Native Order support for multiple line items with different shipping methods within one order | `PRODUCT_BLUEPRINT.md` §9 | Native |
| Address capture (freeform/landmark support, §7) | Native Address entity, used flexibly rather than requiring rigid structured fields | `DELIVERY_MODEL.md` | Native, with a Nigerian-context-appropriate field configuration |
| Lagos-only eligibility enforcement (§11) | Native Service Zone/Geo Zone restriction, checked against the captured address | `DELIVERY_MODEL.md` | Native |
| Delivery slot selection and capacity enforcement (§10) | Delivery-slot module, enforced via a workflow hook at both selection and final submission | `MEDUSA_EXTENSIONS.md` #3 | **Not yet built** |
| Delivery fee / tax calculation (§13) | Native Fulfillment/tax calculation, resolved once address and delivery selection exist | Platform-wide | Native, pending exact rate/zone configuration |
| Payment processing (§14) | Custom Payment Provider module wrapping a local Nigerian payment service | `MEDUSA_EXTENSIONS.md` #4 | **Not yet built — provider undecided, launch-blocking** |
| Cash-on-delivery (§14) | Not modeled — depends on the open business decision | `BUSINESS_RULES.md`, `DELIVERY_MODEL.md` | **Open — not yet decided whether it exists at all** |
| Order confirmation notification (§17) | Custom Notification Provider (WhatsApp and/or SMS), wired to Medusa's native event system | `MEDUSA_EXTENSIONS.md` #5 | **Not yet built — channel undecided** |
| Hard age/compliance re-check at confirmation (§15) | Not modeled — depends on the open business/legal decision | `PRODUCT_BLUEPRINT.md` §9, §11 | **Open — not yet decided whether it exists at all** |
| Post-purchase account creation (§6, §17) | Native Customer creation, pre-filled from completed guest order | Platform-wide | Native |
| Analytics events (§24) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 27. Performance Expectations

- **Checkout is held to the platform's strictest performance bar**, since it is the step immediately preceding revenue and the step where delay most directly costs completed orders — consistent with `PRODUCT_BLUEPRINT.md` §16 treating performance as a conversion metric, not just an engineering one.
- **Each step transition (§5) should feel immediate** — reusing `DESIGN_SYSTEM.md` §B10's existing motion tokens for state transitions (200–250ms) rather than inventing new timing, the same discipline `01_NAVIGATION_SPECIFICATION.md` §27 already applied to navigation interactions.
- **Payment processing (§14) states are shown without delay once a customer submits** — even where the underlying payment provider's own response time cannot be controlled by this platform, the loading state (§20) must appear immediately so the customer never wonders whether their submission registered.
- **Slot-capacity checks (§10) resolve quickly enough to feel like part of the same interaction as selecting the slot** — a capacity check that reads as a separate, slow step would undermine the calendar-grid interaction `DELIVERY_MODEL.md` specifically recommends.

## 28. Future Expansion

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, the same way every prior specification's own future-expansion section documents capability without committing to a roadmap item:

- **Multiple payment methods beyond the first provider integrated** — the Payment Provider pattern (`MEDUSA_EXTENSIONS.md` #4) is designed to support additional providers or methods later without checkout's own step structure (§5) changing.
- **Saved payment methods** for logged-in customers — a plausible convenience layer over Payment Behaviour (§14), not committed to v1.
- **Split or partial payments** (e.g., partial deposit for a scheduled future order) — a genuinely new capability, not a variation of anything specified here.
- **A hard age/compliance re-check step** (§15), if the open business/legal decision resolves in favor of one — this document already names where it would attach (Review & Confirm, §16) without building it.
- **Real-time delivery-fee estimation earlier in the journey** (e.g., a postcode-based estimate on the product page or cart, per `02_HOMEPAGE_SPECIFICATION.md` §14 and `06_CART_SPECIFICATION.md` §8's own similarly-deferred future notes) — would reduce, but likely not eliminate, the need for this document's own fee-confirmation step.
- **Multi-address checkout** (§8) — a genuinely different model than v1's one-address assumption, worth revisiting only if a real customer need for it emerges; not committed or scoped here.

None of the above is authorized or scoped work — `PRODUCT_BLUEPRINT.md` and `MEDUSA_EXTENSIONS.md` name none of it as committed. This section exists solely to confirm the architecture chosen for v1 does not foreclose any of it.

## 29. Risks & Assumptions

**Risks:**

- **Five business decisions this document depends on remain open** (`PROJECT_STATUS.md`, first surfaced at the checkout level by `06_CART_SPECIFICATION.md` §6/§28): the Wine & Spirits nationwide delivery mechanism, the exact Lagos delivery-area definition, delivery-slot operational parameters, whether cash-on-delivery is supported, and whether a hard age/compliance re-check is added at confirmation. None block this document's own behavioral scope, but each will directly shape implementation once resolved.
- **The local payment provider is entirely undecided** (`MEDUSA_EXTENSIONS.md` #4) — this is the single most launch-critical gap this document depends on; Payment Behaviour (§14) is specified at the level of required customer experience, not a specific integration, until that decision is made.
- **The notification channel for order confirmation is undecided** (`MEDUSA_EXTENSIONS.md` #5) — §17's confirmation-notification requirement is specified independent of channel, but the actual customer experience of receiving (or not receiving) a timely confirmation depends entirely on this decision.
- **The address/eligibility blocking condition (§8, §11) is a new, specific interaction this document introduces** — it did not exist as a named concept before this specification, since the cart could only state the rule informally without a real address to check. It should be treated as a priority implementation detail, not a minor edge case, given how directly it protects the mixed-order trust discipline this entire document is built around.
- **The delivery-slot module and its capacity-enforcement workflow hook are not yet built** (`MEDUSA_EXTENSIONS.md` #3) — §10's behavioral requirements assume this module exists; its absence is a backend dependency, not a specification gap.

**Assumptions:**

- Native Medusa Cart-to-Order conversion, multi-fulfillment-leg Order support, and native Address/Fulfillment/tax calculation are sufficient for this document's behavioral requirements (§26) — consistent with `PRODUCT_BLUEPRINT.md` §9/§10's own findings, not re-litigated here.
- Guest checkout remains fully supported throughout every checkout step, per `BUSINESS_RULES.md`.
- One delivery address per order (§8) is the correct v1 model — reasonable given no prior document establishes otherwise, but worth re-confirming once real order patterns exist (§28).
- `06_CART_SPECIFICATION.md`'s two-fulfillment-group model and Pricing Transparency table are the correct foundation this document builds on and completes, not something this document should be read as re-deciding.

## 30. Acceptance Criteria

- [ ] Checkout is unreachable with an empty cart or an unresolved blocking condition — both return the customer to the cart with the specific condition visible.
- [ ] Guest checkout is available and presented as the default at every checkout step, with no account required to complete an order.
- [ ] Address capture accepts freeform, landmark-style input and does not force a rigid street-address/postal-code structure.
- [ ] If the entered delivery address is outside Lagos and the order contains Food Central items, the customer sees an explicit conflict with named resolution options (switch to pickup, remove the item, or change the address) — the item is never silently dropped or re-routed.
- [ ] A mixed order's two fulfillment groups remain visually and functionally distinct through every checkout step, including the final Review & Confirm and Order Confirmation states.
- [ ] The final order total shown at Review & Confirm includes a confirmed delivery fee and tax — never a number presented as final while still incomplete.
- [ ] A delivery slot that becomes fully booked between selection and final submission is caught before payment is charged, with a clear explanation shown to the customer.
- [ ] A failed payment returns the customer to the payment step with a specific reason (where available) and a retry path, without discarding previously completed checkout information.
- [ ] The submit/payment action is disabled immediately after submission to prevent a duplicate charge from a repeated click.
- [ ] No checkout page is indexed by search engines.
- [ ] Every checkout step is fully keyboard-operable, with correct focus management on step transitions.
- [ ] No checkout notice or error is conveyed by color alone.
- [ ] Account creation, if offered, is offered only after order confirmation, never as a precondition to completing the order.
- [ ] All analytics events listed in §24 fire correctly and exactly once per corresponding user action.
- [ ] No business decision named as open in §14, §15, §29 (payment provider, cash-on-delivery, hard age-recheck, delivery mechanism, Lagos-area definition, slot parameters) is silently assumed or resolved by this document or its implementation.

---

**Document status:** In Progress (v0.1). This is the first full draft — ready for review, not yet approved. Upon approval, this specification becomes the reference for checkout implementation, alongside `06_CART_SPECIFICATION.md` (which it extends) and `01_NAVIGATION_SPECIFICATION.md` §17 (whose rules it operates within).

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary interactions were referenced or copied):

- [Ecommerce Checkout UX Guide — Optimize Your Order Flow — Baymard Institute](https://baymard.com/learn/checkout-flow-ux-optimization)
- [Make "Guest Checkout" Prominent — Baymard Institute](https://baymard.com/blog/make-guest-checkout-prominent)
- [Checkout Optimization: Minimize Form Fields — Baymard Institute](https://baymard.com/blog/checkout-flow-average-form-fields)
- [6 Mobile Checkout Usability Considerations — Baymard Institute](https://baymard.com/blog/mobile-checkout)
- [6 Order Confirmation Page Best Practices — Baymard Institute](https://baymard.com/blog/order-confirmation-page)
