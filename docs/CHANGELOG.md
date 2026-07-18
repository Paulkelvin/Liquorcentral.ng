# Changelog

Tracks changes to the documentation set itself (not the product). For product/business decisions, see `DECISION_LOG.md`. For current project state, see `PROJECT_STATUS.md`.

## v1.1 — 2026-07-18

Documentation audit and consolidation. Two independent, unmerged branches were found to each hold real project documentation: `claude/medusa-repo-clone-ut5dl5` (this v1 documentation set, plus the `medusa` git submodule) and a separate branch carrying a newly-authored `AI_HANDOFF.md`. Neither had been merged into `main`.

**Added:**

- `AI_HANDOFF.md` (at the repository root) — project-level onboarding document; now the first document any human or AI session should read, ahead of everything in `/docs`.

**Changed:**

- `README.md` — "Start here" order and document map updated to list `AI_HANDOFF.md` first.
- `PROJECT_STATUS.md` — logged the audit/consolidation under Completed work.
- `DECISION_LOG.md` — added an entry recording the audit finding and the merge.

**Merged:** the full `/docs` set (this file's v1 additions below) from `claude/medusa-repo-clone-ut5dl5` into the current working branch, alongside the `.gitmodules`/`medusa` submodule reference that accompanied it — so `ARCHITECTURE.md`'s and `TECH_STACK.md`'s claims that Medusa is "already vendored in this repo" are now actually true on this branch, not just true on the branch where they were written.

No document's substantive content (business decisions, architecture decisions, open questions) was changed as part of this consolidation — only cross-references and status bookkeeping.

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
