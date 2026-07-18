# LiquorCentral Documentation

This directory is the **single source of truth** for the LiquorCentral project. It replaces chat history as the record of what has been decided, why, and what remains open.

> **Rule:** if it isn't written here, it isn't decided. If a chat conversation reaches a conclusion, that conclusion must be reflected in the relevant document below (and logged in `DECISION_LOG.md`) before the work is considered done.

## Start here

Anyone — human or AI — picking up this project should read, in this order:

1. **`PROJECT_STATUS.md`** — current phase, what's done, what's in progress, what's next, what's blocked, and what's awaiting Paul's approval. Always read this first.
2. **`PRODUCT_BLUEPRINT.md`** — the product's reason for existing: vision, positioning, philosophy, and the 18 strategic pillars every other document is downstream of.
3. **`BRAND_IDENTITY.md`** — the brand's reason for feeling the way it does. Anyone about to do design-system or visual work must read this first — it is an approval gate, not optional background reading (see `PROJECT_STATUS.md`).
4. Everything else, as relevant to the task at hand (see the map below).

## Document map

| Document | What it answers |
|---|---|
| [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) | Where is the project right now? |
| [`PRODUCT_BLUEPRINT.md`](./PRODUCT_BLUEPRINT.md) | What is LiquorCentral, and why is it built this way? |
| [`BUSINESS_RULES.md`](./BUSINESS_RULES.md) | What are the non-negotiable rules of how the business operates? |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | How is the underlying Medusa platform structured? |
| [`MEDUSA_EXTENSIONS.md`](./MEDUSA_EXTENSIONS.md) | What custom modules/extensions does LiquorCentral need, and why? |
| [`API_DECISIONS.md`](./API_DECISIONS.md) | Where does LiquorCentral use Medusa's API as-is vs. extend it? |
| [`TECH_STACK.md`](./TECH_STACK.md) | What technology is this built on, end to end? |
| [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) | How is the site/product structured and navigated? |
| [`PRODUCT_CATALOG.md`](./PRODUCT_CATALOG.md) | How are Wine & Spirits and Food Central products modeled? |
| [`DELIVERY_MODEL.md`](./DELIVERY_MODEL.md) | How does delivery/pickup/scheduling actually work? |
| [`USER_FLOWS.md`](./USER_FLOWS.md) | What are the step-by-step customer journeys? |
| [`BRAND_IDENTITY.md`](./BRAND_IDENTITY.md) | Who is LiquorCentral, how should it feel, and how should its approved colors/type/photography be used? |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | What design principles govern the interface (not yet: what it looks like)? |
| [`BRAND_GUIDELINES.md`](./BRAND_GUIDELINES.md) | What are the exact logo/type/asset specs? *(placeholder — narrower scope now that `BRAND_IDENTITY.md` exists)* |
| [`ROADMAP.md`](./ROADMAP.md) | In what order will this get built? |
| [`DECISION_LOG.md`](./DECISION_LOG.md) | What was decided, when, why, and with what impact? |
| [`CHANGELOG.md`](./CHANGELOG.md) | What changed in the documentation itself, over time? |

## Continuity rules (read this before doing anything)

These rules apply to every future session, human or AI:

1. **Read the docs before acting.** At the start of any task, read `PROJECT_STATUS.md` in full, then whichever documents are relevant to the task. Do not rely on prior chat history — it is not authoritative and may not be available to whoever picks this up next.
2. **The docs are the memory, not the conversation.** A decision made in conversation but not written down here does not count as decided.
3. **Keep documentation synchronized.** Outdated documentation is treated as a bug. If a decision changes, update the document it lives in *and* add an entry to `DECISION_LOG.md` — don't leave the old version in place with the new decision only mentioned in chat.
4. **Every material decision is logged.** Business decisions, architecture decisions, and scope changes all get an entry in `DECISION_LOG.md` with the decision, the reasoning, the date, and the impact — even if the decision is also reflected elsewhere.
5. **`PROJECT_STATUS.md` is always current.** It should never describe a phase or task that has since changed without being updated in the same change.
6. **Don't invent business or brand decisions.** Where a document has a placeholder or an open question, leave it open and flag it for Paul rather than assuming an answer. See `PROJECT_STATUS.md` → "Decisions awaiting Paul's approval."
7. **No implementation code, UI mockups, or wireframes belong in `/docs`.** This directory documents product, architecture, and decisions — not interface design or source code. Visual design work begins only after the relevant blueprint sections are approved.

## Working rules for anyone extending Medusa on this project

- Never modify Medusa core (the `medusa/` submodule). All customization happens through Medusa's documented extension points — custom modules, module links, workflow hooks, custom API routes, and admin widgets/routes. See `MEDUSA_EXTENSIONS.md` for the specific extensions this project needs and `ARCHITECTURE.md` for why this constraint exists.
- Research UX and product principles, not visual designs. Do not copy layouts, branding, animations, or interactions from other websites — see `DESIGN_SYSTEM.md` and `BRAND_GUIDELINES.md` for what's actually been decided vs. left open.
- Every recommendation, in any document, should carry: why, business value, technical impact, implementation difficulty, risks, assumptions, and whether Paul's approval is required. This is the same structure `MEDUSA_EXTENSIONS.md` and `DECISION_LOG.md` use.
