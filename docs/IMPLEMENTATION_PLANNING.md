# Implementation Planning

**Status:** Approved
**Version:** 1.0
**Owner:** Program / Engineering
**Last Updated:** 2026-07-18

This document is the **master governing document for Phase 2 — Implementation Planning**. It is not an implementation document itself: it contains no API design, no database schema, no component design, and no code. It defines *how* implementation-planning work will be structured, sequenced, approved, and versioned, the same way `DOCUMENTATION_GOVERNANCE.md` governs `/docs` as a whole rather than containing product decisions itself. Where this document's process conflicts with `DOCUMENTATION_GOVERNANCE.md`, `DOCUMENTATION_GOVERNANCE.md` wins — this document narrows and extends it for one specific tier, it does not replace it.

---

## 1. Purpose and Scope of Phase 2

**Purpose.** All 11 Product Specifications (`docs/specifications/01`–`11`) are now Approved — Frozen. They define *what* every product surface must do, for whom, and what data it needs — but deliberately contain no API design, no database schema, and no component design (per each specification's own header and `DOCUMENTATION_GOVERNANCE.md` §3's hierarchy). Phase 2 exists to close that gap: to translate frozen behavior-level specifications into concrete, reviewable, versioned **implementation plans** — the layer between "what the product must do" and "the code that does it" — before any development begins.

**In scope for Phase 2:**
- Defining, for each backend requirement named across the 11 frozen specifications, what concrete implementation-planning artifact will describe it (a data-model plan, an API contract plan, an integration plan, a testing plan) and in what document.
- Establishing the order those artifacts get created in, and why.
- Establishing how each is drafted, reviewed, and approved — mirroring the two-pass draft-then-refine (or draft-then-freeze) discipline Phase 1 already established and proved workable across 11 specifications.
- Naming the engineering philosophy every implementation-planning document must be checked against.
- Defining the exit criteria that must be true before actual development (Phase 3, not yet named or scheduled) begins.

**Explicitly out of scope for Phase 2, and for this document specifically:**
- **No implementation code.** Phase 2 produces planning documents, not code — the same discipline `DOCUMENTATION_GOVERNANCE.md` §10's Repository Workflow already establishes (Specification → Design → **Implementation** → Testing → Release; planning precedes and informs Implementation, it is not Implementation).
- **No API design.** Endpoint shapes, request/response contracts, and route-level detail belong to the API Contract Planning documents this document schedules (§4), not to this document or to Phase 2's kickoff.
- **No database schema.** Entity/field-level schema, migrations, and index design belong to the Module Data Planning documents this document schedules (§4), not here.
- **No component building.** Visual/component-level design is `ROADMAP.md` Phase 0c's job, tracked separately and in parallel — see §3.
- **No frontend or backend development.** Phase 2 is planning; nothing here authorizes writing or shipping code.

---

## 2. Engineering Philosophy

Every implementation-planning document produced under Phase 2 must be checked against these principles, the same way every Product Specification was checked against `EXPERIENCE_PRINCIPLES.md` and a closing Quality Checklist:

1. **Specification-driven, not invention-driven.** An implementation-planning document translates a frozen specification's stated requirement into a concrete technical shape. It does not introduce new product behavior, new business rules, or new customer-facing decisions — if a planning document needs a product decision the specifications don't already make, that is an open dependency to flag (§5), never something to decide unilaterally at the planning layer.
2. **Medusa-native first.** Per `ARCHITECTURE.md`'s standing constraint, every plan defaults to Medusa's native data model, workflow engine, and extension points (custom modules, module links, workflow hooks, custom API routes, provider modules, admin widgets) before proposing anything bespoke. A plan that reaches for a custom mechanism where Medusa already provides one is a planning defect, not a preference.
3. **One module, one plan.** Mirroring `PRODUCT_BLUEPRINT.md` §13's "two focused modules, not one universal one" principle, each custom module identified in `MEDUSA_EXTENSIONS.md` gets its own planning document — a wine-details plan does not absorb the food-details plan's concerns, and neither absorbs delivery-slot's.
4. **Open business decisions are inherited, not re-litigated.** Every open decision `PROJECT_STATUS.md` currently tracks (payment provider, delivery mechanism, delivery-slot parameters, notification channel, data-retention/NDPR specifics, and the rest) remains open at the planning layer exactly as it was at the specification layer. A planning document facing one of these documents the dependency and, where genuinely useful, the possible implementation paths — the same discipline `07_CHECKOUT_SPECIFICATION.md` §12/§15 already modeled for payment and age-verification — but does not choose an answer Paul hasn't given.
5. **Plan for testability.** Every Product Specification ends in an Acceptance Criteria section written to be testable. Implementation planning must preserve that traceability — a planning document that cannot be checked against its source specification's acceptance criteria is incomplete, not merely light on detail.
6. **Smallest sufficient plan.** A planning document answers what a backend developer, frontend developer, and QA engineer need to build and test correctly — it is not an exhaustive design document, and it is not code-in-prose. If a decision can reasonably be left to implementation-time engineering judgment without risking a contradiction of the specification, leave it there rather than over-specifying.

---

## 3. Relationship to the Documentation Hierarchy

`DOCUMENTATION_GOVERNANCE.md` §3 already places **Implementation Planning** as its own tier, between Product Specifications and Code:

```
Business Decisions        (BUSINESS_RULES.md, DECISION_LOG.md, PRODUCT_BLUEPRINT.md)
        ↓
Brand & Experience         (BRAND_IDENTITY.md, EXPERIENCE_PRINCIPLES.md)
        ↓
Design System               (DESIGN_SYSTEM.md)
        ↓
Product Specifications       (docs/specifications/01–11)  ← Frozen, complete
        ↓
Implementation Planning        (this phase — governed by this document)
        ↓
Code                             (not yet begun)
```

This document is the tier's own governing standard, occupying the same relative role for Implementation Planning that `DOCUMENTATION_GOVERNANCE.md` occupies for `/docs` as a whole. A lower document may narrow or implement a higher one but may never contradict it (`DOCUMENTATION_GOVERNANCE.md` §3) — every implementation-planning document must therefore be checked against every frozen specification it draws from, exactly as §11's Quality Checklist requires.

**Five documents already exist at this tier** — `ROADMAP.md`, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, and `TECH_STACK.md` — all written *before* the 11 Product Specifications existed, at Draft status. Phase 2's first concrete task (§6) is reconciling these against the now-frozen specifications, not creating something new from a blank page.

**Phase 0c (component specification)** is a related but distinct, parallel track — visual/component design against `DESIGN_SYSTEM.md`, tracked in `ROADMAP.md`. Phase 2 does not absorb Phase 0c; where an implementation-planning document touches a frontend concern, it cross-references Phase 0c's eventual output rather than duplicating it (§4, Tier E).

---

## 4. The Complete Hierarchy of Implementation Documents

Phase 2 organizes its output into six tiers. Each tier answers a different question; a document belongs to exactly one tier, and no tier's document restates content that belongs to another.

| Tier | Answers | Example documents | Governed by |
|---|---|---|---|
| **A — Foundational Reconciliation** | Do the five pre-existing implementation-tier documents (`ROADMAP.md`, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `TECH_STACK.md`) still agree with all 11 frozen specifications? | Updates to the five existing documents themselves — no new files | This document, §6 |
| **B — Module Data Planning** | For a given custom module, what entities/fields/relationships does it need at a planning level (not a migration script), and which frozen specifications drive each field? | One document per module named in `MEDUSA_EXTENSIONS.md` (wine-details, food-details, delivery-slot, payment provider, notification provider) plus the two newly-recommended modules Phase 1 surfaced (Saved-for-Later, the "pairs with" product-relationship module) | This document, §7–§9 |
| **C — API Contract Planning** | For a given product surface, which operations does the storefront/admin need from the backend, and how do they map to native Medusa routes vs. a custom route? | One document per major surface grouping (e.g. Cart & Checkout API Plan, Product Discovery API Plan, Account API Plan, Admin Workflow API Plan), extending `API_DECISIONS.md` | This document, §7–§9 |
| **D — Integration Planning** | For a given third-party integration (Meilisearch, Sanity, a payment provider, a notification provider), what is the integration's shape, and what is still blocked on a business or technology sign-off? | One document per integration named in `MEDUSA_EXTENSIONS.md` #4–#7 | This document, §7–§9 |
| **E — Testing & Acceptance Planning** | How does each frozen specification's Acceptance Criteria section map to an actual, executable test plan? | One consolidated Testing Strategy document, cross-referencing every specification's Acceptance Criteria | This document, §7–§9; flagged as a future need in `DOCUMENTATION_GOVERNANCE.md` §12 |
| **F — Rollout Sequencing** | Given Tiers B–E, in what order does actual development (Phase 3, not yet scheduled) proceed? | An update to `ROADMAP.md`'s existing phase structure, not a new document | This document, §6 |

**What is deliberately not a Phase 2 tier:** component/visual implementation (Phase 0c, parallel — §3), and Code itself (Phase 3, gated by §10's exit criteria).

---

## 5. Dependencies

Every Tier B–D document depends on:
1. The specific frozen Product Specifications that name its backend requirement (traceable via each specification's own Backend Requirements section — §24 in most specifications, §26 in `06_CART_SPECIFICATION.md`).
2. `MEDUSA_EXTENSIONS.md`'s existing scoping entry for that module or integration, where one exists.
3. Any open business decision that specification already flagged (`PROJECT_STATUS.md` — "Decisions awaiting Paul's approval").

A Tier B–D document **may proceed and be drafted even while an open business decision remains unresolved**, exactly as `07_CHECKOUT_SPECIFICATION.md` §12 planned a provider-agnostic payment stage despite the payment-provider decision being open — but it must name the dependency explicitly (§2, principle 4) rather than silently assuming an answer, and must state what part of the plan is genuinely blocked (cannot be finalized) versus what part is provider/parameter-agnostic and can proceed regardless.

Tier E (Testing & Acceptance Planning) depends on all 11 frozen specifications' Acceptance Criteria sections existing — a precondition already satisfied.

Tier F (Rollout Sequencing) depends on Tiers B–E existing in at least draft form, since sequencing requires knowing what's being sequenced.

---

## 6. Creation Order

Phase 2 proceeds in the following order. Later steps are not blocked from starting until Paul is ready to direct them — but skipping a step (drafting a Tier B document before Tier A's reconciliation is complete for the documents it touches) risks planning against a stale foundation, the same risk `DOCUMENTATION_GOVERNANCE.md` §5's change rules exist to prevent.

1. **Tier A — Foundational Reconciliation.** Audit `ROADMAP.md`, `ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, and `TECH_STACK.md` against all 11 frozen specifications. Fix only genuine inconsistencies (per `DOCUMENTATION_GOVERNANCE.md` §13's audit discipline) — do not rewrite settled content that still holds. This is the necessary first step because every later tier cites these five documents as its own dependencies (§5).
2. **Tier B — Module Data Planning**, one module at a time, sequenced by how many frozen specifications already depend on it: the wine-details and food-details attribute modules first (named by nearly every specification), then delivery-slot, then the payment provider and notification provider modules, then the two newly-recommended modules (Saved-for-Later, the "pairs with" relationship) — mirroring `MEDUSA_EXTENSIONS.md`'s own existing approval-status ordering.
3. **Tier C — API Contract Planning**, grouped by product surface, sequenced to follow the same order the Product Specifications themselves were drafted in (Navigation/Discovery → Cart & Checkout → Account → Food Ordering & Delivery → Admin), since each surface's API plan depends on that surface's already-frozen specification and, where relevant, on the Tier B module plans it consumes.
4. **Tier D — Integration Planning**, sequenced by launch-criticality: the payment provider first (the project's sole launch-blocking open decision, per `PROJECT_STATUS.md`), then the notification provider, then Meilisearch, then Sanity (explicitly low-urgency, per `MEDUSA_EXTENSIONS.md` #7).
5. **Tier E — Testing & Acceptance Planning.** Drafted once Tiers B–D are far enough along that test cases can be derived against a concrete plan, not only against the specification's prose.
6. **Tier F — Rollout Sequencing.** A final update to `ROADMAP.md`'s Phase 1–9 backend sequence, incorporating whatever Tiers B–E actually found (e.g., a module turning out to depend on another in a way the original `ROADMAP.md` phase order didn't anticipate).

**Each individual document within a tier is still sequenced one at a time, with Paul's explicit go-ahead to begin it** — the same placeholder-then-draft-then-approve discipline `DOCUMENTATION_GOVERNANCE.md` §5 and §8 (rule 8) already established for Product Specifications, carried forward unchanged into this tier. This document schedules the *order*; it does not itself begin any Tier B–F document.

---

## 7. Approval Workflow

Every Tier A–F document follows the same two-stage pattern Phase 1 proved across all 11 specifications:

1. **Draft.** The document is written in full against its dependencies (§5), status `Draft` or `In Progress`, version `0.x`. Every open business decision it touches is named explicitly, with possible paths and impact where genuinely useful (§2, principle 4) — never invented.
2. **Review and freeze, in one of two patterns** — mirroring the two patterns Phase 1 already used and logged in `DECISION_LOG.md`:
   - **Draft → refinement pass → freeze**, when Paul approves the overall direction but wants specific areas strengthened before locking it (the pattern used for `01`, `03`, `04`, `06`, and every specification from `07` onward).
   - **Draft → direct freeze**, when Paul's initial instruction already specifies the complete scope and explicitly calls for a one-pass freeze (the pattern used for `05`).

No Tier A–F document begins without Paul's explicit direction to begin that specific document, and no document is frozen without Paul's explicit approval — the same sequencing discipline that governed all 11 Product Specifications applies identically here.

---

## 8. Versioning

Implementation-planning documents use the same `major.minor` scheme `DOCUMENTATION_GOVERNANCE.md` §7 already defines, with the same `0.x`-while-drafting, `1.0`-on-first-approval convention Product Specifications used. No new versioning rule is introduced by this document — Phase 2 inherits Phase 1's convention exactly, rather than inventing a parallel one.

---

## 9. Document Lifecycle

Every Tier A–F document uses the same eight-status lifecycle `DOCUMENTATION_GOVERNANCE.md` §4 already defines (Not Started, Draft, In Progress, Under Review, Approved, Frozen, Deprecated, Superseded — Archived is not expected to apply to this tier). A Tier B–D document reaches **Frozen** on the same terms a Product Specification did: approved by Paul, and thereafter modifiable only in response to an explicit new business decision, per `DOCUMENTATION_GOVERNANCE.md` §5.

**One difference from Product Specifications is worth naming explicitly:** because implementation-planning documents sit closer to code than specifications do, a Tier B–D document may reasonably need a **non-substantive maintenance update** as Tier F's rollout sequencing clarifies real dependencies between modules — `DOCUMENTATION_GOVERNANCE.md` §5 already permits this class of edit (cross-references, bookkeeping, reflecting a decision made elsewhere) without a fresh approval round; it is restated here only because it will come up more often at this tier than it did for Product Specifications.

---

## 10. Exit Criteria — What Must Be True Before Development Begins

Phase 3 (actual frontend/backend development — not yet named or scheduled in `ROADMAP.md` beyond its existing Phase 1–9 backend sequence) does not begin until, for the specific surface or module in question:

- [ ] Its Tier A reconciliation is complete — the pre-existing implementation-tier documents it depends on (`ARCHITECTURE.md`, `MEDUSA_EXTENSIONS.md`, `API_DECISIONS.md`, `TECH_STACK.md`) have been checked against the frozen specification(s) that drive it, with any inconsistency fixed.
- [ ] Its Tier B (data) and/or Tier C (API) planning documents are Approved or Frozen, not merely drafted.
- [ ] Every open business decision that specific surface or module depends on is either resolved and logged in `DECISION_LOG.md`, or is genuinely non-blocking for a first-cut implementation (e.g. a provider-agnostic payment-stage build can begin before the specific provider is chosen, per §2 principle 4 and `07_CHECKOUT_SPECIFICATION.md` §12's own precedent) — never silently assumed.
- [ ] Its relevant Tier D integration plan, if any, is at least drafted and names what remains blocked on external approval (e.g. WhatsApp Business API approval timelines, per `MEDUSA_EXTENSIONS.md` #5).
- [ ] Its Tier E test plan exists and is traceable to the originating specification's Acceptance Criteria.
- [ ] `ROADMAP.md`'s Tier F sequencing places it in the correct order relative to its actual dependencies (not just the order originally guessed at in `ROADMAP.md`'s Phase 1–9 sequence, drafted before any specification existed).
- [ ] Every quality-checklist item in `DOCUMENTATION_GOVERNANCE.md` §11 passes for every planning document involved.

**This is a per-surface/per-module gate, not a single all-or-nothing gate for the entire platform.** Consistent with `ROADMAP.md`'s own sequencing logic ("prove ordinary commerce first, then layer in scheduling sophistication..."), different surfaces will clear this gate at different times — Wine & Spirits' core buy flow is expected to clear it before Food Central's scheduling sophistication does, the same order `ROADMAP.md`'s existing Phase 1–4 already implies.

---

## 11. Quality Checklist

Every Tier A–F document, before being considered complete, must satisfy:

- [ ] Traces every claim back to a specific frozen Product Specification section, or to an existing `MEDUSA_EXTENSIONS.md`/`ARCHITECTURE.md`/`API_DECISIONS.md`/`TECH_STACK.md` entry — never a claim invented at the planning layer.
- [ ] Names every open business decision it depends on, with possible implementation paths and customer/technical impact where genuinely useful — never resolves one.
- [ ] Defaults to Medusa-native mechanisms before proposing anything custom (§2, principle 2).
- [ ] Is scoped to exactly one module, surface, or integration (§2, principle 3) — no document silently absorbs another's concerns.
- [ ] Is traceable to its source specification's Acceptance Criteria (§2, principle 5).
- [ ] Satisfies every item in `DOCUMENTATION_GOVERNANCE.md` §11's general document quality checklist (header, status accuracy, dependencies stated, links resolve, facts vs. recommendations distinguished, indexed in `README.md`, decisions logged, tracking documents updated in the same change).
- [ ] Contains no API endpoint design, no database schema, no component design, and no code (§1) — a Tier B document that starts sketching field types down to database column types has drifted from planning into schema design, and should be flagged back rather than accepted as-is.

---

## 12. Future Maintenance

This document should be revisited, the same way `DOCUMENTATION_GOVERNANCE.md` §12 revisits itself:

- **When Tier A's reconciliation is complete**, this document's dependency claims (§5) should be re-checked against whatever the reconciliation actually found, in case a specification's backend requirement turns out to map differently than assumed here.
- **When the first Tier B–D document is drafted**, use it to validate this document's Approval Workflow (§7) and Quality Checklist (§11) actually work in practice, and adjust here if a gap appears — the same "don't invent speculatively, adjust when there's real signal" discipline `DOCUMENTATION_GOVERNANCE.md` §12 already applies to itself.
- **When Phase 3 (development) is scheduled**, the Exit Criteria (§10) should be reviewed once against real, in-progress module planning to confirm the gate is neither too loose nor needlessly blocking.

This document does not need a maintainer beyond "whoever notices it's gone stale," the same standard every other living process document in `/docs` holds itself to.

---

**Document status:** Approved (v1.0). This document governs Phase 2 — Implementation Planning in full. It does not itself begin any Tier A–F document — per `DOCUMENTATION_GOVERNANCE.md` §5 and §8 (rule 8), no implementation-planning document begins without Paul's explicit direction to begin that specific document.
