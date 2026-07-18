# Food Ordering Specification

**Status:** In Progress
**Version:** 0.1
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for Food Central's ordering-specific behavior — everything beyond generic catalog browsing that makes ordering a cooked-to-order dish genuinely different from ordering a bottle of wine. It defines *customer behavior, operational logic, business rules, trust, accessibility, scalability, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §6 (Product Catalog Strategy) and §10 (Delivery Strategy), `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, `USER_FLOWS.md` (Flow 4), `EXPERIENCE_PRINCIPLES.md` (speed-first requirement for food), and `DESIGN_SYSTEM.md` v2.0, and none of it contradicts them. It integrates directly with the eight already-frozen specifications it sits beside, none of which it redefines: `01_NAVIGATION_SPECIFICATION.md` §14 already establishes Food Central's flat, speed-first navigation structure (Today's Menu, Scheduled Orders, Pickup); `04_PRODUCT_LISTING_SPECIFICATION.md` §19 already establishes Food Central's listing card behavior (quick-add default, Featured sort, card-level availability messaging); `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 already establishes the Food Central product detail page's prep-time, ingredient, allergen, and same-day-cutoff messaging; `06_CART_SPECIFICATION.md` §6 already establishes the mixed-cart, two-fulfillment-group model that a wine-plus-food order uses; and `07_CHECKOUT_SPECIFICATION.md` §9/§10 already establish delivery-method selection and delivery-slot selection mechanics. This document's job is the ordering-specific behavior those documents each defer to it, plus the connective tissue between them that is genuinely Food Central's own: catalog structure, cook-to-order workflow, preparation status, and cutoff/scheduling rules as they apply specifically to made-to-order food.

**Scope boundary on delivery:** this document covers Food Central's delivery experience *only as the customer sees it* — messaging, expectations, and the ordering-flow behavior around delivery, scheduling, and pickup. The operational logistics behind delivery (rider dispatch, route planning, geo-zone enforcement mechanics) belong to `10_DELIVERY_SPECIFICATION.md`, not yet drafted. Where this document touches delivery, it restates or extends what `06_CART_SPECIFICATION.md` and `07_CHECKOUT_SPECIFICATION.md` already established, rather than redefining it.

**Explicitly out of scope for this document, per direct instruction:** restaurant table booking, dine-in, loyalty programmes, subscriptions, AI-driven recommendations, customer reviews, recipe/editorial content, and meal customization beyond what `PRODUCT_CATALOG.md` already establishes are not introduced here. None of these are established anywhere in `/docs` as approved for v1 (§27).

**Where this document depends on a business or operational decision that has not yet been made (delivery-slot operational parameters, the exact order-status vocabulary, kitchen operating hours), it says so explicitly rather than inventing an answer.**

Where a decision is grounded in external UX research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Food Ordering Philosophy

**Food Central is its own operational experience — cooked to order, paced for speed — while remaining unmistakably one platform with Wine & Spirits.** `BUSINESS_RULES.md` states food ordering must prioritize speed and simplicity, the opposite pacing from wine's discovery-oriented browsing, deliberately. Two commitments follow, and nothing below may violate them:

1. **Speed is never achieved by hiding a real constraint.** A same-day cutoff, a prep-time estimate, or a sold-out dish is communicated as early and as plainly as it can be — the same "prepare, never surprise" discipline `06_CART_SPECIFICATION.md` §1 already established, applied here to a catalog whose constraints (kitchen capacity, ingredient availability, time-of-day) are more volatile than a stocked wine shelf.
2. **Food Central is a premium subsidiary experience, not a bolted-on delivery app.** Every interaction — menu browsing, ordering, waiting, receiving — should read as unmistakably LiquorCentral: premium, trustworthy, calm under time pressure, per `EXPERIENCE_PRINCIPLES.md` #3 (Premium Through Discipline) and #6 (Speed Builds Trust) applied together, not traded off against each other.

## 2. Business Objectives

- **Convert a hungry, time-pressured visitor into a completed order as fast as honestly possible** — every section below is judged against whether it removes friction or adds it.
- **Protect kitchen capacity and food safety** by making cutoffs, availability, and allergen information accurate and load-bearing, not decorative — an inaccurate cutoff or a missing allergen warning is a genuine operational and safety failure, not a UX nicety.
- **Make Food Central feel like a natural extension of LiquorCentral**, reinforcing `PRODUCT_BLUEPRINT.md` §2's positioning of Food Central as a trusted product line, not a separate seller — every trust mechanism already established platform-wide (§20) applies here without exception.
- **Support the mixed wine-and-food order as a first-class outcome**, not an edge case — `PRODUCT_BLUEPRINT.md`'s wine-and-food cross-sell is a structural differentiator, and Food Central's own ordering flow must hold up its side of that promise (§13).

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to Food Central specifically:

| Customer type | Food ordering objective |
|---|---|
| Confident Buyer | Order a known favorite dish and reach checkout in the fewest possible steps, with an accurate cutoff/prep-time estimate. |
| Guided Browser | Discover today's menu quickly, understand spice level/dietary fit at a glance, without needing to open every dish to decide. |
| Repeat Household | Reorder a familiar dish (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §15) and add a bottle of wine in the same session, with both fulfillment legs clearly represented (§13). |
| Gifter | Rare for Food Central specifically (made-to-order, time-sensitive), but not excluded — a gifted meal for same-day delivery to a third party is a plausible, if secondary, use case this document does not design against directly. |

Every customer type additionally needs: to trust a stated cutoff or prep-time estimate is real (§20), to know instantly whether a craved dish is available right now (§6), and to never discover an allergen or ingredient concern for the first time after ordering (§14).

## 4. Entry Points

- **The Food Central primary navigation entry** (`01_NAVIGATION_SPECIFICATION.md` §14) — the dominant entry point, one tap/click from anywhere on the platform.
- **The homepage Food Central Spotlight** (`02_HOMEPAGE_SPECIFICATION.md` §8.5) — a snapshot of today's menu with a direct path into the full listing.
- **A cross-navigation affordance from Wine & Spirits contexts** (`01_NAVIGATION_SPECIFICATION.md` §12's cross-linking, `02_HOMEPAGE_SPECIFICATION.md` §8.6's pairing moment) — the mechanism by which a wine-focused visit turns into a mixed order (§13).
- **Reorder from account order history** (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §15) — re-adds a past dish, re-validated against today's availability (§6), never a blind repeat of a dish that may no longer be on the menu.
- **Search** (`03_SEARCH_SPECIFICATION.md` §16's Food Discovery) — a query-driven entry point, not redefined here.

## 5. Food Catalog Structure & Menu Organization

- **Food Central's catalog is menu-like, not taxonomy-like** — restating `INFORMATION_ARCHITECTURE.md`'s explicit description and `01_NAVIGATION_SPECIFICATION.md` §14's structure: Today's Menu, Scheduled Orders, and Pickup are the only top-level destinations, with no deep category tree beneath them at launch.
- **Today's Menu is organized flat, with optional single-tap category chips** (e.g., cuisine or meal-type groupings) once the menu is large enough to warrant them — never a nested, multi-level structure, consistent with `01_NAVIGATION_SPECIFICATION.md` §14's explicit rejection of a mega-menu or deep facet system for this catalog.
- **Whether Today's Menu itself needs further subdivision (e.g., by meal type — breakfast, lunch, dinner) is an open question tied to real menu size**, already flagged in `INFORMATION_ARCHITECTURE.md` and not decided here — this document specifies that the structure scales without redesign if subdivision becomes necessary, not what that subdivision looks like today.
- **Each dish is an ordinary Medusa Product**, distinguished from Wine & Spirits by configuration, not by a separate catalog system (`PRODUCT_BLUEPRINT.md` §6) — inventory tracking is off (§6, below), and the food-attributes module (`MEDUSA_EXTENSIONS.md` #2) carries ingredients, allergens, spice level, and prep time as structured, queryable fields.

## 6. Availability States

- **A dish's availability is a kitchen-capacity and timing question, not a stock count** — `PRODUCT_BLUEPRINT.md` §6's explicit distinction: Food Central inventory tracking is off, because the constraint is what the kitchen can prepare and when, not a warehouse quantity.
- **Three availability states apply to a dish at any given moment**: **Available now** (orderable for same-day, subject to the cutoff, §9), **Available to schedule** (not orderable same-day — e.g., past cutoff — but bookable for a future date/time, §10), and **Unavailable** (temporarily 86'd due to an ingredient shortage, §18, or outside kitchen operating hours, §24). These three states are specific to Food Central's made-to-order model and distinct from Wine & Spirits' stock-based unavailable/hidden/discontinued taxonomy (`04_PRODUCT_LISTING_SPECIFICATION.md`'s Operational Behaviour) — the two are not the same concept wearing different labels.
- **Availability is shown at the card level, not only after opening a dish** — restating `01_NAVIGATION_SPECIFICATION.md` §14 and `04_PRODUCT_LISTING_SPECIFICATION.md` §19's existing requirement, applied here as the canonical statement of why: a customer deciding what to order should never have to open several dishes just to discover which ones are actually orderable right now.
- **A dish outside kitchen operating hours (§24) is shown as "Available to schedule" or "Kitchen currently closed," never as if it simply doesn't exist** — consistent with `06_CART_SPECIFICATION.md`'s platform-wide "unavailable is labeled, never silently removed" discipline.

## 7. Cook-to-Order Workflow

- **Every dish is prepared after the order is placed — nothing is held finished in stock.** This is the operational fact `PRODUCT_BLUEPRINT.md` §6 and `BUSINESS_RULES.md` establish; this section specifies its customer-facing consequence: an order transitions through a small number of honest stages rather than appearing instantly "ready."
- **A minimum, customer-facing status progression is specified**: Order Received → Preparing → Ready (for pickup) or Out for Delivery → Completed. This is a reasonable minimum this document establishes for customer communication; the exact operational granularity beneath it (e.g., sub-stages within "Preparing") is a `MEDUSA_EXTENSIONS.md`/operational detail not invented here, consistent with `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §13's identical treatment of order-status vocabulary.
- **The customer sees this progression from the moment of order confirmation** (`07_CHECKOUT_SPECIFICATION.md` §17) through completion, in the order's own detail view (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §14) — restated, not redefined, here.
- **No stage is skipped or shown out of order** — a customer should never see "Out for Delivery" before "Preparing" has been shown, since that would misrepresent the cook-to-order reality this whole section exists to communicate honestly.

## 8. Preparation Status & Estimated Preparation Times

- **A realistic prep-time estimate is shown at the point of decision** — on the listing card and the product detail page (`05_PRODUCT_DETAILS_SPECIFICATION.md` §11), not discovered for the first time after ordering, directly implementing `USER_FLOWS.md` Flow 4 step 3's explicit sequencing.
- **The estimate is honest about being an estimate, not a guarantee** — the same estimated-vs-confirmed discipline `06_CART_SPECIFICATION.md`'s Pricing Transparency applies to money, applied here to time: kitchen volume and order complexity can genuinely shift a prep time, and the interface never implies false precision.
- **Current research finds real-time status visibility measurably improves customer satisfaction and reduces "where is my order" support burden** — a customer who can see that their order has moved from "Received" to "Preparing" needs to ask less, not more (industry food-delivery research, cited below). This validates, rather than invents, the status progression already specified in §7.
- **Prep-time estimates are dish-specific, not a single platform-wide number** — a simple starter and an elaborate main plausibly carry different realistic estimates; this document does not invent a single fixed figure.

## 9. Same-Day Ordering Rules & Cutoff Behaviour

- **Same-day ordering has an explicit, dynamic cutoff — never a vague "same-day where available" promise.** Restating `DELIVERY_MODEL.md`'s own finding directly: vague delivery promises measurably underperform explicit cutoffs. The cutoff is shown as a stated time or a live countdown, visible at the listing level (§6) and the product detail page (`05_PRODUCT_DETAILS_SPECIFICATION.md` §11), not only at checkout.
- **Mechanically, same-day is a delivery slot dated today with a cutoff time** — restating `DELIVERY_MODEL.md`'s explicit finding that same-day requires no separate system from scheduled ordering (§10); this document does not invent a parallel mechanism.
- **Ordering past the cutoff does not fail silently** — a dish past its same-day cutoff is shown as "Available to schedule" (§6) rather than simply disappearing, with a direct path into scheduling (§10) from the same point of decision.
- **The exact cutoff time itself is an operational parameter**, tied to kitchen capacity and prep-time realities — not fixed by this document, consistent with the same open item already flagged in `DELIVERY_MODEL.md` and `07_CHECKOUT_SPECIFICATION.md` §10.

## 10. Scheduling Orders

- **Scheduling ahead uses the calendar-style date-and-time selection already established in `07_CHECKOUT_SPECIFICATION.md` §10** — this document does not redefine that mechanism, only confirms that Food Central's menu-browsing experience leads into it consistently, per `USER_FLOWS.md` Flow 4 step 5.
- **A scheduled order is confirmed against kitchen capacity at the moment of booking**, using the same delivery-slot capacity-enforcement mechanism already specified in `07_CHECKOUT_SPECIFICATION.md` §10 (`MEDUSA_EXTENSIONS.md` #3) — not a separate booking system for Food Central specifically.
- **How far in advance a customer may schedule is an operational parameter**, not specified here — flagged as open (§28), the same treatment already given to slot length and cutoff timing elsewhere in `/docs`.
- **A scheduled order's cook-to-order workflow (§7) begins on the scheduled date, not at the moment of booking** — the customer sees "Scheduled for [date/time]" until that date arrives, then the same Order Received → Preparing → Ready/Out for Delivery progression begins.

## 11. Pickup Workflow

- **Pickup is presented with equal visual and procedural weight to delivery** — restating `DELIVERY_MODEL.md`'s explicit finding directly: pickup is frequently under-designed relative to delivery despite being operationally simpler and often faster, and `PRODUCT_BLUEPRINT.md` §10 requires equal weight.
- **A pickup order shows a clear ready-time estimate**, using the same prep-time honesty discipline as §8 — never a vague "ready soon."
- **Pickup selection itself happens at checkout** (`07_CHECKOUT_SPECIFICATION.md` §9), not redefined here — this section confirms Food Central's menu/ordering experience presents pickup as a genuinely equal option throughout, from the listing card (`04_PRODUCT_LISTING_SPECIFICATION.md` §19) onward, not only once a customer reaches checkout.
- **Pickup location details (address, hours) are informational content, not specified behaviorally here** — a `DELIVERY_MODEL.md`/operational detail.

## 12. Delivery Workflow (Customer-Facing)

- **Delivery method and slot selection are checkout's responsibility** (`07_CHECKOUT_SPECIFICATION.md` §9, §10) — this document does not redefine those mechanics. This section specifies only what a customer sees and expects during the ordering flow itself, before reaching checkout.
- **Delivery expectations are set at the point of menu browsing**, not only at checkout — the same-day cutoff (§9) and general delivery-scope messaging (Lagos only, per `BUSINESS_RULES.md`, already stated platform-wide in `02_HOMEPAGE_SPECIFICATION.md` §8.7 and `06_CART_SPECIFICATION.md` §6/§10) are visible before a customer commits to a dish, not discovered afterward.
- **Post-order delivery status** (out for delivery, arriving soon) **is part of the same cook-to-order status progression** (§7) — this document specifies that such a status exists and is honest; the operational mechanics behind generating it (rider dispatch, live location) belong to `10_DELIVERY_SPECIFICATION.md`, not yet drafted.
- **Proactive delivery communication** (e.g., a "your order is on its way" message) **depends on the still-undecided notification-channel choice** (`MEDUSA_EXTENSIONS.md` #5, already flagged as open by `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §16) — this document specifies the expectation, not the channel.

## 13. Mixed Wine & Food Orders

- **A mixed order uses the exact two-fulfillment-group model already established in `06_CART_SPECIFICATION.md` §6 and carried through `07_CHECKOUT_SPECIFICATION.md` §8** — this document does not redefine that model; it confirms Food Central's own ordering behavior (menu browsing, cutoffs, scheduling) operates identically whether a customer's cart also contains Wine & Spirits items or not.
- **Adding a dish to a cart that already contains Wine & Spirits items (or vice versa) triggers no special interstitial or warning** — the mixed-cart structure absorbs it silently and correctly, per the established model; the only customer-facing consequence is the two-group cart/checkout presentation already specified elsewhere.
- **Food Central's same-day cutoff and scheduling rules apply only to the Food Central portion of a mixed order** — the Wine & Spirits portion's nationwide delivery timeline is entirely independent, restating `06_CART_SPECIFICATION.md` §6's "never a merged delivery promise" rule specifically for the ordering-flow moment where a mixed cart is built.
- **The "Wine & Food, Connected" pairing moment** (`02_HOMEPAGE_SPECIFICATION.md` §8.6, `05_PRODUCT_DETAILS_SPECIFICATION.md` §14) **is the primary mechanism by which a Food Central visit turns into a mixed order** — this document does not introduce a second, competing cross-sell mechanism for Food Central specifically.

## 14. Ingredient Transparency & Allergen Information

- **The full ingredient list is shown for every dish, not abbreviated or summarized** — restating `05_PRODUCT_DETAILS_SPECIFICATION.md` §11's exact requirement at the point where it matters for ordering-flow trust generally, not only on the product detail page.
- **Allergen information is prominent and never conveyed by color alone** — an icon or symbol paired with explicit text, the same never-color-alone rule already established platform-wide, applied here with particular weight given current research finding allergen filters are used roughly ten times more often than any other digital-menu filter (Baymard Institute, already cited by `05_PRODUCT_DETAILS_SPECIFICATION.md`) — this is safety-critical information, not a nice-to-have.
- **Dietary flags (halal, vegan, etc.) are shown consistently at the card and detail level**, using the same fields already established in `PRODUCT_CATALOG.md`'s Food Central attributes — this document does not invent additional dietary categories.
- **Spice level uses the same scale referenced consistently across search facets** (`03_SEARCH_SPECIFICATION.md` §13), listing cards, and the product detail page (`05_PRODUCT_DETAILS_SPECIFICATION.md` §11) — never a different scale at the ordering-flow level, which would create exactly the kind of disagreement `05_PRODUCT_DETAILS_SPECIFICATION.md` already rules out.
- **Who is operationally responsible for keeping allergen/ingredient data accurate remains an open business/operational decision** (`MEDUSA_EXTENSIONS.md` #2, `PROJECT_STATUS.md`) — this document specifies that the data must be accurate and prominently displayed, not who maintains it day to day.

## 15. Quantity Handling & Customisation (Explicitly Out of Scope)

- **Quantity per dish is uncapped by a stock count** — restating `06_CART_SPECIFICATION.md` §7 and §13's explicit finding: Food Central has no inventory count to cap against; any practical per-order quantity limit is an operational/kitchen-capacity matter for fulfillment to enforce, not a number this document invents.
- **A dish's quantity control uses the identical stepper pattern already established platform-wide** (`05_PRODUCT_DETAILS_SPECIFICATION.md` §17, `06_CART_SPECIFICATION.md` §7) — no Food Central-specific control pattern is introduced.
- **Dish customization (e.g., ingredient substitution, spice-level adjustment per order, add-on modifiers) is explicitly out of scope for this document.** No prior document — `PRODUCT_CATALOG.md`, `PRODUCT_BLUEPRINT.md`, or `MEDUSA_EXTENSIONS.md` — establishes a customization/modifier system for Food Central dishes; this document does not invent one, per direct instruction. A dish is ordered as menu-described, at a chosen quantity, with no per-order modification. If customization is ever approved as a business decision, it requires its own specification work, not an extension of this document's scope.

## 16. Menu Availability Changes & Ingredient Shortages

- **A dish can become unavailable mid-day due to an ingredient shortage ("86'd") — this is a normal, expected operational reality of a made-to-order kitchen, not an error state.** It is communicated the same way any availability change is communicated platform-wide: labeled in place, never silently removed (`06_CART_SPECIFICATION.md` §12, `04_PRODUCT_LISTING_SPECIFICATION.md`'s Operational Behaviour), with the dish shown as Unavailable (§6) rather than disappearing from the menu entirely.
- **If a dish already in a customer's cart becomes unavailable before checkout completes**, the same availability re-validation already established in `06_CART_SPECIFICATION.md` §12 and `07_CHECKOUT_SPECIFICATION.md` §12 applies — this document does not introduce a separate re-validation mechanism for food specifically.
- **A menu-wide change (e.g., the kitchen switching from a lunch to a dinner menu) is a scheduled, predictable transition**, not treated as an error — restated from §6's availability-state framing; the exact timing of any such transition is a kitchen-operations detail (§24), not invented here.

## 17. Customer Expectations During Preparation

- **Once an order is placed, the customer knows what to expect and when, without needing to ask** — the direct implementation of `EXPERIENCE_PRINCIPLES.md` #1 (Confidence Before Complexity) applied to the waiting period between order and delivery/pickup, the single longest stretch of a Food Central order where a customer has nothing to actively do but wait.
- **The status progression (§7) is the primary mechanism for managing this expectation** — a customer who can see "Preparing" knows their order registered and is genuinely being made, reducing the anxiety and support burden current research directly associates with an absence of visible progress (industry food-delivery research, cited below).
- **A prep-time or delivery estimate, once given, is not silently revised without explanation** — if kitchen volume genuinely shifts an estimate, the customer is told plainly, restating the same "nothing changes silently" principle `06_CART_SPECIFICATION.md` §1 established for the cart, applied here to the post-order waiting period.
- **No fabricated urgency or artificial scarcity is introduced during this waiting period** (e.g., no manufactured "hurry, almost out" messaging) — consistent with `EXPERIENCE_PRINCIPLES.md` #15 and the identical rule already established in every prior specification.

## 18. Food-Specific Trust Considerations

Every trust mechanism the platform already establishes, extended to the specific stakes of a made-to-order, time-sensitive, safety-relevant catalog:

- **Cooked-to-order is stated plainly as a trust signal, not just an operational fact** — restating `05_PRODUCT_DETAILS_SPECIFICATION.md` §11's framing: a customer who understands their food is made fresh, not reheated from stock, trusts the platform more, not less, when this is communicated confidently.
- **Allergen and ingredient information is never abbreviated for the sake of a cleaner-looking menu** (§14) — trust here is inseparable from customer safety, a stronger standard than ordinary product-description trust.
- **A same-day cutoff or prep-time estimate is honored as stated** (§9, §8) — a platform that consistently states accurate cutoffs and estimates earns exactly the "that was surprisingly easy" / "I trust this company" impressions `EXPERIENCE_PRINCIPLES.md` names as the platform-wide success bar.
- **Food Central is never presented as a separate, less-accountable business** — restating `PRODUCT_BLUEPRINT.md` §2's positioning directly: the same "sold and delivered by us directly" claim that applies to Wine & Spirits applies identically here, since there is no third-party kitchen or vendor involved.
- **No trust mechanism here duplicates or contradicts the identical discipline already established in `06_CART_SPECIFICATION.md` §19 or `07_CHECKOUT_SPECIFICATION.md` §18** — this section extends, rather than reinvents, the platform-wide trust standard.

## 19. Customer Decision States

This document reuses the same five-state taxonomy already established in `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, and `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` — informational, recommendation, warning, blocking condition, recoverable error — instantiated with Food Central-specific triggers, rather than inventing a new vocabulary:

| State | Food-specific trigger | Customer impact | Expected customer action |
|---|---|---|---|
| **Informational** | A same-day cutoff countdown (§9); a prep-time estimate (§8); a "kitchen closed, opens at [time]" message (§24). | None. | None required. |
| **Recommendation** | The "Wine & Food, Connected" pairing moment (§13) — an optional, restrained suggestion, never fabricated urgency. | None if ignored. | Optional: accept (add the pairing) or ignore. |
| **Warning** | A prep-time estimate shifts after order placement (§17) due to kitchen volume. | The customer's original expectation has changed; they should notice. | Review the updated estimate; the order itself still proceeds. |
| **Blocking condition** | A dish in the cart becomes fully unavailable (86'd, §16) before checkout completes; an attempt to order same-day past the cutoff with no schedule/pickup alternative selected (§9). | Cannot proceed until resolved. | Remove or reschedule the specific item, or switch to a schedule/pickup option. |
| **Recoverable error** | A failed availability re-validation check (§16) or a failed slot-capacity confirmation (§10, shared with `07_CHECKOUT_SPECIFICATION.md`). | Temporary — the affected step did not complete. | Retry; the rest of the order remains unaffected. |

## 20. Empty, Loading & Error States

- **A closed kitchen or an empty Today's Menu shows a clear, honest message and next-opening information** (§24), never a blank menu or an implication that something is broken — directly implementing `05_PRODUCT_DETAILS_SPECIFICATION.md` §11's PDP-level treatment at the listing level as well.
- **Loading states use skeleton placeholders, not spinners**, for the menu listing and order-status views, consistent with the platform-wide discipline already established in every prior specification.
- **Every menu and ordering action fails independently and specifically** — a failed availability check for one dish does not prevent the rest of the menu from being browsable; a failed prep-time estimate load does not block adding the dish to cart.
- **No blank white space or broken layout is an acceptable failure mode anywhere in the Food Central ordering experience** — the same standard already set platform-wide.

## 21. Accessibility

- **Every menu card and product detail element follows `DESIGN_SYSTEM.md` §B9 and §B11 exactly** — no Food Central-specific exception to platform-wide form, contrast, and touch-target requirements.
- **Allergen and dietary information is never conveyed by icon or color alone** — paired with explicit, screen-reader-accessible text (§14), the same never-color-alone rule applied with particular weight given the safety stakes.
- **The same-day cutoff countdown (§9) is announced to assistive technology as it changes**, not only visually — reusing the same live-region mechanism already established in `06_CART_SPECIFICATION.md` §23 and `07_CHECKOUT_SPECIFICATION.md` §22, so a countdown updating visually is not silently invisible to a screen-reader user.
- **Order-status progression (§7) uses real heading/list semantics and is announced via a live region on each stage change** — a screen-reader user tracking "Preparing" → "Ready" is not left to re-scan the page to notice a change.
- **Every touch target** (quantity stepper, schedule-date picker, pickup/delivery toggle) **meets the 44×44px minimum** (`DESIGN_SYSTEM.md` §B11), with particular attention to the calendar-style scheduling picker already flagged as a common small-touch-target risk in `07_CHECKOUT_SPECIFICATION.md` §22.

## 22. Kitchen Operational Considerations

*Distinct from the generic product "Operational Behaviour" concept already established in `04_PRODUCT_LISTING_SPECIFICATION.md` and `06_CART_SPECIFICATION.md` (unavailable/hidden/discontinued for a static catalog) — this section addresses operational realities specific to a made-to-order kitchen, which do not exist for Wine & Spirits.*

- **Kitchen operating hours are distinct from site-wide platform availability** — the platform itself is always browsable, but Today's Menu's "Available now" state (§6) only applies within actual kitchen operating hours; outside those hours, dishes show as schedulable or the kitchen shows as closed (§20).
- **A kitchen may close earlier than its stated hours due to capacity** (e.g., fully booked for same-day orders) — this is a legitimate, expected operational state, communicated the same way any availability change is (§16), never treated as an error.
- **Exact kitchen operating hours, capacity limits, and early-closure triggers are operational parameters**, not specified behaviorally beyond: they exist, they are communicated honestly and promptly, and a customer is never left guessing why ordering suddenly isn't possible (§28).

## 23. Analytics Events

- `food_menu_viewed`
- `dish_availability_shown` (value: dish id, state — available now / schedulable / unavailable)
- `dish_added_to_cart` (value: dish id, quantity, delivery/pickup context if already known)
- `same_day_cutoff_reached` (value: dish id) — fires when a dish transitions from available-now to schedulable due to the cutoff
- `dish_unavailable_shown` (value: dish id, reason where known — shortage vs. kitchen closed)
- `order_status_viewed` (value: order id, current stage)
- `mixed_order_created` (value: fulfillment groups present) — shared event with `06_CART_SPECIFICATION.md` §24's cart-level tracking
- `pairing_moment_clicked` (reused from `02_HOMEPAGE_SPECIFICATION.md` §18, not a duplicate event)

Each ties back to §2's business objectives — `same_day_cutoff_reached` and `dish_unavailable_shown` together measure how often a customer's craving collides with a real kitchen constraint, directly informing whether cutoff timing or capacity parameters (§9, §22) need operational attention.

## 24. SEO Considerations

- **Today's Menu and individual dish pages are indexable**, following the same treatment `04_PRODUCT_LISTING_SPECIFICATION.md` and `05_PRODUCT_DETAILS_SPECIFICATION.md` already establish for listing and product pages generally — Food Central carries real organic-acquisition value ("Lagos food delivery," specific dish names), not exempted from it.
- **Order-status and order-history views are not indexed** — the same `noindex` treatment already established for every customer-specific, session-bound surface platform-wide (`06_CART_SPECIFICATION.md` §25, `07_CHECKOUT_SPECIFICATION.md` §25, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §24).
- **This is a restatement, not a new decision** — Food Central's listing/detail pages already inherit the SEO treatment `04`/`05` established; this section confirms no Food Central-specific exception exists.

## 25. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Food catalog structure (§5) | Native Product module, Food Central category | `PRODUCT_BLUEPRINT.md` §6 | Native |
| Ingredients, allergens, spice level, prep time, dietary flags (§14) | Food-attributes module, linked 1:1 to Product | `MEDUSA_EXTENSIONS.md` #2 | **Not yet built** |
| Availability states (§6) | Kitchen-capacity/time-based availability flag, not inventory count | `PRODUCT_BLUEPRINT.md` §6 | Native mechanism; exact capacity logic **not yet built** |
| Same-day cutoff, scheduling, capacity enforcement (§9, §10) | Delivery-slot module, workflow hook | `MEDUSA_EXTENSIONS.md` #3 | **Not yet built** (shared dependency with `07_CHECKOUT_SPECIFICATION.md`) |
| Order-status progression (§7) | Order status field/workflow, granularity TBD | Platform-wide | Native mechanism; exact vocabulary **not yet decided** |
| Mixed order support (§13) | Native multi-fulfillment-leg Order | `PRODUCT_BLUEPRINT.md` §9 | Native |
| Kitchen operating hours / early closure (§22) | Operational configuration, not yet modeled | `DELIVERY_MODEL.md` | **Not yet scoped** |
| Analytics events (§23) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 26. Performance Expectations

- **Food Central is held to the platform's strictest performance bar**, restating `PRODUCT_BLUEPRINT.md` §14's explicit requirement: food ordering is more likely to be a fast, one-thumb, on-the-go action than a considered wine purchase, and this document's every section exists in service of that speed.
- **Availability and cutoff information (§6, §9) load with the menu itself, never as a separate slow step** — a customer should never see a dish before knowing whether it's actually orderable right now.
- **Order-status updates (§7) feel close to real-time**, reusing the same live-region and update discipline already established in `06_CART_SPECIFICATION.md` and `07_CHECKOUT_SPECIFICATION.md`, without inventing a new performance budget beyond the platform-wide LCP target already set in `02_HOMEPAGE_SPECIFICATION.md` §17.

## 27. Future Expansion & Explicitly Out of Scope

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, and explicitly names what this document deliberately does not introduce, per direct instruction:

**Explicitly out of scope for v1, not established elsewhere in `/docs`:**

- **Restaurant table booking / dine-in** — Food Central is a delivery-and-pickup product line; no prior document establishes a physical dining experience, and this document does not introduce one.
- **Loyalty programmes** — named as a future opportunity in `PRODUCT_BLUEPRINT.md` §17, not committed or designed here.
- **Subscriptions** (e.g., a recurring meal plan) — named as a future opportunity in `PRODUCT_BLUEPRINT.md` §17, not committed here.
- **AI-driven recommendations** — not established anywhere in `/docs`; not introduced here.
- **Customer reviews** — `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Reviews Strategy already confirms no review system exists in v1; this document does not introduce one for Food Central specifically.
- **Recipe or editorial content** — a plausible future CMS-driven addition (`MEDUSA_EXTENSIONS.md` #7, once approved) but not established or built here.
- **Meal customization beyond `PRODUCT_CATALOG.md`'s established attributes** (§15) — no modifier/substitution system is introduced.

**Plausible future capability, not built now:**

- Further menu subdivision (e.g., by meal type) once real menu size justifies it (§5).
- A dedicated rider-dispatch/live-tracking module, once delivery volume justifies it (`PRODUCT_BLUEPRINT.md` §17, `DELIVERY_MODEL.md`) — belongs to `10_DELIVERY_SPECIFICATION.md`'s eventual scope, not this document's.
- Richer, CMS-driven content around dishes (seasonal specials storytelling) once Sanity is approved (`MEDUSA_EXTENSIONS.md` #7).

None of the above is authorized or scoped work — this section exists solely to confirm the architecture chosen for v1 does not foreclose any of it, and to make the deliberate exclusions explicit rather than silent.

## 28. Risks & Assumptions

**Risks:**

- **Several genuine open operational decisions this document depends on, none resolved here**: the exact order-status vocabulary and granularity (§7); same-day cutoff timing, delivery-slot length, and capacity per slot (§9, §10, shared with `07_CHECKOUT_SPECIFICATION.md`); how far in advance scheduling is permitted (§10); kitchen operating hours and early-closure triggers (§22); and who is operationally responsible for allergen/ingredient data accuracy (§14). None block this document's own behavioral scope, but each will directly shape implementation once resolved.
- **The food-attributes module and delivery-slot module are not yet built** (`MEDUSA_EXTENSIONS.md` #2, #3) — §14 and §9/§10's behavioral requirements assume both exist; their absence is a backend dependency, not a specification gap.
- **An inaccurate cutoff, prep-time estimate, or allergen listing carries real operational and safety consequences**, not just a UX cost — this document's honesty requirements (§8, §9, §14, §17) are load-bearing, not aspirational.
- **Kitchen-hours-driven early closure (§22) risks being implemented as an unexplained error if not deliberately built as its own honest state** — flagged specifically because it's the one Food Central-specific operational reality with no direct precedent in any frozen prior specification.

**Assumptions:**

- Native Medusa Product, Order, and Cart functionality (multi-fulfillment-leg orders, availability flags) are sufficient for this document's behavioral requirements (§25), consistent with `PRODUCT_BLUEPRINT.md` §6/§9's own findings.
- `06_CART_SPECIFICATION.md`'s mixed-cart model and `07_CHECKOUT_SPECIFICATION.md`'s delivery-method/slot-selection mechanics are the correct foundation this document builds on, not something this document should be read as re-deciding.
- The notification-channel decision (`MEDUSA_EXTENSIONS.md` #5), once made, will carry proactive order-status updates (§12) without requiring a change to this document's own behavioral requirements.

## 29. Food Ordering Quality Checklist

Every future change to Food Central's ordering experience — a new menu section, a new status stage, a layout adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline every prior frozen specification already applies to its own domain:

- [ ] **Does it communicate a real constraint (cutoff, prep time, availability) as early and honestly as possible?** Checked against §1, §8, §9.
- [ ] **Does it treat Food Central as a premium LiquorCentral experience, not a bolted-on delivery app?** (§1, §18)
- [ ] **Does availability messaging distinguish available-now, schedulable, and unavailable clearly**, never conflating them? (§6)
- [ ] **Does a mixed wine-and-food order remain structurally correct**, using the established two-group model without reinventing it? (§13)
- [ ] **Is allergen and ingredient information complete, prominent, and never color-alone?** (§14)
- [ ] **Does it avoid introducing table booking, dine-in, loyalty, subscriptions, AI recommendations, reviews, recipe content, or customization** not already established elsewhere? (§27)
- [ ] **Does it avoid inventing an operational decision** (§9, §10, §22, §28) that hasn't actually been made, instead of flagging it explicitly?
- [ ] **Does it remain accessible?** Form fields, live-region announcements, and touch targets all meet §21's requirements with no exceptions.
- [ ] **Does it avoid any manufactured urgency or pressure**, especially during the post-order waiting period? (§17)
- [ ] **Is the customer decision-state vocabulary reused, not reinvented?** (§19)
- [ ] **Does a kitchen-hours-driven closure read as an honest operational state, never an unexplained error?** (§22)

## 30. Acceptance Criteria

- [ ] Every dish's availability state (available now, schedulable, unavailable) is visible at the listing-card level, not only after opening the dish.
- [ ] A same-day cutoff is shown as an explicit time or countdown, never a vague "same-day where available" statement.
- [ ] A dish past its same-day cutoff is offered a direct path to scheduling, not simply hidden or removed.
- [ ] A dish that becomes unavailable mid-day is labeled in place, never silently removed from the menu.
- [ ] The full ingredient list and prominent, non-color-alone allergen information are shown for every dish.
- [ ] A mixed wine-and-food order displays both fulfillment groups distinctly through cart, checkout, and order confirmation, exactly as established in `06_CART_SPECIFICATION.md` and `07_CHECKOUT_SPECIFICATION.md`.
- [ ] Order status progresses through Order Received → Preparing → Ready/Out for Delivery → Completed, never skipping or reordering a stage.
- [ ] Quantity per dish is not capped by a stock count, and no dish-level customization/modifier option appears anywhere in the ordering flow.
- [ ] A kitchen-hours-driven closure or early cutoff is communicated as an honest operational state, with next-availability information, never as a generic error.
- [ ] The same-day cutoff countdown and order-status changes are announced to assistive technology via a live region, not only shown visually.
- [ ] Every interactive control in the Food Central ordering flow is fully keyboard-operable and meets the 44×44px touch-target minimum.
- [ ] All analytics events listed in §23 fire correctly and exactly once per corresponding user action.
- [ ] No feature named as explicitly out of scope in §27 (table booking, dine-in, loyalty, subscriptions, AI recommendations, reviews, recipe content, customization) appears anywhere in the Food Central ordering experience.
- [ ] No operational decision named as open in §9, §10, §22, §28 (cutoff timing, slot parameters, scheduling horizon, kitchen hours, allergen-data ownership) is silently assumed or resolved by this document or its implementation.

---

**Document status:** In Progress (v0.1). This is the first full draft — ready for review, not yet approved. Upon approval, this specification becomes the reference for Food Central ordering implementation, alongside `01_NAVIGATION_SPECIFICATION.md` §14, `04_PRODUCT_LISTING_SPECIFICATION.md` §19, `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 (which it extends without redefining), `06_CART_SPECIFICATION.md` §6, and `07_CHECKOUT_SPECIFICATION.md` §9/§10 (whose mechanics it builds on), and `10_DELIVERY_SPECIFICATION.md` (not yet drafted, which will own the operational logistics this document explicitly defers).

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary interactions were referenced or copied):

- [3 High-Level UX Takeaways from 1,100+ Hours of Testing Leading Food Delivery and Takeout Sites — Baymard Institute](https://baymard.com/blog/food-delivery-takeout-launch)
- [8 'Food Delivery & Takeout' Sites Ranked by User Experience Performance — Baymard Institute](https://baymard.com/ux-benchmark/collections/online-food-delivery)
