# Changelog

**Status:** Approved (living record)
**Version:** 2.0
**Owner:** Program
**Last Updated:** 2026-07-18

Tracks changes to the documentation set itself (not the product). For product/business decisions, see `DECISION_LOG.md`. For current project state, see `PROJECT_STATUS.md`.

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
