# Changelog

**Status:** Approved (living record)
**Version:** 6.2
**Owner:** Program
**Last Updated:** 2026-07-20

Tracks changes to the documentation set itself (not the product). For product/business decisions, see `DECISION_LOG.md`. For current project state, see `PROJECT_STATUS.md`. **Engineering (code) changes are tracked in `backend/README.md` and the repository's own commit history, not duplicated in full here — this entry records only that the engineering phase began and what it produced, at the level of detail this changelog's other entries use.**

## v59 — 2026-07-20 — Milestone 15: Food Ordering (`09_FOOD_ORDERING_SPECIFICATION.md`)

**Context:** With Customer Account (Milestone 14) complete, Food Ordering was the confirmed next specification in Paul's approved implementation order. Research first found the specification roughly 60–70% already satisfied by prior milestones (catalog structure, ingredient/allergen/prep-time display, mixed-order handling, uncapped quantity) — this milestone's own genuinely new work was two mechanisms the specification requires as a decided minimum but with no existing backend home, per `TIER_B_FOOD_ATTRIBUTES_MODULE.md`'s own explicit exclusion of both from `food-details`. Built under the standing autonomous-continuation authorization; full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/apps/backend/src/` — not part of `/docs`):**

- `admin/widgets/food-availability-widget.tsx` — a product-detail-page toggle for the new Available/Unavailable dish flag, reading and writing `product.metadata.food_available` directly (no new module, migration, or `additional_data` plumbing — metadata is already a native, freely-writable product field).
- `admin/widgets/food-order-status-widget.tsx` — an order-detail-page dropdown for the new cook-to-order status field, reading and writing `order.metadata.food_order_status` the same way.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/lib/util/food-availability.ts` — `isFoodCentralProduct`/`isFoodCentralUnavailable`, the shared "Unavailable" (86'd) check against `product.metadata.food_available`.
- `storefront/src/lib/util/food-order-status.ts` — `FOOD_ORDER_STAGES`, `hasFoodCentralItems`, `getFoodOrderStage`, the shared cook-to-order stage vocabulary and detection logic.
- `storefront/src/modules/order/components/food-order-status/index.tsx` — the real heading/list-semantics status-progression display with a live region, rendered only when an order genuinely contains a Food Central item and a stage has actually been set.
- `storefront/src/modules/food-central/components/menu-grid/index.tsx` — the real Food Central menu listing (reused across Today's Menu, Pickup, and Scheduled Orders), extending the homepage Food Central Spotlight's own proven `listProducts({ fields: "+food_details.*" })` + filter pattern to a full listing.

**Changed:**

- `storefront/src/app/[countryCode]/(main)/food-central/page.tsx`, `pickup/page.tsx`, `scheduled/page.tsx` — replaced an unconditional `NotTakingOrders` placeholder with the real `FoodCentralMenuGrid` listing.
- `storefront/src/modules/products/components/product-preview/index.tsx` — the listing card's "Sold out" logic now also checks `isFoodCentralUnavailable`, labeled "Unavailable" (a distinct concept from Wine & Spirits' stock-based "Sold out," per §6) rather than reusing the same label.
- `storefront/src/modules/products/components/product-actions/index.tsx` — the PDP's `inStock`/Add-to-Cart logic now also checks `isFoodCentralUnavailable`, with dedicated "This dish is currently unavailable"/"Unavailable" messaging distinct from the stock-based "Out of stock" path.
- `storefront/src/lib/data/orders.ts` — `retrieveOrder`/`listOrders` fields extended with `+metadata` (dropped by default once either function supplies its own explicit `fields`, the same additive-fields gotcha `listProducts` fixed in Milestone 9) and, for `listOrders`, `+items.product.food_details.id` so the account order list can detect Food Central items.
- `storefront/src/modules/order/components/order-details/index.tsx` — removed a private, duplicate `formatStatus` helper in favor of the already-shared `lib/util/order-status.ts` formatter (a pre-existing inconsistency, not introduced here), and fixed a pre-existing `sata-testid` typo (should have been `data-testid`) on the payment-status element.
- `storefront/src/modules/order/templates/order-details-template.tsx`, `order-completed-template.tsx` — both now render `FoodOrderStatus` alongside the existing `OrderDetails` block.
- `storefront/src/modules/account/components/order-card/index.tsx` — shows a second badge with the current food-order stage, when applicable, alongside the existing native fulfillment-status badge.

**Not changed, and explicitly out of scope:** the "Available to schedule" third availability state, the same-day cutoff countdown, any scheduling-picker UI, and kitchen-operating-hours gating — all depend on delivery-slot storefront wiring and cutoff timing still explicitly "not yet built"/"not yet decided" per `09_FOOD_ORDERING_SPECIFICATION.md` §25, the same gap Checkout (Milestone 13) already deferred true per-fulfillment-group slot selection on. One already-documented, systemic Design-System-level color-contrast violation (`ui-fg-muted`/`ui-fg-interactive`, from the vendored `@medusajs/ui-preset` token layer, first flagged in Milestone 7 under the shared `Button` component) was reconfirmed present on the new pages via this milestone's own axe-core scans and deliberately left unaltered, per the same precedent.

**Also updated:** `storefront/README.md` (new "Milestone 15" section). `docs/PROJECT_STATUS.md` (→ v6.1), `docs/AI_HANDOFF.md` (→ v5.7), `docs/DECISION_LOG.md` (new entry, → v3.3), `docs/ROADMAP.md` (→ v6.3).

## v58 — 2026-07-20 — Milestone 14: Customer Account (`08_CUSTOMER_ACCOUNT_SPECIFICATION.md`)

**Context:** With Checkout (Milestone 13) complete, Customer Account was the confirmed next specification in Paul's approved implementation order — built on top of the vendored template's existing account module, which turned out to be partly stubbed (password change, email change) and partly missing (password reset, reordering, notification preferences, privacy/deletion) relative to the frozen specification. Built under the standing autonomous-continuation authorization; full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/modules/account/components/forgot-password/index.tsx`, `reset-password/index.tsx`, `storefront/src/app/[countryCode]/(main)/reset-password/page.tsx` — the full password-reset flow (§9), never confirming or denying account existence.
- `storefront/src/modules/account/components/privacy-security/index.tsx`, `storefront/src/app/.../account/@dashboard/privacy/page.tsx` — real data visibility plus a real, password-gated account deletion/deactivation request pathway (§17, §18).
- `storefront/src/modules/account/components/notification-preferences/index.tsx`, `storefront/src/app/.../account/@dashboard/notifications/page.tsx` — an honest informational stub (§16 — no channel/provider module exists yet).
- `storefront/src/modules/account/components/reorder-button/index.tsx` — the re-validating Reorder action (§15).
- `storefront/src/lib/util/reorder.ts`, `lib/util/__tests__/reorder.test.ts` — the pure reorder availability/quantity decision function, unit-tested.
- `storefront/src/lib/util/order-status.ts` — shared order-status formatting.

**Changed:**

- `storefront/src/lib/data/customer.ts` — added `requestPasswordReset`, `completePasswordReset`, `updateCustomerPassword` (real implementation, current-password re-verification), `requestAccountLifecycleChange` (deletion/deactivation request-intake); rewrote `addCustomerAddress`/`updateCustomerAddress` to freeform fields with default-address exclusivity enforced client-side (no backend constraint exists); removed the broken email-update stub.
- `storefront/src/lib/data/orders.ts` — added `reorderItems`, re-validating each line against current stock/availability via the Store API.
- `storefront/src/lib/util/cart-fulfillment.ts` — added `hasRealAddress()`, applied across six checkout call sites (`checkout-form`, `payment-button`, `review`, `shipping`, `shipping-address`, `addresses`) that had all been treating Medusa's eagerly-created, still-empty cart address record as if it were a real, submitted address since Milestone 13.
- `storefront/src/modules/common/components/input/index.tsx` — added `id={name}` to the underlying `<input>`, fixing a critical, platform-wide `label` association bug (no text field built from this shared component had ever had a working accessible label) and password show/hide toggle `aria-label`/`aria-pressed`.
- `storefront/src/modules/common/components/checkbox/index.tsx` — accepts an `id` prop (previously hardcoded, colliding whenever more than one checkbox rendered on a page).
- `storefront/src/modules/account/components/account-info/index.tsx` — added `inert` to collapsed edit panels (previously stayed interactive despite being invisible, intercepting clicks meant for other fields) and live-region announcements for success/error states.
- `storefront/src/modules/account/components/address-card/add-address.tsx`, `edit-address-modal.tsx`, `address-book/index.tsx` — freeform fields matching Checkout's own model, a "Default" badge, and a "use as default" checkbox.
- `storefront/src/modules/account/components/profile-password/index.tsx` — real implementation (previously `console.info("not implemented")`).
- `storefront/src/modules/account/components/profile-email/index.tsx` — read-only display with an honest limitation note (see `DECISION_LOG.md`'s Auth-architecture finding).
- `storefront/src/modules/account/components/order-card/index.tsx`, `overview/index.tsx` — real order status badges, a Reorder action, fixed heading structure and invalid list markup.
- `storefront/src/modules/account/components/account-nav/index.tsx` — added Notifications/Privacy & Security links; fixed a heading-order break (a nav-section label was itself an `<h3>` positioned ahead of every page's own `<h1>`).
- `storefront/src/modules/account/templates/account-layout.tsx`, `login-template.tsx` — heading-order fix; added the Forgot Password view.
- `storefront/src/modules/account/components/register/index.tsx`, `transfer-request-form/index.tsx`, and various page metadata — removed residual "Medusa Store" branding; fixed a heading-order break; added `robots: { index: false, follow: false }` across every account/reset-password/verify-account route.
- `storefront/src/app/.../account/@dashboard/orders/page.tsx` — removed a false "you can also create returns or exchanges" claim (no returns pathway exists, pending the still-open alcohol-return policy).
- `storefront/src/modules/order/templates/order-details-template.tsx` — added the Reorder action to Order Details.

**Deleted:** `storefront/src/modules/account/components/profile-billing-address/index.tsx` — a vendored apparel-store "Billing address" Profile section that duplicated and conflicted with the frozen specification's own unified Saved Addresses concept.

**Not changed, and explicitly out of scope:** real notification-channel toggles (no provider module exists); automated, policy-enforcing account deletion/deactivation (§18's policy itself is open); multi-factor authentication and concurrent-session management UI (Session & Security Behaviour names these as implementation parameters, not required). One already-documented, systemic Design-System-level color-contrast violation (the shared `Button`/`text-ui-fg-interactive` tokens, first flagged in Milestone 7) was reconfirmed present via this milestone's own axe-core scans and deliberately left unaltered, per the same precedent.

**Also updated:** `storefront/README.md` (new "Milestone 14" section). `docs/PROJECT_STATUS.md` (→ v6.0), `docs/AI_HANDOFF.md` (→ v5.6), `docs/DECISION_LOG.md` (new entry, → v3.2), `docs/ROADMAP.md` (→ v6.2).

## v57 — 2026-07-19 — Milestone 13: Checkout (`07_CHECKOUT_SPECIFICATION.md`)

**Context:** With Cart (Milestone 12) complete, Checkout was the confirmed next and final individual specification in Paul's approved implementation order. Before any UI work, this milestone found the environment had **zero shipping options anywhere** (`GET /admin/shipping-options` returned empty) — Milestone 1's seed had deliberately stopped at region/store/sales-channel, so checkout could not function at all without real fulfillment infrastructure. Minimal, *permanent* (not QA-only) infrastructure was seeded first: two Fulfillment Sets on the existing "LiquorCentral Lagos Warehouse" stock location, using Medusa's native `manual_manual` provider. Built under the standing autonomous-continuation authorization; full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/lib/hooks/use-focus-step-heading.ts` — shared focus-management hook moving focus to a checkout step's heading whenever that step becomes active (§22).
- `storefront/src/modules/checkout/components/delivery-eligibility-conflict/index.tsx` — the delivery-eligibility blocking-condition banner (§8/§11), with "change delivery address," "remove the Food Central item(s)," and "choose pickup" resolution paths.
- `storefront/src/lib/util/cart-fulfillment.ts` gained `isLagosAddress`, `hasFoodCentralItems`, `isPickupShippingMethod`, and `hasUnresolvedDeliveryConflict` — the address/eligibility blocking-condition logic, reused identically by the conflict banner and the payment step's order-placement gate.
- **Permanent backend seed (Admin API, not code):** Fulfillment Set "LiquorCentral Nationwide Delivery" (type `shipping`, service zone "Nigeria," one flat ₦3,000 "Standard Delivery" Shipping Option) and Fulfillment Set "LiquorCentral Pickup" (type `pickup`, service zone "Lagos Island Pickup," one flat ₦0 "Pickup — Lagos Island" Shipping Option) — both on the `manual_manual` fulfillment provider, enabled on the Lagos Warehouse stock location.

**Changed:**

- `storefront/src/modules/checkout/components/shipping-address/index.tsx`, `billing_address/index.tsx` — rewritten: removed `postal_code`/`company`, added a "Landmark or additional directions (optional)" field, relabeled fields for a freeform Nigerian address model, fixed country via a hidden input (no visible dropdown — the region has exactly one country).
- `storefront/src/lib/data/cart.ts`'s `setAddresses` — fixed to read the real `address_2` form value (previously always hardcoded to `""`); removed `postal_code`/`company` from the address payloads sent to the backend.
- `storefront/src/modules/checkout/templates/checkout-form/index.tsx` — computes the delivery-eligibility conflict and renders the new banner conditionally; adds a page-level, visually-hidden `<h1>Checkout</h1>` (§22 — no checkout step had ever had a top-level heading).
- `storefront/src/modules/checkout/components/review/index.tsx` — added `hasDeliveryConflict` (gating `PaymentButton`) and a restated age-verification reminder for carts containing Wine & Spirits items.
- `storefront/src/modules/checkout/components/payment-button/index.tsx` — added an optional `notReady` prop, ORed into the existing readiness checks.
- `storefront/src/modules/checkout/components/error-message/index.tsx` — added `role="alert" aria-live="assertive"` (§21/§22).
- `storefront/src/modules/common/components/radio/index.tsx` — **critical accessibility fix**: replaced a nested `<button role="radio" aria-checked="true">` (hardcoded `"true"` regardless of the real `checked` prop) with a plain `aria-hidden` decorative `<span>`; every consumer already wraps it in its own semantic interactive control. Found via the first-ever live axe-core scan against a real Shipping Option.
- `storefront/src/modules/cart/templates/preview.tsx`, `storefront/src/modules/order/components/items/index.tsx` — rewritten to group into "Wine & Spirits"/"Food Central" sections with per-group subtotals, reusing Milestone 12's `cart-fulfillment.ts` utilities unchanged.
- `storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx` — expanded `retrieveCart` fields; added `robots: { index: false, follow: false }`; redirects to `/cart` on an empty cart or a confirmed-zero-stock Wine & Spirits item.
- `storefront/src/lib/data/orders.ts`'s `retrieveOrder` — added `+items.product.food_details.*,+items.product.wine_details.*` to its previously non-overridable fields string.
- `storefront/src/app/[countryCode]/(main)/order/[id]/confirmed/page.tsx` — added `robots: { index: false, follow: false }`.

**Not changed, and explicitly out of scope:** true per-fulfillment-group delivery-method/slot selection (§9/§10 — one combined shipping-method selection serves the whole cart instead, since the `delivery-slot` module has no storefront wiring); real Paystack integration (module not yet built; `pp_system_default` used as placeholder); cash-on-delivery (already resolved as not supported); a hard age-recheck at order confirmation (still an open business decision, only restated); a real notification channel (channel undecided).

**Also updated:** `storefront/README.md` (new "Milestone 13" section). `docs/PROJECT_STATUS.md` (→ v5.9), `docs/AI_HANDOFF.md` (→ v5.5), `docs/DECISION_LOG.md` (new entry, → v3.1), `docs/ROADMAP.md` (→ v6.1).

## v56 — 2026-07-19 — Milestone 12: Cart (`06_CART_SPECIFICATION.md`)

**Context:** With Product Details (Milestone 11) complete, Cart was the confirmed next specification in Paul's approved implementation order — the natural destination of every add-to-cart action built across Product Listing and Product Details. Built under the standing autonomous-continuation authorization; this session's environment started from a completely fresh database (zero products), so visual and accessibility validation used one low-stock QA wine product, one QA food product, and a temporary `gift-wrap` product, all created via the Admin API and fully deleted afterward, including the temporary admin account (deleted via a `medusa exec` script against the User module directly, the same workaround Milestone 11 established). Full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/lib/util/cart-fulfillment.ts` — the core fulfillment-leg grouping/stock/subtotal utility: `isFoodCentralItem` (the same `food_details` presence check every prior specification's implementation already established), `splitGiftWrapLines` (separates a metadata-linked gift-wrap line from its parent product line), `isStockManaged`/`getAvailableStock` (never defaults an unknown stock count to zero), and `groupSubtotal`.
- `storefront/src/modules/cart/components/fulfillment-group/index.tsx` — renders one fulfillment-leg group (heading, delivery messaging, item table, subtotal); returns nothing when the group has no items.
- `storefront/src/lib/data/products.ts`'s `getVariantInventoryMap` — a small batch `/store/products?id[]=...` lookup used to get each Wine & Spirits line item's genuine available stock, since the cart module's own field expansion never populates `inventory_quantity` (confirmed by direct testing).
- `storefront/src/lib/data/cart.ts`'s `addGiftWrapToLineItem` — adds a gift-wrap line item tagged with `{ gift_wrap_for: <parentLineItemId> }` metadata, the mechanism `splitGiftWrapLines` reads back.
- `storefront/src/lib/util/__tests__/cart-fulfillment.test.ts` — 14 new unit tests covering the grouping/stock/subtotal utilities.

**Changed:**

- `storefront/src/modules/cart/components/item/index.tsx` — rewritten: replaces the vendored `CartItemSelect`/hardcoded-10 quantity dropdown with the shared `QuantityStepper` (Milestone 11), capped by real stock for Wine & Spirits; adds a per-item Gift Wrap checkbox for Wine & Spirits lines; fixes the remove action's accessible name; adds an in-place "Currently unavailable" notice.
- `storefront/src/modules/products/components/quantity-stepper/index.tsx` — gained an optional `min` prop (default `1`, unchanged for the PDP); the cart passes `min={0}` so decrementing to zero triggers an immediate removal (§7), rather than duplicating the component.
- `storefront/src/modules/products/components/product-actions/index.tsx` and `lib/data/cart.ts`'s `addToCart` — the PDP's own add-to-cart-with-gift-wrap flow now tags the wrap with the same `gift_wrap_for` metadata as the cart's own toggle (previously two independent, non-interoperable code paths); `addToCart` now returns the created line item so its id is available to link against.
- `storefront/src/modules/common/components/cart-totals/index.tsx` — delivery fee and tax now state "Calculated at checkout" explicitly instead of a literal, misleading ₦0 (§8/Pricing Transparency), with an explicit "+ delivery & tax, calculated at checkout" caveat on the item total; wrapped in `role="status" aria-live="polite"` (§23).
- `storefront/src/modules/common/components/delete-button/index.tsx` — gained an `aria-label` prop for icon-only usages with no visible text children.
- `storefront/src/modules/cart/templates/items.tsx`, `index.tsx` — rewritten to assemble two `FulfillmentGroup` instances (Wine & Spirits, Food Central) instead of one flat table; added a native `<details>` "Why is my cart split?" disclosure for mixed carts, a top-level `<h1>`, and a stock/price-notice banner.
- `storefront/src/app/[countryCode]/(main)/cart/page.tsx` — rewritten: expanded `retrieveCart` fields for grouping/stock/gift-wrap; added `robots: { index: false }` (§25); implemented server-side stock re-validation (§12/§13) that auto-adjusts a line item down with a visible notice when genuine stock has fallen below what's in the cart, or labels it unavailable in place (never removes it) at zero stock — calling the Medusa SDK directly rather than the cache-tag-revalidating `updateLineItem` helper, since Next.js forbids `revalidateTag` during a page's render (confirmed by direct testing — it throws).
- `storefront/src/modules/cart/components/cart-item-select/index.tsx` — deleted; no longer used once `Item` was rewritten to use `QuantityStepper`.

**Not changed, and explicitly out of scope:** Saved-for-Later (§14 — a new, not-yet-approved recommendation requiring backend scoping); cart-level cross-selling (§18 — the same unscoped "pairs with" gap six prior specifications have already flagged); a price-change-since-added notice (§8/§19 — deliberately not implemented without real catalog data to validate the comparison against, flagged for a future pass). One already-documented, systemic Design-System-level color-contrast violation (the shared `Button`/`text-ui-fg-interactive` tokens, first flagged in Milestone 7) was reconfirmed present via this milestone's own axe-core scan and deliberately left unaltered, per the same precedent.

**Also updated:** `storefront/README.md` (new "Milestone 12" section). `docs/PROJECT_STATUS.md` (→ v5.8), `docs/AI_HANDOFF.md` (→ v5.4), `docs/DECISION_LOG.md` (new entry, → v3.0), `docs/ROADMAP.md` (→ v6.0).

## v55 — 2026-07-19 — Milestone 11: Product Details (`05_PRODUCT_DETAILS_SPECIFICATION.md`)

**Context:** With Search (Milestone 10) complete, Product Details was the confirmed next specification in Paul's approved implementation order — the natural destination of every product card built across Navigation, Homepage, Product Listing, and Search. Built under the standing autonomous-continuation authorization; visual and accessibility validation used two temporary QA-only products (one per catalog) plus a temporary `gift-wrap` product, all fully deleted via the Admin API afterward, including both temporary admin accounts (deleted via a `medusa exec` script against the User module directly, since the API layer refuses self-deletion and no second real admin credential was available — a cleaner resolution than Milestone 9's leftover account, without needing Milestone 10's cross-delete workaround). Full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/modules/products/components/wine-fact-sheet/index.tsx` and `food-fact-sheet/index.tsx` — the catalog-specific structured fact sheets (§10–§13), reading `wine_details`/`food_details` directly and omitting any field genuinely absent for a given product (§23) rather than rendering an empty row.
- `storefront/src/modules/products/components/quantity-stepper/index.tsx` — a numeric stepper (§17) with a real, associated label; capped by genuine available stock for Wine & Spirits, uncapped for Food Central. Previously entirely absent — the vendored template always added quantity 1.
- `storefront/src/modules/products/components/gift-wrap-addon/index.tsx` and `lib/data/products.ts`'s `getGiftWrapProduct` — the Gift Wrap add-on (§16), rendering only when a real product with handle `gift-wrap` exists; otherwise correctly absent, not a placeholder.
- `storefront/src/modules/products/components/trust-and-delivery/index.tsx` — Trust Signals, Delivery Information, and Pickup Information (§19–§21) as their own page section, stating the platform's current launch-scope delivery areas and an honest, catalog-appropriate return/age-verification statement.

**Changed:**

- `storefront/src/modules/products/components/image-gallery/index.tsx` — gained click-to-zoom (a Headless UI Dialog lightbox showing a plain, unmodified `<img>` so mobile pinch/double-tap works natively, §6), distinct descriptive alt text per image, and a single honest placeholder when no images are configured (§23) instead of a blank region.
- `storefront/src/modules/products/components/product-actions/index.tsx` — gained the quantity stepper, the Gift Wrap add-on, an inline `role="status" aria-live="polite"` add-to-cart confirmation alongside the existing toast (§18, §25), and an explicit "out of stock" text reason.
- `storefront/src/modules/products/components/product-tabs/index.tsx` and `accordion.tsx` — replaced the vendored template's generic apparel-oriented "Material/Country of origin/Weight/Dimensions" tab and its fabricated "no questions asked" refund/exchange copy (neither applicable to wine or food, and the refund claim was flatly inaccurate given the still-open alcohol-return policy) with the real fact sheets. Also fixed two genuine, newly-surfaced axe-core accessibility violations in the shared Accordion: a critical missing accessible name on the chevron-only trigger button (fixed by making the whole labeled header row the trigger), and a heading-order skip introduced by promoting the product title to `<h1>` (fixed with `asChild` + a real `<h2>`, safe since this accordion has a single consumer).
- `storefront/src/modules/products/templates/product-info/index.tsx` — product title promoted from `<h2>` to `<h1>`, fixing a confirmed `page-has-heading-one` violation (no PDP had a top-level heading at all).
- `storefront/src/modules/products/templates/index.tsx` — added `Product`/`Offer` JSON-LD, corrected the breadcrumb's middle segment to link to a route that actually exists (`/store` for Wine & Spirits, `/food-central` for Food Central — this codebase has no unifying "Wine & Spirits"/"Food Central" root category), and assembled the page per §5's section order.
- `storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx` — descriptive, unique meta title/description per product (§27), no longer a templated string.

**Not changed, and explicitly out of scope:** Pairing Recommendations (§14, "pairs with" — the same unscoped backend relationship four prior specifications have already flagged, now a fifth); customer reviews (§22 — none exist in v1). One already-documented, systemic Design-System-level color-contrast violation (the shared `Button` component's primary variant, first flagged in Milestone 7) was reconfirmed present via this milestone's own axe-core scan and deliberately left unaltered, per the same precedent.

**Also updated:** `storefront/README.md` (new "Milestone 11" section). `docs/PROJECT_STATUS.md` (→ v5.7), `docs/AI_HANDOFF.md` (→ v5.3), `docs/DECISION_LOG.md` (new entry, → v2.9), `docs/ROADMAP.md` (→ v5.9).

## v54 — 2026-07-19 — Batch business-decision approval; Milestone 10: Search (`03_SEARCH_SPECIFICATION.md`)

**Context:** Paul supplied a large batch of previously-open business decisions in one direction — payment provider (Paystack, no COD), notification channels (Email/WhatsApp/in-app), launch delivery areas and pricing, operating hours, inventory policy, unified search with catalog badges, MVP checkbox age verification, guest checkout reaffirmed, currency/tax display, coupon capability, loyalty/wishlist scope — together with a confirmed specification implementation order and a standing instruction to keep building continuously without stopping for per-milestone approval. Full reasoning in `DECISION_LOG.md`'s two new entries (the decision batch, and Milestone 10 itself).

**Documentation-only changes** (no code): `docs/DECISION_LOG.md` (new entry recording the full batch), `docs/PROJECT_STATUS.md` (Blockers and Decisions-awaiting-approval sections struck through where resolved, → v5.5), `docs/AI_HANDOFF.md` (Section 3, Section 11 new rules 13–14, versioning table, → v5.1), `docs/ROADMAP.md` (payment/notification blocker bullets, → v5.8).

**Added (new, `storefront/` — not part of `/docs`):**

- No new components — Milestone 10 (Search) reuses Product Listing's existing card/sort/Load-More/empty-state infrastructure entirely.

**Changed:**

- `storefront/src/app/[countryCode]/(main)/search/page.tsx` — rewritten from a flat, uncapped 24-product list into a real results page: `RefinementList` (sort), `PaginatedProducts` (Load More, catalog badges), a distinct pre-query state (§19) separate from a genuine zero-result state (§18), and an honest two-tier zero-result recovery (no fabricated "did you mean," which needs Meilisearch's real typo-distance data).
- `storefront/src/modules/products/components/product-preview/index.tsx` — gained a `showCatalogBadge` prop: on search results only, the card's existing one-fact slot (Milestone 9) carries a "Food Central"/"Wine & Spirits" identity badge instead of Food Central's prep-time fact — the new cross-catalog-labeling business requirement, implemented without a second card design.
- `storefront/src/modules/store/templates/paginated-products.tsx` — gained `query` (mapped to the Store API's native `q` parameter), `showCatalogBadge`, `itemNoun`, and empty-state copy override props, plus a `role="status"` result-count live region (§22) — all additive, category/collection listings unaffected.
- `storefront/src/modules/store/components/refinement-list/sort-products/index.tsx` (and `refinement-list/index.tsx`) — gained a `defaultSortLabel` prop so the identical no-op "featured" sort value reads "Featured" on listings and "Relevance" on search (§14), without a second sort mechanism.

**Not changed, and explicitly out of scope:** Meilisearch-backed typo tolerance, synonyms, autocomplete, editorial boosting, and faceted search results (§7, §8, §9, §11, §13 — Meilisearch remains unapproved); search-within-category (§4, §15/§16); the "pairs with" cross-sell (§17, unbuilt data model). No planning document's substance was altered.

**Also updated:** `storefront/README.md` (new "Milestone 10" section, including the visual-validation findings and the cross-catalog-badge proof methodology). `docs/PROJECT_STATUS.md` (→ v5.6), `docs/AI_HANDOFF.md` (→ v5.2), `docs/DECISION_LOG.md` (new entry, → v2.8).

## v53 — 2026-07-19 — Milestone 9: Product Listing (`04_PRODUCT_LISTING_SPECIFICATION.md`)

**Context:** With Homepage (Milestone 8) complete, and under Paul's standing autonomous-continuation authorization, Product Listing was chosen as the next milestone — unblocked, and the natural destination of links already built by Navigation's mega menu and Homepage's Food Central Spotlight. The standing visual-validation requirement (in force since Milestone 8) applied here too; since this project has never seeded a single catalog product, temporary QA-only products were created via the Admin API for screenshot purposes and fully deleted afterward. Full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/modules/products/components/product-preview/quick-add-button.tsx` — the card's quick-add sibling control (§9): catalog-weighted visual weight (Food Central primary/full-width, Wine & Spirits secondary text-link), single-variant auto-resolution with a "Select options" fallback for multi-variant products, inline "Adding…"/"Added ✓" confirmation, and reuse of the existing `CartDropdown`'s item-count auto-open for persistent confirmation rather than a second mechanism.
- `storefront/src/modules/store/components/load-more/index.tsx` — replaces the vendored classic page-number `Pagination` component (deleted, zero remaining references) with §13's "Load More" pattern: URL-reflected cumulative page count, a real keyboard-operable button, and a polite live-region announcement of newly-loaded results.

**Changed:**

- `storefront/src/modules/products/components/product-preview/index.tsx` — rewritten around the Product Card Information Hierarchy: at most one of a promotional badge or catalog-specific supporting fact (today, only ever Food Central's prep-time fact — no promotional-badge mechanism exists yet), an always-shown "Sold out" availability label separate from that one-fact cap, and quick-add moved outside the card's one real link (previously the entire card, including where quick-add would go, was one `<a>`).
- `storefront/src/lib/data/products.ts` — `listProductsWithSort` gained a `cumulative` mode for Load More's URL semantics; **a genuine latent bug fixed**: `listProducts`' `fields` query parameter was silently replacing, not extending, the function's default field set, meaning any caller requesting extra fields (Food Central Spotlight, built in Milestone 8) had been silently losing pricing/variant data since that milestone shipped. Now merges additively.
- `storefront/src/modules/store/templates/paginated-products.tsx` — rewritten for cumulative Load More fetching and a real §21 empty state (`EmptyState`, reused from Phase 0c) with a sibling-category fallback link, replacing the vendored classic-pagination markup.
- `storefront/src/modules/store/components/refinement-list/sort-products/index.tsx` — "Featured" added as the default sort option (§11); documented in-code as an honest no-op fallthrough, since no merchandising-rank field exists to sort by.
- `storefront/src/modules/products/components/thumbnail/index.tsx` and every call site (product cards, cart, order history, account) — added a real `alt` prop and passed actual product/item titles, replacing the hard-coded generic `alt="Thumbnail"` (§24/§111).

**Removed:** `storefront/src/modules/store/components/pagination/index.tsx` — the vendored classic page-number pagination component, fully superseded by Load More.

**Not changed, and explicitly out of scope:** Filtering/facets (§10 — same Meilisearch-approval gate as Search); the "pairs with" cross-sell; a real promotional-badge mechanism and a real "Featured" merchandising order (both need Paul's attribute-field-list approval); navigation/homepage/listing analytics events (no analytics infrastructure exists yet). The pre-existing, systemic `Button` primary-variant contrast issue and the vendored "Sort by"/price-text contrast issue (documented since Milestone 7) remain unaltered. No planning document's substance was altered.

**Also updated:** `storefront/README.md` (new "Milestone 9" section, including the visual-validation findings and the temporary-QA-data methodology). `docs/PROJECT_STATUS.md` (→ v5.4), `docs/ROADMAP.md` (→ v5.7), `docs/AI_HANDOFF.md` (→ v5.0), `docs/DECISION_LOG.md` (new entry, → v2.6).

## v52 — 2026-07-19 — Milestone 8: Homepage (`02_HOMEPAGE_SPECIFICATION.md`)

**Context:** With Navigation (Milestone 7) complete, Paul directed Homepage as the next individual specification — the primary entry point, with no external blocking dependencies unlike Search (Meilisearch) or Checkout (payment provider). **A new project-wide requirement took effect mid-milestone: every UI-changing milestone's completion report must include real browser screenshots of every significant state**, not just automated-check output — now standing practice, logged in `docs/AI_HANDOFF.md` §11 rule 12. Full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/src/modules/home/components/age-gate/{index.tsx,constants.ts}` — the site-wide Age Verification Gate (§8.2), mounted in the shared `(main)` layout. Built on Headless UI's `Dialog` with a deliberately no-op `onClose` so `Escape`/outside-click cannot silently bypass a legal gate — only the two explicit confirm/decline actions can close it.
- `storefront/src/modules/home/components/{hero,curated-collections,food-central-spotlight,trust-delivery-band,returning-customer-strip}` — the remaining §7 homepage sections. Hero and Trust & Delivery Band copy is Paul's own already-finalized `BRAND_IDENTITY.md` text (§10 Positioning Statement, §11 Value Proposition, §8.7/§13's required trust statements), not invented. Curated Collections and Food Central Spotlight both correctly render their §19 empty states today (no Collections or products of either catalog have ever been seeded) — reusing `NotTakingOrders` from Milestone 7 rather than a second empty-state implementation.
- `storefront/src/modules/home/components/age-gate/__tests__/age-gate.test.tsx` — 5 new Jest/RTL tests, including one specifically asserting `Escape` does not close the gate.

**Changed:**

- `storefront/src/app/[countryCode]/(main)/page.tsx` — replaced the vendored "Ecommerce Starter Template" placeholder homepage entirely with the §7 section list; "Wine & Food, Connected" (§8.6) is deliberately absent per §19, since its "pairs with" backend relationship doesn't exist yet.
- `storefront/src/app/[countryCode]/(main)/layout.tsx` — mounts the Age Verification Gate site-wide, reading the incoming request's cookie to avoid a flash of the gate on return visits.
- `storefront/src/modules/layout/components/mega-menu/index.tsx` — **a genuine layout bug found only by a real screenshot, not by `tsc`, ESLint, Jest, or axe-core (all of which passed with the bug present)**: the panel's `absolute inset-x-0` resolved against the narrow trigger wrapper (which also carried `position: relative`) instead of the full-width header, squeezing all three mega-menu columns into a ~110px box with overlapping text. Fixed by removing `relative` from the trigger wrapper; re-screenshotted and confirmed correct.

**A second genuine bug, found through real end-to-end testing (confirm the gate, then reload):** a cookie-name constant re-exported from the `"use client"` `AgeGate` module resolved to `undefined` when imported by the server-rendered `(main)` layout — Next.js replaces a client module's exports with reference stubs for React Server Components serialization, which don't resolve plain data the same way. The gate reappeared on every reload despite the verification cookie being set correctly. Fixed by moving the constant to a boundary-free `constants.ts` file both the server layout and the client component import directly.

**Not changed, and explicitly out of scope:** `03_SEARCH_SPECIFICATION.md`'s own implementation; the "pairs with" relationship; navigation/homepage analytics events (§18, §25 — no analytics infrastructure exists anywhere in this project); a mobile accordion footer (§8.9 — Milestone 7's own component, flagged via Milestone 8's real mobile screenshots but not fixed here). The shared `Button` component's primary-variant contrast issue (documented since Milestone 7, confirmed systemic) remains unaltered — a Design-System-level concern, not this milestone's to resolve unilaterally. No planning document's substance was altered.

**Also updated:** `storefront/README.md` (new "Milestone 8" section, including the visual-validation findings above). `docs/PROJECT_STATUS.md` (→ v5.3), `docs/ROADMAP.md` (→ v5.6), `docs/AI_HANDOFF.md` (→ v4.8, new §11 rule 12 on the standing visual-validation requirement), `docs/DECISION_LOG.md` (new entry).

## v51 — 2026-07-19 — Milestone 7: Navigation (`01_NAVIGATION_SPECIFICATION.md`)

**Context:** With every remaining backend track (payment provider, notification provider, Food Central/Wine & Spirits fulfillment) confirmed blocked on an open business decision, and Phase 0c (Storefront Foundation) complete, Paul directed the first individual specification implementation on top of it: Navigation, chosen because it's the shared shell every other specification's page sits inside. Full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/apps/backend/` and `storefront/` — not part of `/docs`):**

- `backend/apps/backend/src/migration-scripts/navigation-category-seed.ts` — an idempotent script seeding the provisional Product Category tree §11 itself proposes as a non-final default (a "Spirits" parent plus Wines/Champagne/Beer/Gift Sets/Accessories as top-level entries) — the project had zero categories before this milestone. Food Central is deliberately not seeded as a category (§11/§14 treat it as a hardcoded structural branch, not category data).
- `storefront/src/modules/layout/components/{mega-menu,food-central-menu,mobile-nav-drawer,mobile-wayfinding-strip,search-field}` — the Wine & Spirits mega menu (§10, data-driven), the Food Central dropdown (§14, deliberately not data-driven), the mobile drawer (§7.3, replacing Phase 0c's placeholder `SideMenu`), the persistent mobile wayfinding strip (§7.2), and the header search field (§15, a real always-visible desktop input + one-tap mobile affordance).
- `storefront/src/lib/util/mega-menu.ts` (`groupCategoriesForMegaMenu`) — a pure, content-agnostic function distributing whatever top-level categories exist round-robin across mega-menu columns, since §11 is explicit the exact grouping is a merchandising decision, not an engineering one.
- `storefront/src/lib/hooks/use-hover-intent-open.ts` — fixes a genuine flash-open-then-close bug found with a real Playwright click (not by inspection): synthetically clicking a Headless UI `Popover` trigger on `mouseenter` (needed since Popover exposes no imperative `open()`) races a real click on the same element. Fixed with a short, cancellable hover-intent delay.
- `storefront/src/modules/common/components/breadcrumbs` — one reusable component (real `<nav aria-label="Breadcrumb">`, `aria-current="location"`, `BreadcrumbList` JSON-LD) wired into category, collection, and product detail pages (§18, §26).
- `storefront/src/app/[countryCode]/(main)/{search,food-central,food-central/scheduled,food-central/pickup,about,support,legal}` — a minimal native-search bridge page (§15, explicitly not `03_SEARCH_SPECIFICATION.md`'s Meilisearch-backed implementation); three Food Central placeholder destinations (§14/§24 — must never be a dead end); three footer placeholder pages for Company/Support/Legal (real pages, no invented brand/legal copy).

**Changed:**

- `storefront/src/modules/layout/templates/nav/index.tsx` — replaced the Phase 0c placeholder shell (logo + region/locale menu + Account/Cart only) with the mega menu, Food Central dropdown, search field, and mobile wayfinding strip.
- `storefront/src/modules/layout/templates/footer/index.tsx` — restructured from two ad hoc columns (Categories/Collections) into §8's five named groups (Shop, Food Central, Collections, Company, Support/Legal).
- `storefront/src/modules/categories/templates/index.tsx`, `collections/templates/index.tsx`, `products/templates/index.tsx` — wired in `Breadcrumbs`, replacing an ad hoc, non-semantic parent-chain rendering in the category template. Product detail's `listProducts` fields query gained `+categories.*` (never previously fetched).
- `storefront/src/modules/common/components/interactive-link/index.tsx` — **a genuine, newly-surfaced WCAG contrast violation found and fixed via real axe-core testing**: the vendored component (used for a category's in-page children sub-navigation, §11) used the old `text-ui-fg-interactive` preset color at 3.35:1 contrast; retokenized to the new `text-interactive` semantic token.
- `storefront/src/modules/layout/components/side-menu/` — deleted; fully superseded by `MobileNavDrawer`, which carries its region/language-selector functionality forward unchanged.

**Found via real axe-core/Playwright testing and deliberately *not* fixed (pre-existing, out of scope):**

- `text-ui-fg-muted` on the vendored "Sort by" control — the same violation already documented in `storefront/README.md` since Phase 0c, confirmed still present, still Product Listing's own future scope.
- White text on the shared `Button` component's `bg-primary` (#EC2D07) primary variant, measured at 4.24:1 against the required 4.5:1 — newly discovered by this milestone, but confirmed **systemic** (present on the pre-existing Cart page too, independent of any navigation change), not introduced here. A Design-System-level concern (one of `BRAND_IDENTITY.md`'s four fixed brand colors) — recorded, not altered, since neither is this milestone's decision to make.

**Not changed, and explicitly out of scope:** `03_SEARCH_SPECIFICATION.md`'s own ranking/typo-tolerance/synonyms/facets (Meilisearch, still pending formal approval); the "pairs with" cross-catalog relationship (§13/§14/§19 — the data model doesn't exist yet); faceted-URL canonicalization (§26 — no facets exist yet); navigation analytics events (§25 — no analytics infrastructure exists anywhere in this project); merchandising promotional-Collection cap/expiry enforcement (no Collections exist yet to enforce it against). No planning document's substance was altered.

**Also updated:** `storefront/README.md` (new "Milestone 7 — Navigation" section, `.env.local` created locally for build/lint validation, gitignored, not committed). `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/AI_HANDOFF.md`, `docs/DECISION_LOG.md`. `docs/implementation-planning/MODULE_INVENTORY.md` was not touched — it tracks backend modules/integrations only, and Navigation introduced neither.

## v50 — 2026-07-19 — Milestone 6: Phase 0c — Storefront Foundation

**Context:** Paul directed Phase 0c — Storefront Foundation: the reusable infrastructure (design tokens, layout shells, shared primitives, error/empty/toast/form infrastructure, testing) every future specification implementation sits on top of, explicitly not Homepage/Navigation/Search/Product Listing/Product Details/Cart/Checkout behavior itself. Full reasoning in `DECISION_LOG.md`.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/tailwind.config.js`, `storefront/src/styles/globals.css` — the full `DESIGN_SYSTEM.md` §B token system (three-tier color architecture, 7-step typography scale, elevation, radius, motion timing, `sm` breakpoint correction) as CSS custom properties + Tailwind extensions, additive to the vendored Medusa UI preset tokens (nothing removed, nothing broke).
- `storefront/src/modules/common/components/{empty-state,toast,form-field}`, `storefront/src/lib/hooks/use-blur-validation.ts` — new shared infrastructure: a generic empty-state shell, an `aria-live` toast provider/hook, and the canonical label/control/error form composition implementing `DESIGN_SYSTEM.md` §B9's "validate on blur" rule.
- `storefront/src/app/[countryCode]/error.tsx`, `storefront/src/app/global-error.tsx` — Next.js App Router error-boundary convention, previously entirely absent.
- `storefront/jest.config.js`, `storefront/jest.setup.js`, `storefront/.env.test` — a Jest + React Testing Library foundation (`next/jest`); 17 tests across 5 suites covering every new primitive.

**Changed:**

- `storefront/src/modules/common/components/ui/index.tsx` — retokenized in place (not duplicated): this file was already the vendored template's de facto shared component library (`Text`, `Heading`, `Button`, `Container`, `Badge`, `Input`, etc.), used by 20+ existing account/checkout/cart components, all of which now render with LiquorCentral tokens automatically with no behavior change. `Button`/`IconButton`/`Input` now enforce a 44×44px minimum touch target (`DESIGN_SYSTEM.md` §B11).
- `storefront/src/modules/layout/templates/{nav,footer}/index.tsx`, `(checkout)/layout.tsx` — retokenized; "Medusa Store" branding corrected to "LiquorCentral"; the vendored "Powered by Medusa & Next.js" CTA and GitHub/Docs/Source-code footer links removed (marketing content for the wrong product); `medusa-cta` component and its icon files deleted as now-unused. No `01_NAVIGATION_SPECIFICATION.md` behavior (mega menu, category tree, search) added.
- `storefront/src/app/layout.tsx`, `(main)/layout.tsx`, `(checkout)/layout.tsx` — a genuine pre-existing bug fixed: the root layout wrapped every page in its own `<main>`, and `(main)/layout.tsx` didn't render one at all, leaving zero or two `<main>` landmarks depending on route. Fixed to exactly one `<main id="main-content">` per page, paired with a new skip-to-content link in each route group.
- `storefront/src/modules/layout/components/cart-dropdown/index.tsx` — **two genuine, pre-existing WCAG violations found and fixed via real axe-core testing** against the live, backend-connected storefront (not just markup review): a `<button>` (Headless UI's `PopoverButton`) wrapping a nested `<a>` (`nested-interactive`, serious), then — after an intermediate fix attempt — an invalid `aria-expanded` on a bare `<span>` (`aria-allowed-attr`, critical). Resolved by rendering `PopoverButton` `as={LocalizedClientLink}` directly, keeping exactly one interactive element while preserving the `aria-expanded` state Headless UI injects. Homepage/Store/Cart pages all now score zero axe violations for WCAG 2A/2AA on shell chrome.

**Not changed, and explicitly out of scope:** no Homepage/Navigation/Search/Product Listing/Product Details/Cart/Checkout *behavior* was implemented anywhere — the Homepage's own vendored hero placeholder ("Ecommerce Starter Template") is deliberately untouched. One further axe-core finding (a color-contrast failure on the vendored Store listing page's "Sort by" control) was found and deliberately **not** fixed, since it lives in Product Listing behavior outside this milestone's scope — recorded in `storefront/README.md` for `04_PRODUCT_LISTING_SPECIFICATION.md`'s future implementation. No specific display typeface was chosen (`font-display` is a generic system-serif stack; `BRAND_GUIDELINES.md` has not yet selected one). No planning document's substance was altered.

**Also updated:** `docs/PROJECT_STATUS.md` (→ v5.1), `docs/ROADMAP.md` (→ v5.4) — Phase 0c marked ✅ complete. `docs/DECISION_LOG.md` (new entry with full reasoning and validation detail). `storefront/README.md` (new "Phase 0c" section).

## v49 — 2026-07-19 — Milestone 5: storefront scaffold stood up

**Context:** Continuing Paul's autonomous-continuation authorization from Milestone 4. Milestones 5 (local payment provider) and 6 (notification provider), in the original priority order, were both found blocked on genuine open business decisions (provider choice; a still-Draft Tier B document) — recorded in `DECISION_LOG.md`'s Milestone 4 entry. Paul confirmed proceeding to the storefront scaffold instead, per `IMPLEMENTATION_READINESS_REPORT.md` §5's explicit "begin now" authorization for Wine & Spirits' browse-through-checkout track.

**Added (new, `storefront/` — not part of `/docs`):**

- `storefront/` — Medusa's official DTC Starter Next.js app (`apps/storefront` extracted from `github.com/medusajs/dtc-starter`), wired to the real backend: a real Nigeria region (`NEXT_PUBLIC_DEFAULT_REGION=ng`), and a real publishable API key created via the Admin API and scoped to the "LiquorCentral Storefront" sales channel Milestone 1 seeded. Includes its own `README.md`.
- `@medusajs/js-sdk`, `@medusajs/icons`, `@medusajs/types` pinned to `2.17.2` (matching the backend exactly); `eslint` bumped to `8.57.1` to satisfy `eslint-config-next`'s actual peer requirement.

**Changed (mechanical type/lint fixes in the vendored template, no business logic touched):**

- `src/lib/data/cart.ts` — `setAddresses`' dynamically-built address objects cast through `unknown` rather than `any`; three `catch (e: any)` blocks narrowed to `catch (e)` with an `instanceof Error` check; two placeholder (upstream-commented-out) gift-card functions' unused params prefixed with `_`.
- `src/modules/checkout/components/shipping/index.tsx` — prop type widened to `StoreCartShippingOptionWithServiceZone` (the type the endpoint actually returns); `formatAddress` narrowed to the minimal structural type it actually reads.
- `src/modules/common/components/line-item-price/index.tsx`, `line-item-unit-price/index.tsx` — `total`/`original_total` defaulted to `0` when `undefined`.
- `src/modules/layout/components/country-select/index.tsx` — `CountryOption` fields widened to optional, with a guard.
- `src/modules/layout/components/language-select/index.tsx` — two now-unnecessary `@ts-ignore` comments removed.

**Corrected mid-flight, not a repeat mistake left uncorrected:** the first clone was `medusajs/nextjs-starter-medusa`, which displays its own deprecation notice pointing to `medusajs/dtc-starter` — discovered before any tracking-document update referenced it, so no doc ever recorded the wrong repository; the deprecated clone was discarded and replaced before this entry was written.

**Not changed:** no LiquorCentral branding, color, typography, or custom component was applied — the starter's own default UI runs as-is. No planning document's substance was altered.

**Also updated:** `docs/PROJECT_STATUS.md` (→ v5.0), `docs/ROADMAP.md` (→ v5.3) — Phase 1's storefront bullet marked ✅ complete. `docs/DECISION_LOG.md` (new entry with the deprecated-repo discovery and full validation detail).

## v48 — 2026-07-19 — Milestone 4: `delivery-slot` module implemented

**Context:** Paul directed autonomous continuation of implementation through the remaining launch-critical backend milestones, per the Approved `IMPLEMENTATION_READINESS_REPORT.md` and the exact architecture in `TIER_B_DELIVERY_SLOT_MODULE.md`. Full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/` — not part of `/docs`):**

- `backend/apps/backend/src/modules/delivery-slot/` — a custom Medusa module (data model, service, migration) holding a bookable time window (`starts_at`/`ends_at`/`cutoff_at`) and two operational numbers (`capacity`/`booked_count`), linked to Fulfillment's Shipping Option via `src/links/delivery-slot-shipping-option.ts` (many slots to one option, not 1:1). Includes its own `README.md`, naming the deliberately-absent pickup/delivery discriminator field and a residual compensation-gap limitation.
- `backend/apps/backend/src/workflows/delivery-slot/lib/capacity.ts` — `bookDeliverySlotCapacity`/`releaseDeliverySlotCapacity`, the atomic check-and-increment/decrement, wrapped in Medusa's own `ILockingModule.execute()` (the `locking-redis` provider this project already runs in production mode) — no new concurrency-control mechanism invented.
- `backend/apps/backend/src/workflows/delivery-slot/lib/extract-delivery-slot-id.ts` — reads a booked slot's ID off the cart's shipping method's native `data` JSON field (the same extension point any fulfillment provider uses), rather than a new Cart module field.
- `backend/apps/backend/src/workflows/delivery-slot/steps/book-delivery-slot-capacity.ts` — a `createStep` wrapper around the same capacity logic, for ordinary workflow composition.
- `backend/apps/backend/src/workflows/hooks/complete-cart-validate.ts` — wires atomic capacity enforcement into Medusa's native `completeCartWorkflow` via its `validate` hook, registered with both an invoke **and** a compensate function, so a later cart-completion step's failure automatically releases the capacity this hook booked.
- 6 new unit tests, 6 new module-integration tests, and 3 real, Redis-backed concurrency tests (two-of-one-capacity, three-of-eight-concurrent-burst, and release-then-rebook scenarios) validating TIER_B §20's single highest-severity named risk directly against this environment's actual Postgres and Redis, not a mock.

**Changed:**

- `backend/apps/backend/medusa-config.ts` — `delivery_slot` registered as a module.
- `docs/PROJECT_STATUS.md` (→ v4.9) — new Milestone 4 narrative; local payment provider and notification provider status distinguished (former Approved-and-pending, latter still Draft).
- `docs/ROADMAP.md` (→ v5.2) — Phase 4's delivery-slot-module bullet marked ✅ complete.
- `docs/implementation-planning/MODULE_INVENTORY.md` — delivery-slot row updated to reflect implementation, not only Approved architecture.

**Not changed:** no planning document's substance was altered, `TIER_B_DELIVERY_SLOT_MODULE.md` was not modified, and no business decision was made — slot length, cutoff timing, and capacity-per-slot values remain exactly as open as `TIER_B` left them; the pickup-slot boundary and kitchen-capacity-vs-rider-capacity reconciliation questions remain unresolved.

**Also updated:** `docs/DECISION_LOG.md` (new entry with full reasoning for the `validate`-hook-over-`beforePaymentAuthorization` choice and the compensable-hook-handler finding), `backend/README.md` (updated file tree and "what's configured"/"what's deliberately not here yet" sections).

## v47 — 2026-07-19 — Milestone 3: `food-details` module implemented

**Context:** Paul directed Milestone 3 — implementing the Approved `TIER_B_FOOD_ATTRIBUTES_MODULE.md` architecture in code, per a stated precedence order of governing documents, reusing `wine-details`' pattern without assuming the two modules are identical. Full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/` — not part of `/docs`):**

- `backend/apps/backend/src/modules/food-details/` — a custom Medusa module (data model, service, migration) holding structured Food Central attributes (ingredients, allergens, dietary flags, `safety_data_verified`, spice level, prep time, portion size), linked 1:1 to Product via `src/links/product-food-details.ts`. Includes its own `README.md`.
- `backend/apps/backend/src/workflows/food-details/` — four steps, two workflows, and shared helper logic that create/update/delete the linked record based on the native product endpoints' `additional_data` payload — no new API route.
- `backend/apps/backend/src/workflows/hooks/` — **new, shared** `product-created.ts`/`product-updated.ts`, replacing the per-module hook files each of `wine-details` and `food-details` previously had; the single registration point every attribute module's workflow now runs from (see "Changed," below, for why).
- `backend/apps/backend/src/admin/widgets/food-details-widget.tsx` — a product-detail-page admin widget.
- 12 new unit tests and 7 new module-integration tests.

**Changed:**

- `backend/apps/backend/src/api/middlewares.ts` — `wine-details`' and `food-details`' `additionalDataValidator` fields combined into one schema per route, rather than two separate route registrations, since Medusa's merge behavior across multiple matching entries for an identical route isn't part of the documented contract.
- **`backend/apps/backend/src/workflows/wine-details/hooks/` removed**, its two files' logic moved into the new shared `src/workflows/hooks/`. Discovered during Milestone 3's own migration: Medusa allows exactly one handler per native workflow hook — registering `food-details`' own hook alongside `wine-details`' pre-existing one threw "Cannot define multiple hook handlers for the productsCreated hook." Not a conflict with any Approved document; a framework constraint neither `TIER_B` document could have anticipated, resolved by consolidation, verified by creating one product with both modules' data in a single request and confirming both linked records were created.
- `docs/PROJECT_STATUS.md` (→ v4.8) — new "Completed work" entry for Milestone 3; "Work in progress" and "Next recommended task" updated to point at Milestone 4.
- `docs/ROADMAP.md` (→ v5.1) — Phase 3's food-attributes-module bullet marked ✅ complete.
- `docs/implementation-planning/MODULE_INVENTORY.md` (→ v2.0) — `food-details` row updated to reflect implementation, not only Approved architecture.

**Not changed:** no planning document's substance was altered, `TIER_B_FOOD_ATTRIBUTES_MODULE.md` was not modified, and no business decision was made — the field list used is explicitly provisional; the allergen/ingredient-accuracy-ownership question remains exactly as open as `TIER_B` left it.

**Also updated:** `docs/DECISION_LOG.md` (new entry with full reasoning, the hook-consolidation finding, and validation detail), `backend/README.md` (updated file tree, the shared-hooks note, and "what's configured"/"what's deliberately not here yet" sections).

## v46 — 2026-07-19 — Milestone 2: `wine-details` module implemented

**Context:** Paul directed Milestone 2 — implementing the Approved `TIER_B_WINE_ATTRIBUTES_MODULE.md` architecture in code, per a stated precedence order of governing documents. Full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/` — not part of `/docs`):**

- `backend/apps/backend/src/modules/wine-details/` — a custom Medusa module (data model, service, migration) holding structured Wine & Spirits attributes (vintage, ABV, producer, region, bottle size, tasting notes, serving temperature), linked 1:1 to Product via `src/links/product-wine-details.ts`. Includes its own `README.md`.
- `backend/apps/backend/src/workflows/wine-details/` — four steps, two workflows, and two hook registrations (`createProductsWorkflow.hooks.productsCreated`, `updateProductsWorkflow.hooks.productsUpdated`) that create/update/delete the linked record based on the native product endpoints' `additional_data` payload — no new API route.
- `backend/apps/backend/src/api/middlewares.ts` — a zod `additionalDataValidator` for the wine-details fields.
- `backend/apps/backend/src/admin/widgets/wine-details-widget.tsx` and `src/admin/lib/sdk.ts` — a product-detail-page admin widget for entering these fields.
- 10 unit tests (`src/workflows/wine-details/__tests__/helpers.unit.spec.ts`) and 6 module-integration tests (`src/modules/wine-details/__tests__/service.spec.ts`, run against a real, isolated temporary database).

**Changed:**

- `docs/PROJECT_STATUS.md` (→ v4.7) — new "Completed work" entry for Milestone 2; "Work in progress" and "Next recommended task" updated to point at Milestone 3.
- `docs/ROADMAP.md` (→ v5.0) — Phase 2's wine-attributes-module bullet marked ✅ complete.
- `docs/implementation-planning/MODULE_INVENTORY.md` (→ v1.9) — `wine-details` row updated to reflect implementation, not only Approved architecture.

**Not changed:** no planning document's substance was altered, `TIER_B_WINE_ATTRIBUTES_MODULE.md` was not modified (its architecture is exactly what was implemented), and no business decision was made — the field list used is explicitly provisional, matching `PRODUCT_CATALOG.md`'s own "proposed, not finalized" list, not a resolution of that open decision.

**Also updated:** `docs/DECISION_LOG.md` (new entry with full reasoning, the one genuine bug found and fixed during live verification, and validation detail), `backend/README.md` (updated file tree and "what's configured"/"what's deliberately not here yet" sections).

## v45 — 2026-07-19 — Engineering phase begun; Milestone 1 — Backend Foundation complete

**Context:** Paul approved beginning the engineering phase directly against `IMPLEMENTATION_READINESS_REPORT.md`, `IMPLEMENTATION_PLANNING.md`, `ARCHITECTURE.md`, `API_DECISIONS.md`, `MODULE_INVENTORY.md`, `MEDUSA_EXTENSIONS.md`, and all 11 frozen specifications, with the explicit instruction to work in small, reviewable milestones and stop for approval after each. Full reasoning in `DECISION_LOG.md`.

**Added (new, `backend/` — not part of `/docs`):**

- A Medusa v2.17.2 backend application at `backend/apps/backend`, scaffolded via Medusa's official generator into a Yarn-workspaces + Turborepo monorepo per `TECH_STACK.md`. Wired to real PostgreSQL and Redis in production mode (event bus, workflow engine, locking, and cache modules all Redis-backed, per `ROADMAP.md` Phase 1's explicit instruction never to launch on in-memory dev defaults).
- A LiquorCentral-specific store-level seed (`src/migration-scripts/initial-data-seed.ts`) replacing the generator's generic demo data: a "LiquorCentral" store (NGN), a "LiquorCentral Storefront" sales channel, a "Nigeria" region, and a Nigeria tax-region shell (no rate set — open decision, not invented).
- `backend/README.md` documenting what's built, what's configured, and what's deliberately deferred to a later milestone.

**Changed:**

- `docs/PROJECT_STATUS.md` (→ v4.6) — "Current phase" updated to record Paul's approval to begin engineering and Milestone 1's completion; new "Completed work" entry with full detail; "Work in progress" and "Next recommended task" rewritten; a new open decision recorded (exact Nigerian VAT/tax rate, surfaced by Milestone 1).
- `docs/ROADMAP.md` (→ v4.9) — Phase 1's bullets updated to reflect Milestone 1's actual progress (backend infrastructure ✅, region/tax partially complete, storefront/payment-provider/full buy-flow not yet started).

**Not changed:** no planning document's substance was altered, no frozen document was touched, and no business or architecture decision was made or revisited by this milestone — two build-tooling issues were fixed (a Yarn Classic `workspaces`/`private` requirement, and `ts-node` hoisting) as mechanical necessities, not decisions requiring approval.

**Also updated:** `docs/DECISION_LOG.md` (new entry recording Paul's approval to begin engineering and Milestone 1's scope/validation), `docs/AI_HANDOFF.md` (current-phase, project-state, roadmap, and immediate-next-step sections updated to reflect the engineering phase's start).

## v44 — 2026-07-19 — `IMPLEMENTATION_READINESS_REPORT.md` created (v1.0, Approved) — Phase 2 formally concluded

**Context:** With all five Tier B documents Approved, Paul directed three sequential reviews before any Tier C document could begin: (1) a recommendation on which remaining Tier B modules (notification provider, Saved-for-Later) are genuinely required before implementation — approved, concluding neither is launch-blocking and no sixth Tier B document was drafted; (2) an implementation-readiness assessment determining whether Tier C (API Contract Planning) is genuinely required before implementation — approved, concluding it is not; (3) creation of a single closing document, `docs/IMPLEMENTATION_READINESS_REPORT.md`, formally concluding Phase 2 and authorizing the transition into implementation. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/IMPLEMENTATION_READINESS_REPORT.md` (v1.0, Approved) — a governance record, not an architecture document: summarizes completed Phase 2 planning work; explains why Tier C is intentionally not being produced, citing `API_DECISIONS.md`'s native-API-first principle, `IMPLEMENTATION_PLANNING.md` §10's "Tier B and/or Tier C" exit criterion, and the Approved Tier B documents' own Integration sections; lists remaining business decisions engineering cannot resolve, grouped by urgency; classifies every planning output as Ready to implement immediately / Ready once business decisions are supplied / Deferred until after MVP; recommends an implementation order for engineering (resolving `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §13's flagged Customer-Account/Admin-Workflows sequencing gap along the way); states remaining implementation risks and mitigations; and closes with a formal recommendation that planning is sufficiently complete and implementation should begin. Contains no new architecture, API design, database schema, or code.

**Changed:**

- `docs/README.md` — added `IMPLEMENTATION_READINESS_REPORT.md` as reading-order item 8 ("read this before beginning any engineering work"), renumbering the prior item 8 to 9; added a document-map row; added a paragraph after the Tier B table stating Phase 2 is formally concluded and no Tier C–F document is currently planned.
- `docs/PROJECT_STATUS.md` — "Current phase" rewritten to state Phase 2 is complete and formally concluded; new "Completed work" bullets added for the remaining-Tier-B-modules recommendation, the implementation-readiness assessment, and the readiness report's creation; "Work in progress" rewritten to reflect Phase 2's conclusion; "Next recommended task" rewritten from "Paul to direct which Tier B module begins next" (now stale) to "Paul to review and approve `IMPLEMENTATION_READINESS_REPORT.md`."
- `docs/ROADMAP.md` (→ v4.8) — Phase 0f heading changed to "✅ Complete"; a new closing paragraph added after the Tier B summary documenting Phase 2's conclusion; the "Open questions blocking Phase 0 and Phase 1" closing section updated to reference the readiness report.

**Not changed:** no Tier C document was created — none was found to be required. No frozen specification, frozen Phase 0 document, or previously-Approved Tier A/B document was modified. No architecture, API, database schema, or code was designed or written anywhere in this change.

**Also updated:** `docs/DECISION_LOG.md` (new entry recording the decision to conclude Phase 2 without a Tier C document), `docs/AI_HANDOFF.md` (current-phase, project-state, roadmap, and immediate-next-step sections updated to reflect Phase 2's conclusion and the pending review of the readiness report).

## v43 — 2026-07-19 — `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` finalized to v1.0 — Approved

**Context:** Paul directed a genuine architectural review-and-finalize pass on `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `MODULE_INVENTORY.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `TECH_STACK.md`, `API_DECISIONS.md`, all relevant Approved specifications, and all four existing Approved Tier B modules. Full reasoning in `DECISION_LOG.md`.

**Changed (within `docs/implementation-planning/TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md`):**

- §0 (Module Selection Verification): corrected a stale self-referential status claim describing `TIER_A_FOUNDATIONAL_RECONCILIATION.md` Row 4 as "Scoped, not built" without acknowledging this document's own drafting had already updated it to "Drafted."
- §8 (Provider Abstraction Responsibilities): corrected a reversed-order misquotation of `MEDUSA_EXTENSIONS.md` #4's Technical Impact bullet.
- §14 (Integration with Order Management): corrected a principle misattributed jointly to `PRODUCT_BLUEPRINT.md` §9 and `07_CHECKOUT_SPECIFICATION.md` §21 — attributed to `07`'s §21 alone.
- §4, §10, and §23 (Quality Checklist): corrected three incorrect self-references citing "§18" (CMS & Merchandising, unrelated) to §19 (Operational Assumptions).
- Document header changed to Version 1.0, Status: Approved.

**Not changed:** no missing responsibility, non-responsibility, ownership ambiguity, incorrect dependency relationship, incorrect integration point, or architectural boundary violation was found. Dependency count (`07` only) reconfirmed unchanged. One newly-discovered documentation gap remains recorded, not resolved: `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §11 names a staff refund workflow without naming this module as its underlying mechanism.

**Also updated:** `docs/README.md`, `docs/implementation-planning/MODULE_INVENTORY.md` (→ v1.8), `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` (Row 4 → "Architecture Approved," → v1.5), `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/AI_HANDOFF.md` — all now reflect the Local Payment Provider Module as Approved (five of five Tier B documents drafted so far now Approved).

## v42 — 2026-07-19 — `TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` drafted at v1.0 — Draft

**Context:** Paul directed the fifth Tier B module, the local payment provider, re-verified against the six standing selection criteria and every remaining candidate before drafting. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md` (v1.0, Draft) — purely architectural, provider-agnostic definition of the local payment provider module: why it exists, responsibilities and explicit non-responsibilities, a payment-method/mechanism/status/refund-policy boundary section, payment lifecycle and payment-state responsibilities, provider abstraction responsibilities, scope, a two-way ownership split, its interaction with Medusa's native Payment module, integration points across Checkout/Customer Account/Order Management/Admin Workflows, a dedicated Integration with Refund Workflow (Architectural Boundary Only) section, a consolidated non-integrations section, future extensibility, risks, dependencies, a quality checklist, and acceptance criteria. No specific payment service provider is named or chosen anywhere.

**Changed:**

- `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` bumped to v1.4 — Row 4 (Local payment provider) Status updated from "Scoped, not built" to "Drafted." Dependency count (`07`) confirmed unchanged — no correction required, the first Tier B module whose baseline needed none.
- `docs/implementation-planning/MODULE_INVENTORY.md` bumped to v1.7 — Local payment provider row Status updated to match; one new not-yet-scoped row added for the newly-discovered `11_ADMIN_WORKFLOWS_SPECIFICATION.md` refund-mechanism documentation gap.
- `docs/README.md`, `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/AI_HANDOFF.md` updated to reflect the draft's existence, the confirmed (unchanged) dependency count, and the newly-discovered documentation gap.

**Not changed:** no frozen or previously-Approved document's substance was altered; `TIER_A_FOUNDATIONAL_RECONCILIATION.md` and `MODULE_INVENTORY.md` received only the status-field update described above, not a dependency-count correction.

## v41 — 2026-07-19 — `TIER_B_DELIVERY_SLOT_MODULE.md` finalized to v1.0 — Approved

**Context:** Paul directed a genuine architectural review-and-finalize pass on `TIER_B_DELIVERY_SLOT_MODULE.md` against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `MODULE_INVENTORY.md`, `MEDUSA_EXTENSIONS.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, all relevant Approved specifications, and the three existing Approved Tier B modules. Full reasoning in `DECISION_LOG.md`.

**Changed (within `docs/implementation-planning/TIER_B_DELIVERY_SLOT_MODULE.md`):**

- §0 (Module Selection Verification): corrected an inaccurate Tier-placement claim — the payment/notification provider modules are genuine Tier B candidates per `IMPLEMENTATION_PLANNING.md` §4/§6, not Tier D alone; delivery-slot still proceeds first per §6 point 2's explicit sequencing within Tier B.
- §2 (Business Justification): corrected a misattributed quotation — "the one real gap in an otherwise fully native fulfillment story" is `MEDUSA_EXTENSIONS.md` #3's framing, not `PRODUCT_BLUEPRINT.md` §10's.
- §12 (Integration with Checkout): corrected an ambiguous section citation — `07_CHECKOUT_SPECIFICATION.md`'s Customer Decision States table is a separate, unnumbered appendix, not a subsection of numbered §21.
- Document header changed to Version 1.0, Status: Approved.

**Not changed:** no missing responsibility, non-responsibility, ownership clarification, or integration point was found; no existing section was rewritten beyond the three corrections above; no table, field, endpoint, or code was introduced. Two architectural questions remain open, not resolved: the pickup-slot mechanism boundary (§5, §19) and the kitchen-capacity-vs-rider-capacity reconciliation question (§6, §18).

**Also updated:** `docs/README.md`, `docs/implementation-planning/MODULE_INVENTORY.md` (→ v1.6), `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/AI_HANDOFF.md` — all now reflect the Delivery-Slot Module as Approved (four of four Tier B documents drafted so far now Approved).

## v40 — 2026-07-19 — `TIER_B_DELIVERY_SLOT_MODULE.md` drafted at v1.0 — Draft

**Context:** Following the round-three repository reconciliation (below), Paul directed the fourth Tier B module, delivery-slot scheduling, re-verified against the six standing selection criteria and every remaining candidate before drafting. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/TIER_B_DELIVERY_SLOT_MODULE.md` (v1.0, Draft) — purely architectural definition of the delivery-slot scheduling module: why it exists, responsibilities and explicit non-responsibilities, scheduling and capacity concepts, a conceptual time-slot lifecycle, a three-way ownership split, its relationship with Medusa's native fulfillment flow, integration points across Checkout/Food Ordering/Delivery/Admin Workflows, a confirmed non-integration with Cart, future extensibility, risks, dependencies, a quality checklist, and acceptance criteria. Two appendix sections added for completeness: Integration with Navigation, Integration with Homepage.

**Changed:**

- `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` bumped to v1.3 — delivery-slot's dependency list in §6/§14 corrected from `06`,`07`,`09`,`10` to `01`,`02`,`07`,`09`,`10`,`11` (bookkeeping correction, not a new architectural finding).
- `docs/implementation-planning/MODULE_INVENTORY.md` bumped to v1.5 — delivery-slot row's Status and Depended On By list corrected to match; two new not-yet-scoped rows added for the pickup-slot boundary and kitchen-vs-rider capacity reconciliation questions.
- `docs/README.md`, `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/AI_HANDOFF.md` updated to reflect the draft's existence, the corrected dependency count, and the two newly-recorded open architectural questions.

**Not changed:** no frozen or previously-Approved document's substance was altered; `TIER_A_FOUNDATIONAL_RECONCILIATION.md` and `MODULE_INVENTORY.md` received only the bookkeeping correction described above.

## v39 — 2026-07-19 — Repository reconciliation, round three: independent `IMPLEMENTATION_PLANNING.md` draft superseded

**Context:** A session on `claude/medusa-repo-clone-ut5dl5` had independently drafted its own `IMPLEMENTATION_PLANNING.md` (v1.0, Approved) without knowing `claude/project-onboarding-status-p35u3v` had, in the interim, been continued with its own `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, and three approved Tier B modules built on top of it. Full reasoning in `DECISION_LOG.md`.

**Changed:**

- `claude/project-onboarding-status-p35u3v` merged into `claude/medusa-repo-clone-ut5dl5` via a true three-way merge (not fast-forward — both branches had diverged; not rebase; not squash). Every commit from both lines preserved, including the superseded draft (`4106b99`).
- For every file both branches had independently edited (`IMPLEMENTATION_PLANNING.md`, `README.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `AI_HANDOFF.md`), the `project-onboarding-status-p35u3v` version was kept as authoritative, per Paul's explicit merge policy.
- This file and `DECISION_LOG.md`, being append-only, each received this reconciliation entry rather than one side's history silently replacing the other's.

**Added:**

- `docs/implementation-planning/MODULE_INVENTORY.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, `TIER_B_WINE_ATTRIBUTES_MODULE.md`, `TIER_B_FOOD_ATTRIBUTES_MODULE.md` — merged cleanly with no conflict, since they exist only on the incoming side. All now confirmed present and current.

**Not changed:** no frozen Phase 0 or Phase 1 document was touched by the merge.

## v38 — 2026-07-19 — `TIER_B_FOOD_ATTRIBUTES_MODULE.md` finalized to v1.0 — Approved

**Context:** Paul directed a genuine architectural review-and-finalize pass on `TIER_B_FOOD_ATTRIBUTES_MODULE.md` against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, `TIER_B_WINE_ATTRIBUTES_MODULE.md`, `MODULE_INVENTORY.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `PRODUCT_CATALOG.md`, `MEDUSA_EXTENSIONS.md`, `DELIVERY_MODEL.md`, and all 11 frozen specifications, using the same methodology already applied to both prior Tier B documents. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md`):**

- A new, unnumbered **Integration with Food Ordering** section — closing a genuine missing-integration-point gap: `09_FOOD_ORDERING_SPECIFICATION.md`, this module's single most consequential consuming specification, had no dedicated integration section despite every one of its six sibling dependents (`01`,`02`,`03`,`04`,`05`,`11`) having one. Mirrors the identical append-only precedent `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`'s own "Integration with Navigation" fix established.
- §4 (Explicit Non-Responsibilities) — a new bullet stating this module does not determine or hold product pricing, mirroring `wine-details`' equivalent explicit statement, which this document's first draft had omitted.
- §9 (Integration with Product Module) — a new bullet naming `PRODUCT_CATALOG.md`'s own proposal that dietary-flag values may optionally be mirrored, one-way, into native Product Tags for storefront filter-chip efficiency, with this module remaining the sole source of truth.

**Changed (within `docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md`):**

- Five cross-reference corrections: three citations within §6 and one within §8 incorrectly pointed to §18 (Data Accuracy & Verification Ownership) for the field-list-not-finalized open item, which is actually named in §8 and §21 — corrected in place. One Quality Checklist citation corrected from §12 (Search) to §9 (Product Module integration), where the Attributes/Presentation/Operational-Status boundary is actually drawn.
- One reference to a nonexistent section (§27) removed from §6.
- §21 (Dependencies) — the closing bullet, which stated the document "remains Draft... rather than Approved," updated to reflect the new Approved status.
- Document header: **Status: Draft → Approved**. No existing section was rewritten.

**Changed (tracking documents):**

- `docs/README.md` (v3.9) — Implementation Planning table updated: Tier B food-attributes document now Approved.
- `docs/implementation-planning/MODULE_INVENTORY.md` (v1.4) — `food-details` row updated to "Architecture Approved."
- `docs/PROJECT_STATUS.md` (v4.0), `docs/ROADMAP.md` (v4.3) — current phase, Completed work, Work in progress, Next recommended task, and Tier A/B findings updated to reflect the finalization; two open dependencies (field list, allergen-accuracy ownership) restated as still open, not resolved.
- `docs/DECISION_LOG.md` — new entry recording the review findings and the finalization.

## v37 — 2026-07-19 — Third Tier B document drafted: Food Attributes Module

**Context:** Paul directed the third Tier B module, first requiring a re-verification that `food-details` remains the highest-priority remaining candidate against the six standing selection criteria, explicitly not assuming the existing baseline was correct. Full selection reasoning, the corrected dependency count, and the drafting decisions are in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/TIER_B_FOOD_ATTRIBUTES_MODULE.md` (v1.0, status Draft) — the architecture of the `food-details` module (`MEDUSA_EXTENSIONS.md` #2). Re-verification confirmed `food-details` as the correct next module per `IMPLEMENTATION_PLANNING.md` §6's explicit ordering, and found its dependency count had been undercounted: **seven frozen specifications depend on it** (`01`,`02`,`03`,`04`,`05`,`09`,`11`), not the five previously recorded — `01_NAVIGATION_SPECIFICATION.md`'s Backend Data Requirements table and `02_HOMEPAGE_SPECIFICATION.md`'s Food Central Spotlight both genuinely depend on it for prep-time/availability data. Defines why the module exists (the corrected count); business justification, naming an allergen-data error as a customer-safety failure, not merely a trust/accuracy one; responsibilities and explicit non-responsibilities; a dedicated section stating the five-way distinction between attributes, presentation, operational status, inventory, and customer-facing facts (per direct instruction) — most consequentially, that this module never holds Food Central's live availability-state flag, a separate, native, not-yet-built mechanism; attribute categories, including a newly discovered field-list gap (portion/serving-size, required by `05_PRODUCT_DETAILS_SPECIFICATION.md` §11 but absent from `PRODUCT_CATALOG.md`'s proposed list); scope (safety-critical fields held to a stricter completeness standard than ordinary attributes; product-vs-variant granularity confirmed as a non-issue for this module); a four-way ownership split (engineering / Paul's field-list approval / staff data entry / the still-open allergen-accuracy-ownership decision); integration points with Product, Navigation, **Homepage** (a genuine, confirmed integration — unlike `wine-details`, for which Homepage was confirmed as a non-dependency), Search, Listing, Product Details, and Admin Workflows; a consolidated non-integrations section; CMS responsibilities; an elevated, consolidated statement of the already-flagged allergen-accuracy-ownership gap; future extensibility; risks; dependencies; a Quality Checklist; and architecture-level Acceptance Criteria. No table, field type, endpoint, or UI component appears anywhere — verified directly.

**Changed (bookkeeping correction, `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md`, v1.1 → v1.2):**

- §6 and §14's `food-details` dependency lists corrected from `03,04,05,09,11` to `01,02,03,04,05,09,11` — `01_NAVIGATION_SPECIFICATION.md` and `02_HOMEPAGE_SPECIFICATION.md` both genuinely depend on this module. A non-substantive consistency correction, not a new architectural finding, per `DOCUMENTATION_GOVERNANCE.md` §6.

**Changed (tracking documents):**

- `docs/README.md` (v3.8) — Implementation Planning table updated: Tier B food-attributes document now listed as Draft.
- `docs/implementation-planning/MODULE_INVENTORY.md` (v1.2 → v1.3) — `food-details` row updated to "Draft architecture"; dependency list corrected to `01`,`02`,`03`,`04`,`05`,`09`,`11`; two new not-yet-scoped rows added (food attribute data-accuracy/verification ownership; the portion/serving-size field-list gap).
- `docs/PROJECT_STATUS.md` (v3.8 → v3.9), `docs/ROADMAP.md` (v4.1 → v4.2) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect the draft, the corrected dependency count, and the newly-discovered field-list gap.
- `docs/DECISION_LOG.md` — new entry recording the re-verification, the corrected count, and the document's drafting.

## v36 — 2026-07-18 — `TIER_B_WINE_ATTRIBUTES_MODULE.md` finalized to v1.0 — Approved

**Context:** Paul approved a review-and-finalize pass on `TIER_B_WINE_ATTRIBUTES_MODULE.md` against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, `MODULE_INVENTORY.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `MEDUSA_EXTENSIONS.md`, and all 11 frozen specifications, explicitly not a rewrite. Full reasoning in `DECISION_LOG.md`.

**Changed (within `docs/implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md`):**

- §4 (Explicit Non-Responsibilities) — corrected an ambiguous "(§8, §17)" self-citation to accurately state the module "confirms and remains consistent with" (not "depends on") the Product Relationship Module's prior architectural decision; added a new bullet distinguishing tasting notes from a customer/expert review system, per `05_PRODUCT_DETAILS_SPECIFICATION.md` §22's confirmed no-reviews-in-v1 stance.
- §6 (Scope Within Wine & Spirits) — added a bullet naming Product-vs-Product-Variant attribute granularity as an explicitly open data-modeling question (bottle size being the likely candidate), not resolved here.
- §7 (Ownership) — corrected an ambiguous "(§17)" self-citation to explicitly name `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` §17.
- §18 (Risks) and §19 (Dependencies) — each gained a bullet reflecting the newly-discovered product-vs-variant granularity question.
- §20 (Quality Checklist) and §21 (Acceptance Criteria) — each gained two new checks reflecting the reviews-boundary and granularity clarifications.
- Document header: **Status: Draft → Approved**. No existing section was rewritten.

**Changed (bookkeeping correction, `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md`, v1.0 → v1.1):**

- §6 and §14's `wine-details` dependency lists corrected from `03,04,05,09,11` to `01,03,04,05,11` — `09_FOOD_ORDERING_SPECIFICATION.md` depends on the symmetrical `food-details` module, not this one, and `01_NAVIGATION_SPECIFICATION.md`'s Wine Discovery Navigation genuinely depends on it. A non-substantive consistency correction, not a new architectural finding, per `DOCUMENTATION_GOVERNANCE.md` §6.

**Changed (tracking documents):**

- `docs/README.md` (v3.7) — Implementation Planning table updated: Tier B wine-attributes document now Approved.
- `docs/implementation-planning/MODULE_INVENTORY.md` (v1.2) — `wine-details` row updated to "Architecture Approved"; two new not-yet-scoped rows added (accuracy ownership; product-vs-variant granularity).
- `docs/PROJECT_STATUS.md` (v3.8), `docs/ROADMAP.md` (v4.1) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect the finalization and its two newly-recorded dependencies.
- `docs/DECISION_LOG.md` — new entry recording the review findings and the finalization.

## v35 — 2026-07-18 — Second Tier B document drafted: Wine & Spirits Attributes Module

**Context:** Paul directed the second Tier B module to be selected using six explicit criteria (spec-count dependency, blocking effect on other implementation-planning work, launch criticality, architectural centrality, Tier A gaps, and `IMPLEMENTATION_PLANNING.md`'s own dependency ordering) rather than chosen alphabetically or arbitrarily, then drafted to the same structure, quality, and depth as `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`. Full selection reasoning and drafting decisions in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/TIER_B_WINE_ATTRIBUTES_MODULE.md` (v1.0, status Draft) — the architecture of the `wine-details` module (`MEDUSA_EXTENSIONS.md` #1). Selected over `food-details` (tied on spec-count) via architectural centrality and dependency ordering: `ROADMAP.md`'s backend build sequence places wine-attributes (Phase 2) immediately after Wine & Spirits' end-to-end launch (Phase 1) and before food-attributes (Phase 3); it also blocks the most subsequent Phase 2 work (Meilisearch facet design, and the Search/Listing/Product-Details API contracts). Defines why the module exists (five specifications depend on it — `01`,`03`,`04`,`05`,`11` — with `09_FOOD_ORDERING_SPECIFICATION.md` explicitly confirmed as a non-dependent, consuming the symmetrical `food-details` module instead), business justification, responsibilities, explicit non-responsibilities (does not own presentation — the Attributes/Facts boundary `05_PRODUCT_DETAILS_SPECIFICATION.md` §12/§13 already draws; does not hold the "pairs with" relationship, confirming `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`'s prior correction; does not rank search results; does not determine availability/pricing; does not hold Food Central data), conceptual attribute categories (no field finalized), scope across the whole Wine & Spirits catalog, a three-way ownership split (engineering/Paul's field-list approval/staff data entry), integration points with Product, Navigation (the varietal/style navigation layer's actual data source), Search, Listing, Product Details, and Admin Workflows, a consolidated non-integrations section (Cart, Checkout, Account, Food Ordering, Delivery, Homepage all confirmed zero dependency), CMS responsibilities, a newly-discovered documentation gap (no assigned wine-attribute-accuracy verification ownership), future extensibility, risks, dependencies, a Quality Checklist, and architecture-level Acceptance Criteria. No table, field type, endpoint, or UI component appears anywhere — verified directly. Contains no database design, API specification, implementation code, or UI component definition, per direct instruction.

**Changed (tracking documents):**

- `docs/README.md` (v3.6) — Implementation Planning table updated to include the new Tier B document.
- `docs/implementation-planning/MODULE_INVENTORY.md` (v1.1) — `wine-details` row updated to "Architecture Drafted"; dependency list corrected to `01`,`03`,`04`,`05`,`11`; new row added for the wine-attribute-accuracy-ownership gap.
- `docs/PROJECT_STATUS.md` (v3.7), `docs/ROADMAP.md` (v4.0) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect the draft and its newly-discovered dependency.
- `docs/DECISION_LOG.md` — new entry recording the selection reasoning and the document's drafting.

## v34 — 2026-07-18 — `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` finalized to v1.0 — Approved; `MODULE_INVENTORY.md` created

**Context:** Paul approved `TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`, then directed a refinement pass against `IMPLEMENTATION_PLANNING.md`, `TIER_A_FOUNDATIONAL_RECONCILIATION.md`, `PRODUCT_BLUEPRINT.md`, `BUSINESS_RULES.md`, `MEDUSA_EXTENSIONS.md`, and all 11 frozen specifications before finalizing — explicitly no rewriting of existing sections, no implementation detail, no database or API design. He also recommended a standing Tier B module inventory. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/implementation-planning/TIER_B_PRODUCT_RELATIONSHIP_MODULE.md`):**

- **Integration with Navigation** — a new unnumbered section (positioned after the existing numbered sections, consistent with the append-only refinement pattern established throughout Phase 1) closing a genuine cross-reference gap: `01_NAVIGATION_SPECIFICATION.md` §13/§14/§19 also depends on this module, for cross-linking/wayfinding rather than a displayed pairing suggestion — a distinction now made explicit.
- A clarifying Dependencies bullet noting a formal `MEDUSA_EXTENSIONS.md` entry for the module remains outstanding, deferred to Tier C or a future data-model document, not created by this finalization.
- A light forward cross-reference added to §1, and one Acceptance Criteria bullet corrected to reference the full set of integration sections including the new one.

**Changed:**

- Document header: **Status: Draft → Approved** (per Paul's explicit instruction, "Approved" rather than "Frozen"). No existing numbered section (§1–§22) was rewritten.
- `docs/README.md` (v3.5) — Implementation Planning table updated: Tier B document now Approved; new `MODULE_INVENTORY.md` row added.

**Added (new document):**

- `docs/implementation-planning/MODULE_INVENTORY.md` (v1.0, status Approved, living) — per Paul's explicit recommendation, a single-page index of every module/integration/capability identified anywhere in `/docs`: ten native Medusa modules, five custom modules, two provider modules, two third-party integrations, and thirteen not-yet-scoped items, each tagged by type, status, dependencies, and launch-criticality, with a closing "Answering the standing questions" section directly addressing which modules exist, which are native/custom/extension, which depend on others, which are optional, and which are launch-critical. Not a Tier B document itself — a living index of them, to be updated in the same change as any future module-level document.

**Changed (tracking documents):**

- `docs/PROJECT_STATUS.md` (v3.6), `docs/ROADMAP.md` (v3.9) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect the finalization, the two newly-recorded (not resolved) dependencies, and the new module inventory.
- `docs/DECISION_LOG.md` — new entry recording the finalization and the module inventory's creation.

## v33 — 2026-07-18 — First Tier B document drafted: Product Relationship Module

**Context:** Paul directed Tier B (Module Data Planning) to begin with Tier A's highest-priority finding — the "pairs with" product-relationship module, depended on by six frozen specifications with no existing `MEDUSA_EXTENSIONS.md` entry — explicitly as a purely architectural document: no database design, no API specification, no code. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/TIER_B_PRODUCT_RELATIONSHIP_MODULE.md` (v1.0, status Draft) — defines why the module exists, its business justification, responsibilities, explicit non-responsibilities (does not replace Related Products, does not influence search ranking, does not compute algorithmic recommendations, does not set pricing, does not determine availability), relationship types (one required kind for v1: cross-catalog pairing, with the concept of "kind" left open for future extension), supported catalogs, ownership (module shape is engineering's, curated content is merchandising's), and integration points with all nine consuming/adjacent surfaces named in the governing instruction — Product Module, Search, Homepage, Product Details, Cart, Checkout (confirmed as having **zero** dependency), Food Ordering (confirmed as pure reuse of the existing homepage/PDP pairing moment), and Admin Workflows (confirmed as having **no staff curation workflow specified anywhere yet** — a named, unresolved dependency). Also covers CMS responsibilities, merchandising responsibilities, future extensibility, risks, dependencies, a Quality Checklist, and architecture-level Acceptance Criteria. Contains no table, field, endpoint, or code anywhere — verified directly. Corrects, by reference rather than by editing, the conflict `TIER_A_FOUNDATIONAL_RECONCILIATION.md` §4 identified between `PRODUCT_CATALOG.md`'s narrow wine-side-field framing and the general module six specifications actually require.

**Changed (tracking documents):**

- `docs/README.md` (v3.4) — Implementation Planning table updated to include the new Tier B document.
- `docs/PROJECT_STATUS.md` (v3.5), `docs/ROADMAP.md` (v3.8) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect the draft and its one new open dependency (the staff curation workflow).
- `docs/DECISION_LOG.md` — new entry recording the document's drafting and its findings.

## v32 — 2026-07-18 — Tier A — Foundational Reconciliation complete

**Context:** Paul directed Phase 2 to begin with Tier A (Foundational Reconciliation), per `IMPLEMENTATION_PLANNING.md` §6's recommended creation order — reconciling every existing technical planning document against the now-complete Phase 0/Phase 1 foundation before any engineering design begins. Explicitly not a design or implementation task. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/implementation-planning/` — new directory, parallel to `docs/specifications/`, holding Tier A–F implementation-planning documents.
- `docs/implementation-planning/TIER_A_FOUNDATIONAL_RECONCILIATION.md` (v1.0, status Approved) — reviewed all 11 frozen Product Specifications, the four frozen Phase 0 documents, `DOCUMENTATION_GOVERNANCE.md`, `IMPLEMENTATION_PLANNING.md`, and every pre-existing implementation-tier and product-tier document (`ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `PRODUCT_CATALOG.md`, `INFORMATION_ARCHITECTURE.md`, `DELIVERY_MODEL.md`, `BUSINESS_RULES.md`, `USER_FLOWS.md`, `ROADMAP.md`), plus `PROJECT_STATUS.md` and `AI_HANDOFF.md` for accuracy. Findings: every foundational architectural assumption confirmed still valid (§2); no outright-obsolete assumption found (§3); one genuine conflicting assumption (§4 — `PRODUCT_CATALOG.md` frames the "pairs with" relationship as a narrow wine-side attribute field, while six frozen specifications treat it as a general, unscoped product-relationship module); missing-work findings consolidated by category (§5–§13: missing Medusa modules, integrations, backend/frontend/CMS/search responsibilities, operational tooling, and a `ROADMAP.md` sequencing gap around `08`/`11`); and one **Definitive Implementation Baseline** table (§14, 20 rows) that every future Tier B–F document is directed to reference as its starting point. Explicitly does not redesign the product, modify any Frozen document, design an API, design a database, or write code (§15). Recommends (§16, not decides) the "pairs with" module as Tier B's first document, since it is depended on by six specifications and has no existing `MEDUSA_EXTENSIONS.md` entry at all.

**Changed (tracking documents):**

- `docs/README.md` (v3.3) — new "Implementation Planning" section table indexing `TIER_A_FOUNDATIONAL_RECONCILIATION.md`.
- `docs/PROJECT_STATUS.md` (v3.4), `docs/ROADMAP.md` (v3.7) — current phase, Completed work, Work in progress, Next recommended task, and Decisions awaiting Paul's approval updated to reflect Tier A's completion and its new findings; `ROADMAP.md`'s Phase 0f section and closing "Open questions" paragraph both updated.
- `docs/DECISION_LOG.md` — new entry recording Tier A's completion and its full findings.

## v31 — 2026-07-18 — Second branch reconciliation; `IMPLEMENTATION_PLANNING.md` created as Phase 2's governing document

**Context:** A session working on `claude/project-onboarding-status-p35u3v` found it had fallen behind `claude/medusa-repo-clone-ut5dl5` (which had, in the interim, independently drafted and frozen specifications `07`–`11`, including its own version of `07_CHECKOUT_SPECIFICATION.md`). Confirmed as a pure fast-forward before merging, per `DOCUMENTATION_GOVERNANCE.md` §8's "reconcile, don't recreate" rule. Paul then directed creation of `docs/IMPLEMENTATION_PLANNING.md` as the master governing document for Phase 2. Full reasoning in `DECISION_LOG.md`.

**Changed (branch reconciliation):**

- `claude/project-onboarding-status-p35u3v` fast-forward-merged to `claude/medusa-repo-clone-ut5dl5`'s tip (commit `d73d6d4`) and pushed — no history rewritten, nothing squashed, every commit from both lines preserved. A redundant, uncommitted local draft of `07_CHECKOUT_SPECIFICATION.md` was stashed rather than committed, since an already-reviewed, frozen version already existed on the branch being merged in.
- `docs/AI_HANDOFF.md` (v3.2) — corrected: it had not been updated by the session that drafted specs `07`–`11`, and still described Phase 1 as underway with only the homepage spec drafted. Rewritten against the actual current state (Phase 1 complete, all 11 specifications frozen, Phase 2 governing document approved).

**Added:**

- `docs/IMPLEMENTATION_PLANNING.md` (v1.0, status Approved) — the master governing document for Phase 2 (Implementation Planning), not an implementation document itself: no API design, database schema, component design, or code appears anywhere in it. Defines the purpose and scope of Phase 2; an Engineering Philosophy (specification-driven, Medusa-native first, one module per plan, open business decisions inherited not re-litigated, plan for testability, smallest sufficient plan); a six-tier hierarchy of implementation documents (A — Foundational Reconciliation, B — Module Data Planning, C — API Contract Planning, D — Integration Planning, E — Testing & Acceptance Planning, F — Rollout Sequencing); each tier's dependencies and creation order; an Approval Workflow reusing Phase 1's exact two-stage pattern; Versioning and Document Lifecycle sections confirming Phase 2 inherits Phase 1's conventions unchanged; a per-surface/per-module Exit Criteria section gating when actual development may begin; and a closing Quality Checklist. Explicitly begins no Tier A–F document itself.

**Changed (tracking documents):**

- `docs/README.md` (v3.2) — added `IMPLEMENTATION_PLANNING.md` to the reading order and document map; added a new "Implementation Planning" section summarizing Phase 2.
- `docs/PROJECT_STATUS.md` (v3.3), `docs/ROADMAP.md` (v3.6) — current phase, Completed work, Work in progress, and Next recommended task updated to reflect the second reconciliation and the new governing document; `ROADMAP.md` gained a new "Phase 0f — Implementation Planning" section and an expanded naming note disambiguating Paul's "Phase 2" from `ROADMAP.md`'s own numbered "Phase 2 — Product data foundation."
- `docs/DECISION_LOG.md` — two new entries: the second branch reconciliation, and `IMPLEMENTATION_PLANNING.md`'s creation.

## v30 — 2026-07-18 — `11_ADMIN_WORKFLOWS_SPECIFICATION.md` finalized to v1.0 and frozen — Phase 1 complete

**Context:** Paul approved `11_ADMIN_WORKFLOWS_SPECIFICATION.md`, then requested a final refinement pass — a full review against all four frozen Phase 0 documents and all ten frozen prior specifications, plus meaningful refinements where they genuinely strengthened the specification — before freezing v1.0. This was the eleventh and final planned Phase 1 specification. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/11_ADMIN_WORKFLOWS_SPECIFICATION.md`):**

- **Admin Workflow Intent** — a table mapping five recognizable staff intents (keeping the catalog accurate, running a promotion within the rules, fulfilling and resolving an order, supporting a customer, recovering from an interruption) onto mechanisms already specified elsewhere in the document, mirroring `07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent, `09_FOOD_ORDERING_SPECIFICATION.md`'s Food Ordering Intent, and `10_DELIVERY_SPECIFICATION.md`'s Delivery Intent.
- **Operational Trust & Accountability** — names staff accountability as the internal twin of `PRODUCT_BLUEPRINT.md` §11's "sold and delivered by us directly" claim; explicitly confirms audit logging exists for accountability and troubleshooting, never staff-performance scoring.
- **Cross-Catalog Operational Parity** — extends `BUSINESS_RULES.md`'s and `01_NAVIGATION_SPECIFICATION.md`'s customer-facing "equal prominence" principle to internal tooling investment for the first time: equal seriousness of treatment, not identical workflows.
- **Admin Workflow Recovery** — four named scenarios (a session expiring mid-edit, a multi-step action partially completing then failing, a save failing during peak load, a network interruption during a status update) governed by the same intent-preservation principle already established in `06`'s Cart Recovery, `07`'s Checkout Recovery, `08`'s Account Recovery, `09`'s Food Ordering Recovery, and `10`'s Delivery Recovery sections.

**Changed (within the same document):**

- §5 (Dashboard) — new bullet on cross-catalog parity.
- §20 (Audit Logging) — new bullet confirming the mechanism is not a staff-performance-scoring device.
- §24 (Accessibility) — new bullet on focus management after a save or recovery action.
- §29 (Admin Workflows Quality Checklist) — three new checks; §30 (Acceptance Criteria) — two new checks. No previously-flagged open operational decision was resolved or silently assumed.
- Header changed to **Version 1.0, Status: Approved — Frozen**.

**Changed (tracking documents):**

- `docs/README.md` (v3.1) — specification status table updated: `11_ADMIN_WORKFLOWS_SPECIFICATION.md` now **Approved — Frozen**, v1.0; confirms all 11 planned specifications are frozen and Phase 1 — Product Specifications is complete.
- `docs/PROJECT_STATUS.md` (v3.2), `docs/ROADMAP.md` (v3.5) — Current phase, Phase 1 status, Completed work, Work in progress, and Next recommended task all updated to reflect Phase 1's completion; Phase 0d marked ✅ Complete in `ROADMAP.md`; the "Admin operations" grouping in Decisions Awaiting Approval is unchanged, since none of its items were resolved by this pass.
- `docs/DECISION_LOG.md` — new entry recording the refinement and freeze.

**Not changed:** no previously-flagged open operational or business decision (allergen/ingredient data-verification responsibility, staff-permission granularity, audit-log retention and granularity, report definitions, staff-facing alert thresholds) was resolved by this pass — all remain explicitly open.

## v29 — 2026-07-18 — `11_ADMIN_WORKFLOWS_SPECIFICATION.md` drafted in full

**Context:** With ten customer-facing specifications frozen, Paul directed Product Specifications to proceed with `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — the eleventh and final planned Phase 1 specification, and the first internal/staff-facing one — naming an extensive coverage list and directing no UI mockups, wireframes, implementation code, database schema, or API design. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/11_ADMIN_WORKFLOWS_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative internal-operations specification, covering all 30 required sections: Admin Workflows Philosophy, Business/Operational Objectives, Entry Points & Scope Boundary, Dashboard, Product Management, Category & Collection Management, Inventory Management, Pricing Management, Promotions Management, Order Management, a **Food Order Workflow** section (the kitchen-facing counterpart to `09_FOOD_ORDERING_SPECIFICATION.md` §7), a **Delivery Management** section (the staff-facing counterpart to `10_DELIVERY_SPECIFICATION.md`), Customer Management, a **Staff Roles & Permissions** section flagging granular RBAC as a genuine open decision, Content Management, a **Search Merchandising Workflow** section, Reports & Analytics, staff-facing Notifications, **Audit Logging** (attributability as a baseline accountability requirement), Security, Operational Decision States, Empty/Loading/Error States, Accessibility (scoped to custom admin extensions, not Medusa's native admin UI), Backend Requirements, Performance Expectations, a **Future Expansion & Explicitly Out of Scope** section naming every excluded capability, Risks & Assumptions, a closing **Admin Workflows Quality Checklist**, and Acceptance Criteria. Derives from and does not contradict `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `BUSINESS_RULES.md`, and all ten frozen prior specifications. Contains no UI mockups, wireframes, implementation code, database schema, or API design, per direct instruction. Confirms several genuine open business/operational decisions (allergen/ingredient data-verification responsibility, staff-permission granularity, audit-log retention and granularity, report definitions, staff-facing alert thresholds), none resolved here.

**Changed (tracking documents):**

- `docs/README.md` (v3.0) — specification status table updated: `11_ADMIN_WORKFLOWS_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review; the placeholder note replaced with confirmation that all 11 planned specifications are now drafted, none remaining as placeholders.
- `docs/PROJECT_STATUS.md` (v3.1), `docs/ROADMAP.md` (v3.4) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: all eleven specifications now drafted (ten frozen, Admin Workflows awaiting review); a new "Admin operations" grouping added to Decisions Awaiting Approval.
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

**Not changed:** granular role-based staff permissions, a dispatch/route-optimization module, a business-intelligence platform, a vendor-facing capability, and AI-assisted decision-making remain unbuilt and unspecified anywhere in `/docs` — this draft explicitly names each as out of scope rather than silently omitting them.

## v28 — 2026-07-18 — `10_DELIVERY_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved `10_DELIVERY_SPECIFICATION.md`, then requested a final refinement pass — a full review against all four frozen Phase 0 documents and all nine frozen prior specifications, plus meaningful refinements in named areas — before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/10_DELIVERY_SPECIFICATION.md`):**

- **Delivery Intent** — a table mapping five recognizable customer intents (reliable arrival, self-collection, mixed-order clarity, plan adjustment, recovery) onto mechanisms already specified elsewhere in the document, mirroring `07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent and `09_FOOD_ORDERING_SPECIFICATION.md`'s Food Ordering Intent pattern.
- **Delivery Trust & Professionalism** — names a rider or pickup interaction as the single most concrete proof of `PRODUCT_BLUEPRINT.md` §11's "sold and delivered by us directly" claim; names landmark-first addressing as a deliberate trust-building design choice, not a tolerated limitation; confirms no rider rating/review mechanism is introduced.
- **Customer Expectations During Delivery** — mirrors `09_FOOD_ORDERING_SPECIFICATION.md`'s "Customer Expectations During Preparation," applied to the delivery/pickup waiting period: the status progression as the primary expectation-management mechanism, no silent estimate revision, no fabricated urgency.
- **Delivery Recovery** — five named scenarios (a failed delivery attempt, an unresolved address ambiguity, a mixed order's one leg failing while the other succeeds, a stale/failed status update, a reschedule or cancellation) governed by the same intent-preservation principle already established in `06_CART_SPECIFICATION.md`'s Cart Recovery, `07_CHECKOUT_SPECIFICATION.md`'s Checkout Recovery, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Account Recovery, and `09_FOOD_ORDERING_SPECIFICATION.md`'s Food Ordering Recovery sections.

**Changed (within the same document):**

- §8 (Pickup Workflow) — new opening framing: pickup is a deliberate parity option, not a fallback.
- §10 (Delivery Status Progression) — two new bullets: transitions move forward only, never silently reverted; every transition is timestamped internally.
- §18 (Customer Communication) — new opening governing-principle framing: a delivery message exists to remove uncertainty, never to create it.
- §21 (Accessibility) — new bullet on focus management after a reschedule, cancellation, or recovery action.
- §29 (Delivery Quality Checklist) — three new checks; §30 (Acceptance Criteria) — two new checks. No previously-flagged open operational decision was resolved or silently assumed.
- Header changed to **Version 1.0, Status: Approved — Frozen**.

**Changed (tracking documents):**

- `docs/README.md` (v2.9) — specification status table updated: `10_DELIVERY_SPECIFICATION.md` now **Approved — Frozen**, v1.0.
- `docs/PROJECT_STATUS.md` (v3.0), `docs/ROADMAP.md` (v3.3) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: all ten drafted specifications now frozen at v1.0; the "Delivery operations" grouping in Decisions Awaiting Approval is unchanged, since none of its items were resolved by this pass.
- `docs/DECISION_LOG.md` — new entry recording the refinement and freeze.

**Not changed:** no previously-flagged open operational or business decision (Wine & Spirits' delivery mechanism, the Lagos delivery-area definition, the delivery-fee schedule, the failed-delivery-attempt policy, the cancellation-cutoff policy, doorstep age verification) was resolved by this pass — all remain explicitly open.

## v27 — 2026-07-18 — `10_DELIVERY_SPECIFICATION.md` drafted in full

**Context:** With nine specifications frozen, Paul directed Product Specifications to continue with `10_DELIVERY_SPECIFICATION.md`, naming an extensive coverage list and directing that this document own delivery operations and customer delivery behaviour without redefining checkout, food ordering, or cart behaviour except where delivery-specific logic genuinely belongs here. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/10_DELIVERY_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative delivery-operations specification, covering all 30 required sections: Delivery Philosophy, Business/Customer Objectives, Entry Points & Scope Boundary, Delivery Coverage (Lagos vs. Nationwide), Wine & Spirits Delivery Workflow, Food Central Delivery Workflow (company-owned riders), Pickup Workflow, Same-Day & Scheduled Delivery Fulfillment, Delivery Status Progression & Delivery Windows (specifying Wine & Spirits' own status vocabulary for the first time), Delivery Tracking Expectations, Address Validation & Landmark Handling, Failed Delivery & Customer-Unavailable Scenarios, Delivery Rescheduling & Cancellation, Mixed Wine & Food Delivery Handling, Delivery Fees, Proof of Delivery & Age Verification at Delivery, Customer Communication, Customer Decision States, Empty/Loading/Error States, Accessibility, a **Delivery Operations Considerations** section, Analytics Events, SEO Considerations, Backend Requirements, Performance Expectations, a **Future Expansion & Explicitly Out of Scope** section naming every excluded feature, Risks & Assumptions, a closing **Delivery Quality Checklist**, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §10, `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, and all nine frozen prior specifications. Grounded in limited external research (Baymard on order confirmation and food-delivery/takeout UX, already cited by prior specifications) cited inline and in a Sources section — no layouts, interfaces, or wording copied. Confirms several genuine open operational and business decisions (Wine & Spirits' delivery mechanism, the Lagos delivery-area definition, the delivery-fee schedule, the failed-delivery-attempt policy, the cancellation-cutoff policy, and doorstep age verification), none resolved here.

**Changed (tracking documents):**

- `docs/README.md` (v2.8) — specification status table updated: `10_DELIVERY_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review.
- `docs/PROJECT_STATUS.md` (v2.9), `docs/ROADMAP.md` (v3.2) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: ten specifications now drafted (nine frozen, Delivery awaiting review); a new "Delivery operations" grouping added to Decisions Awaiting Approval.
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

**Not changed:** third-party courier integrations, live GPS tracking, route optimisation, delivery marketplace features, AI dispatch, autonomous delivery, and locker pickup remain unbuilt and unspecified anywhere in `/docs` — this draft explicitly names each as out of scope rather than silently omitting them.

## v26 — 2026-07-18 — `09_FOOD_ORDERING_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved `09_FOOD_ORDERING_SPECIFICATION.md`, then requested a final refinement pass — a full review against all four frozen Phase 0 documents and all eight frozen prior specifications, plus meaningful refinements in named areas — before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/09_FOOD_ORDERING_SPECIFICATION.md`):**

- **Food Ordering Intent** — a table mapping five recognizable customer intents (craving-driven speed, menu discovery, planning ahead, mixed-order pairing, recovery) onto mechanisms already specified elsewhere in the document, mirroring `07_CHECKOUT_SPECIFICATION.md`'s Checkout Intent pattern.
- **Freshness & Quality Philosophy** — names the connective principle between `BRAND_IDENTITY.md`'s and `EXPERIENCE_PRINCIPLES.md`'s existing freshness/quality language and this document's ordering-specific behaviour: no dish presented as held finished in stock, a prep-time estimate read as a quality signal rather than a competing concern to speed, and quality communicated through accurate information rather than a numeric rating or score.
- **Availability Transition Behaviour** — unifies the transition rules between the three availability states first specified across §6, §9, §16, and §22: a transition is always driven by a real kitchen event, reflected the moment it's known, never silently drops a cart item, and does not require proactively notifying a customer when a dish returns to available.
- **Food Ordering Recovery** — five named scenarios (mid-browse interruption, an item becoming unavailable before checkout, a same-day cutoff passing on an unpurchased cart item, a confirmed scheduled order's kitchen capacity changing before its date, network interruption during placement) governed by the same intent-preservation principle already established in `06_CART_SPECIFICATION.md`'s Cart Recovery, `07_CHECKOUT_SPECIFICATION.md`'s Checkout Recovery, and `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`'s Account Recovery sections.

**Changed (within the same document):**

- §13 (Mixed Wine & Food Orders) — new bullet confirming each fulfillment group's re-validation is independent, so a Food Central item becoming unavailable never invalidates the Wine & Spirits portion of the same order or vice versa.
- §21 (Accessibility) — new bullet extending the existing live-region pattern to any availability-state transition, not only the cutoff countdown and order-status progression.
- §29 (Food Ordering Quality Checklist) — three new checks; §30 (Acceptance Criteria) — two new checks. No previously-flagged open operational decision was resolved or silently assumed.
- Header changed to **Version 1.0, Status: Approved — Frozen**.

**Changed (tracking documents):**

- `docs/README.md` (v2.7) — specification status table updated: `09_FOOD_ORDERING_SPECIFICATION.md` now **Approved — Frozen**, v1.0.
- `docs/PROJECT_STATUS.md` (v2.8), `docs/ROADMAP.md` (v3.1) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: all nine drafted specifications now frozen at v1.0; the "Food ordering operations" grouping in Decisions Awaiting Approval is unchanged, since none of its items were resolved by this pass.
- `docs/DECISION_LOG.md` — new entry recording the refinement and freeze.

**Not changed:** no previously-flagged open operational decision (order-status vocabulary, cutoff/slot parameters, scheduling horizon, kitchen operating hours, allergen-data ownership) was resolved by this pass — all remain explicitly open; one new open item was flagged rather than invented (renegotiating a confirmed scheduled slot whose kitchen capacity has changed since booking).

## v25 — 2026-07-18 — `09_FOOD_ORDERING_SPECIFICATION.md` drafted in full

**Context:** With eight specifications frozen, Paul directed Product Specifications to continue with `09_FOOD_ORDERING_SPECIFICATION.md`, naming an extensive coverage list and directing that the document define Food Central as its own operational experience while remaining part of the single LiquorCentral platform. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/09_FOOD_ORDERING_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative Food Central ordering specification, covering all 30 required sections: Food Ordering Philosophy, Business/Customer Objectives, Entry Points, Food Catalog Structure & Menu Organization, Availability States (a three-state model distinct from Wine & Spirits' stock-based taxonomy), Cook-to-Order Workflow, Preparation Status & Estimated Preparation Times, Same-Day Ordering Rules & Cutoff Behaviour, Scheduling Orders, Pickup Workflow, Delivery Workflow (Customer-Facing), Mixed Wine & Food Orders, Ingredient Transparency & Allergen Information, Quantity Handling & Customisation (Explicitly Out of Scope), Menu Availability Changes & Ingredient Shortages, Customer Expectations During Preparation, Food-Specific Trust Considerations, Customer Decision States, Empty/Loading/Error States, Accessibility, a **Kitchen Operational Considerations** section, Analytics Events, SEO Considerations, Backend Requirements, Performance Expectations, a **Future Expansion & Explicitly Out of Scope** section naming every excluded feature, Risks & Assumptions, a closing **Food Ordering Quality Checklist**, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §6/§10, `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, `USER_FLOWS.md` Flow 4, and all eight frozen prior specifications. Grounded in limited external research (Baymard on food delivery/takeout UX benchmarking) cited inline and in a Sources section — no layouts, interfaces, or wording copied. Confirms several genuine open operational decisions (order-status vocabulary, cutoff/slot parameters, scheduling horizon, kitchen operating hours, allergen-data ownership), none resolved here.

**Changed (tracking documents):**

- `docs/README.md` (v2.6) — specification status table updated: `09_FOOD_ORDERING_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review.
- `docs/PROJECT_STATUS.md` (v2.7), `docs/ROADMAP.md` (v3.0) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: nine specifications now drafted (eight frozen, Food Ordering awaiting review); a new "Food ordering operations" grouping added to Decisions Awaiting Approval.
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

**Not changed:** table booking, dine-in, loyalty, subscriptions, AI recommendations, reviews, recipe content, and meal customization beyond established attributes remain unbuilt and unspecified anywhere in `/docs` — this draft explicitly names each as out of scope rather than silently omitting them.

## v24 — 2026-07-18 — `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, then requested a final refinement pass — a full review against all four frozen Phase 0 documents and all seven frozen prior specifications, plus meaningful refinements in named areas — before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/08_CUSTOMER_ACCOUNT_SPECIFICATION.md`):**

- **Account Lifecycle** — a new unnumbered section consolidating the account's state transitions (Guest → Registered → Active → Deactivated → Deleted) into one view, specifying reactivation mechanics and an explicit rule that in-progress orders are never affected by a lifecycle transition.
- **Session & Security Behaviour** — a new unnumbered section specifying password-change session invalidation, permitted concurrent multi-device sessions, login rate-limiting/lockout, and step-up reauthentication for sensitive actions.
- **Account Recovery** — a new unnumbered section (five named scenarios: forgotten password, lost registration-email access, expired links, session expiry mid-edit, lockout), governed by the same intent-preservation principle already established in `06_CART_SPECIFICATION.md`'s Cart Recovery and `07_CHECKOUT_SPECIFICATION.md`'s Checkout Recovery sections.

**Changed:**

- §12 (Saved Addresses) gained a bullet on default-address-deletion behavior.
- §15 (Reordering Behaviour) gained an opening "reorder philosophy" framing.
- §16 (Notification Preferences) gained a bullet on the pre-preference default state.
- §19 (Trust Considerations) gained a cross-reference to session security as a trust mechanism.
- §22 (Accessibility) gained two bullets: focus management after an irreversible action, live-region announcements for account state changes.
- §28 (Risks & Assumptions) updated to note the lifecycle/session/recovery gaps are now fully specified, without altering any still-open business/legal decision.
- §29 (Account Quality Checklist) gained three new checks; §30 (Acceptance Criteria) gained five new checks.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Approved — Frozen**, per Paul's explicit instruction to freeze once the refinement pass was complete.
- `docs/README.md` (v2.5) — specification status table updated to `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`: Approved — Frozen, v1.0.
- `docs/PROJECT_STATUS.md` (v2.6), `docs/ROADMAP.md` (v2.9) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: eight specifications now frozen; a new "Account & privacy" grouping added to Decisions Awaiting Approval.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and the freeze.

**Not changed:** a standalone "Operational Behaviour" section was deliberately not added — the one genuine operational question (lifecycle-vs-in-progress-order interaction) is addressed within Account Lifecycle instead, avoiding collision with the different, already-established meaning "Operational Behaviour" carries in `04_PRODUCT_LISTING_SPECIFICATION.md` and `06_CART_SPECIFICATION.md`.

## v23 — 2026-07-18 — `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` drafted in full

**Context:** With seven specifications frozen, Paul directed Product Specifications to continue with `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, naming an extensive coverage list and explicitly excluding loyalty, wishlists, reviews, subscriptions, personalization, social login, and AI features unless already approved elsewhere. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/08_CUSTOMER_ACCOUNT_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative customer account specification, covering all 30 required sections: Account Philosophy, Business/Customer Objectives, Entry Points, Account Information Architecture, Account Creation Behaviour, Guest-to-Account Conversion, Login & Logout Behaviour, Password Reset Behaviour, Email Verification Behaviour, Profile Management, Saved Addresses, Order History, Order Details, Reordering Behaviour, Saved Items (relationship to `06_CART_SPECIFICATION.md`'s Saved-for-Later), Notification Preferences, Privacy & Security, Account Deletion & Deactivation, Trust Considerations, Customer Decision States (reusing the exact five-state taxonomy from `06`/`07`), Empty/Loading/Error States, Accessibility, Analytics Events, SEO Considerations, Backend Requirements, Performance Expectations, a **Future Expansion & Explicitly Out of Scope** section naming every excluded feature and why, Risks & Assumptions, a closing **Account Quality Checklist**, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §4/§9, `BUSINESS_RULES.md`, `TECH_STACK.md`, and all seven frozen prior specifications. Grounded in limited external research (Nielsen Norman Group on registration/login and password reset, Baymard on accounts/self-service, order history, order returns, and address-book UX) cited inline and in a Sources section — no layouts, interfaces, or wording copied. Confirms three genuine open business/legal decisions (data-retention/NDPR specifics, account deletion-vs-deactivation policy, notification-channel choice), none resolved here.

**Changed (tracking documents):**

- `docs/README.md` (v2.4) — specification status table updated: `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review.
- `docs/PROJECT_STATUS.md` (v2.5), `docs/ROADMAP.md` (v2.8) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: eight specifications now drafted (seven frozen, Customer Account awaiting review); two new open items (data retention/NDPR, deletion/deactivation policy) added to "Decisions awaiting Paul's approval."
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

**Not changed:** loyalty, wishlists, reviews, subscriptions, personalization, social login, and AI features remain unbuilt and unspecified anywhere in `/docs` — this draft explicitly names each as out of scope rather than silently omitting them.

## v22 — 2026-07-18 — `07_CHECKOUT_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved `07_CHECKOUT_SPECIFICATION.md`, then requested a final refinement pass — a full review against all four frozen Phase 0 documents and all six frozen prior specifications, plus meaningful refinements in named areas — before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/07_CHECKOUT_SPECIFICATION.md`):**

- **Checkout Intent** — a new unnumbered section mapping four named customer intents (Fast Completion, Careful Review, Mixed-Order Resolution, Recovery) onto mechanisms already specified elsewhere in the document, explicitly without introducing AI or personalization.
- **Customer Decision States** — a new unnumbered section that reuses `06_CART_SPECIFICATION.md`'s exact five-state taxonomy (informational, recommendation, warning, blocking condition, recoverable error), instantiated with checkout-specific triggers, rather than inventing a parallel vocabulary.
- **Payment State Behaviour** — a new unnumbered section specifying pending, failed, cancelled, expired, and retry as distinct, provider-agnostic payment states — closing a genuine gap the first draft left unaddressed for asynchronous local payment methods (bank transfer, USSD).
- **Checkout Recovery** — a new unnumbered section (five named scenarios: browser closed mid-checkout, session/cart expiry, payment-redirect return, network interruption during final submission, blocking-condition resolution), governed by the same intent-preservation principle already established in `06_CART_SPECIFICATION.md`'s Cart Recovery section.
- **Checkout Quality Checklist** — a new unnumbered closing section every future checkout change must satisfy, mirroring every other frozen specification's own closing checklist.

**Changed:**

- §16 (Order Review Step) gained an opening framing: review builds confidence, introduces no new decision.
- §18 (Trust Signals) gained a bullet on pending-payment reassurance, cross-referencing Payment State Behaviour.
- §21 (Error States) gained a cross-reference to Payment State Behaviour and Checkout Recovery.
- §22 (Accessibility) gained two bullets: focus return after an external payment redirect, and live-region announcements for payment-state changes.
- §29 (Risks & Assumptions) updated to note the backend-failure-after-payment risk is now fully specified (Checkout Recovery), without removing any still-open business decision.
- §30 (Acceptance Criteria) gained four new checks reflecting the new sections.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Approved — Frozen**, per Paul's explicit instruction to freeze once the refinement pass was complete.
- `docs/README.md` (v2.3) — specification status table updated to `07_CHECKOUT_SPECIFICATION.md`: Approved — Frozen, v1.0.
- `docs/PROJECT_STATUS.md` (v2.4), `docs/ROADMAP.md` (v2.7) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: seven specifications now frozen; `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` named as the natural next candidate, not yet begun and not to start without Paul's explicit approval.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and the freeze.

**Not changed:** Mixed-Order Checkout Behaviour (§8) was reviewed directly against `06_CART_SPECIFICATION.md`'s frozen text and confirmed already consistent — no content change required. A standalone "Operational Behaviour" section was deliberately not added, since its substance is fully covered by Payment State Behaviour and Checkout Recovery together, and a separate section under that name would have collided with the different, already-established meaning "Operational Behaviour" carries in `04_PRODUCT_LISTING_SPECIFICATION.md` and `06_CART_SPECIFICATION.md`.

## v21 — 2026-07-18 — `07_CHECKOUT_SPECIFICATION.md` drafted in full

**Context:** With the repository reconciled (v20, below) and six specifications frozen, Paul directed Product Specifications to continue with `07_CHECKOUT_SPECIFICATION.md`. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/07_CHECKOUT_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative checkout specification, covering all 30 required sections: Checkout Philosophy, Business/Customer Objectives, Entry Points, Checkout Information Architecture (a six-step logical sequence), Guest Checkout Behaviour, Address Capture Behaviour, a **Mixed-Order Checkout Behaviour** section (one address per order in v1; the cart's two fulfillment-leg groups carried through every step; a new blocking condition for a non-Lagos address paired with a Food Central item), Delivery Method Selection, Delivery Slot Selection Behaviour, Address-Based Delivery Eligibility Enforcement, Availability Re-validation at Checkout, Pricing and Fee Calculation (completing `06_CART_SPECIFICATION.md`'s Pricing Transparency table), Payment Behaviour (provider-agnostic; cash-on-delivery flagged open), Age-Verification Backstop (hard recheck at confirmation left explicitly open), Order Review Step, Order Confirmation, Trust Signals, Empty/Invalid Checkout States, Loading States, Error States, Accessibility, Responsive Behaviour, Analytics, SEO Considerations, Backend Requirements, Performance Expectations, Future Expansion, Risks & Assumptions, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §9/§11, `BUSINESS_RULES.md`, `DELIVERY_MODEL.md`, `USER_FLOWS.md`, and all six frozen prior specifications. Grounded in limited external research (Baymard checkout-flow, guest-checkout-prominence, form-field-minimization, mobile-checkout, and order-confirmation-page research) cited inline and in a Sources section — no layouts, interfaces, or wording copied. Confirms five delivery-related business decisions already flagged by `06_CART_SPECIFICATION.md` as checkout-level dependencies, plus the payment-provider and notification-channel gaps as launch-critical.

**Changed (tracking documents):**

- `docs/README.md` (v2.2) — specification status table updated: `07_CHECKOUT_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review.
- `docs/PROJECT_STATUS.md` (v2.3), `docs/ROADMAP.md` (v2.6) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: seven specifications now drafted (six frozen, Checkout awaiting review).
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

## v20 — 2026-07-18 — Repository reconciliation, round two

**Context:** An onboarding read at the start of this session found the working branch (`claude/medusa-repo-clone-ut5dl5`) missing `docs/AI_HANDOFF.md` and `docs/DOCUMENTATION_GOVERNANCE.md` entirely, and lagging a second session's branch (`claude/project-onboarding-status-p35u3v`) by 12 commits. Full reasoning in `DECISION_LOG.md`.

**Changed:**

- `claude/medusa-repo-clone-ut5dl5` fast-forwarded from `63efb10` to `78b31c4` — purely additive, no history rewritten, no squash, no force-push. Brings in `docs/AI_HANDOFF.md`, `docs/DOCUMENTATION_GOVERNANCE.md`, and specifications 01, 03, 04, 05, 06 fully drafted and frozen to v1.0, none of which previously existed on this branch.
- A pre-reconciliation, in-progress draft of `01_NAVIGATION_SPECIFICATION.md`, produced independently on this branch earlier in the same session before the discrepancy was discovered, was confirmed fully superseded and dropped rather than merged in.

**Validated post-merge (all passed):** all four frozen Phase 0 documents and all six frozen specifications unchanged; zero conflict markers in `/docs`; every markdown cross-reference resolves; every document has a status header; every specification's header status matches `docs/README.md`'s table; `docs/AI_HANDOFF.md` and `docs/DOCUMENTATION_GOVERNANCE.md` present and current; `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/DECISION_LOG.md`, and `docs/CHANGELOG.md` all synchronized.

**Not changed:** no document's substantive content was altered by this reconciliation — it was a pure branch-pointer fast-forward.

## v19 — 2026-07-18 — `06_CART_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved `06_CART_SPECIFICATION.md` in principle, then requested a final refinement pass before freezing v1.0 — explicitly no redesign and no section removal. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/06_CART_SPECIFICATION.md`):**

- **Customer Decision States** — a new unnumbered section classifying every cart message into five types (informational, recommendation, warning, blocking condition, recoverable error), each with a table entry for why it appears, when it appears, customer impact, and expected customer action.
- **Pricing Transparency** — a new unnumbered section (expanding on §8, §9, §15) consolidating every cart amount — line item price, Gift Wrap fee, promotional adjustment, fulfillment-group subtotal, cart-wide item total, delivery fee, tax, grand order total — into one table distinguishing confirmed amounts from estimated/unknown ones.
- **Cart Recovery** — a new unnumbered section (extending §12, §13, §16, §22) documenting expected behaviour across nine named scenarios: expired guest sessions, customer-removed products, discontinued products, hidden products, inventory shortfalls, system-driven quantity adjustments, price updates, failed updates, and temporary network interruptions — governed by an explicit intent-preservation principle.

**Changed:**

- §6 (Mixed Cart Behaviour) expanded in place with an "Avoiding fulfillment confusion — concrete mechanisms" subsection (distinct group labeling, no shared/averaged copy, an optional disclosure explainer, per-group-scoped notices) and a Future Operational Expansion note confirming the two-group model generalizes to a hypothetical future fulfillment leg without requiring redesign.
- §23 (Accessibility) expanded in place with six new bullets: keyboard navigation, focus management, screen-reader coverage extended beyond cart totals, per-control touch targets on the quantity stepper/remove/gift-wrap controls, error announcements via the same live-region mechanism, and a requirement that dynamic updates never require a full re-scan.
- §29 (Cart Quality Checklist) expanded with five new checks: pricing clarity, fulfillment clarity, operational transparency, recovery behaviour, and readiness for checkout.
- §8, §19, and §22 each gained a one-line cross-reference to their corresponding new section, avoiding duplicated content.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Approved — Frozen**, per Paul's explicit instruction to freeze once the refinement pass was complete.
- `docs/README.md` (v2.1) — specification status table updated to `06_CART_SPECIFICATION.md`: Approved — Frozen, v1.0.
- `docs/PROJECT_STATUS.md` (v2.2), `docs/ROADMAP.md` (v2.5) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: six specifications now frozen; `07_CHECKOUT_SPECIFICATION.md` named as the natural next candidate, not yet begun.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and the freeze.

**Not changed:** no new external research was added for this pass — Customer Decision States, Pricing Transparency, Cart Recovery, and the expanded Accessibility and Quality Checklist sections extend principles already established in `06_CART_SPECIFICATION.md` and its previously cited research base.

## v18 — 2026-07-18 — `06_CART_SPECIFICATION.md` drafted in full

**Context:** With five specifications frozen, Paul directed Product Specifications to continue with `06_CART_SPECIFICATION.md`, the authoritative specification for the LiquorCentral shopping cart, with a deep-dive instruction for Mixed Cart Behaviour (documenting exactly how the cart behaves when Wine & Spirits and Food Central are combined, without inventing any open business rule) plus dedicated treatment of Cart Philosophy, Trust, and Future Readiness. Unlike the instruction for `05`, this one did not include a Finalization/freeze directive, so the document was drafted to v0.1/In Progress, awaiting Paul's review before any refinement-pass-then-freeze or direct-freeze decision. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/06_CART_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative shopping cart specification, covering all 30 required sections: Cart Philosophy, Business/Customer Objectives, Entry Points, Cart Information Architecture, a deep-dive **Mixed Cart Behaviour** section, Quantity Management, Price Calculations, Promotions, Delivery Eligibility, Pickup Eligibility, Availability Changes, Out-of-Stock Behaviour, a **Saved-for-Later Strategy** (new recommendation), Gift Wrapping, Cart Persistence, Estimated Delivery Messaging, Cross-selling, a **Trust Signals** section, Empty Cart Behaviour, Loading States, Error States, Accessibility, Analytics, SEO Considerations, Backend Requirements, a **Future Expansion** section (loyalty, subscriptions, saved carts, shared carts, gift registries, corporate ordering — capability only), Risks & Assumptions, a numbered **Cart Quality Checklist** (§29), and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §9/§10, `DELIVERY_MODEL.md`, `USER_FLOWS.md`, `BUSINESS_RULES.md`, and all five frozen prior specifications. Grounded in limited external research (Baymard cart-abandonment and checkout-UX research, cart-abandonment statistics, Shopify/Optimizely split-shipment documentation, persistent-cart research, ARIA live-region and screen-reader accessibility research) cited inline and in a Sources section — no layouts, interfaces, or wording copied. Key decisions: line items grouped by fulfillment leg (Wine & Spirits / Food Central) as two visually distinct groups with their own subtotals, feeding into one cart-wide total and one checkout action, per `PRODUCT_BLUEPRINT.md` §9's no-order-splitting rule; delivery messaging for each fulfillment leg is never merged into one promise; exact scheduling/slot selection is explicitly deferred to `07_CHECKOUT_SPECIFICATION.md`; five business decisions are explicitly flagged as open rather than invented (Wine & Spirits delivery mechanism, Lagos delivery-area definition, delivery-slot parameters, cash-on-delivery, hard age-recheck at order confirmation); Availability Changes (§12) and Out-of-Stock Behaviour (§13) are kept as two distinct, non-overlapping sections; Saved-for-Later (§14, cart-item-level) is kept distinct from the future "Saved carts" capability (§27, whole-cart-level); cart total/subtotal updates are announced via an ARIA live region, closing a documented screen-reader gap around cart-total changes. Confirms the "pairs with" gap as a dependency of a sixth specification, and flags Saved-for-Later as a new, not-yet-scoped backend recommendation in `MEDUSA_EXTENSIONS.md`.

**Changed (tracking documents):**

- `docs/README.md` (v2.0) — specification status table updated: `06_CART_SPECIFICATION.md` now **In Progress**, v0.1, full draft complete, awaiting review.
- `docs/PROJECT_STATUS.md` (v2.1), `docs/ROADMAP.md` (v2.4) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: six specifications now drafted (five frozen, Cart awaiting review); the "pairs with" gap now flagged by six specifications; Saved-for-Later and Cart's five delivery-related open decisions added to "Decisions awaiting Paul's approval."
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting.

## v17 — 2026-07-18 — `05_PRODUCT_DETAILS_SPECIFICATION.md` drafted in full and frozen to v1.0

**Context:** Paul directed Product Specifications to continue with Product Details, this time specifying the full scope (including the deep-dive treatments and closing Quality Checklist) up front and instructing a direct freeze on completion, rather than the draft-then-separate-refinement-pass sequence used for `01`–`04`. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/05_PRODUCT_DETAILS_SPECIFICATION.md` (v1.0, status Approved — Frozen) — the authoritative product detail page specification, covering all 30 required sections plus a closing **Product Details Quality Checklist**: Product Detail Philosophy, Business/Customer Objectives, Entry Points, Information Architecture, Product Gallery Behaviour, a four-tier **Product Information Hierarchy** (always visible / progressively disclosed / optional / never shown), Pricing and Availability Behaviour (reusing `04`'s unavailable/hidden/discontinued distinction), a **Wine Product Experience** section, a **Food Product Experience** section, Product Attributes vs. Product Facts (data model vs. presentation, kept distinct), Pairing Recommendations, Related Products, Cross-selling, Quantity Selection, Add to Cart Behaviour, a **Trust Signals** section, Delivery and Pickup Information, a Reviews Strategy confirming no review system exists in v1, Empty/Error States, Accessibility, Analytics, SEO Considerations, Backend Requirements, a **Future Expansion** section (reviews, expert reviews, recommendations, personalization, AI assistance, richer educational content — documented as capability only), and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §3/§13, the four frozen Phase 0 documents, and all four frozen prior specifications. Grounded in limited external research (Baymard, wine-ecommerce UX research, digital-menu allergen-transparency research, progressive-disclosure and cart-feedback research) cited for principles only; no layouts, interfaces, or wording copied. Confirms the "pairs with" gap as a dependency of a fifth specification.

**Changed (tracking documents):**

- `docs/README.md` (v1.9) — specification status table updated: `05_PRODUCT_DETAILS_SPECIFICATION.md` now **Approved — Frozen**, v1.0.
- `docs/PROJECT_STATUS.md` (v2.0), `docs/ROADMAP.md` (v2.3) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: five specifications now frozen; `06_CART_SPECIFICATION.md` named as the natural next candidate, not yet begun.
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting and direct freeze.

## v16 — 2026-07-18 — `04_PRODUCT_LISTING_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved the overall Product Listing Specification, then requested a final refinement pass before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/04_PRODUCT_LISTING_SPECIFICATION.md`):**

- **Listing Intent** — a new unnumbered section mapping seven named browsing intentions (inspiration, buying a known product, comparing, budget shopping, premium/luxury exploration, gift shopping, food pairing) onto mechanisms already specified elsewhere in the document, explicitly without introducing AI or personalization into v1.
- **Product Card Information Hierarchy** — a new unnumbered section stating exactly what's always visible (image, name, price), conditionally visible (at most one of: badge, catalog-specific fact, quick-add), and never shown (full descriptions, multiple simultaneous facts, personalized content, fabricated claims) on a listing card.
- **Merchandising Governance** — a new unnumbered section stating what merchandising can influence (Featured order, badge content, Collection membership) and cannot (relevance/ranking established by Navigation and Search, availability facts, pricing beyond a genuine promotion, the one-slot/one-module caps), with explicit promotional limits, expiry behavior, and trust requirements.
- **Operational Behaviour** — a new unnumbered section specifying predictable behavior as products become unavailable, low stock, price changes, promotions expire, products are hidden, or products are discontinued — introducing a "low stock" state and a clean three-way "unavailable/hidden/discontinued" distinction.
- **Listing Quality Checklist** — a new unnumbered closing section every future listing change must satisfy.

**Changed:**

- §9 (Product Card Behaviour), §16 (Merchandising Rules), and §21 (Empty States) each gained a one-line cross-reference to their corresponding new section, avoiding duplicated explanation.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Approved — Frozen**, per Paul's explicit instruction to move directly to frozen status once the refinement pass was complete.
- `docs/README.md` (v1.8) — specification status table updated to `04_PRODUCT_LISTING_SPECIFICATION.md`: Approved — Frozen, v1.0.
- `docs/PROJECT_STATUS.md` (v1.9), `docs/ROADMAP.md` (v2.2) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: four specifications now frozen; `05_PRODUCT_DETAILS_SPECIFICATION.md` named as the natural next candidate, not yet begun.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and the freeze.

## v15 — 2026-07-18 — `02_HOMEPAGE_SPECIFICATION.md` frozen; `04_PRODUCT_LISTING_SPECIFICATION.md` drafted in full

**Context:** Paul reconfirmed `03_SEARCH_SPECIFICATION.md`'s frozen status, directed a consistency review of `02_HOMEPAGE_SPECIFICATION.md` against the now-frozen Navigation and Search specifications, and directed Product Specifications to continue with Product Listing. Full reasoning in `DECISION_LOG.md`.

**Changed:**

- `docs/specifications/02_HOMEPAGE_SPECIFICATION.md` — reviewed for internal consistency against `01_NAVIGATION_SPECIFICATION.md` and `03_SEARCH_SPECIFICATION.md` (both frozen); no content changes required. Status changed from Under Review to **Approved — Frozen**, version bumped **0.1 → 1.0**. Per `DOCUMENTATION_GOVERNANCE.md` Section 5, it may now only be modified in response to an explicit new business decision.

**Added:**

- `docs/specifications/04_PRODUCT_LISTING_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative product listing and browsing specification, covering all 30 required sections: Product Listing Philosophy, Business Objectives, Customer Objectives, Entry Points, Listing Types, Category Listings, Collection Listings, Search Result Listings (deferred to `03_SEARCH_SPECIFICATION.md`), a detailed Product Card Behaviour section, Filtering, Sorting, Active Filter Behaviour, Pagination vs. Infinite Scroll, Mobile Behaviour, Desktop Behaviour, Merchandising Rules, Promotional Content, Cross-selling Opportunities, Food Central Listings, Wine & Spirits Listings, Empty States, Loading States, Error States, Accessibility, Analytics, SEO Considerations, Backend Requirements, Performance Expectations, Future Expansion, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §6, the four frozen Phase 0 documents, and all three frozen prior specifications. Grounded in limited external research (Baymard, Smashing Magazine, NN/g, product-card and accessible-card design research) cited for principles only; no layouts, interfaces, or wording copied. Key decisions: pure infinite scroll rejected in favor of "Load More" with lazy-loading and URL-reflected state; default listing sort is "Featured," explicitly distinct from search's "Relevance" default; product cards implement at most one supporting fact and one promotional badge, with quick-add as a separate sibling control (never a link nested inside a link); Food Central cards default to quick-add, Wine & Spirits cards favor click-through. Flags the "pairs with" relationship as a fourth surface depending on the same unscoped `MEDUSA_EXTENSIONS.md` gap.

**Changed (tracking documents):**

- `docs/README.md` (v1.7) — specification status table updated: `02_HOMEPAGE_SPECIFICATION.md` now **Approved — Frozen**, `04_PRODUCT_LISTING_SPECIFICATION.md` now **In Progress**.
- `docs/PROJECT_STATUS.md` (v1.8), `docs/ROADMAP.md` (v2.1) — Phase 1 status, Completed work, Work in progress, and Next recommended task all updated: three specifications now frozen, `04` is the only one awaiting a decision.
- `docs/DECISION_LOG.md` — two new entries: the homepage specification's freeze, and the listing specification's drafting.

## v14 — 2026-07-18 — `03_SEARCH_SPECIFICATION.md` finalized to v1.0 and frozen

**Context:** Paul approved the overall Search Specification, then requested a final refinement pass before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/03_SEARCH_SPECIFICATION.md`):**

- **Search Intent** — a new unnumbered section mapping eight named customer intents (exact product lookup, category exploration, gifting, occasion shopping, food pairing, budget shopping, premium/luxury browsing, educational discovery) onto mechanisms already specified elsewhere in the document, with an explicit statement that none of it introduces AI or personalization into Version 1.
- **Query Understanding** — a new unnumbered section covering abbreviations, spelling mistakes (cross-referencing §8), plural/singular normalization, local Nigerian terminology, and wine/spirit/food terminology — all served through typo tolerance, synonyms, and full-text matching, not a natural-language-understanding model.
- **Ranking Philosophy** — a new unnumbered section stating the priority order (relevance first; then availability; then bounded business merchandising; popularity and freshness explicitly not silent v1 ranking factors) and, explicitly, what may never override relevance: no promotional/business/availability signal may insert an irrelevant product or outrank an exact match on the customer's own query.
- **Operational Considerations** — a new unnumbered section specifying predictable behavior as products become unavailable, prices change, promotions expire, and inventory changes, plus a three-way distinction between "unavailable" (labeled, findable), "hidden" (a deliberate merchandising decision, fully excluded), and "deleted" (removed from the index promptly).
- **Search Quality Checklist** — a new unnumbered closing section every future search change must satisfy, mirroring `DESIGN_SYSTEM.md`'s and `01_NAVIGATION_SPECIFICATION.md`'s own quality checklists.

**Changed:**

- §10 (Product Ranking) gained a one-line cross-reference to the new Ranking Philosophy section, avoiding duplicated priority-order explanation between the two.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Approved — Frozen**, per Paul's explicit instruction to move directly to frozen status once the refinement pass was complete.
- `docs/README.md` (v1.6) — specification status table updated to `03_SEARCH_SPECIFICATION.md`: Approved — Frozen, v1.0.
- `docs/PROJECT_STATUS.md` (v1.7), `docs/ROADMAP.md` (v2.0) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated: `02_HOMEPAGE_SPECIFICATION.md` is now the only specification still awaiting a decision.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and the freeze.

## v13 — 2026-07-18 — `01_NAVIGATION_SPECIFICATION.md` approved and frozen; `03_SEARCH_SPECIFICATION.md` drafted in full

**Context:** Paul approved Navigation Specification v1.0 in full. Product Specifications resumed with Search, per Paul's direction. Full reasoning in `DECISION_LOG.md`.

**Changed:**

- `docs/specifications/01_NAVIGATION_SPECIFICATION.md` — status changed from Under Review to **Approved — Frozen**. Header, closing checklist statement, and Document status note all updated to reflect approval; per `DOCUMENTATION_GOVERNANCE.md` Section 5, it may now only be modified in response to an explicit new business decision from Paul, logged in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/03_SEARCH_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative search and product-discovery specification, covering all 30 required sections: Search Philosophy, Business Objectives, Customer Objectives, Search Entry Points (integrating with `01_NAVIGATION_SPECIFICATION.md` §15 rather than redefining it), Search Scope, Search Behaviour, Autocomplete Strategy, Typo Tolerance, Synonym Strategy, Product Ranking, Editorial Boosting, Merchandising Rules, Filtering Strategy, Sorting Strategy, Wine Discovery, Food Discovery, Cross-selling Opportunities, Zero Results Behaviour, Empty States, Loading States, Error States, Accessibility, Mobile Search, Analytics, SEO Considerations, Backend Requirements, Performance Expectations, Future Expansion, Risks & Assumptions, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §8, the four frozen Phase 0 documents, and both approved/under-review prior specifications. Grounded in limited external research (Baymard, Meilisearch documentation, mobile filter UX research, WAI-ARIA live-region guidance, semantic-search industry research) cited for principles only; no interfaces, layouts, or wording copied. Names editorial boosting, filtering, and merchandising rules against the same non-manipulation, capped, auto-expiring discipline `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy already established. Flags the "pairs with" cross-sell relationship as not yet scoped in `MEDUSA_EXTENSIONS.md` at all (previously only flagged as "not yet built").

**Changed (tracking documents):**

- `docs/README.md` (v1.5) — specification status table updated: `01_NAVIGATION_SPECIFICATION.md` now **Approved — Frozen**, `03_SEARCH_SPECIFICATION.md` now **In Progress**.
- `docs/PROJECT_STATUS.md` (v1.6), `docs/ROADMAP.md` (v1.9) — Phase 1 status, Completed work, Work in progress, and Next recommended task all updated; `03_SEARCH_SPECIFICATION.md`'s dependency on Meilisearch's formal sign-off and the newly-sharpened "pairs with" scoping gap both logged as open items.
- `docs/DECISION_LOG.md` — two new entries: Navigation Specification's approval/freeze, and the Search Specification's drafting.

## v12 — 2026-07-18 — `01_NAVIGATION_SPECIFICATION.md` finalized to v1.0

**Context:** Paul approved the overall Navigation Specification's architecture as aligned with `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md`, then requested one final refinement pass before freezing v1.0. Full reasoning in `DECISION_LOG.md`.

**Added (within `docs/specifications/01_NAVIGATION_SPECIFICATION.md`):**

- **Navigation Governance** — a new unnumbered section with a table classifying every navigation element (shell structure, category tree, collections, promotional collections, facets, footer links, breadcrumbs, search, account/cart, accessibility mechanics) by who controls it and whether developer involvement is required, organized around the rule that navigation *structure* is developer-governed and navigation *content* is data/merchandising-governed.
- **Merchandising Strategy** — a new unnumbered section defining promotional navigation (featured collections, seasonal campaigns, limited-time promotions, gifting occasions, editorial destinations, new arrivals, premium selections) as an optional, capped (3–4 simultaneous entries), auto-expiring layer distinct from permanent taxonomy, with an explicit no-fake-urgency rule per `EXPERIENCE_PRINCIPLES.md` #15.
- **Navigation Quality Checklist** — a new unnumbered closing section, mirroring `DESIGN_SYSTEM.md`'s own Design Quality Checklist, that every future navigation change must satisfy.

**Changed:**

- §27 (Performance Considerations) expanded with a maximum navigation-depth budget (three levels beneath a root branch), interaction-latency targets reusing `DESIGN_SYSTEM.md` §B10's existing motion tokens rather than inventing new ones, and a three-tier graceful-degradation model (cached tree → hardcoded two-branch fallback → independent shell rendering).
- §28 (Future Expansion Strategy) expanded with a table demonstrating the architecture's reach into additional services, subscriptions, educational content, events, corporate gifting, and a hypothetical future business line — explicitly framed as a capability demonstration, not authorized roadmap work, mirroring `DESIGN_SYSTEM.md`'s "Future Theme Support" framing.
- Document header: **Version 0.1 → 1.0**, **Status: In Progress → Under Review**. A closing note clarifies that "Version 1.0" here means complete and frozen-ready, not yet formally Approved — that status still requires Paul's confirmation, per `DOCUMENTATION_GOVERNANCE.md` Section 4.
- `docs/README.md` (v1.4) — specification status table updated to `01_NAVIGATION_SPECIFICATION.md`: Under Review, v1.0.
- `docs/PROJECT_STATUS.md` (v1.5), `docs/ROADMAP.md` (v1.8) — Phase 1 status, Completed work, Work in progress, and Next recommended task updated to reflect the finalized v1.0 draft awaiting final approval.
- `docs/DECISION_LOG.md` — new entry recording the refinement pass and its content.

**Not changed:** no external research was added for this pass — Governance, Merchandising, Scalability, and Performance are internal architecture/process decisions extending the already-cited research base, not new claims requiring new citations.

## v11 — 2026-07-18 — `01_NAVIGATION_SPECIFICATION.md` drafted in full

**Context:** Product Specifications resumed per Paul's direction, following the documentation governance hardening pass. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/specifications/01_NAVIGATION_SPECIFICATION.md` (v0.1, status In Progress) — the authoritative navigation specification for the entire platform, covering all 30 required sections: Navigation Philosophy, Business Objectives, Customer Objectives, Information Architecture (with a consolidated Backend Data Requirements table), Global/Desktop/Mobile Navigation Strategy, Footer Navigation, Header Behaviour, Mega Menu Strategy, Product Category Navigation, Collection Navigation, Wine Discovery Navigation, Food Central Navigation, Search Entry Points, Account Navigation, Cart & Checkout Navigation Rules, Breadcrumb Strategy, Internal Linking Strategy, Deep Linking, Accessibility Requirements, Keyboard Navigation, Responsive Behaviour, Empty & Error Navigation States, Analytics Events, SEO Considerations, Performance Considerations, Future Expansion Strategy, Risks & Assumptions, and Acceptance Criteria. Derives from and does not contradict `PRODUCT_BLUEPRINT.md` §5/§7, `INFORMATION_ARCHITECTURE.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0. Grounded in limited external research (mega menu, mobile navigation, breadcrumb, WAI-ARIA keyboard, search-vs-navigation, luxury-ecommerce, and food-delivery-navigation sources — see the specification's own Sources section) cited for principles only; no layouts, menu wording, branding, or proprietary interactions were copied. Designs the product-category and collection navigation as data-driven (Medusa Product Category/Collection records rendered dynamically), explicitly not hardcoding the current catalog list, per Paul's instruction. Flags one new open merchandising item (exact spirit-type category grouping within the mega menu's link budget) and repeats one already-flagged backend gap (the "pairs with" product-relationship data, not yet modeled).

**Changed:**

- `docs/specifications/02_HOMEPAGE_SPECIFICATION.md` — status changed from In Progress to **Under Review**, per Paul's explicit instruction (the document itself was complete and awaiting approval; the status now reflects that accurately per `DOCUMENTATION_GOVERNANCE.md` Section 4's distinction between the two).
- `docs/README.md` — Product Specifications status table updated: `01_NAVIGATION_SPECIFICATION.md` now **In Progress** (fully drafted, v0.1), `02_HOMEPAGE_SPECIFICATION.md` now **Under Review**.
- `docs/PROJECT_STATUS.md` (v1.4) — Phase 1 status, Completed work, Work in progress, and Next recommended task all updated to reflect `01`'s full draft and both specifications' current statuses; added the new mega-menu category-grouping item to "Decisions awaiting Paul's approval."
- `docs/ROADMAP.md` (v1.7) — Phase 0d's specification list and the "Open questions" section updated to reflect `01`'s completion and its new open item.
- `docs/DECISION_LOG.md` — new entry recording the specification's drafting and its scope decisions.

## v10 — 2026-07-18 — Documentation governance hardening pass

**Context:** Repository governance work, not product design, per Paul's explicit instruction — a final hardening pass before resuming Product Specifications. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/DOCUMENTATION_GOVERNANCE.md` (v1.0) — the governing standard for all documentation work: Purpose; Single Source of Truth; Documentation Hierarchy (Business Decisions → Brand & Experience → Design System → Product Specifications → Implementation Planning → Code); Document Lifecycle (nine statuses: Not Started, Draft, In Progress, Under Review, Approved, Frozen, Deprecated, Superseded, Archived); Change Rules; Cross-Reference Rules; Versioning Rules; AI Contributor Rules; Human Contributor Rules; Repository Workflow; Quality Checklist; Future Maintenance; and the Audit Process used for this pass's own audit.

**Changed (audit fixes — every genuine inconsistency the audit found; nothing else was touched):**

- `docs/README.md` (v1.3) — "Document status convention" section rewritten to defer to `DOCUMENTATION_GOVERNANCE.md` Section 4 as the single authoritative status list, instead of maintaining its own shorter four-status list that was already out of step with how statuses like "Not Started" (used throughout `docs/specifications/`) were actually being used; "Start here" reading order and document map updated to include `DOCUMENTATION_GOVERNANCE.md`; "Continuity rules" section now points to `DOCUMENTATION_GOVERNANCE.md` Sections 8–9 as the full contributor rules.
- `docs/AI_HANDOFF.md` (v3.1) — repository structure tree, reading order, document-count (20 → 21 documents, 31 → 32 files total), Documentation Guide table, and status-summary category all updated to include `DOCUMENTATION_GOVERNANCE.md`; "Immediate Next Step" section updated — it previously gated all further Product Specification work on reconciliation approval (now granted), and now names `01_NAVIGATION_SPECIFICATION.md` as the next specification to draft.
- `docs/PROJECT_STATUS.md` (v1.3) — logged both the reconciliation's approval and the governance pass under Completed work; "Work in progress" and "Next recommended task" updated to reflect that documentation work is unblocked and `01_NAVIGATION_SPECIFICATION.md` is next.
- `docs/ROADMAP.md` (v1.6) — new Phase 0e ("Documentation governance and repository reconciliation," marked complete) added, explaining why Phase 0d briefly paused and what unblocked it; Phase 0d's specification list updated to name `01_NAVIGATION_SPECIFICATION.md` as next.
- `docs/DECISION_LOG.md` — new entry recording the governance pass and every audit finding/fix.

**Audit result:** headers, statuses, cross-references, terminology, version numbering, and the document map were checked across all 21 top-level documents and 11 specifications. No broken links, no duplicate/diverging concepts (brand-color hex values checked specifically, since they're repeated across four documents — all consistent), and no orphaned documents were found beyond the two issues already fixed during the prior reconciliation pass. No Frozen document's substantive content was modified.

## v9 — 2026-07-18 — Repository reconciliation: two documentation branches merged into one

**Context:** `claude/medusa-repo-clone-ut5dl5` (this v8 documentation set) and `claude/ai-handoff-docs-ufdn5t` (an older documentation snapshot plus a uniquely-authored `AI_HANDOFF.md`) had diverged from a common commit and were never merged. Reconciled per Paul's explicit instruction, ahead of any further Product Specifications work. Full reasoning in `DECISION_LOG.md`.

**Added:**

- `docs/AI_HANDOFF.md` — recovered from `claude/ai-handoff-docs-ufdn5t` and rewritten (v3.0) against the current, reconciled project state: updated executive summary and current-phase statement; new Repository Structure section; new explicit Documentation Reading Order section; new Documentation Guide and Status Summary section categorizing every document as Frozen / Approved / In Progress / Not Started / Draft / Superseded; updated Current Project State, Current Roadmap, and Immediate Next Step sections; an accurate provenance note describing this reconciliation; and a corrected `Status`/`Version`/`Owner`/`Last Updated` header (it previously had none, despite `README.md` requiring one on every document).

**Changed:**

- `docs/README.md` (v1.2) — fixed a broken link (`../AI_HANDOFF.md` → `docs/AI_HANDOFF.md`, since the file lives inside `/docs`, not at the repository root); updated the "Start here" reading order to list `AI_HANDOFF.md` first, matching what the document map row already implied but the numbered list had never been updated to say.
- `docs/PRODUCT_BLUEPRINT.md` (v1.1) — status header corrected from "Draft — pending Paul's review and approval" to "Approved — Frozen as Phase 0 foundation (2026-07-18)," matching how `PROJECT_STATUS.md` and `DECISION_LOG.md` had already been describing it since Phase 0 was declared complete. Content unchanged.
- `docs/PROJECT_STATUS.md` (v1.2) — added the reconciliation to Completed work; removed the stale "`AI_HANDOFF.md` work should be treated as lost" blocker (it was recovered, not lost) and replaced it with confirmation that no documentation-branch blockers remain; added an explicit note to "Next recommended task" that further Product Specification work is paused pending Paul's approval of this reconciliation.
- `docs/DECISION_LOG.md` — new entry recording the reconciliation, the audit that found it necessary, and every file it touched.

**Not changed:** no business decision, architecture decision, or approved content within any Phase 0 document (`BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md`, and `PRODUCT_BLUEPRINT.md`'s substantive content) was altered by this reconciliation — only `PRODUCT_BLUEPRINT.md`'s status header, which was a pre-existing inconsistency this audit surfaced rather than something the reconciliation itself introduced.

## v8 — 2026-07-18 — Phase 0 frozen; Phase 1 Product Specifications opened

**Added:**

- `docs/specifications/` — new directory, 11 numbered specification files:
  - `02_HOMEPAGE_SPECIFICATION.md` (v0.1) — **fully drafted**, all 25 required sections: purpose, homepage responsibilities, business/customer goals, primary journeys, information hierarchy, all 9 homepage sections (Persistent Header/Shell, Age Verification Gate, Hero, Curated Collections, Food Central Spotlight, Wine & Food Connected, Trust & Delivery Band, Returning Customer Strip, Footer) each with a 9-part behavior breakdown, backend data requirements, search/discovery entry point, Food Central integration strategy, trust/delivery messaging, personalization (future), SEO/accessibility/performance targets (LCP < 2.5s at p75 mobile), 8 named analytics events, empty/loading/error states, Version 1 scope, future enhancements, risks/assumptions, and acceptance criteria. Includes a Sources section citing the UX/performance research used to ground behavioral decisions (no layouts, branding, or UI copied).
  - `01_NAVIGATION_SPECIFICATION.md`, `03_SEARCH_SPECIFICATION.md`, `04_PRODUCT_LISTING_SPECIFICATION.md`, `05_PRODUCT_DETAILS_SPECIFICATION.md`, `06_CART_SPECIFICATION.md`, `07_CHECKOUT_SPECIFICATION.md`, `08_CUSTOMER_ACCOUNT_SPECIFICATION.md`, `09_FOOD_ORDERING_SPECIFICATION.md`, `10_DELIVERY_SPECIFICATION.md`, `11_ADMIN_WORKFLOWS_SPECIFICATION.md` — created as **approved placeholders only** (Document Purpose, Scope, Dependencies, Planned Sections, Status = Not Started), each naming its scope boundary against sibling specs. Detailed content intentionally not invented ahead of sequencing.

**Changed:**

- `README.md` (v1.1) — new "Product Specifications" section indexing all 11 files and their status; "Start here" reading order updated to name `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` as frozen Phase 0 output.
- `PROJECT_STATUS.md` (v1.1) — current phase updated to reflect Phase 0's closure (four documents frozen, not to be modified absent a business decision) and Phase 1 — Product Specifications now underway; completed work, work in progress, next recommended task, and blockers all updated accordingly.
- `ROADMAP.md` (v1.5) — new Phase 0d ("Product Specifications") added, explicitly disambiguated by name from the existing backend-foundation "Phase 1," running in parallel with Phase 0c and Phase 1.
- `DECISION_LOG.md` — new entry recording Phase 0's closure and the opening of the Product Specifications phase.

## v7 — 2026-07-18 — DESIGN_SYSTEM.md v2.0 finalized and frozen

**Changed:**

- `DESIGN_SYSTEM.md` (v2.0, status **Approved — Authoritative Foundation, frozen**) — final refinement per Paul's review:
  - Tier 3 color tokens reorganized around semantic intent (Primary, Secondary, Accent, Surface, Surface Elevated, Text Primary, Text Secondary, Border, Divider, Focus, Interactive/Hover/Active, Disabled, Success, Warning, Danger, Information) as the system's canonical language, replacing the earlier dot-notation-first framing.
  - New **Surface Elevated** token (`#FFFFFF`) for cards/modals/dropdowns, paired with the existing elevation shadows.
  - New **Interactive States** mechanism — hover/active expressed as percentage-based overlays on whichever base color is active, rather than fixed hex values per color/state combination.
  - New **Future Theme Support** section documenting how the token architecture enables dark mode, seasonal themes, brand refreshes, and accessibility themes without component changes (not implemented — architecture only).
  - New **Component Philosophy** section preceding any component specification work.
  - New concluding **Design Quality Checklist** every future component must satisfy.
- `PROJECT_STATUS.md` — Phase 0 (Brand & Design Foundation) marked fully complete with no open items; next recommended task updated to component specification work.
- `ROADMAP.md` (v1.4) — Phase 0b marked complete; new Phase 0c (component specification, not yet started) added.
- `DECISION_LOG.md` — new entry recording the final refinement and freeze.

## v6 — 2026-07-18 — Color Architecture refined into three explicit tiers

**Changed:**

- `DESIGN_SYSTEM.md` (v2.1) — §B6 rewritten in full as "Color Architecture," per Paul's review of the Design System proposal. Now explicitly structured as Tier 1 (Brand Colors, fixed), Tier 2 (Functional UI Colors — Success/Warning/Danger/Info, chosen independently for accessibility and unambiguous state signaling), and Tier 3 (Semantic Design Tokens — the only thing components reference). Adds a dedicated "Gold Usage" rule (premium/curation only, never functional states) and a fully documented "Neutral System" (7-step warm grayscale, every text-bearing step verified against WCAG AA). Adds a "Consistency check" cross-referencing `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, and `EXPERIENCE_PRINCIPLES.md`.
- `PROJECT_STATUS.md` — current phase, completed work, blockers, and the Paul-approval list narrowed to reflect that only four specific Tier 2 color values (plus the Neutral System's general approach) remain open; everything else in the Design System is settled.
- `ROADMAP.md` (v1.3) — Phase 0b updated to reflect the approved three-tier Color Architecture and the narrower remaining open item.
- `DECISION_LOG.md` — new entry recording the refinement and its reasoning.

## v5 — 2026-07-18 — Brand Identity & Experience Principles approved; Design System Foundations v1

**Changed:**

- `BRAND_IDENTITY.md` and `EXPERIENCE_PRINCIPLES.md` — status headers updated from Under Review to **Approved**, per Paul's explicit confirmation. The Phase 0 gate on Design System/UI work is lifted.
- `DESIGN_SYSTEM.md` (v2.0) — restructured into Part A (Principles, unchanged, approved) and Part B (Foundations v1, new): concrete typography scale, spacing scale, grid system, elevation/shadows, border radius, color roles, motion timing, breakpoints, icon sizing, form behaviors, and accessibility tokens. Flags one open item: five new functional colors (a neutral grayscale plus distinct danger/warning/info colors) proposed to complete the color-role system, pending Paul's sign-off — the four originally approved brand colors are unchanged.
- `ROADMAP.md` (v1.2) — Phase 0 marked complete; Phase 0b updated from "agreed approach" to "drafted, one open item."
- `PROJECT_STATUS.md` — current phase, completed work, blockers, and the Paul-approval list all updated to reflect both approvals and the new, narrower open item.
- `DECISION_LOG.md` — two new entries (Brand Identity/Experience Principles approval; Design System Foundations v1 draft).

## v4 — 2026-07-18 — Positioning finalized, status headers, Design System Foundations plan

**Added:**

- A `Status | Version | Owner | Last Updated` metadata header to every document in `/docs` (19 files), plus a new "Document status convention" section in `README.md` explaining it.
- `ROADMAP.md` Phase 0b — the agreed Design System Foundations approach (typography scale, spacing scale, grid, elevation/shadows, border radius, semantic color roles, motion timing, breakpoints, icon sizing, form behaviors, accessibility tokens), per Paul's recommendation.

**Changed:**

- `BRAND_IDENTITY.md` §10 (Positioning Statement) — replaced with Paul's finalized text; added §10a cross-referencing `EXPERIENCE_PRINCIPLES.md`'s Category Definition.
- `EXPERIENCE_PRINCIPLES.md` — Category Definition replaced with Paul's finalized text; the earlier open reconciliation note resolved.
- `PROJECT_STATUS.md` — reflects the finalized positioning, the adopted status-header convention, the agreed Design System Foundations plan, and one outstanding confirmation needed from Paul (whether this constitutes full approval of `BRAND_IDENTITY.md`/`EXPERIENCE_PRINCIPLES.md`, lifting the Phase 0 gate).
- `DESIGN_SYSTEM.md` — corrected a stale cross-reference (previously pointed to `BRAND_GUIDELINES.md` as the gating document for visual tokens; now correctly points to `BRAND_IDENTITY.md`/`EXPERIENCE_PRINCIPLES.md`).
- `DECISION_LOG.md` — three new entries (status convention, positioning finalization, Design System Foundations plan).

## v3 — 2026-07-18 — Experience Principles

**Added:**

- `EXPERIENCE_PRINCIPLES.md` — v1.0: 15 experience principles, a product vision, competitive positioning ("Premium Lifestyle Commerce Platform"), and a single success-metric test for evaluating design decisions. Explicitly positioned as complementary to `BRAND_IDENTITY.md`, not a duplicate — see its "Relationship to other documents" section.

**Changed:**

- `docs/README.md` — added to the "Start here" reading order and document map, alongside `BRAND_IDENTITY.md` as a required read before design-system/visual work.
- `PROJECT_STATUS.md` — current phase, completed work, next task, blockers, and the Paul-approval list updated to include `EXPERIENCE_PRINCIPLES.md`'s approval as part of the same gate as `BRAND_IDENTITY.md`. Added a flagged reconciliation item: this document's "Premium Lifestyle Commerce Platform" positioning frame vs. `BRAND_IDENTITY.md` §10's formal Positioning Statement.
- `ROADMAP.md` — Phase 0 (Brand & Design Foundation) now includes `EXPERIENCE_PRINCIPLES.md` alongside `BRAND_IDENTITY.md` in the gate on `DESIGN_SYSTEM.md`/UI work.
- `DECISION_LOG.md` — new entry for the Experience Principles draft.

## v2 — 2026-07-18 — Brand Identity phase

**Added:**

- `BRAND_IDENTITY.md` — v1 brand identity: vision, mission, values, personality, voice, tone, emotional and perception goals, brand story, positioning, value proposition, and visual/color/typography/photography/art-direction/motion/iconography/illustration/white-space/trust/accessibility/mobile-first principles, plus a do's-and-don'ts summary and future-evolution notes. Includes a computed WCAG contrast analysis of the four approved brand colors.

**Changed:**

- `BRAND_GUIDELINES.md` — rewritten to remove content now owned by `BRAND_IDENTITY.md` (voice, story, positioning, color/type/photography direction); narrowed to its own distinct scope — logo, exact typefaces, exact color tokens, and physical/asset execution — explicitly built on top of `BRAND_IDENTITY.md` rather than duplicating it.
- `PROJECT_STATUS.md` — phase updated to "Brand Identity — v1 drafted, awaiting Paul's review"; completed-work, blockers, and the Paul-approval list updated accordingly; added a note that a separate session's uncommitted `AI_HANDOFF.md` work was never pushed to this repository.
- `ROADMAP.md` — added Phase 0 (Brand & Design Foundation), gating `DESIGN_SYSTEM.md` visual-token work and all UI design on `BRAND_IDENTITY.md`'s approval.
- `DECISION_LOG.md` — new entry for the Brand Identity draft and the four approved colors being treated as fixed inputs.

This version's brand-color usage recommendations (§13 of `BRAND_IDENTITY.md`) are the first evidence-based (not assumed) accessibility finding in this project's brand work: gold fails WCAG contrast against the off-white base at every text size and should be reserved for dark-ground or accent use.

## v1 — 2026-07-18

Initial creation of the `/docs` documentation system.

**Added:**

- `README.md` — documentation index and continuity rules
- `PROJECT_STATUS.md` — current phase, work status, open questions
- `PRODUCT_BLUEPRINT.md` — v1 product blueprint (18 sections)
- `ARCHITECTURE.md` — Medusa technical architecture reference
- `BUSINESS_RULES.md` — finalized business decisions
- `BRAND_GUIDELINES.md` — placeholder, pending brand definition
- `DESIGN_SYSTEM.md` — design principles (no visual tokens yet)
- `INFORMATION_ARCHITECTURE.md` — site/navigation structure
- `USER_FLOWS.md` — step-by-step customer journeys
- `PRODUCT_CATALOG.md` — catalog and product-data strategy
- `DELIVERY_MODEL.md` — delivery/fulfillment strategy
- `MEDUSA_EXTENSIONS.md` — custom module/extension catalog
- `API_DECISIONS.md` — API usage and extension decisions
- `TECH_STACK.md` — full technology stack reference
- `ROADMAP.md` — phased rollout plan
- `DECISION_LOG.md` — seeded with all decisions made to date
- `CHANGELOG.md` — this file

This version reflects the finalized single-company, no-marketplace business model. It supersedes an earlier multi-vendor marketplace architecture explored in prior research, which is not part of this documentation set (see `PRODUCT_BLUEPRINT.md` supersession notice and `DECISION_LOG.md`).
