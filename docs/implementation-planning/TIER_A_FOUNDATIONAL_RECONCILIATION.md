# Tier A — Foundational Reconciliation

**Status:** Approved
**Version:** 1.3
**Owner:** Program / Engineering
**Last Updated:** 2026-07-19

This document is the first Tier A deliverable defined by `IMPLEMENTATION_PLANNING.md` §4/§6. Its objective is **not** to design or implement anything — it reconciles every existing technical planning document against the now-complete Phase 0 (brand/experience/design foundation) and Phase 1 (all 11 frozen Product Specifications), so that Tier B–F implementation-planning work starts from one accurate, agreed baseline rather than from documents written before the specifications existed. No Frozen document was changed. No API was designed. No database was designed. No code was written.

---

## 1. Method and Documents Reviewed

Every document below was reviewed in full against every other document in this list, checking specifically for: obsolete assumptions, conflicting assumptions, and missing implementation work (per `DOCUMENTATION_GOVERNANCE.md` §13's audit process, applied here one tier down from `/docs` as a whole).

**Foundational (Frozen, not reviewed for change — reviewed only to confirm nothing below contradicts them):**
`PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md` v2.0.

**Governance (Approved, not reviewed for change — reviewed as the standard this audit itself follows):**
`DOCUMENTATION_GOVERNANCE.md`, `IMPLEMENTATION_PLANNING.md`.

**The five pre-existing implementation-tier documents (the actual subject of this reconciliation):**
`ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `PRODUCT_CATALOG.md`, `INFORMATION_ARCHITECTURE.md`, `DELIVERY_MODEL.md`, `BUSINESS_RULES.md`, `USER_FLOWS.md`, `ROADMAP.md`. *(`IMPLEMENTATION_PLANNING.md` §3 names five of these explicitly — `ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `ROADMAP.md`; the other five — `PRODUCT_CATALOG.md`, `INFORMATION_ARCHITECTURE.md`, `DELIVERY_MODEL.md`, `BUSINESS_RULES.md`, `USER_FLOWS.md` — sit at the Business Decisions/Product tier per `DOCUMENTATION_GOVERNANCE.md` §3 but were written at the same early stage and carry the same risk of predating the specifications, so this reconciliation checked them too.)*

**Tracking documents (reviewed for accuracy, not technical content):**
`PROJECT_STATUS.md`, `AI_HANDOFF.md`.

**All 11 frozen Product Specifications**, with particular attention to each one's Backend Requirements section (§24–§28 depending on the document — see each specification's own numbering) and Future Expansion section: `01_NAVIGATION_SPECIFICATION.md` through `11_ADMIN_WORKFLOWS_SPECIFICATION.md`.

---

## 2. Assumptions Confirmed Still Valid

Every foundational architectural decision made before the specifications existed held up under review — none was contradicted by any of the 11 frozen specifications:

- **One Medusa store, one cart, one checkout, no order-splitting** (`PRODUCT_BLUEPRINT.md` §9, `ARCHITECTURE.md`) — confirmed and reused directly by `06_CART_SPECIFICATION.md` §5/§6 and `07_CHECKOUT_SPECIFICATION.md` §5/§14 with zero deviation.
- **Two Product-module configurations, not two catalog systems** (`PRODUCT_CATALOG.md`) — confirmed by every specification that touches product data (`04`, `05`, `09`).
- **Native Fulfillment module (Stock Location, Service/Geo Zone) as the mechanism for nationwide vs. Lagos-only delivery** (`DELIVERY_MODEL.md`) — confirmed by `06`, `07`, `09`, `10`.
- **A small, purpose-built delivery-slot module as the one genuine gap in an otherwise native fulfillment story** (`DELIVERY_MODEL.md`, `MEDUSA_EXTENSIONS.md` #3) — confirmed as still the correct scope by `07`, `09`, `10`, none of which asked for anything broader.
- **Two focused, linked attribute modules (`wine-details`, `food-details`), not one universal module** (`PRODUCT_CATALOG.md`, `MEDUSA_EXTENSIONS.md` #1–#2) — confirmed by `03`, `04`, `05`, `09`, `11`.
- **Native `/store/*` and `/admin/*` APIs used as-is, custom routes only where genuinely needed** (`API_DECISIONS.md`) — confirmed; no specification asked for a custom route beyond the two `API_DECISIONS.md` already anticipated (delivery-slot availability, attribute-data exposure).
- **No custom actor type beyond native `customer`/`user`** (`API_DECISIONS.md`, `ARCHITECTURE.md`) — confirmed by `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` and `11_ADMIN_WORKFLOWS_SPECIFICATION.md`, both of which build on the native model without requesting a new actor type (though `11` §15 raises a real, separate question about role *granularity within* the admin-user type — see §8 below).
- **Guest checkout, freeform/landmark address capture, no forced account creation** (`BUSINESS_RULES.md`, `USER_FLOWS.md` Flow 6) — confirmed verbatim by `06`, `07`, `08`.
- **One unified search index spanning both catalogs, Meilisearch as the recommended engine** (`PRODUCT_BLUEPRINT.md` §8, `MEDUSA_EXTENSIONS.md` #6) — confirmed by `01`, `03`, `04`.
- **`DESIGN_SYSTEM.md`'s §B9 (Form behaviors), §B10 (Motion timing), and §B11 (Accessibility tokens)** are referenced correctly and consistently by section number across every specification that cites them (verified directly against `DESIGN_SYSTEM.md`'s actual section numbering) — no drift found.
- **No marketplace, no vendor concepts anywhere** — confirmed absent from all 11 specifications, consistent with `PRODUCT_BLUEPRINT.md`'s supersession notice.

---

## 3. Assumptions Found Obsolete

**None.** No claim in `ARCHITECTURE.md`, `TECH_STACK.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `PRODUCT_CATALOG.md`, `INFORMATION_ARCHITECTURE.md`, `DELIVERY_MODEL.md`, or `BUSINESS_RULES.md` was found to be actively wrong or contradicted by a frozen specification. This is a genuine, checked finding, not an assumption of cleanliness — see §1 for what was checked. The gaps found (§5–§13 below) are *incompleteness* (these documents predate the specifications and don't yet mention things the specifications later required), not *obsolescence* (nothing they currently say is false).

---

## 4. Conflicting Assumptions Found

**One genuine conflict, worth resolving before Tier B's Module Data Planning for the "pairs with" relationship begins:**

- **`PRODUCT_CATALOG.md`'s Wine & Spirits attribute list** (§"Wine & Spirits attributes (proposed — not finalized)") proposes `"Pairs with" (a simple reference to related Food Central dishes or general pairing suggestions)` as **a field within the `wine-details` module itself** — a one-directional, wine-side attribute.
- **Every specification that has since depended on this relationship** — `02_HOMEPAGE_SPECIFICATION.md` §8.6, `01_NAVIGATION_SPECIFICATION.md` §13/§14/§19, `03_SEARCH_SPECIFICATION.md` §17, `04_PRODUCT_LISTING_SPECIFICATION.md` §18, `05_PRODUCT_DETAILS_SPECIFICATION.md` §14, and `06_CART_SPECIFICATION.md` §18 — treats it as **a general, presumably bidirectional, product-to-product relationship mechanism** (wine↔dish, and potentially other future pairings), consistently describing it as "not yet modeled" and requiring **its own new entry in `MEDUSA_EXTENSIONS.md`**, not as a field already accounted for inside an existing module.
- **These two framings are not the same shape.** A single nullable text/reference field on `wine-details` cannot cleanly support: bidirectional lookup (a dish page showing which wines pair with it, not just a wine page showing dishes), multiple pairings per product, or the editorial curation and merchandising controls `02_HOMEPAGE_SPECIFICATION.md` and `01_NAVIGATION_SPECIFICATION.md` describe for how pairings are surfaced.
- **This is not a product decision to make here** (Tier A does not design anything) — it is a documentation inconsistency between two pre-specification documents' framing of the same feature, now that six frozen specifications have made clear which framing the product actually needs. **Flagged for Tier B:** when the "pairs with" relationship's Module Data Planning document is drafted, it should supersede `PRODUCT_CATALOG.md`'s narrower field-level framing with the general relationship-module framing the specifications consistently describe — and `PRODUCT_CATALOG.md` should be updated in that same change to remove the now-inconsistent field-level mention, per `DOCUMENTATION_GOVERNANCE.md` §6.

No other conflicting assumption was found.

---

## 5. Missing Implementation Work — Consolidated

The sections below break the same underlying finding into the specific categories requested. Read together, they are one finding: **a materially larger set of backend, frontend, and operational work is now named by the 11 frozen specifications than the five pre-existing implementation-tier documents currently describe**, because those five documents were last substantively written before any specification beyond a placeholder existed. This is expected — it is exactly the gap Phase 2 exists to close — and none of it blocks Phase 1's completeness; it defines Phase 2's actual workload.

### 6. Missing Medusa Modules

| Module | Status in `MEDUSA_EXTENSIONS.md` today | Specifications that depend on it | Severity |
|---|---|---|---|
| **"Pairs with" product-relationship module** | **Absent entirely** — not listed as extension #1–#7. `PRODUCT_CATALOG.md` mentions it only as a narrower wine-side field (§4's conflict). | `01`, `02`, `03`, `04`, `05`, `06` (six specifications) | **Highest** — the single most-referenced missing piece of backend infrastructure across all of Phase 1 |
| **Saved-for-Later mechanism** | **Absent entirely.** A new recommendation `06_CART_SPECIFICATION.md` §14/§26 introduced, explicitly flagged there as "not a pre-approved feature." | `06` (and referenced as confirmed cart-level, not account-level, by `08` §"Saved Items note") | Medium — genuinely new, requires Paul's confirmation it's in scope for v1 before Tier B plans it |
| Wine attributes module (`wine-details`) | Scoped (`MEDUSA_EXTENSIONS.md` #1) but not built; field list not finalized | `01`, `03`, `04`, `05`, `11` | Already tracked — no new finding, restated for completeness of the baseline (§14). *(Corrected 2026-07-18 per `TIER_B_WINE_ATTRIBUTES_MODULE.md`'s more granular review: `01`'s Wine Discovery Navigation §13 genuinely depends on this module; `09_FOOD_ORDERING_SPECIFICATION.md` depends on the symmetrical `food-details` module instead, not this one — a bookkeeping correction, not a new architectural finding.)* |
| Food attributes module (`food-details`) | Scoped (`MEDUSA_EXTENSIONS.md` #2) but not built; field list not finalized, allergen-accuracy ownership open | `01`, `02`, `03`, `04`, `05`, `09`, `11` | *(Corrected 2026-07-19 per `TIER_B_FOOD_ATTRIBUTES_MODULE.md`'s more granular review: `01_NAVIGATION_SPECIFICATION.md`'s Backend Data Requirements table and `02_HOMEPAGE_SPECIFICATION.md`'s Food Central Spotlight both genuinely depend on this module for prep-time/availability data — a bookkeeping correction, not a new architectural finding.)* |
| Delivery-slot scheduling module | Drafted (`TIER_B_DELIVERY_SLOT_MODULE.md` v1.0 — Draft); operational parameters open | `01`, `02`, `07`, `09`, `10`, `11` | *(Corrected 2026-07-19 per `TIER_B_DELIVERY_SLOT_MODULE.md`'s more granular review: `01_NAVIGATION_SPECIFICATION.md` and `02_HOMEPAGE_SPECIFICATION.md` both genuinely depend on this module; `06_CART_SPECIFICATION.md` does not — its own Backend Requirements table has no delivery-slot row, and its behavioral sections defer all slot mechanics to checkout; `11_ADMIN_WORKFLOWS_SPECIFICATION.md` genuinely depends on it for staff-configurable operational parameters and capacity-conflict alerting — a bookkeeping correction, not a new architectural finding.)* |

### 7. Missing Integrations

No integration is missing that isn't already named in `MEDUSA_EXTENSIONS.md` #4–#7 (local payment provider, notification provider, Meilisearch, Sanity). What's newly clear from the specifications, not from the pre-existing documents alone:

- The **payment provider integration** (`MEDUSA_EXTENSIONS.md` #4) is now known, specifically because of `07_CHECKOUT_SPECIFICATION.md` §12/§18, to need to support **distinct pending/failed/cancelled/expired/retry payment states** — a genuine integration-shape detail (async local-payment-method confirmation, e.g. bank transfer/USSD) that `MEDUSA_EXTENSIONS.md` #4's original scoping does not mention. Not a new integration — a materially more specific requirement on the existing one.
- The **notification provider** (`MEDUSA_EXTENSIONS.md` #5) is now known, from `08`, `09`, `10`, `11`, to need to serve **both customer-facing notifications and a separate, internal staff-facing alerting mechanism** (`11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19 explicitly distinguishes the two) — `MEDUSA_EXTENSIONS.md` #5 currently describes only the customer-facing channel.
- **Meilisearch's exact facet set** depends on the wine/food attribute modules' field lists, which remain open — this dependency is already correctly captured in `ROADMAP.md`'s existing Phase 2 → Phase 6 sequencing (product data before search), so no new finding here, only confirmation the existing sequencing logic still holds.

### 8. Missing Backend Responsibilities

| Responsibility | First named by | Current status |
|---|---|---|
| Customer-facing order-status vocabulary and granularity (beyond the minimum progression `09` proposes) | `09_FOOD_ORDERING_SPECIFICATION.md` §7, `10_DELIVERY_SPECIFICATION.md` §10 | **Not decided** — a business/ops decision, not an engineering one; Wine & Spirits' own status vocabulary is specified for the first time in `10` (Order Placed → Dispatched → In Transit → Delivered), but exact granularity beneath both catalogs' vocabularies remains open |
| Food Central kitchen-capacity/availability-flag logic (the exact mechanism behind the three-state availability model) | `09_FOOD_ORDERING_SPECIFICATION.md` §6 | Native mechanism direction is clear (a flag, not a stock count); the exact capacity logic itself is not built and not fully specified — this is real Tier B work, not yet a business-decision blocker |
| Kitchen operating hours / capacity-driven early closure | `09_FOOD_ORDERING_SPECIFICATION.md` §22 | **Not yet scoped anywhere** — no prior document (including `DELIVERY_MODEL.md`) names this as a configuration surface |
| Proof of delivery (confirmation, photo, or signature capture) | `10_DELIVERY_SPECIFICATION.md` §17 | **Not yet scoped anywhere** — genuinely new, no prior document anticipated it |
| Doorstep/hand-off age re-verification | `10_DELIVERY_SPECIFICATION.md` §16 | **Not yet scoped** — related to, but distinct from, the already-tracked "hard age-recheck at order confirmation" open decision |
| Audit logging (staff action/change history) | `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §20 | **Not yet scoped anywhere** |
| Staff-facing internal notifications/alerting | `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §19 | **Not yet scoped anywhere** (distinct from customer notification provider, §7 above) |
| Reports & analytics aggregation | `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §18 | **Not yet built or scoped**; no aggregation mechanism named in `ARCHITECTURE.md` |
| Staff role/permission granularity beyond native `customer`/`user` | `11_ADMIN_WORKFLOWS_SPECIFICATION.md` §15 | **Not yet scoped** — Medusa's native model is single-role; whether v1 needs more is an open business/ops decision, not yet an engineering task |
| Data-retention / NDPR-compliance mechanism | `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §17 | Native data-query mechanism is sufficient technically; the retention *policy* itself is a legal/business decision, not yet made |
| Account deletion-vs-deactivation exact policy | `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` §18 | Native mechanism (soft-delete/deactivation) is sufficient technically; exact policy not yet decided |

### 9. Missing Frontend Responsibilities

The gap here is structural, not a list of missing features: **`ROADMAP.md` Phase 0c (component specification) has not started**, and no implementation-planning document for any UI pattern the 11 specifications name yet exists. This is not a defect — `IMPLEMENTATION_PLANNING.md` §3 already names Phase 0c as a parallel, separate track — but Tier A should name, once, the concrete patterns now waiting on it, since Tier C (API Contract Planning) will need to know what the frontend actually consumes:

- The disclosure pattern for mega menu/mobile drawer (`01_NAVIGATION_SPECIFICATION.md` §22).
- The WAI-ARIA combobox pattern for autocomplete (`03_SEARCH_SPECIFICATION.md` §7/§22).
- The polite live-region pattern reused for cart totals, checkout stage transitions, order-status updates, and account/food-ordering/delivery state changes (`06`, `07`, `08`, `09`, `10` — five specifications reuse the identical mechanism).
- The calendar-grid delivery-slot picker (`07_CHECKOUT_SPECIFICATION.md` §10, reused by `09`).
- The product card component shared across listings, search results, and the homepage (`04_PRODUCT_LISTING_SPECIFICATION.md` §9).
- The staged, progress-indicated checkout flow itself (`07_CHECKOUT_SPECIFICATION.md` §5/§21).

None of this is a Tier A defect to fix — it is the concrete input Phase 0c needs once Paul directs it to begin, named here so it isn't rediscovered from scratch later.

### 10. Missing CMS Responsibilities

- `Sanity` remains recommended, not approved, and explicitly low-urgency (`MEDUSA_EXTENSIONS.md` #7, `TECH_STACK.md`) — this is unchanged and correctly reflected everywhere.
- **No specification defines what CMS-authored content actually needs to look like structurally** (e.g., a seasonal-campaign content type's fields) — `01_NAVIGATION_SPECIFICATION.md`'s Merchandising Strategy and `06_CART_SPECIFICATION.md`'s cross-sell mechanism both describe editorially-curated content operationally, but neither names it as CMS-backed versus Collection-backed. This is a minor, low-urgency gap, consistent with Sanity's own low-priority status — flagged, not urgent.

### 11. Missing Search Responsibilities

- Formal Meilisearch sign-off remains the primary open item (unchanged finding, already well-tracked).
- The synonym dictionary's actual content (Nigerian-market terminology, abbreviations) is not yet seeded — `03_SEARCH_SPECIFICATION.md` §26 already names this correctly as "mechanism scoped; content not yet seeded," no new finding.
- Search's dependency on the wine/food attribute field lists being finalized before indexing is already correctly sequenced in `ROADMAP.md` — confirmed, not a gap.

### 12. Missing Operational Tooling

- **Rider dispatch** — confirmed, not missing: `DELIVERY_MODEL.md` and `10_DELIVERY_SPECIFICATION.md` §7 both explicitly and consistently defer this to a manual/operational process for v1, with no module planned. This is a deliberate, already-agreed exclusion, not a gap.
- **Staff-facing internal alerting, audit logging, and reporting/analytics** — genuinely missing; see §8's table above (these are Admin Workflows-specific findings, listed once there rather than duplicated here).
- **Kitchen operating-hours configuration tooling** — genuinely missing; see §8.

---

## 13. `ROADMAP.md` Sequencing Gap

`ROADMAP.md`'s backend Phase 1–9 sequence was drafted before `08_CUSTOMER_ACCOUNT_SPECIFICATION.md` and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` existed, and **neither is currently named as a scheduled phase anywhere in `ROADMAP.md`** — Phase 1 scopes only Wine & Spirits' browse → age-gate → PDP → cart → guest checkout → payment → delivery path; no phase mentions account functionality or the admin dashboard extensions `11` requires. This is not a contradiction (nothing in `ROADMAP.md` says accounts or admin tooling won't be built), but it is a real gap: two full, frozen, in-scope specifications currently have no place in the build sequence. **This is explicitly Tier F's (Rollout Sequencing) job to fix, not Tier A's** — `IMPLEMENTATION_PLANNING.md` §4 and §6 place `ROADMAP.md` sequencing updates at Tier F, after Tiers B–E exist. Flagged here so it is not lost between now and then.

---

## 14. The Definitive Implementation Baseline

This table is the artifact every Tier B–F document should reference as its starting point — it consolidates every custom module, integration, or backend mechanism named anywhere across Phase 0–1, its current build status, and what (if anything) blocks it.

| # | Item | Type | Status | Blocking open decision | Depended on by |
|---|---|---|---|---|---|
| 1 | `wine-details` module | Module | Scoped, not built | Field list (`PRODUCT_CATALOG.md`) | `01`,`03`,`04`,`05`,`11` |
| 2 | `food-details` module | Module | Scoped, not built | Field list + allergen-accuracy ownership | `01`,`02`,`03`,`04`,`05`,`09`,`11` |
| 3 | Delivery-slot module | Module + workflow hook | Drafted (`TIER_B_DELIVERY_SLOT_MODULE.md` v1.0 — Draft) | Slot length/cutoff/capacity parameters; pickup-slot mechanism boundary; kitchen-vs-rider capacity reconciliation | `01`,`02`,`07`,`09`,`10`,`11` |
| 4 | Local payment provider | Provider module | Scoped, not built | Provider choice; COD policy; now also needs pending/failed/cancelled/expired/retry state support | `07` |
| 5 | Notification provider (customer-facing) | Provider module | Scoped, not built | Channel choice (WhatsApp/SMS) | `08`,`09`,`10` |
| 6 | Meilisearch integration | Integration | Recommended, not approved | Formal sign-off; depends on #1/#2 field lists | `01`,`03`,`04` |
| 7 | Sanity CMS integration | Integration | Recommended, low urgency | Formal sign-off (not urgent) | Editorial content generally |
| 8 | **"Pairs with" product-relationship module** | **Module — not yet scoped in `MEDUSA_EXTENSIONS.md` at all** | **Missing** | Needs a `MEDUSA_EXTENSIONS.md` entry; `PRODUCT_CATALOG.md`'s conflicting field-level framing needs correcting in the same change (§4) | `01`,`02`,`03`,`04`,`05`,`06` |
| 9 | **Saved-for-Later mechanism** | **New recommendation — not yet scoped** | **Missing** | Paul's confirmation it's in scope for v1 | `06` |
| 10 | Staff-facing internal notifications | New — not yet scoped | **Missing** | None named yet; needs scoping | `11` |
| 11 | Audit logging | New — not yet scoped | **Missing** | Retention duration/granularity | `11` |
| 12 | Reports & analytics aggregation | New — not yet scoped | **Missing** | Exact report definitions/cadence | `11` |
| 13 | Staff role/permission granularity | Native model may or may not be sufficient | **Open question, not yet scoped** | Whether granular RBAC is needed for v1 | `11` |
| 14 | Proof of delivery | New — not yet scoped | **Missing** | Mechanism itself (confirmation/photo/signature) not chosen | `10` |
| 15 | Kitchen operating-hours configuration | New — not yet scoped | **Missing** | Operating hours themselves | `09` |
| 16 | Order-status vocabulary (both catalogs) | Native mechanism, vocabulary undecided | **Open decision** | Exact customer-facing vocabulary/granularity | `09`,`10`,`11` |
| 17 | Data-retention / NDPR policy | Native mechanism sufficient; policy undecided | **Open decision** | Legal/business decision | `08` |
| 18 | Account deletion-vs-deactivation policy | Native mechanism sufficient; policy undecided | **Open decision** | Exact policy | `08` |
| 19 | Doorstep age re-verification | New question — not yet scoped | **Open decision** | Whether and how | `10` |
| 20 | Gift Wrap line item | Recommended, native mechanism, not yet built | Recommended, not built | None — ready for Tier B | `05`,`06` |

**Rows 1–7 were already tracked before this reconciliation.** Rows 8–19 are new or newly sharpened findings this document contributes to the baseline. Row 20 is included for completeness since it is genuinely ready to plan.

---

## 15. What This Document Does Not Do

Consistent with `IMPLEMENTATION_PLANNING.md` §1's explicit scope boundary:

- **No Frozen document was modified.** `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md`, and all 11 Product Specifications remain exactly as frozen.
- **No product decision was made.** Every open item in §14 remains open; this document documents the dependency, per `IMPLEMENTATION_PLANNING.md` §2 principle 4, it does not resolve one.
- **No API was designed.** §7 and the API-relevant rows of §14 name *that* new API surface will eventually be needed, never its shape — that is Tier C's job.
- **No database was designed.** §6 and §14 name *that* new modules are needed, never their field-level schema — that is Tier B's job.
- **No code was written.**

---

## 16. Recommended Next Step

Per `IMPLEMENTATION_PLANNING.md` §6, Tier B (Module Data Planning) is the natural next step, and within it, the "pairs with" relationship module (§4, §14 row 8) is the single highest-leverage document to draft first — it is depended on by more frozen specifications (six) than any other missing piece of infrastructure identified here. This is a recommendation only; per `IMPLEMENTATION_PLANNING.md` §7 and `DOCUMENTATION_GOVERNANCE.md` §5/§8, no Tier B document begins without Paul's explicit direction.

---

**Document status:** Approved (v1.3). This is the definitive implementation baseline every Tier B–F document should reference. Per `DOCUMENTATION_GOVERNANCE.md` §5, substantive changes to this document's findings require reflecting a genuine new discovery or decision, logged in `DECISION_LOG.md`, not a silent edit. **v1.1 bookkeeping correction (2026-07-18):** `wine-details`' dependency list in §6 and §14 was corrected from `03,04,05,09,11` to `01,03,04,05,11`, per `TIER_B_WINE_ATTRIBUTES_MODULE.md`'s more granular review — `09_FOOD_ORDERING_SPECIFICATION.md` depends on the symmetrical `food-details` module, not this one, and `01_NAVIGATION_SPECIFICATION.md`'s Wine Discovery Navigation genuinely depends on it. No finding's substance changed; logged in `DECISION_LOG.md` per `DOCUMENTATION_GOVERNANCE.md` §6. **v1.2 bookkeeping correction (2026-07-19):** `food-details`' dependency list in §6 and §14 was corrected from `03,04,05,09,11` to `01,02,03,04,05,09,11`, per `TIER_B_FOOD_ATTRIBUTES_MODULE.md`'s more granular review — `01_NAVIGATION_SPECIFICATION.md`'s Backend Data Requirements table and `02_HOMEPAGE_SPECIFICATION.md`'s Food Central Spotlight (and its own Backend Data Requirements table) both genuinely depend on this module for prep-time/availability data. No finding's substance changed; logged in `DECISION_LOG.md` per `DOCUMENTATION_GOVERNANCE.md` §6. **v1.3 bookkeeping correction (2026-07-19):** Delivery-slot module's dependency list in §6 and §14 was corrected from `06,07,09,10` to `01,02,07,09,10,11`, per `TIER_B_DELIVERY_SLOT_MODULE.md`'s more granular review — `06_CART_SPECIFICATION.md` has no genuine Backend Requirements dependency on this module (it defers all slot mechanics to checkout) and is removed; `01_NAVIGATION_SPECIFICATION.md`, `02_HOMEPAGE_SPECIFICATION.md`, and `11_ADMIN_WORKFLOWS_SPECIFICATION.md` each have a genuine, evidenced dependency and are added. This draft (not yet approved) also surfaces two new open architectural questions not previously named anywhere: the pickup-slot mechanism boundary and the kitchen-capacity-vs-rider-capacity reconciliation question (both recorded, not resolved, in `TIER_B_DELIVERY_SLOT_MODULE.md` §5/§6/§18/§19). No finding's substance changed beyond this correction and these two newly-named open questions; logged in `DECISION_LOG.md` per `DOCUMENTATION_GOVERNANCE.md` §6.
