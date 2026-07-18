# Customer Account Specification

**Status:** In Progress
**Version:** 0.1
**Owner:** Product
**Last Updated:** 2026-07-18

## Purpose

This document is the authoritative specification for the LiquorCentral customer account area — everything a logged-in customer can see and do, plus the optional paths into and out of having an account at all. It defines *customer behavior, operational logic, business rules, trust, accessibility, scalability, and backend requirements* — no mockups, no wireframes, and no implementation code appear anywhere in this document, consistent with `DOCUMENTATION_GOVERNANCE.md`'s Product Specifications tier.

Every recommendation below derives from `PRODUCT_BLUEPRINT.md` §4 (Customer Types) and §9 (Checkout Strategy), `BUSINESS_RULES.md`, `TECH_STACK.md` (native Medusa Auth), `USER_FLOWS.md` (Flow 7), `EXPERIENCE_PRINCIPLES.md`, and `DESIGN_SYSTEM.md` v2.0 §B9 (form behaviors) and §B11 (accessibility tokens), and none of it contradicts them. It integrates directly with the seven already-frozen specifications it sits beside: `01_NAVIGATION_SPECIFICATION.md` §16 already establishes the account entry point's shell behavior (icon states, guest-vs-logged-in menu contents, the two-place reorder-access pattern) — this document does not redefine that, only what happens once a customer is inside the account area. `06_CART_SPECIFICATION.md` and `07_CHECKOUT_SPECIFICATION.md` both explicitly name post-purchase account creation as an optional, never-mandatory offer made at order confirmation — this document picks up from the moment that account exists (or from a customer's deliberate sign-up), not before. **Where this document depends on a business or legal decision that has not yet been made (data retention specifics, an account deletion timeframe, notification-channel choice), it says so explicitly rather than inventing an answer.**

**Explicitly out of scope for this document, per direct instruction:** loyalty programmes, wishlists, product reviews, subscriptions, personalization, social/third-party login, and AI-driven account features are not introduced here. None of these are established anywhere in `/docs` as approved for v1; where they are mentioned below, it is only to confirm they are deferred (§26) or to explain why an adjacent, already-established mechanism (e.g., `06_CART_SPECIFICATION.md`'s Saved-for-Later) is not the same thing as one of them.

Where a decision is grounded in external UX or security research rather than one of those documents, the source is cited inline and listed in Sources — research validates the reasoning here, it never replaces the product thinking already established in those documents. No layout, interface, wording, or proprietary interaction was copied from any product or source consulted.

A UX designer should be able to design from this document, a frontend developer should be able to build from it, a backend developer should understand exactly what data it needs, a QA engineer should be able to derive test cases from it, and a future AI contributor should be able to extend it without a follow-up question.

---

## 1. Account Philosophy

**An account is a convenience a customer opts into, never a requirement standing between them and a purchase.** `BUSINESS_RULES.md` states guest checkout must be supported throughout; this document's governing responsibility is to make the account area worth choosing, not to compensate for the absence of a forced one. Two commitments follow, and nothing below may violate them:

1. **Nothing in the account area is a precondition for buying.** Every capability specified here (saved addresses, order history, reordering) makes a *future* purchase faster — none of it gates a purchase happening at all, consistent with `07_CHECKOUT_SPECIFICATION.md` §6's guest-checkout default.
2. **The account is one identity across both product lines.** Order history, saved addresses, and profile details span Wine & Spirits and Food Central in a single view — never two separate account experiences per catalog, per `PRODUCT_BLUEPRINT.md` §4's one-`Customer`-record decision.

## 2. Business Objectives

- **Increase repeat-purchase rate** by making a second, third, and tenth order measurably faster than the first — reordering (§15) and saved addresses (§12) are the direct mechanisms.
- **Convert goodwill from a completed guest order into an account**, without ever making that conversion feel like a precondition the customer had to clear to get there (§7).
- **Reduce support burden** from routine, self-serviceable questions — "where is my order," "what did I order last time," "can I change my address" — by making order history and profile management genuinely self-service (§13, §14, §12).
- **Protect customer trust in how their data is held and controlled**, consistent with `PRODUCT_BLUEPRINT.md` §11's Trust Strategy and `BRAND_IDENTITY.md`'s trust principles — privacy, security, and account deletion (§17, §18) are treated as core account responsibilities, not an afterthought appended once the rest is built.

## 3. Customer Objectives

Extending `PRODUCT_BLUEPRINT.md` §4's four customer intents to the account area specifically:

| Customer type | Account objective |
|---|---|
| Confident Buyer | Reorder a known previous purchase in one action (§15), without re-entering address or payment details. |
| Guided Browser | Keep account creation entirely optional — this customer type is often still deciding whether they trust the platform, and should never feel pressured into an account to keep browsing. |
| Repeat Household | See one unified order history spanning both Wine & Spirits and Food Central (§13), and manage more than one saved address for different delivery contexts (§12). |
| Gifter | Confirm a past gift order's details (§14) without it being confused with, or cluttering, their own personal order history. |

Every customer type additionally needs: confidence that their personal data is handled responsibly (§17), a clear and reachable way to leave the platform entirely if they choose (§18), and an account area that is exactly as fast and accessible as the rest of the platform (§20, §24).

## 4. Entry Points

- **The account icon in the persistent header** (`01_NAVIGATION_SPECIFICATION.md` §16) is the primary entry point — a sign-in/create-account prompt for a guest, the account area directly for a logged-in customer.
- **Post-purchase account creation** (`06_CART_SPECIFICATION.md` §6/§17's optional offer, `07_CHECKOUT_SPECIFICATION.md` §6/§17) is the second entry point — a guest who just completed an order may create an account from the confirmation page, pre-filled from the order just placed, landing directly in the account area once created.
- **A password-reset link** (§9) is a third, narrower entry point, used only by an existing customer who cannot currently log in.
- **There is no other way into the account area** — no account exists without either a deliberate sign-up or the post-purchase offer; nothing in this document assumes an account can be created any other way.

## 5. Account Information Architecture

Mirroring the structure `01_NAVIGATION_SPECIFICATION.md` §16 already established, not redefining it:

- **Order History** (§13), including **Order Details** (§14) and **Reordering** (§15) reached from within it.
- **Saved Addresses** (§12).
- **Profile** (§11) — name, contact details, password.
- **Notification Preferences** (§16).
- **Privacy & Security** (§17), including the account deletion/deactivation pathway (§18).
- **Logout** (§10).

This is a flat, single-level structure — no nested account sub-sections deep enough to need their own breadcrumb trail (`01_NAVIGATION_SPECIFICATION.md` §18 already excludes the account area from breadcrumbs for the same reason it excludes cart and checkout: a flat structure doesn't need one).

## 6. Account Creation Behaviour

- **Two paths create an account: a deliberate sign-up, and the post-purchase offer** (§4) — both result in the identical account structure (§5); neither is a "lesser" or partial account.
- **The minimum information genuinely needed is requested — nothing more**, consistent with `07_CHECKOUT_SPECIFICATION.md` §7's minimum-necessary-field principle and current registration-form research finding that excess fields at sign-up directly cost completion (Nielsen Norman Group, cited below): an email address, a password, and a name — nothing else is required to create the account itself. Saved addresses (§12) and preferences (§16) are added afterward, whenever the customer chooses.
- **Post-purchase account creation pre-fills every field it can from the order just placed** (name, email, and the address just used, offered as the first saved address) — the customer confirms and sets a password, rather than re-entering information already provided minutes earlier, directly implementing the research-validated placement `07_CHECKOUT_SPECIFICATION.md` §6 already established.
- **No third-party or social login is offered** — `TECH_STACK.md` confirms native Medusa Auth as the sole system of record for v1, with no third-party identity provider; this document does not introduce one.

## 7. Guest-to-Account Conversion

- **Never required, never blocking.** A guest customer can complete any number of orders without ever creating an account — this is restated here, not merely inherited from `BUSINESS_RULES.md`, because the account specification is exactly where a temptation to soften that rule would most plausibly appear.
- **The only conversion prompt is the optional, post-confirmation offer** (§4, §6) — no interstitial, no email campaign pressuring account creation, and no feature is held back from guest customers as leverage to convert them. A guest and a logged-in customer buy the exact same product, at the exact same price, through the exact same checkout (`07_CHECKOUT_SPECIFICATION.md` §6).
- **Declining the offer has no consequence** — the order is already placed regardless of the decision (`07_CHECKOUT_SPECIFICATION.md` §17), and a guest who declines is not asked again during that session.

## 8. Login & Logout Behaviour

- **Login requires only email and password** — no additional friction (security questions, mandatory two-factor) is introduced without a business decision to require it; if adopted later, it is a new decision requiring its own specification, not assumed here.
- **A failed login attempt states plainly that the email/password combination didn't match**, never confirming or denying whether a given email address has an account at all — a standard, defensible security practice that avoids leaking account existence.
- **"Remember me" / persistent login is a reasonable convenience** for a returning customer on their own device, distinct from the cart's own session-persistence mechanism (`06_CART_SPECIFICATION.md` §16) — this document does not assume a specific session duration, the same treatment already given to other session-length questions left open elsewhere in `/docs`.
- **Logout is a single, unambiguous action, reachable from the account area** (`01_NAVIGATION_SPECIFICATION.md` §16), and clears the logged-in session without affecting cart contents (`06_CART_SPECIFICATION.md` §16 already establishes that a logged-in customer's cart is tied to their account, persisting independently of any single session).

## 9. Password Reset Behaviour

- **A "Forgot password?" link is visible directly on the login step**, not buried — current research is explicit that this is where customers expect to find it, and that its absence or poor visibility directly costs completed logins (Nielsen Norman Group, cited below).
- **Requesting a reset never confirms or denies whether the submitted email has an account** — the same non-leaking principle as §8's failed-login message; the customer is shown an identical "if an account exists, a reset link has been sent" message regardless.
- **The reset link is time-limited and single-use** — a standard, defensible security practice; the exact expiry window is an implementation parameter, not fixed by this document.
- **A successful reset shows an explicit success confirmation with a clear next step** (proceeding directly to login) — current research finds this explicit confirm-and-guide pattern measurably reduces confusion at exactly the point a customer is most likely to abandon the flow (Nielsen Norman Group, cited below).

## 10. Email Verification Behaviour

- **Email verification is not a barrier to using the account** — a newly created account (§6) is usable immediately; verification confirms the email address is reachable for order and account communications, it does not gate checkout, order history, or any other capability specified in this document.
- **An unverified email shows a lightweight, dismissible reminder** (not a blocking banner) with a one-action "resend verification email" option — never a repeated interruption.
- **Verification uses the same time-limited, single-use link pattern as password reset** (§9), for implementation consistency rather than as a new mechanism.

## 11. Profile Management

- **A customer can update their name, email, phone, and password** at any time — the minimum set of details actually collected (§6); this document does not invent additional profile fields (birthday, preferences beyond §16) not established elsewhere.
- **Changing the email address requires re-verification** (§10) of the new address before it becomes the account's primary contact — the previous, verified address remains valid for account recovery until the new one is confirmed.
- **Changing the password requires the current password** (or a password-reset flow, §9) — never a change accepted on session authentication alone, a standard defensible security practice.
- **Every field-level behavior follows `DESIGN_SYSTEM.md` §B9 exactly**: visible labels, blur-triggered validation, plain-language errors — no account-specific exception.

## 12. Saved Addresses

- **A customer may save more than one address** (e.g., home and a gifting address for the Gifter customer type, §3) — no artificial cap is specified here; a reasonable practical limit is an implementation detail, not a behavioral requirement.
- **Saved addresses use the identical freeform, landmark-friendly field structure already established in `07_CHECKOUT_SPECIFICATION.md` §7** — the account area does not introduce a second, stricter address format; an address good enough to check out with is good enough to save.
- **One saved address may be marked as default**, pre-selected at checkout (`07_CHECKOUT_SPECIFICATION.md` §7's "logged-in customer may select a saved address" reference) — but manual entry or selecting a different saved address always remains available, never overridden by the default.
- **Editing or removing a saved address never retroactively changes a past order** — an order's delivery address is fixed at the time it was placed (§14); saved addresses are a convenience for *future* checkouts only.
- **Current research finds address-book management is a genuinely distinct concern from checkout's own address capture**, since customers manage saved addresses both proactively (from the account area) and reactively (during checkout itself) — this document specifies the account-area management path; `07_CHECKOUT_SPECIFICATION.md` §7 remains the authoritative source for address capture behavior during checkout itself (Baymard Institute, cited below).

## 13. Order History

- **One list, spanning both Wine & Spirits and Food Central**, in reverse chronological order — never two separate histories per catalog, directly implementing `01_NAVIGATION_SPECIFICATION.md` §16's explicit structure and `PRODUCT_BLUEPRINT.md` §4's one-identity decision.
- **Each entry shows, at a glance:** order date, a summary of items (or item count for a large order), order status, and the order total — enough to recognize an order without opening it, consistent with current research finding customers scan order history for quick recognition before committing to open a specific order (Baymard Institute, cited below).
- **A mixed order (Wine & Spirits + Food Central) is shown as one entry**, not two — restating `PRODUCT_BLUEPRINT.md` §9's one-cart-one-checkout-one-order decision at the history level; opening it reveals the same two-fulfillment-group structure already established throughout `06_CART_SPECIFICATION.md` and `07_CHECKOUT_SPECIFICATION.md`.
- **Order status reflects real fulfillment state** (e.g., processing, out for delivery, delivered, ready for pickup) — the exact status vocabulary and how granularly it's tracked is a `MEDUSA_EXTENSIONS.md`/operational detail this document does not invent, since no prior document establishes a specific status taxonomy.
- **No review, rating, or "leave feedback" prompt appears anywhere in order history** — `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Reviews Strategy already confirms no review system exists in v1; this document does not introduce one through the account area.

## 14. Order Details

- **Opening an order shows its complete, permanent record**: every line item (grouped by fulfillment leg, exactly as it appeared at checkout — `06_CART_SPECIFICATION.md` §5, §6), the delivery address and method used, the payment method (not full payment details), and the final confirmed total, unchanged from what `07_CHECKOUT_SPECIFICATION.md` §16/§17 confirmed at the time.
- **An order's details never change after placement**, even if the customer later edits a saved address (§12) or their profile (§11) — an order detail page is a historical record, not a live view of current account data.
- **Order-specific actions live here**: reordering (§15) and, if adopted, initiating a return — the alcohol return/refund policy remains an explicit open business decision (`PRODUCT_BLUEPRINT.md` §9, `05_PRODUCT_DETAILS_SPECIFICATION.md` §19) this document does not resolve; a returns pathway is not specified here until that policy exists, consistent with current research finding an unclear or absent returns interface is a significant, measurable retention risk once it *is* needed (Baymard Institute, cited below).
- **Delivery/pickup expectation messaging for an in-progress order restates, never contradicts, what was confirmed at checkout** (`07_CHECKOUT_SPECIFICATION.md` §16, §17) — the order detail page is not a second place where a different delivery promise could accidentally appear.

## 15. Reordering Behaviour

- **A single "Reorder" action on a past order** re-adds its items to a fresh cart — directly implementing `USER_FLOWS.md` Flow 7's exact sequence.
- **Reordered items are re-validated against current availability and pricing, never a blind copy of the old order** — an item that's since become unavailable, discontinued, or changed in price is shown honestly in the resulting cart (`06_CART_SPECIFICATION.md` §12, §13), not silently re-added as if nothing changed. This is the same "prepare, never surprise" principle `06_CART_SPECIFICATION.md` §1 already established, applied to a cart populated from history rather than from fresh browsing.
- **A partially-reorderable order still reorders what it can**, with the customer told plainly which items could not be re-added and why (e.g., discontinued) — never a silent, all-or-nothing failure over one unavailable item among several.
- **Reordering a mixed order (§13) re-creates both fulfillment groups in the new cart** (`06_CART_SPECIFICATION.md` §6) — the resulting cart looks and behaves exactly like any other mixed cart, with no special "reordered" state that behaves differently from a cart built through ordinary browsing.
- **This is the fast path the homepage's Returning Customer Strip** (`02_HOMEPAGE_SPECIFICATION.md` §8.8) **also offers** — that shortcut and this full order-history reorder action use the identical underlying mechanism; the homepage strip is a shortcut to it, not a second implementation.

## 16. Notification Preferences

- **A customer can choose which order-related notifications they receive and through which channel(s)**, once the notification-channel decision is made (`MEDUSA_EXTENSIONS.md` #5 — WhatsApp and/or SMS remain undecided) — this document specifies that a preference exists and is respected, not the channel(s) it applies to.
- **Transactional notifications directly tied to an order in progress** (confirmation, delivery updates) are not optional — a customer cannot silently opt out of being told their own order is on its way; only the *channel* choice, and any non-transactional communication (if any is ever introduced), is a genuine preference.
- **No marketing or promotional preference is specified here**, since no prior document establishes a marketing-communication program for this platform — this document does not invent one; if introduced later, it is a new decision requiring its own specification.
- **This section deliberately does not specify personalization of any kind** (e.g., preference-driven content curation) — personalization is explicitly deferred platform-wide (`02_HOMEPAGE_SPECIFICATION.md` §14, `03_SEARCH_SPECIFICATION.md`'s Search Intent section, `04_PRODUCT_LISTING_SPECIFICATION.md`'s Listing Intent section), and this document does not reopen that deferral for notifications specifically.

## 17. Privacy & Security

- **A customer can see what personal data the account holds** (the same fields specified in §11, §12) and request a copy or correction — a baseline data-access expectation, not a new business decision, since it follows directly from data the customer themselves entered and can already see in the account area.
- **Passwords are never displayed or emailed in plain text at any point** (§9, §11) — a non-negotiable security baseline, not a business decision requiring approval.
- **Payment details are never fully displayed back to the customer** (§14) — only enough to recognize which payment method was used (e.g., a masked reference), consistent with standard PCI-adjacent handling of payment data regardless of which payment provider (`MEDUSA_EXTENSIONS.md` #4) is ultimately integrated.
- **The exact data-retention period, and the specifics of compliance with Nigerian data-protection requirements (NDPR), are not established in any prior document** — this is flagged as an open item requiring legal/business input (§27), not assumed or invented here. This document specifies only that the account area gives customers visibility into and control over their own data; it does not set the retention policy behind that visibility.

## 18. Account Deletion & Deactivation

- **A customer can request account deletion or deactivation from Privacy & Security** (§17) — reachable without contacting support, consistent with `PRODUCT_BLUEPRINT.md` §11's trust strategy of giving customers clear control rather than requiring them to ask permission to leave.
- **Deletion/deactivation never deletes an existing order's own record** (§14) — an order is a transactional and, plausibly, a legal/tax record independent of the customer's ongoing relationship with the platform; this document does not specify that placing an order becomes undiscoverable once the account is removed, only that the *account* (login, saved data, ongoing marketing/notification relationship) ends.
- **The exact distinction between "deactivation" (reversible) and "deletion" (not reversible) — including any waiting period, data-retention obligation, or how each interacts with in-progress orders — is not established in any prior document and is not resolved here.** This document specifies only that a request pathway exists and is honored (§27); the specific policy is flagged as an open business/legal decision, the same way the alcohol return policy is treated in `05_PRODUCT_DETAILS_SPECIFICATION.md` §19.
- **A request in progress shows a clear confirmation of what will happen and when**, never a silent or ambiguous outcome — consistent with this document's broader Trust Considerations (§19).

## 19. Trust Considerations

Every trust mechanism the account area must honor, extending the same discipline already established in `06_CART_SPECIFICATION.md` §19 and `07_CHECKOUT_SPECIFICATION.md` §18 to the account context specifically:

- **Never confirming or denying account existence** on login (§8) or password reset (§9) — a security-through-honesty balance, not evasiveness.
- **Full transparency into what data the account holds** (§17) and clear control over ending the relationship (§18) — trust is reinforced by making both easy to find, not by making them technically possible but hard to locate.
- **Order history is a permanent, unaltered record** (§14) — a customer must be able to trust that what they see there is exactly what happened, not a live view that could quietly drift from what was actually charged or delivered.
- **No account feature is used to pressure a purchase** — no artificial urgency, no manufactured "your saved item is almost gone" messaging tied to account data, consistent with `EXPERIENCE_PRINCIPLES.md` #15 (Build Relationships, Not Just Transactions) and the identical rule already established in every prior specification.
- **Account creation is never framed as safer or more legitimate than guest checkout** — both are equally trustworthy, equally secure paths to the same purchase (§7); the account area earns its use through convenience, not through implying guest checkout is somehow lesser.

## 20. Customer Decision States

This document reuses the same five-state taxonomy already established in `06_CART_SPECIFICATION.md` and extended in `07_CHECKOUT_SPECIFICATION.md` — informational, recommendation, warning, blocking condition, recoverable error — instantiated with account-specific triggers, rather than inventing a new vocabulary:

| State | Account-specific trigger | Customer impact | Expected customer action |
|---|---|---|---|
| **Informational** | E.g., "A reset link has been sent if an account exists" (§9); an unverified-email reminder (§10). | None. | None required, or a single optional action (resend verification). |
| **Recommendation** | Not used in the account area — no cross-sell or optional suggestion appears here, consistent with §19's no-pressure rule. | N/A | N/A |
| **Warning** | An item in a reorder attempt (§15) has changed price or availability since the original order. | The customer should notice before the reordered cart proceeds to checkout. | Review the specific change in the resulting cart; the reorder itself still succeeds for everything else. |
| **Blocking condition** | An attempted email change (§11) to an address already in use by another account; an incorrect current password on a password-change attempt (§11). | Cannot proceed until resolved. | Correct the specific field and resubmit. |
| **Recoverable error** | A failed profile or address update (§11, §12); an expired password-reset or verification link (§9, §10). | Temporary — the attempted change did not complete. | Retry, or request a fresh link where applicable; no other account data is affected. |

## 21. Empty, Loading & Error States

- **A customer with no order history sees a clear, encouraging message and a path into browsing** (`01_NAVIGATION_SPECIFICATION.md`'s primary navigation) — never a blank page or an implication that something is broken.
- **A customer with no saved addresses sees an equally clear invitation to add one**, framed as a convenience for next time, not a requirement.
- **Loading states use skeleton placeholders, not spinners**, for order history and order detail views, consistent with the platform-wide "skeletons communicate structure and are perceived as faster" discipline already established in every prior specification.
- **Every account action fails independently and specifically** — a failed address update does not discard an unsaved profile edit in progress; a failed reorder attempt does not affect the rest of order history (§13, §15).
- **No blank white space or broken layout is an acceptable failure mode anywhere in the account area** — the same standard already set platform-wide.

## 22. Accessibility

- **Every form field in Profile Management (§11), Saved Addresses (§12), and Authentication (§8, §9, §10) follows `DESIGN_SYSTEM.md` §B9 and §B11 exactly** — visible labels, blur-triggered validation, plain-language errors, no account-specific exception.
- **Password fields include a visible show/hide toggle**, itself a real, labeled, keyboard-operable control — never a mechanism reachable only by mouse.
- **Order history and order detail views use real heading and list semantics**, so a screen-reader user can navigate between orders and within an order's line items structurally, not just by reading linearly through undifferentiated text.
- **Every touch target** (reorder buttons, address edit/delete controls, notification-preference toggles) **meets the 44×44px minimum** (`DESIGN_SYSTEM.md` §B11).
- **No account status or notice** (verification reminders, decision states in §20) **is conveyed by color alone** — the same platform-wide rule.
- **Keyboard navigation**: every account page and form is fully operable by keyboard alone, with no trap anywhere, including the password show/hide toggle and any confirmation dialog (e.g., account deletion, §18).

## 23. Analytics Events

- `account_created` (value: entry path — deliberate sign-up or post-purchase offer, per §4)
- `login_succeeded` / `login_failed`
- `password_reset_requested` / `password_reset_completed`
- `email_verification_sent` / `email_verification_completed`
- `profile_updated` (value: field changed)
- `address_saved` / `address_updated` / `address_removed`
- `order_history_viewed`
- `order_details_viewed` (value: order id)
- `reorder_initiated` / `reorder_completed` (value: items successfully re-added vs. unavailable, per §15)
- `notification_preference_updated`
- `account_deletion_requested` / `account_deactivation_requested`

Each ties back to §2's business objectives — the gap between `account_created` and a subsequent `reorder_completed` is a direct measure of whether the account area is actually accelerating repeat purchases, and `reorder_initiated` vs. `reorder_completed` measures how often re-validation (§15) meaningfully changes a reorder attempt.

## 24. SEO Considerations

- **No account page is indexed.** Like the cart and checkout (`06_CART_SPECIFICATION.md` §25, `07_CHECKOUT_SPECIFICATION.md` §25), every account page is customer-specific, authentication-gated, and served `noindex` — the same treatment, for the identical underlying reason: this content has no stable, shareable meaning to a search engine, and in this case is also private.
- **This is a brief, deliberate scope note**, not a gap — the account area carries none of the platform's organic-acquisition responsibility.

## 25. Backend Requirements

| Requirement | Data/mechanism needed | Source | Status |
|---|---|---|---|
| Customer account, login/logout | Native Medusa Customer + Auth module | `TECH_STACK.md`, `PRODUCT_BLUEPRINT.md` §4 | Native |
| Password reset, email verification | Native Medusa Auth token/link mechanisms | `TECH_STACK.md` | Native |
| Saved addresses (§12) | Native Address entity, associated with Customer | `07_CHECKOUT_SPECIFICATION.md` §26 | Native |
| Order history / order details (§13, §14) | Native Order module, queried by Customer | Platform-wide | Native |
| Reorder re-validation (§15) | Native pricing/inventory checks, reused from cart-add logic | `06_CART_SPECIFICATION.md` §12, §13 | Native |
| Notification preferences (§16) | A preference field/entity associated with Customer, gated on the notification-provider decision | `MEDUSA_EXTENSIONS.md` #5 | Preference storage native; **channel(s) undecided** |
| Data export/access request (§17) | Native Customer data query, exposed as a self-service action | Platform-wide | Native mechanism; **retention/NDPR policy undecided** |
| Account deletion/deactivation (§18) | Native Customer soft-delete/deactivation, order records retained independently | Platform-wide | Native mechanism; **exact policy undecided** |
| Analytics events (§23) | Standard client/event-tracking pipeline | Platform-wide | Not this document's scope to build |

## 26. Performance Expectations

- **Order history and order detail views load with the same platform-wide performance discipline** as category/listing pages (`04_PRODUCT_LISTING_SPECIFICATION.md` §27) — no account-specific exception, even though these pages are not SEO-critical (§24).
- **Reorder re-validation (§15) resolves quickly enough to feel like one action**, not a separate slow step distinguishable from an ordinary add-to-cart — reusing the same performance bar already applied to cart operations (`06_CART_SPECIFICATION.md`).
- **Login and password-reset submissions show immediate feedback** (§21's loading-state discipline), never leaving a customer uncertain whether their submission registered — the same principle already established for checkout's payment step (`07_CHECKOUT_SPECIFICATION.md` §20, §27).

## 27. Future Expansion & Explicitly Out of Scope

Nothing in this section is built now — it documents the *capability* this architecture already leaves room for, and explicitly names what this document deliberately does not introduce, per direct instruction:

**Explicitly out of scope for v1, not established elsewhere in `/docs`:**

- **Loyalty programmes** — named as a future opportunity in `PRODUCT_BLUEPRINT.md` §17 and `06_CART_SPECIFICATION.md` §27, not committed or designed here.
- **Wishlists** — not established anywhere; the only related, already-approved mechanism is `06_CART_SPECIFICATION.md` §14's cart-item-level Saved-for-Later, which this document does not duplicate or extend into a separate account-level wishlist (§16's Saved Items note applies).
- **Product reviews** — `05_PRODUCT_DETAILS_SPECIFICATION.md`'s Reviews Strategy already confirms no review system exists in v1; this document does not introduce a "my reviews" account section.
- **Subscriptions** — named as a future opportunity in `PRODUCT_BLUEPRINT.md` §17 and `06_CART_SPECIFICATION.md` §27, not committed here.
- **Personalization** of any kind (curated content, tailored recommendations, preference-driven browsing) — deferred platform-wide (§16), not reopened here.
- **Social or third-party login** — `TECH_STACK.md` confirms native Medusa Auth only for v1 (§6); not introduced here.
- **AI-driven account features** (e.g., predictive reordering, automated preference inference) — not established anywhere in `/docs`; not introduced here.

**Plausible future capability, not built now:**

- A dedicated account-level Saved Items or wishlist view, if Cart's Saved-for-Later (§16) is ever extended beyond its current cart-adjacent, item-level scope.
- Order-level returns/refunds self-service (§14), once the alcohol return policy (`PRODUCT_BLUEPRINT.md` §9) is resolved.
- Multi-factor authentication, if a future security decision requires it (§8).
- The whole-cart "Saved carts" capability `06_CART_SPECIFICATION.md` §27 already names — a natural account-area extension if ever built, but not this document's to design.

None of the above is authorized or scoped work — this section exists solely to confirm the architecture chosen for v1 does not foreclose any of it, and to make the deliberate exclusions explicit rather than silent.

## 28. Risks & Assumptions

**Risks:**

- **Three genuine open business/legal decisions this document depends on, none resolved here**: the exact data-retention period and NDPR-compliance specifics (§17); the precise account deletion-vs-deactivation policy, including any waiting period (§18); and the notification-channel decision (§16, shared with `MEDUSA_EXTENSIONS.md` #5). None block this document's own behavioral scope, but each will directly shape implementation once resolved.
- **Reorder re-validation (§15) is only as good as the honesty of its "what changed" messaging** — a reorder that silently succeeds despite meaningful price/availability changes would violate this document's own trust standard (§19) as surely as a cart that hides a price change would violate `06_CART_SPECIFICATION.md` §1.
- **The order-status vocabulary (§13) is not specified in detail here** — it depends on operational/fulfillment tracking granularity not yet established in `MEDUSA_EXTENSIONS.md` or `DELIVERY_MODEL.md`.
- **A returns pathway (§14) is deliberately unspecified** pending the alcohol return-policy decision — implementing order details without anticipating that dependency risks a rework once the policy exists.

**Assumptions:**

- Native Medusa Customer, Auth, and Address entities are sufficient for this document's behavioral requirements (§25) — consistent with `TECH_STACK.md`'s own findings, not re-litigated here.
- Guest checkout remains fully supported and unaffected by anything in this document, per `BUSINESS_RULES.md` and `07_CHECKOUT_SPECIFICATION.md` §6.
- `06_CART_SPECIFICATION.md`'s Saved-for-Later (§14 of that document) remains a cart-level feature; this document does not assume it becomes an account-level feature without a future decision to do so.

## 29. Account Quality Checklist

Every future change to the account area — a new profile field, a new notification type, a layout adjustment — must be able to answer **yes** to all of the following before it's considered complete, the same discipline every prior frozen specification already applies to its own domain:

- [ ] **Does it keep the account entirely optional?** Nothing added here may become a precondition for purchase, checked against §1, §7.
- [ ] **Does it treat order history as a permanent, unaltered record?** (§14, §19)
- [ ] **Does reordering re-validate honestly rather than silently copying stale data?** (§15)
- [ ] **Does it give the customer real visibility into and control over their own data?** (§17, §18)
- [ ] **Does it avoid introducing loyalty, wishlists, reviews, subscriptions, personalization, social login, or AI features** not already established elsewhere? (§27)
- [ ] **Does it avoid inventing a business or legal decision** (§16, §17, §18, §28) that hasn't actually been made, instead of flagging it explicitly?
- [ ] **Does it remain accessible?** Form fields, touch targets, and keyboard operability all meet §22's requirements with no exceptions.
- [ ] **Does it avoid any manufactured urgency or pressure?** (§19)
- [ ] **Is the customer decision-state vocabulary reused, not reinvented?** (§20)
- [ ] **Does it stay within v1's scope**, correctly deferring everything named in §27 rather than smuggling any of it in early?

## 30. Acceptance Criteria

- [ ] An account can be created via deliberate sign-up or the post-purchase offer, and never any other path.
- [ ] Guest checkout remains fully functional and identical in price/flow regardless of whether an account exists.
- [ ] Order history displays Wine & Spirits, Food Central, and mixed orders in a single, unified, reverse-chronological list.
- [ ] Opening an order's details never shows information that differs from what was confirmed at the time of purchase.
- [ ] Reordering re-validates every item's price and availability and clearly states any item that changed or could not be re-added.
- [ ] Login and password-reset flows never confirm or deny whether a given email address has an associated account.
- [ ] A customer can view, correct, or request deletion of their personal data from within the account area, without contacting support.
- [ ] Account deletion or deactivation never removes an existing order's own historical record.
- [ ] No account page is indexed by search engines.
- [ ] Every account form field, control, and page is fully keyboard-operable, with no exceptions.
- [ ] No account notice or status is conveyed by color alone.
- [ ] All analytics events listed in §23 fire correctly and exactly once per corresponding user action.
- [ ] No business or legal decision named as open in §16, §17, §18, §28 (notification channel, data retention/NDPR specifics, deletion/deactivation policy) is silently assumed or resolved by this document or its implementation.
- [ ] No feature named as explicitly out of scope in §27 (loyalty, wishlists, reviews, subscriptions, personalization, social login, AI features) appears anywhere in the account area.

---

**Document status:** In Progress (v0.1). This is the first full draft — ready for review, not yet approved. Upon approval, this specification becomes the reference for customer account implementation, alongside `01_NAVIGATION_SPECIFICATION.md` §16 (the shell it sits beneath), `06_CART_SPECIFICATION.md` (Saved-for-Later, cart persistence), and `07_CHECKOUT_SPECIFICATION.md` (the post-purchase account-creation offer it extends).

## Sources

External research cited above (principles only — no layouts, interfaces, wording, or proprietary interactions were referenced or copied):

- [A Checklist for Registration and Login Forms on Mobile — Nielsen Norman Group](https://www.nngroup.com/articles/checklist-registration-login/)
- [Accounts & Self-Service UX Best Practices — Baymard Institute](https://baymard.com/blog/current-state-accounts-selfservice)
- [131 'Orders Overview' Design Examples — Baymard Institute](https://baymard.com/ecommerce-design-examples/62-orders-overview)
- [The 'Order Returns' Experience is Critical for Customer Retention — Baymard Institute](https://baymard.com/blog/order-returns-ecommerce-ux)
- [723 'Address Book' Design Examples — Baymard Institute](https://baymard.com/ecommerce-design-examples/59-address-book)
