# User Flows

**Status:** Described as step sequences only — no wireframes or screen designs. These flows exist so implementation and eventual visual design have an agreed sequence of steps to build against, independent of how each step looks.

## Flow 1 — First visit, age confirmation

1. Visitor arrives at the site.
2. Before any alcohol content is browsable, an age-confirmation step is presented.
3. Visitor confirms (or is blocked from proceeding to alcohol content if they decline/fail).
4. Confirmation persists for the remainder of the session (exact duration: open question, see `BUSINESS_RULES.md`).
5. Visitor proceeds to Home.

> Open question: whether this gate blocks the entire site on first visit, or only triggers when navigating into Wine & Spirits specifically, given Food Central itself is not age-restricted. See `PRODUCT_BLUEPRINT.md` §11.

## Flow 2 — Wine & Spirits discovery (Guided Browser intent)

1. Visitor enters Wine & Spirits.
2. Visitor browses via curated/occasion collections (not knowing a specific product yet).
3. Visitor optionally narrows using facets (region, vintage, price, occasion) — see `PRODUCT_CATALOG.md`.
4. Visitor opens a product detail page and reviews the structured fact sheet (producer, region, vintage, ABV, tasting notes, food pairing).
5. Visitor adds to cart, or continues browsing using "pairs with" suggestions from the same product page.

## Flow 3 — Wine & Spirits direct purchase (Confident Buyer intent)

1. Visitor searches for a specific, known product by name.
2. Visitor opens the product detail page directly from search results.
3. Visitor adds to cart and proceeds to checkout with minimal further browsing.

## Flow 4 — Food Central ordering (speed-first)

1. Visitor enters Food Central.
2. Visitor sees Today's Menu immediately — no forced multi-step navigation.
3. Visitor selects a dish; sees prep-time/availability information at the point of selection, not after adding to cart.
4. Visitor adds to cart.
5. Visitor is shown a same-day cutoff countdown if ordering same-day, or a calendar-style slot picker if scheduling ahead, or a pickup option — all three presented as equally valid, not pickup/scheduling as an afterthought. See `DELIVERY_MODEL.md`.

## Flow 5 — Mixed cart (Repeat Household intent)

1. Customer has already added a Food Central dish to their cart.
2. Customer separately browses to Wine & Spirits and adds a bottle.
3. Cart now holds one wine line item and one food line item, in a single cart.
4. At checkout, delivery information is presented per line item — the wine's nationwide-courier estimate and the food's Lagos same-day/scheduled/pickup choice are shown distinctly, not merged into one ambiguous delivery promise.
5. Customer completes one checkout, one payment, for the whole cart.

## Flow 6 — Guest checkout

1. Customer reaches checkout without an account.
2. Customer is not required to create an account to proceed — guest checkout is available at every step.
3. Customer supplies delivery address (see note on address format below), contact details, and payment.
4. Order is placed; customer is optionally offered account creation afterward (not before), so it never blocks the purchase.

> Note: delivery-address collection should support free-text landmark/directions fields, not force a rigid street-address/postal-code format — see the Nigerian-context findings summarized in `DECISION_LOG.md`. Exact address-form design is a `DELIVERY_MODEL.md` / future implementation decision, not finalized here.

## Flow 7 — Repeat ordering

1. Returning customer (logged in) opens their account/order history.
2. Customer selects a previous order (wine, food, or mixed) and reorders in one action.
3. Reordered items are added to a fresh cart, re-validated against current availability/pricing (not a blind copy of the old order) before checkout.

## What's intentionally not specified here

Visual layout, exact copy, specific UI components, and screen-by-screen wireframes — these belong to a later design phase and to `DESIGN_SYSTEM.md` / `BRAND_GUIDELINES.md` once populated, not to this document.
