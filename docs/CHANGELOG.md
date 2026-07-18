# Changelog

**Status:** Approved (living record)
**Version:** 1.0
**Owner:** Program
**Last Updated:** 2026-07-18

Tracks changes to the documentation set itself (not the product). For product/business decisions, see `DECISION_LOG.md`. For current project state, see `PROJECT_STATUS.md`.

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
