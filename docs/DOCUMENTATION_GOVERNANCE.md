# Documentation Governance

**Status:** Approved (living, authoritative standard)
**Version:** 1.0
**Owner:** Program
**Last Updated:** 2026-07-18

This document is the governing standard for how documentation on this project is created, statused, changed, cross-referenced, versioned, and maintained — by AI sessions and human contributors alike. Where any other document's practice conflicts with this one, this document wins unless a `DECISION_LOG.md` entry explicitly says otherwise.

---

## 1. Purpose

Documentation exists because this project has no other durable memory. Chat history is not saved between sessions, is not searchable by whoever picks up the work next, and is not guaranteed to be available to the person or AI session that continues it. `/docs` is what makes the project **self-documenting**: a new contributor — human or AI — should be able to onboard completely and correctly by reading `/docs` alone, without needing prior conversation, tribal knowledge, or a briefing from someone else.

Every rule in this document exists to serve that one goal: **a future reader, with no other context, must be able to reach the same understanding of the project that today's contributor has.**

---

## 2. Single Source of Truth

**Repository documentation always overrides chat history.** If a conclusion was reached in conversation but never written into `/docs`, it is not decided — it does not bind any future session, and no future session should treat it as fact.

Concretely:
- A decision is real once it is written into the relevant document *and* logged in `DECISION_LOG.md`. Until then, it is a proposal, not a decision.
- If a user (in chat) states that something was "already decided" or "already built" and it does not appear in `/docs`, the correct response is to check `git log --all` and `git branch -r` for unmerged work (see `AI_HANDOFF.md`'s provenance note for a real example of this happening), not to take the chat claim at face value or to silently fabricate matching content.
- If chat guidance and `/docs` conflict, `/docs` wins until a document is explicitly updated to reflect the new instruction — updating the document *is* how a chat instruction becomes durable.

---

## 3. Documentation Hierarchy

Documents are not all equally authoritative. When two documents appear to disagree, the one higher in this hierarchy wins, and the lower one is out of date and should be corrected:

```
Business Decisions        (BUSINESS_RULES.md, DECISION_LOG.md)
        ↓
Brand & Experience         (BRAND_IDENTITY.md, EXPERIENCE_PRINCIPLES.md)
        ↓
Design System               (DESIGN_SYSTEM.md)
        ↓
Product Specifications       (docs/specifications/*)
        ↓
Implementation Planning        (ROADMAP.md, ARCHITECTURE.md, MEDUSA_EXTENSIONS.md, API_DECISIONS.md, TECH_STACK.md)
        ↓
Code                             (the codebase itself, once it exists)
```

Rules that follow from this:
- A lower document may **narrow** or **implement** a higher one, but may never **contradict** it. A Product Specification cannot introduce a customer journey that violates `BUSINESS_RULES.md`; `DESIGN_SYSTEM.md` cannot invent a brand color `BRAND_IDENTITY.md` didn't approve.
- `PRODUCT_BLUEPRINT.md` sits alongside Business Decisions as foundational — it is where the business decisions and the product's reason for existing are unified into one frozen document. Treat it as authoritative at the top of the hierarchy alongside `BUSINESS_RULES.md`.
- Process/tracking documents (`PROJECT_STATUS.md`, `README.md`, `CHANGELOG.md`, `DECISION_LOG.md`, `AI_HANDOFF.md`, this document) sit outside the hierarchy — they describe and index the other documents rather than competing with them for authority. `DECISION_LOG.md` is the one exception with teeth: a logged decision can override any document's prior content, which is exactly how the hierarchy is meant to evolve over time.
- Code, once it exists, must conform to Implementation Planning and everything above it — code is never itself the source of truth for a product or business decision. If code and documentation disagree, that is a bug in one of them, not a tiebreaker in code's favor.

---

## 4. Document Lifecycle

Every document declares its status in its header (see `README.md` → "Document status convention" for the header format). This governance document adds four statuses to the four `README.md` already defines, for a complete set of eight:

| Status | Meaning | When to use it |
|---|---|---|
| **Not Started** | A placeholder skeleton exists (Document Purpose, Scope, Dependencies, Planned Sections) but no detailed content has been written. | Specifically for `docs/specifications/*` placeholders — see `docs/README.md`'s Product Specifications section. This is a pre-Draft state, distinct from Draft: a Draft document has actual content awaiting review, a Not Started document deliberately has none yet. |
| **Draft** | Proposed, not yet reviewed. | A document's first version, or any version with content not yet checked by anyone but its author. |
| **In Progress** | Actively being written or expanded, with a defined scope but incomplete content. | A specification whose placeholder sections (Purpose, Scope, Dependencies, Planned Sections) exist but whose detailed behavior sections are still being drafted — e.g. `02_HOMEPAGE_SPECIFICATION.md` before Paul's review. |
| **Under Review** | Complete, but awaiting explicit approval; parts may already be finalized (the document should say which). | A document handed to Paul (or another explicit approver) for a decision, where work has stopped pending their response. |
| **Approved** | Authoritative; treat as decided unless a `DECISION_LOG.md` entry says otherwise. | Any document whose content has received explicit sign-off and is now safe to build on. |
| **Frozen** | Approved, and additionally locked against modification except by an explicit new business decision. | Documents at the top of the hierarchy that everything else depends on — currently `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md`. Freezing exists specifically to stop downstream work from quietly renegotiating upstream decisions. |
| **Deprecated** | Still accurate as a historical record, but no longer the recommended approach going forward, and should not be built against for new work. | Rare on this project so far; reserved for a document whose approach is being phased out gradually rather than replaced outright in one decision. |
| **Superseded** | Kept for history only; the document (or the section replacing it) states what replaced it. | A retired approach that has a clean, complete replacement — e.g. the multi-vendor marketplace architecture, superseded by the single-company model documented in `PRODUCT_BLUEPRINT.md`'s supersession notice. |
| **Archived** | No longer relevant to the active project and not expected to be read as part of normal onboarding, but retained rather than deleted. | Not yet used on this project. Would apply to a document whose entire subject matter has been dropped (not just replaced) — e.g. if a product line were discontinued and its specifications were no longer even historically instructive. |

**Rules governing transitions:**
- A document moves forward through these statuses; moving backward (e.g. Approved → Draft) is itself a material decision and must be logged in `DECISION_LOG.md` with the reason.
- Frozen is the only status that adds a hard modification barrier — see Section 5.
- Superseded and Deprecated documents are never deleted. They remain in `/docs` as history; a note at the top must say what replaced them, matching the "documents are never actually lost" principle in `AI_HANDOFF.md`.

---

## 5. Change Rules

**Default rule:** any document may be edited by whoever is doing the relevant work, as long as the edit is logged (see Section 7 — Cross-Reference Rules — and `DECISION_LOG.md`'s append-only convention).

**Documents requiring Paul's explicit approval before modification:**
- Any document with status **Frozen** — currently `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, `EXPERIENCE_PRINCIPLES.md`, `DESIGN_SYSTEM.md`. These may only change in response to an explicit new business decision from Paul, never as a side effect of downstream work.
- Any document with status **Approved**, when the proposed change is to *substantive content* rather than bookkeeping (cross-references, status headers, typo fixes, or reflecting a decision Paul has already made elsewhere). Approved documents can and should still receive non-substantive maintenance without a fresh approval round.
- Any Product Specification (`docs/specifications/*`) that is currently a placeholder (status Not Started): detailed content may not be added without Paul's explicit direction to begin that specific file. This applies even though placeholders are not Frozen — the restriction here is about *starting* work, not modifying existing approved content.

**Documents that may be edited freely as part of normal work**, provided every material change is logged:
- Draft and In Progress documents, by whoever is actively developing them.
- The tracking documents themselves (`PROJECT_STATUS.md`, `CHANGELOG.md`, `DECISION_LOG.md`) — these are living by design and are expected to change every session; see Section 4 of `README.md`'s continuity rules.

**Never:**
- Silently edit history. `DECISION_LOG.md` is append-only — a changed decision gets a new entry, not an edit to the old one (Section 6 explains why).
- Recreate a document that already exists because a second copy of it was found elsewhere (e.g. on an unmerged branch). Reconcile it — see `DECISION_LOG.md`'s "Repository reconciliation" entry for the precedent.

---

## 6. Cross-Reference Rules

- **Every document should name the documents it depends on**, either in a "Scope"/"Dependencies" section (as the Product Specification template already does) or inline where a claim rests on another document's decision (e.g. "the four approved brand colors — see `BRAND_IDENTITY.md` §13").
- **No document may silently contradict another.** If new information makes an existing statement in another document wrong, the fix has two required parts in the same change: (1) update the document that was wrong, and (2) log the correction in `DECISION_LOG.md` if it reflects an actual decision change, or note it as a bookkeeping fix in `CHANGELOG.md` if it's purely a consistency correction (as with the `PRODUCT_BLUEPRINT.md` status-header fix during the 2026-07-18 repository reconciliation — a stale header, not a new decision).
- **Links must resolve.** A markdown link to another `/docs` file must point to a file that actually exists at that path. Broken links are a documentation bug, not a cosmetic issue — see Section 12 for the audit process that catches these.
- **`docs/README.md`'s document map is the canonical index.** Every file in `/docs` (including this one) must appear in it. A document not indexed there is effectively invisible to anyone following the standard reading order.
- **Status claims must agree across documents.** If `PROJECT_STATUS.md` or `DECISION_LOG.md` describes a document as approved/frozen, that document's own header must say the same thing. This exact class of bug — `PRODUCT_BLUEPRINT.md`'s header still saying "Draft" after `PROJECT_STATUS.md` had already started describing it as frozen — is what the 2026-07-18 reconciliation audit found and fixed, and is exactly what future audits (Section 12) should keep checking for.

---

## 7. Versioning Rules

Every document's header carries a `Version` field. This project uses a lightweight `major.minor` scheme, not full semantic versioning (there is no "patch" tier — documentation changes are either substantive or they're bookkeeping, and bookkeeping doesn't need a version bump at all):

- **Major version bump (e.g. 1.0 → 2.0):** the document's substantive content changed — new sections, a materially different decision, a restructure, or (for `AI_HANDOFF.md` specifically) a rewrite against a changed project state.
- **Minor version bump (e.g. 1.0 → 1.1):** a smaller but still real change — a status-header correction, a cross-reference fix, a section added without changing existing conclusions, or absorbing a `DECISION_LOG.md`-logged decision into the document's own text.
- **No version bump:** typo fixes, formatting, or anything that changes no meaning at all. (In practice, prefer a minor bump if there's any doubt — an under-incremented version is a worse failure mode than an over-cautious one, since it hides the fact that something changed.)
- Product Specifications use their own `0.x` pre-release convention while In Progress (e.g. `02_HOMEPAGE_SPECIFICATION.md` at v0.1), moving to `1.0` on first approval — signaling that nothing below v1.0 should be treated as stable enough to build against without checking for changes.
- `CHANGELOG.md`'s own entries (`v1`, `v2`, ... `v9`, ...) are a separate numbering track from any individual document's version — they number *changesets to the documentation set as a whole*, not any one file. Do not confuse the two: `CHANGELOG.md`'s own header `Version` field tracks this document's own structural version, while its `v1`...`v9` entries are its content.
- A version bump on a document is not optional bookkeeping — update it in the same change that changes the document, not later, and not by a different person than whoever made the change.

---

## 8. AI Contributor Rules

Every future AI session working on this project must:

1. **Onboard first.** Read `AI_HANDOFF.md`, then `docs/README.md`, then `PROJECT_STATUS.md`, before making any recommendation or change — see `AI_HANDOFF.md` Section 6 for the full reading order.
2. **Read documentation before acting.** Consult the relevant document(s) for a task rather than guessing or relying on general knowledge of e-commerce/retail conventions.
3. **Never recreate existing work.** If something appears to be missing, check `git log --all` and `git branch -r` before concluding it doesn't exist and before writing a replacement from scratch. Reconcile, don't recreate — see the 2026-07-18 repository reconciliation for the precedent this project now follows.
4. **Never contradict approved documents.** A Frozen or Approved document is binding until a new decision changes it — an AI session disagreeing with a past decision is not grounds to override it; flag it to Paul instead.
5. **Never skip updating tracking documents.** Any material change to `/docs` updates `PROJECT_STATUS.md` in the same change, and any material decision gets a `DECISION_LOG.md` entry in the same change — "I'll log it later" is how documentation drifts out of sync.
6. **Document assumptions.** Where a document has to proceed without a settled answer, say so explicitly (a "Risks/assumptions" or "Open questions" section, or a flagged note) rather than silently picking an answer and moving on.
7. **Distinguish facts from recommendations.** A decision Paul has made is a fact and should be stated as one. A path the AI session thinks is best, but which Paul has not yet confirmed, must be labeled "recommended," "proposed," or "not yet approved" — never phrased as if it were already decided. `AI_HANDOFF.md` Section 2 (`TECH_STACK.md` recommendations) is the model for this distinction.
8. **Never start a placeholder specification without explicit direction.** The Product Specifications phase is deliberately sequenced one file at a time — see Section 5.
9. **Never introduce marketplace concepts, or any other explicitly superseded architecture**, without Paul explicitly reopening that decision.

---

## 9. Human Contributor Rules

Guidance for any human developer or designer joining the project after this point:

1. **Start where AI sessions start.** Read `AI_HANDOFF.md`, then `docs/README.md`, then `PROJECT_STATUS.md`. This governance document assumes the same onboarding path applies to everyone, not just AI sessions.
2. **Don't rely on Slack/email/meeting notes as the record.** If a decision is made in conversation, it isn't real until it's written into the relevant document and logged in `DECISION_LOG.md` — the same rule that binds AI sessions (Section 2) binds humans too, for the same reason: whoever joins next shouldn't have to have been in the room.
3. **Respect Frozen and Approved documents.** Don't hand-edit a Frozen document to "just fix one thing" without Paul's sign-off, even if the fix seems obviously correct — route it through Section 5's change process so it's logged and visible.
4. **Keep `PROJECT_STATUS.md` current as you work**, the same standard this document holds AI sessions to. An out-of-date status is treated as a bug regardless of who introduced it.
5. **When in doubt about scope or authority, check Section 3 (the hierarchy) and Section 5 (change rules)** before editing — they answer "can I change this?" and "does this contradict something upstream?" for both human and AI contributors identically. This document does not have a separate, looser standard for humans.

---

## 10. Repository Workflow

The expected path from an idea to shipped software on this project:

```
Business Decision           (Paul decides; logged in DECISION_LOG.md, reflected in BUSINESS_RULES.md / PRODUCT_BLUEPRINT.md)
        ↓
Documentation                (the decision is written into the relevant /docs file — undocumented decisions do not count, see Section 2)
        ↓
Specification                 (translated into a behavior-level spec under docs/specifications/, if it concerns a product surface)
        ↓
Design                          (component/visual design against DESIGN_SYSTEM.md, once Phase 0c — component specification — begins)
        ↓
Implementation                    (code, built against Specification + Design + ARCHITECTURE.md/MEDUSA_EXTENSIONS.md, never against assumption)
        ↓
Testing                             (verified against the Specification's acceptance criteria — a spec without testable acceptance criteria is incomplete, see Section 11)
        ↓
Release
```

Each stage's output is a `/docs` artifact (or code, at the Implementation stage) that the next stage depends on and must not contradict — this is the same hierarchy from Section 3, expressed as a process rather than a document ranking. A stage may run in parallel with a non-adjacent stage (e.g. `ROADMAP.md` already documents Product Specifications running in parallel with backend Implementation work), but it may never skip the stage directly above it — Implementation should never begin from a Business Decision with no Specification in between, for anything customer-facing.

---

## 11. Quality Checklist

A document is complete when it satisfies all of the following:

- [ ] Has the standard header (`Status`, `Version`, `Owner`, `Last Updated`) per `README.md`'s convention.
- [ ] Status accurately reflects reality — cross-checked against how `PROJECT_STATUS.md` and `DECISION_LOG.md` currently describe it (Section 6).
- [ ] States its dependencies on other documents, and does not contradict any of them (Sections 3, 6).
- [ ] Every internal link resolves to a file that actually exists.
- [ ] Distinguishes decided facts from open questions/recommendations — nothing is quietly assumed (Section 8, rule 7).
- [ ] Is indexed in `docs/README.md`'s document map.
- [ ] If it records a decision: that decision also has a `DECISION_LOG.md` entry.
- [ ] If it changed materially: `PROJECT_STATUS.md` and, if relevant, `CHANGELOG.md` were updated in the same change.
- [ ] For a Product Specification specifically: has testable acceptance criteria, not just descriptive behavior — see `02_HOMEPAGE_SPECIFICATION.md` as the reference example.
- [ ] Uses terminology consistent with the rest of `/docs` (Section 12's audit checks for drift here — e.g. "Wine & Spirits" vs. "Wine and Spirits" vs. "the liquor line" should not all appear for the same concept).

---

## 12. Future Maintenance

As the project grows, this governance document itself should evolve rather than be treated as permanently frozen — but changes to it are still material decisions and follow Section 5 like any other document (it is Approved, not Frozen, precisely so it can adapt without requiring a full new business decision each time).

Expected evolution points:
- **When Phase 0c (component specification) begins**, this document's hierarchy (Section 3) and workflow (Section 10) should be checked against how component-level design actually gets documented, and adjusted if a gap appears.
- **When implementation code begins**, a `Testing`/QA-facing convention (how acceptance criteria map to actual test cases) will likely need its own short addendum here or in a new document — do not invent it speculatively now; add it when Phase 1 backend work is far enough along to know what's actually needed.
- **When the document count grows enough that the flat `docs/README.md` map becomes hard to scan**, consider sub-indexes per hierarchy tier (Section 3) rather than restructuring the directory — but this is explicitly not needed yet at 21 top-level documents plus 11 specifications, and should not be done speculatively.
- **Periodic audits** (Section 13's process) should be re-run whenever a reconciliation, a large batch of new documents, or a long gap between sessions makes drift likely — not on a fixed schedule, since a fixed schedule invites checkbox audits that don't actually re-derive whether things are still consistent.

This document does not need a maintainer beyond "whoever notices it's gone stale" — the same standard `PROJECT_STATUS.md` holds itself to.

---

## 13. Audit Process

This section defines what a documentation audit checks, for use by this hardening pass and any future one:

1. **Consistent headers** — every document in `/docs` has `Status`/`Version`/`Owner`/`Last Updated`, correctly filled in (not a placeholder like `TBD`).
2. **Consistent statuses** — a document's own header status agrees with how every other document that references it describes it (Section 6's core check).
3. **Correct cross-references** — every markdown link inside `/docs` resolves to an existing file; every document named in `docs/README.md`'s map exists; every file in `/docs` is named in that map.
4. **Consistent terminology** — the same concept is named the same way everywhere (e.g. "Wine & Spirits," "Food Central," "Phase 0," product-line names, document names) — drift here is a readability and trust problem even when it isn't technically a contradiction.
5. **Consistent version numbering** — versions follow Section 7's scheme, and a document whose content changed has a version number that actually moved.
6. **No duplicate concepts** — the same decision or definition isn't independently (and possibly divergently) restated in two documents that should instead cross-reference one canonical source.
7. **No orphaned documents** — every file in `/docs` is reachable from `docs/README.md`'s map and serves a purpose currently described in `PROJECT_STATUS.md` or `ROADMAP.md`; a file that fails this check is either mis-indexed (fix the index) or genuinely stale (mark it Deprecated/Archived, don't silently delete it).

**Audit discipline:** fix only genuine inconsistencies found by the checks above. Do not rewrite approved content, do not "improve" wording that isn't actually wrong, and do not second-guess a Frozen document's substance under the banner of an audit — an audit is a consistency check, not a design review.
