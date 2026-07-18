# Business Rules

**Status:** Finalized business decisions, as confirmed by Paul. These are treated as non-negotiable constraints on the product and architecture unless explicitly revisited and logged in `DECISION_LOG.md`.

## Company structure

- LiquorCentral is a **single company**. It is a premium liquor retailer.
- **Food Central is a subsidiary brand under LiquorCentral**, not a separate company or a separate website.
- **This is not a marketplace.** There are no vendors, no vendor onboarding, no vendor dashboard, no vendor payouts, and no marketplace commissions.
- One company owns and manages: products, inventory, pricing, orders, deliveries, and operations. There is no third-party seller at any point in the transaction.

## Product lines

| | Wine & Spirits | Food Central |
|---|---|---|
| What it sells | Wine, spirits, and related premium beverages | Freshly cooked Nigerian food |
| Sourced/produced by | LiquorCentral (import/retail) | LiquorCentral (cooked on demand) |
| Delivery coverage | **Nationwide** | **Lagos only** |
| Fulfillment timing | Standard delivery | Same-day delivery, scheduled delivery, or pickup |

## Delivery rules

- Wine & Spirits ships **nationwide**.
- Food Central delivers **Lagos only**.
- Food Central is **cooked on demand** — there is no held stock of finished dishes.
- Food Central supports **same-day delivery**, **scheduled delivery**, and **pickup**.
- **All deliveries are made by company-owned riders.** No third-party courier/dispatch platform is used for Food Central. (Wine & Spirits' nationwide delivery mechanism — in-house fleet vs. courier partner — is not yet specified; see open questions below.)

## Customer experience rules

- **Guest checkout must be supported.** A customer should never be forced to create an account to complete a purchase.
- **An age confirmation popup is required before browsing alcohol.** This is a compliance requirement, not optional UX polish.
- **Food ordering must prioritize speed and simplicity** over discovery/browsing depth.
- **Wine shopping must encourage discovery, confidence, and education** — the opposite pacing from food ordering, deliberately.
- **The experience must feel like one premium LiquorCentral ecosystem.** Food Central is presented as a premium subsidiary within that ecosystem, never as a separate website or a visually disconnected experience.

## Product quality bar

The platform must feel, throughout:

- Premium
- Modern
- Elegant
- Fast
- Trustworthy
- Mobile-first
- Effortless to use

Every design and product decision should be evaluated against a single question: **does this reduce friction and increase purchase confidence?** Decisions that don't clearly do one of the two need a stated reason to proceed anyway.

## What these rules imply architecturally

See `PRODUCT_BLUEPRINT.md` for the full reasoning. In short:

- No Vendor module, no actor-type beyond customer/admin-user, no order-splitting workflow.
- One Medusa store, one cart, one checkout — even for a mixed wine + food order.
- Two distinct Fulfillment configurations (nationwide Service Zone vs. Lagos-restricted Geo Zone), not two separate systems.
- Two focused product-attribute modules (wine vs. food), not one universal one.

## Open questions (not yet decided — do not assume)

- Whether Wine & Spirits' nationwide delivery uses an in-house fleet, a third-party courier partner, or both.
- Whether cash-on-delivery is supported at all, given the fraud/reconciliation tradeoffs specific to alcohol.
- Which local payment provider (e.g. Paystack, Flutterwave) is used.
- Exact age-gate mechanics: how long a confirmation persists, and whether it gates the whole site or only alcohol sections.
- The alcohol return/refund policy (subject to legal limits on alcohol returns).

These are tracked in `PROJECT_STATUS.md` under "Decisions awaiting Paul's approval" and must not be assumed by anyone extending this project.
