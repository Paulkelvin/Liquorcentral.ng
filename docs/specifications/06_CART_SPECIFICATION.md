# Cart Specification

**Status:** In Progress
**Version:** 0.1
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for the LiquorCentral shopping cart — how items are added, reviewed, changed, and carried forward toward checkout, for both single-catalog and mixed-catalog orders. It defines *customer behavior, operational logic, business rules, trust, accessibility, scalability, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §9 (Checkout Strategy) and §10 (Delivery Strategy), `DELIVERY_MODEL.md`, `USER_FLOWS.md` (Flow 5, Flow 6), `BUSINESS_RULES.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0, and none of it contradicts them. It integrates directly with the five already-frozen specifications it sits beside: `01_NAVIGATION_SPECIFICATION.md` §17 already defines the cart icon/preview shell behavior — this document does not redefine it, only what the cart itself contains and does. `05_PRODUCT_DETAILS_SPECIFICATION.md` §18 already defines add-to-cart's originating behavior; this document picks up from the moment an item is in the cart. **Where this document depends on a business decision that has not yet been made (payment provider, exact delivery mechanics, delivery-slot parameters), it says so explicitly rather than inventing an answer** — per the explicit instruction governing this specification.

Where a decision is grounded in external UX, accessibility, or conversion research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Cart Philosophy

**The cart should prepare customers for checkout, not surprise them during checkout.** Every operational constraint this platform has — nationwide vs. Lagos-only delivery, stock limits, delivery timing — should be communicated as early as the cart, not discovered for the first time at the final step. This directly implements `EXPERIENCE_PRINCIPLES.md` #1 (Confidence Before Complexity): a customer should always understand what they're buying, roughly what it costs, roughly when it will arrive, and what happens next, before they ever reach checkout.

Two commitments follow, and nothing below may violate them:

1. **The cart minimizes friction without ever trading away honesty.** Current cart-abandonment research consistently finds that the two largest *fixable* causes of abandonment are unclear cost and unnecessary friction (forced registration, confusing flow) — not that customers were shown too much truth too early. Reducing friction and being transparent about constraints are the same goal here, not competing ones.
2. **Nothing changes silently.** A price update, a quantity reduction because of stock, a newly-unavailable item — every one of these is explained inline, in the cart, before checkout (§19). A customer reaching checkout and discovering something changed without warning is exactly the "surprise" this document exists to prevent.

## 2. Business Objectives

- **Reduce cart abandonment** by removing the fixable friction current research identifies — unclear costs, forced account creation, ambiguous delivery promises — while never resorting to pressure tactics to compensate for it.
- **Make the one-cart, one-checkout decision for mixed orders (`PRODUCT_BLUEPRINT.md` §9) feel coherent to the customer**, not just technically valid — a mixed cart should read as one confident order with two fulfillment legs, not as two orders awkwardly sharing a page (§6).
- **Protect trust at every state change** (§12, §13, §19) — the cart is the last checkpoint before checkout where a customer can review, correct, or walk away with full information.
- **Support both catalogs' operational realities without forcing one model onto the other** — Wine & Spirits' stock-tracked, nationwide model and Food Central's made-to-order, Lagos-only model both need to be represented honestly in the same cart.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to the cart specifically:

| Customer type | Cart objective |
|---|---|
| Confident Buyer | Review the cart fast, confirm nothing is wrong, and reach checkout in as few actions as possible. |
| Guided Browser | Return to browsing from the cart without losing cart contents or progress (§16) — the cart is a checkpoint, not a dead end. |
| Repeat Household | Understand a mixed cart's two delivery legs clearly and confidently (§6), since this customer is the one most likely to actually build one. |
| Gifter | Add or remove gift wrap (§15) directly in the cart without returning to the product detail page. |

Every customer type additionally needs: to trust that the price and availability shown in the cart are accurate (§8, §12, §13), to never lose cart contents unexpectedly (§16), and to reach the cart identically from anywhere on the platform (§4).

## 4. Entry Points

The cart's own shell behavior (the header cart icon, the lightweight preview drawer, the full cart page) is fully specified in `01_NAVIGATION_SPECIFICATION.md` §17 and is not redefined here. This section only confirms how items arrive in it:

- **Add-to-cart from a product detail page** (`05_PRODUCT_DETAILS_SPECIFICATION.md` §18) — the primary entry mechanism, carrying quantity (§7) and any gift-wrap selection (§15).
- **Quick-add from a listing card** (`04_PRODUCT_LISTING_SPECIFICATION.md` §9) — adds at a default quantity of one, per the same "never pre-filled higher" rule already established in `05_PRODUCT_DETAILS_SPECIFICATION.md` §17.
- **The cart icon/preview** (`01_NAVIGATION_SPECIFICATION.md` §17) is reachable from every page, and the full cart page is a real, deep-linkable URL like every other primary surface on the platform.

## 5. Cart Information Architecture

- **Line items are grouped by fulfillment leg — Wine & Spirits and Food Central rendered as two visually distinct groups within one cart**, not interleaved in add-order. This is the structural foundation §6 depends on: a customer must be able to see, at a glance, that two different delivery promises apply to two different parts of the order.
- **Each line item shows**: product image and name (linking back to its product detail page), unit price, quantity control (§7), a remove action, and its current availability status (§12, §13).
- **A per-group subtotal** appears beneath each fulfillment-leg group, in addition to the cart-wide total (§8) — a customer should be able to see what the wine portion and the food portion of a mixed order each cost, not only the combined figure.
- **One cart, one checkout action** — a single "Proceed to Checkout" control for the entire cart, regardless of how many fulfillment-leg groups it contains, per `PRODUCT_BLUEPRINT.md` §9's explicit no-order-splitting decision. The grouping in this section is a presentation and clarity device, not a step toward separate checkouts.

## 6. Mixed Cart Behaviour (Wine & Spirits + Food Central)

This is the specification's most consequential section, directly implementing the risk `PRODUCT_BLUEPRINT.md` §18 names explicitly: *"a cart containing both a nationwide-courier wine and a same-day Lagos dish needs unambiguous, separate delivery-date messaging per item — conflating them risks a confusing promise neither fulfillment leg can keep."* Everything below exists to prevent that conflation.

- **One cart, one checkout, no order-splitting** — restated from §5 as the foundational, already-decided rule (`PRODUCT_BLUEPRINT.md` §9, `DELIVERY_MODEL.md`). A mixed cart is one order with two fulfillment legs attached to different line items, never two separate orders.
- **Delivery messaging is never merged into one promise.** The Wine & Spirits group (§5) shows its own nationwide-courier delivery estimate; the Food Central group shows its own Lagos-only, same-day/scheduled/pickup messaging (§17) — directly implementing `USER_FLOWS.md` Flow 5's explicit requirement that the two are "shown distinctly, not merged into one ambiguous delivery promise."
- **Split-shipment cart presentation is a well-established commerce pattern, not a novel invention** — current ecommerce-platform research describes exactly this structure (multiple delivery groups within one order, each with its own shipping/fulfillment context) as a standard mechanism for orders spanning different fulfillment models, which is precisely LiquorCentral's situation with two structurally different catalogs sharing one checkout.
- **Scheduling and exact slot selection happen at checkout, not in the cart.** The cart states *that* Food Central items will require a delivery choice (same-day, scheduled, or pickup) and shows general timing expectations (§17); the actual slot picker is `07_CHECKOUT_SPECIFICATION.md`'s responsibility, not yet drafted.
- **Delivery-eligibility messaging in the cart is informational, not a final determination**, because the cart does not yet know the customer's delivery address for a guest, and may or may not know it for a logged-in customer (§10). The cart states the rule plainly — Food Central delivers to Lagos only — but the actual feasibility check against a real address happens at checkout. **This is a sequencing fact about when data becomes available, not a business rule invented here.**
- **If a logged-in customer's account already has a known default address outside Lagos**, the cart may proactively surface that mismatch as a warning on the Food Central group — a legitimate, data-available-now enhancement, not a requirement this document mandates be built for v1.
- **Customer expectations are set through structure, not caveats buried in fine print** — the two-group layout (§5) itself is the primary mechanism; supporting text per group states its delivery scope plainly (§17), rather than a single disclaimer at the bottom of the cart.

**Business decisions this document explicitly does not invent, flagged as open per `PROJECT_STATUS.md`:**
- Whether Wine & Spirits' nationwide delivery uses an in-house fleet, a third-party courier, or both.
- The exact Lagos delivery-area definition (postal-pattern zones vs. true radius geofencing).
- Delivery-slot operational parameters (slot length, cutoff times, capacity).
- Whether cash-on-delivery is supported at all.
- Whether a hard age/compliance re-check happens at order confirmation, in addition to the entry pop-up (relevant to §19's age-restricted-product handling).

None of these decisions block this document's own scope — the cart's job is to present the mixed-order structure clearly and honestly regardless of how each of these resolves; none of the resolutions would require restructuring the two-group model itself.

## 7. Quantity Management

- **A numeric stepper per line item**, reusing `05_PRODUCT_DETAILS_SPECIFICATION.md` §17's exact control pattern and touch-target requirements (`DESIGN_SYSTEM.md` §B11) — the cart does not introduce a second quantity-control pattern.
- **Wine & Spirits quantity remains capped by genuine available stock**, re-validated at cart view (§12) since time has passed since add-to-cart — if stock has fallen below the cart's requested quantity, the line item auto-adjusts down to the maximum currently available, with a clearly visible note explaining why (§19), never a silent reduction and never an outright removal when a partial quantity is still genuinely available.
- **Food Central quantity remains uncapped by a stock count** (made-to-order, `PRODUCT_BLUEPRINT.md` §6) — any practical per-order limit is an operational/kitchen-capacity matter for checkout/fulfillment to enforce, not a number this document invents.
- **Reducing a line item's quantity to zero removes it** — the same interaction current cart research identifies as carrying some of the highest engagement in the entire cart experience, so it must behave predictably: an immediate, visible removal, not a confirmation dialog that adds friction to an extremely common action.

## 8. Price Calculations

- **A subtotal per line item, a subtotal per fulfillment-leg group (§5), and one cart-wide total.**
- **The cart states plainly what it can and cannot calculate yet**: item subtotals and the cart-wide item total are fully known and shown; delivery fees and any tax are calculated at checkout, where a real address and (for Food Central) a chosen delivery/pickup option exist to calculate them against — the cart says so explicitly rather than presenting an incomplete total as if it were final. Current research is specific that this exact gap — hidden costs appearing only at the final checkout step — is among the most cited reasons for abandonment; stating the gap honestly in the cart, rather than concealing it, is the direct mitigation.
- **Price shown per line item matches the price shown on the product detail page or listing card it was added from** (`05_PRODUCT_DETAILS_SPECIFICATION.md` §8) — if the underlying price has changed since the item was added, the cart shows the current price with a clear notice (§19), never a silently stale one.

## 9. Promotions

- **Any promotional pricing already applied at the product level** (`04_PRODUCT_LISTING_SPECIFICATION.md` §17, `05_PRODUCT_DETAILS_SPECIFICATION.md` §8) carries through into the cart honestly — the line item shows both the genuine original price and the current promotional price, exactly as it did on the page the item was added from, never a different or newly-invented promotional framing at the cart stage.
- **A cart-wide promo/discount-code system is not established in any prior document** (`PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `MEDUSA_EXTENSIONS.md`) and is not invented here — this document does not assume a coupon-code feature exists. If one is introduced later, it is a new business decision requiring its own specification work, not something this document should be read as having already scoped.
- **No fabricated urgency or scarcity is introduced at the cart stage** — the same non-manipulation rule already established in every prior specification's Merchandising Rules/Governance, restated here because a cart is a plausible place for last-minute pressure tactics to appear, and this platform does not use them.

## 10. Delivery Eligibility

- **Wine & Spirits line items are eligible for nationwide delivery**, no exclusions currently established anywhere in `/docs`.
- **Food Central line items are eligible for delivery to Lagos only**, per `BUSINESS_RULES.md` — stated plainly on the Food Central group in the cart (§6), not held back until checkout.
- **The cart does not perform a final, address-verified eligibility check** — it does not yet have a confirmed delivery address for most customers (§6). The cart's role is to state the rule and surface a warning when a relevant address is already known (a logged-in customer's default address); the authoritative check happens at checkout, where an address is actually collected.

## 11. Pickup Eligibility

- **Confirmed available for Food Central** (`DELIVERY_MODEL.md`), shown in the cart as a fulfillment option indicator on the Food Central group (§5), with the actual selection deferred to checkout (§6) — the cart does not need its own pickup-location picker.
- **Not assumed for Wine & Spirits.** Consistent with `05_PRODUCT_DETAILS_SPECIFICATION.md` §21, no prior document establishes that Wine & Spirits ever offers pickup — this document does not invent it, and the cart shows a Wine & Spirits pickup indicator only if and when that option is actually configured.

## 12. Availability Changes

- **An item in the cart is re-validated against current availability whenever the cart is viewed or checkout begins** — cart persistence (§16) means real time passes between add-to-cart and purchase, during which stock or kitchen availability can genuinely change.
- **A newly-unavailable item is labeled in place, never silently removed** — the same unavailable/hidden/discontinued discipline already established in `04_PRODUCT_LISTING_SPECIFICATION.md`'s Operational Behaviour and `05_PRODUCT_DETAILS_SPECIFICATION.md` §9, applied here to a cart line item specifically. The customer is given a clear action (remove it, or wait and check back) rather than having it vanish from the total without explanation.
- **A price change since the item was added is surfaced the same way** — see §8 and §19 for the specific trust-communication requirement.

## 13. Out-of-Stock Behaviour

Distinct from §12 (which covers *any* availability change): this section is specifically about a customer's requested quantity exceeding what's actually available, for a catalog where that concept applies.

- **Wine & Spirits**: if a line item's requested quantity exceeds current stock (inventory tracking is on, `PRODUCT_BLUEPRINT.md` §6), the quantity auto-adjusts down to the maximum available, with a visible, specific note (e.g. stating that availability changed, not a generic error) — the line item is never removed entirely while any quantity remains genuinely purchasable.
- **Food Central**: "out of stock" in the conventional sense does not apply (no stock count, made-to-order) — the equivalent state is the kitchen currently being unable to fulfill the item, handled identically to §12's general unavailability labeling, not as a separate stock-out concept.
- **If an item's full requested quantity becomes entirely unavailable** (zero purchasable, for either catalog), the line item is labeled unavailable in place per §12 — still not silently removed, since the customer should see and acknowledge what changed rather than discover a missing item only from a shorter total.

## 14. Saved-for-Later Strategy

Not an existing feature established elsewhere in `/docs` — designed here as a v1-appropriate answer to a well-evidenced problem: current cart research finds a majority of online shoppers use the cart itself to save items for later consideration, and that a dedicated save-for-later option (visible, requiring no registration) is a documented, low-complexity lever against abandonment specifically because it lets a customer defer a decision on *one* item without abandoning the whole cart.

- **A lightweight "Save for later" action per line item** moves that item out of the active cart (and its totals, §8) into a separate, persisted list on the same page — not a new destination page, and not requiring an account (guest-compatible, per the same persistence mechanism as the cart itself, §16).
- **Saving an item for later does not affect checkout** — only active cart items proceed to checkout; saved items remain visible and easy to move back into the cart with one action.
- **This is a UX/architecture recommendation answering the section this document was explicitly asked to specify — it is not a claim that this feature is already an approved business requirement elsewhere.** It requires the same lightweight persisted-state mechanism as the cart itself (§26), not a new complex module.

## 15. Gift Wrapping

Reuses `05_PRODUCT_DETAILS_SPECIFICATION.md` §16's decision directly: Gift Wrap is a priced, order-time line-item add-on (`PRODUCT_CATALOG.md`'s existing recommendation), not a product attribute.

- **Editable in the cart, not only at the point of add-to-cart** — a customer can add or remove gift wrap for an eligible line item directly in the cart, without returning to its product detail page.
- **Restricted to Wine & Spirits line items** — gift-wrapping a cooked-to-order Food Central dish is not operationally sensible, and no prior document proposes it; this is a reasonable scope boundary, not an invented business rule about wine specifically being giftable.
- **Shown as its own distinct, priced line within the relevant group** (§5) — never folded invisibly into the product's price, so the customer always sees exactly what they're paying for gift wrap.

## 16. Cart Persistence

- **The cart persists across the session for guest customers** and **across devices for logged-in customers**, via the native Cart/Customer association Medusa already provides (`PRODUCT_BLUEPRINT.md` §4) — guest checkout remains fully supported (`BUSINESS_RULES.md`), and persistence does not require an account.
- **Current research validates persistence as a meaningful abandonment lever** — when a customer returns (same device or, for a logged-in customer, a different one), cart contents are exactly as left, not lost.
- **The exact guest-session persistence duration is an operational/implementation parameter, not fixed by this document** — the same treatment already given to other session-duration questions (e.g. the age-gate's session length, `PRODUCT_BLUEPRINT.md` §11) that remain open elsewhere in `/docs`; this document specifies that persistence exists and behaves predictably, not a specific number of days.
- **A logged-in customer's cart persists indefinitely, tied to their account**, until they explicitly clear it or complete checkout — a more defensible default than an arbitrary expiry, since the account relationship itself is the persistence mechanism.

## 17. Estimated Delivery Messaging

- **Each fulfillment-leg group (§5) shows a general delivery estimate appropriate to its catalog**: standard nationwide delivery windows for Wine & Spirits; an explicit same-day cutoff or scheduled/pickup framing for Food Central — reusing `DELIVERY_MODEL.md`'s own finding that vague delivery promises measurably underperform explicit cutoffs, applied here rather than re-derived.
- **These are general estimates, not final delivery dates** — an exact date depends on the address and (for Food Central) the slot ultimately chosen at checkout (§6); the cart is explicit about this distinction rather than implying a precision it cannot actually deliver on yet.
- **The estimate is never a single, merged promise across a mixed cart** (§6) — each group's estimate is its own, shown against its own group, never averaged or combined into one date.

## 18. Cross-selling

- **A single, restrained cart-level pairing suggestion** may appear when the cart contains only one catalog (e.g. a wine-only cart surfacing a Food Central pairing suggestion), using the same editorial "pairs with" mechanism already established in `02_HOMEPAGE_SPECIFICATION.md` §8.6, `03_SEARCH_SPECIFICATION.md` §17, `04_PRODUCT_LISTING_SPECIFICATION.md` §18, and `05_PRODUCT_DETAILS_SPECIFICATION.md` §14 — not a per-line-item mechanism, and not shown at all once a cart is already mixed (§6), since the cross-catalog connection is already realized.
- **Depends on the same "pairs with" relationship data already flagged as unscoped** in `MEDUSA_EXTENSIONS.md` by every prior specification — this is the sixth Product Specification to depend on that same gap.
- **No cross-sell suggestion is manufactured for a cart it has no genuine relevance to** — the same non-manipulation principle already established platform-wide.

## 19. Trust Signals

Every trust mechanism the cart must honor, stated explicitly — **customers should understand why something changed before they reach checkout**, per the explicit instruction governing this section:

- **Price changes**: if a line item's price differs from what it was when added, the cart shows the current price with a clear, visible notice explaining that it changed — never a silently updated total.
- **Inventory changes**: a quantity auto-adjustment (§13) or a newly-unavailable item (§12) is always accompanied by a specific, plain-language explanation, not a generic error or an unexplained shrinking total.
- **Unavailable products**: labeled in place, never silently dropped (§12) — the customer decides what happens next, the cart does not decide for them.
- **Scheduled delivery**: framed with explicit timing (§17), never a vague promise the cart cannot actually back up yet.
- **Pickup**: presented with equal visual weight to delivery where it applies (§11), reusing `DELIVERY_MODEL.md`'s explicit finding.
- **Delivery limitations**: the Lagos-only scope for Food Central is stated plainly on its group (§6, §10), not discovered for the first time at checkout.
- **Age-restricted products**: a lightweight, non-intrusive reminder on Wine & Spirits line items that the order will be age-verified — the same reminder-not-a-second-gate treatment already established in `05_PRODUCT_DETAILS_SPECIFICATION.md` §19, not a new mechanism, and not a resolution of the still-open hard-recheck-at-confirmation question (§6).
- **No trust signal here is used to create urgency or pressure** — restated from §9, because the cart is the page where a customer is closest to committing, and is therefore the highest-stakes place for this rule to hold without exception.

## 20. Empty Cart Behaviour

- **An empty cart shows a clear, honest message and a path back into browsing** (a link to the homepage or a primary category, `01_NAVIGATION_SPECIFICATION.md` §11) — never a blank page.
- **A small number of restrained suggestions** (e.g. a curated collection link) may appear, reusing the same non-manipulative, capped approach already established for cross-sell content (§18) — never a full product grid competing with the cart's own simplicity.
- **Removing the last item from an active cart transitions cleanly to this state** — not a jarring reload, and any saved-for-later items (§14) remain visible and unaffected.

## 21. Loading States

- **Skeleton placeholders are preferred over a spinner** for the initial cart load, consistent with the platform-wide "skeletons communicate structure and are perceived as faster" discipline already established in every prior specification.
- **A quantity or removal action shows a lightweight, localized loading state on the affected line item only** — the rest of the cart remains interactive while one line item updates, never a full-cart blocking reload for a single-item change.
- **Price/total recalculation (§8) does not block the cart from being viewed or scrolled** while it resolves.

## 22. Error States

- **The cart, the price/total calculation, and any promotional/gift-wrap state fail independently** — a failure recalculating one line item's price must not prevent the rest of the cart from being reviewable, the same independent-failure discipline already established throughout every prior specification.
- **A failed quantity update or removal offers a clear retry action** without discarding the rest of the cart's state.
- **No blank white space or broken layout is an acceptable failure mode for any part of the cart** — the same standard already set platform-wide.

## 23. Accessibility

- **The quantity stepper (§7) uses the same accessible number-input pattern already established** in `05_PRODUCT_DETAILS_SPECIFICATION.md` §25 — proper semantics, a visible associated label, no bare unlabeled buttons.
- **Every remove action is labeled specifically** (e.g. "Remove [product name]"), never a bare icon with no accessible name.
- **Cart total and subtotal updates are announced to assistive technology via a polite live region** (`role="status"`, `aria-live="polite"`) — current accessibility research on shopping carts specifically names cart-total updates as a canonical live-region use case, and separately warns that inline change notices (§19) are commonly missed by screen readers when implemented as a visual-only banner; this document requires the live-region announcement specifically to close that documented gap, not merely as a generic accessibility nicety.
- **The cart preview drawer** (`01_NAVIGATION_SPECIFICATION.md` §17) follows the same disclosure-pattern focus management (trap while open, return focus to trigger on close) already established for every other disclosure panel on the platform.
- **No availability, price-change, or trust notice (§19) is conveyed by color alone** — text-labeled in every case, the same platform-wide rule applied here.
- **All contrast, focus-state, and touch-target requirements follow `DESIGN_SYSTEM.md` §B11 exactly**, with no cart-specific exception.

## 24. Analytics

- `cart_viewed`
- `item_quantity_changed` (value: product id, new quantity, fulfillment group)
- `item_removed` (value: product id, fulfillment group)
- `item_saved_for_later` / `item_restored_from_saved` (§14)
- `gift_wrap_added` / `gift_wrap_removed` (§15)
- `price_change_notice_shown` (value: product id) — the direct measure of §19's trust commitment actually firing
- `availability_change_notice_shown` (value: product id, change type)
- `delivery_eligibility_notice_shown` (value: fulfillment group) — §6, §10
- `cross_sell_suggestion_clicked` (reused from prior specifications' identical event, not a duplicate)
- `proceed_to_checkout_clicked` (value: cart total, fulfillment groups present)

Each ties back to §2's business objectives — abandonment-relevant friction can be diagnosed directly from `cart_viewed` vs. `proceed_to_checkout_clicked`, and the notice-shown events are the direct evidence that §19's trust commitments are actually being honored in practice, not just specified on paper.

## 25. SEO Considerations

- **The cart is not an indexable page.** Unlike category/collection listings and product detail pages (`01_NAVIGATION_SPECIFICATION.md` §26, `05_PRODUCT_DETAILS_SPECIFICATION.md` §27), a cart's content is customer-specific and session-bound — it is served `noindex` — the same treatment already established for `03_SEARCH_SPECIFICATION.md`'s query-specific results pages, for the identical underlying reason: this content has no stable, shareable meaning to a search engine.
- **This is a brief, deliberate scope note**, not a gap — the cart carries none of the platform's organic-acquisition responsibility, which belongs entirely to category, collection, and product pages already specified elsewhere.

## 26. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Cart/line items | Native Cart module | Platform-wide, `PRODUCT_BLUEPRINT.md` §9 | Native |
| Mixed-cart, multi-fulfillment-leg order | Native Cart/Order support for multiple line items with different shipping methods within one order | `PRODUCT_BLUEPRINT.md` §9 | Native |
| Guest/logged-in persistence (§16) | Native Cart/Customer association | Platform-wide | Native |
| Stock re-validation (§12, §13) | Native inventory (Wine & Spirits) / availability flag (Food Central) | `PRODUCT_CATALOG.md` | Native |
| Gift Wrap add-on (§15) | A priced line item | `PRODUCT_CATALOG.md` | Recommended, not yet built (same item flagged in `05_PRODUCT_DETAILS_SPECIFICATION.md`) |
| Saved-for-Later (§14) | A lightweight persisted list, cart-adjacent | This document | **New — not yet scoped in `MEDUSA_EXTENSIONS.md`**, recommended here for the first time |
| Pairing cross-sell (§18) | Product-to-product relationship, not yet modeled | Flagged by five prior specifications | **Not yet scoped in `MEDUSA_EXTENSIONS.md`** |
| Delivery-fee/tax calculation (§8) | Belongs to checkout, not cart | `07_CHECKOUT_SPECIFICATION.md` (not yet drafted) | Out of this document's scope |
| Analytics events (§24) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 27. Future Expansion

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, the same way every prior specification's own future-expansion section documents capability without committing to a roadmap item:

- **Loyalty** — points, tiers, or recurring-purchase rewards tied to cart/order activity — a plausible fit given this category's naturally recurring purchase pattern (`PRODUCT_BLUEPRINT.md` §17 already names this as a future opportunity), not committed to v1.
- **Subscriptions** — a recurring cart/order for a regularly-reordered product — the same deferral named in `PRODUCT_BLUEPRINT.md` §17.
- **Saved carts** — naming and persisting multiple distinct carts (distinct from Saved-for-Later, §14, which defers individual items within one active cart) — a plausible extension for a customer managing separate occasions (e.g. a personal order vs. a gift order) without conflating them.
- **Shared carts** — a collaborative cart multiple people can view or edit together (e.g. a household or event-planning use case) — a genuinely new capability, not a variation of anything built for v1.
- **Gift registries** — a durable, shareable list of desired items tied to an occasion, distinct from the lightweight per-order Gift Wrap add-on (§15).
- **Corporate ordering** — bulk quantities, purchase-order-style workflows, or multi-approver checkout — a different customer/operational model than any established in `PRODUCT_BLUEPRINT.md` today.

None of the above is authorized or scoped work — `PRODUCT_BLUEPRINT.md` and `MEDUSA_EXTENSIONS.md` name none of it as committed. This section exists solely to confirm the architecture chosen for v1 (a native, single-cart, multi-fulfillment-leg model) does not foreclose any of it.

## 28. Risks & Assumptions

**Risks:**

- **Mixed-cart delivery clarity (§6) depends on checkout reinforcing, not undermining, the same distinction** — this document specifies the cart's side of that clarity; `07_CHECKOUT_SPECIFICATION.md` (not yet drafted) must carry it forward, or the cart's own careful separation is undone at the very next step.
- **Several delivery mechanics remain open business decisions** (§6): the Wine & Spirits nationwide delivery mechanism, the exact Lagos delivery-area definition, delivery-slot operational parameters, and whether cash-on-delivery is supported — none block this document's own scope, but each will eventually need to inform checkout's design in ways this document cannot anticipate.
- **The "pairs with" relationship data remains unscoped in `MEDUSA_EXTENSIONS.md`** (§18) — the sixth specification to flag this; it should be treated as a genuine priority to scope rather than a recurring footnote.
- **Saved-for-Later (§14) is a new recommendation, not a pre-approved feature** — it requires backend scoping (§26) before implementation, and should be confirmed as in-scope for v1 rather than assumed.
- **Whether a hard age/compliance re-check happens at order confirmation** (§19) remains open (`PRODUCT_BLUEPRINT.md` §9) — the cart's lightweight reminder does not resolve this, and checkout's eventual design depends on the answer.

**Assumptions:**

- Native Medusa Cart/Order functionality (multiple line items, multiple shipping methods within one order) is sufficient for the mixed-cart model (§6, §26) — confirmed by `PRODUCT_BLUEPRINT.md` §9, not re-litigated here.
- Guest checkout remains fully supported throughout the cart experience, per `BUSINESS_RULES.md`.
- `07_CHECKOUT_SPECIFICATION.md`, once drafted, will own exact delivery-fee/tax calculation, slot selection, and payment — this document assumes that scope boundary holds.

## 29. Cart Quality Checklist

Every future change to the cart — a new line-item state, a new trust notice, a new cross-sell mechanism, a layout adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline every prior frozen specification already applies to its own domain:

- [ ] **Does it prepare the customer for checkout rather than surprise them?** Checked against §1 — every constraint communicated here is communicated as early as it genuinely can be.
- [ ] **Is mixed-cart delivery messaging unambiguous?** The two fulfillment legs (§6) are never merged into one promise, in this change or any other.
- [ ] **Is pricing honest and transparent?** What's known now is shown now; what isn't known yet (§8) says so explicitly rather than implying false precision.
- [ ] **Are availability and price changes communicated clearly, before checkout?** (§12, §13, §19) — nothing changes silently.
- [ ] **Does it preserve trust over a friction-reduction shortcut?** A faster interaction that removes an honest disclosure is not an improvement by this document's standard.
- [ ] **Does it remain accessible?** Quantity controls, remove actions, and live-region total announcements all meet §23's requirements with no exceptions.
- [ ] **Does it perform well on mobile**, where cart abandonment is measurably higher than desktop per cited research, making mobile the default test condition, not an afterthought?
- [ ] **Does it support both business lines equally**, representing Wine & Spirits' and Food Central's genuinely different operational realities without forcing one model onto the other (§6)?
- [ ] **Does it stay within v1's scope**, correctly deferring loyalty, subscriptions, saved carts, shared carts, gift registries, and corporate ordering to §27 rather than smuggling any of them in early?
- [ ] **Does it avoid inventing a business decision** (§6, §28) that hasn't actually been made, instead of flagging it explicitly?

## 30. Acceptance Criteria

- [ ] A mixed cart displays Wine & Spirits and Food Central line items in two visually distinct groups, each with its own subtotal and its own delivery messaging.
- [ ] No delivery promise in the cart merges or averages the two fulfillment legs of a mixed cart into one date or one statement.
- [ ] Reducing a line item's quantity to zero removes it from the cart immediately, without a blocking confirmation dialog.
- [ ] A Wine & Spirits line item's quantity cannot exceed genuine available stock; if stock has fallen since it was added, the quantity auto-adjusts with a visible explanatory notice.
- [ ] An item that becomes unavailable remains visible in the cart, clearly labeled, with a customer-facing action available — never silently removed.
- [ ] A price change since an item was added is shown with a visible notice, and the notice is announced via an ARIA live region.
- [ ] The cart states explicitly which costs are final (item subtotals) and which are not yet known (delivery fees/tax), rather than presenting an incomplete total as final.
- [ ] Gift Wrap can be added or removed directly in the cart for an eligible Wine & Spirits line item, shown as its own distinct priced line.
- [ ] The cart persists across a full session for a guest customer and across devices for a logged-in customer.
- [ ] An empty cart shows a clear message and a path back into browsing, never a blank page.
- [ ] Every quantity control and remove action is fully keyboard-operable, with an accessible name specific to the product it affects.
- [ ] The cart total updates are announced to assistive technology via a polite live region on every quantity, removal, or price-change event.
- [ ] No page in the cart flow is indexed by search engines.
- [ ] All analytics events listed in §24 fire correctly and exactly once per corresponding user action.
- [ ] No business decision named as open in §6/§28 is silently assumed or resolved by this document or its implementation.

---

**Document status:** In Progress (v0.1). This is the first full draft — ready for review, not yet approved. Upon approval, this specification becomes the reference for all cart implementation platform-wide, integrating directly with `01_NAVIGATION_SPECIFICATION.md` (cart shell/preview) and `05_PRODUCT_DETAILS_SPECIFICATION.md` (add-to-cart origin) without redefining either, and setting the boundary `07_CHECKOUT_SPECIFICATION.md` (not yet drafted) must respect and extend.

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary interactions were referenced or copied):

- [How to Reduce Cart Abandonment (Data-Backed UX Strategies) — Baymard Institute](https://baymard.com/learn/reduce-cart-abandonment)
- [Cart Abandonment Statistics 2026: 100+ Data Points](https://www.digitalapplied.com/blog/cart-abandonment-statistics-2026-data-points)
- [Ecommerce Checkout UX Guide — Optimize Your Order Flow — Baymard Institute](https://baymard.com/learn/checkout-flow-ux-optimization)
- [About split carts in checkout — Shopify Developer Documentation](https://shopify.dev/docs/apps/build/orders-fulfillment/split-carts)
- [Multi-shipment examples — Optimizely Commerce Connect Documentation](https://docs.developers.optimizely.com/commerce-connect/v13.0.0-commerce-cloud/docs/multi-shipment-examples)
- [Letting Buyers Save Their Cart For Later Can Reduce Cart Abandonment — Shift4Shop](https://blog.shift4shop.com/persistent-shopping-carts-can-reduce-cart-abandonment)
- [Persistent Carts: Preserving Revenue for Your Business — AdRoll](https://www.adroll.com/glossary/persistent-cart)
- [Building accessible-app.com: The shopping cart and aria-live regions — marcus.io](https://marcus.io/blog/a11y-app-shopping-cart-with-aria-live)
- [Why Blind Shoppers Can't Complete Online Checkout — UsableNet](https://blog.usablenet.com/shopping-cart-accessibility-screen-reader-barriers)
