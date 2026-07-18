# Brand Guidelines

**Status:** Draft (placeholder — narrowed in scope now that `BRAND_IDENTITY.md` exists)
**Version:** 1.0
**Owner:** Brand
**Last Updated:** 2026-07-18

This document is the tactical execution layer: actual logo files, exact typeface selections, and a usable asset library. The strategic and emotional foundation those assets must express — vision, personality, voice, color roles, typography direction, photography direction — is now defined in `BRAND_IDENTITY.md` and should not be duplicated or re-decided here.

> Do not invent a logo, typefaces, or asset specifics on behalf of this document. If a decision is needed before it's made here, flag it in `PROJECT_STATUS.md` rather than assuming an answer.

## Relationship to `BRAND_IDENTITY.md`

These two documents coexist with distinct responsibilities — see `BRAND_IDENTITY.md`'s own "Relationship" section for the full explanation. In short:

- **`BRAND_IDENTITY.md`** — why the brand exists, how it should feel, and the principles governing color, type, photography, and motion. **Approved v1 exists.**
- **`BRAND_GUIDELINES.md` (this document)** — the exact files and specs built on top of that foundation. **Still a placeholder.**

Anyone reaching for "what's our brand voice" or "how should we use the color red" should go to `BRAND_IDENTITY.md`, not here. Anyone reaching for "the actual logo file" or "the exact hex code for a hover state" should look here once it's populated.

## What is decided (defined in `BRAND_IDENTITY.md`, referenced here)

- Vision, mission, values, personality, voice, and tone — see `BRAND_IDENTITY.md` §1–§6.
- Brand story and positioning — see `BRAND_IDENTITY.md` §9–§11.
- The four approved brand colors and their usage hierarchy (including computed accessibility contrast findings) — see `BRAND_IDENTITY.md` §13. **The colors themselves are fixed and approved; only their exact application as UI tokens remains to be specified below.**
- Typography *direction* (a warm serif/slab display face paired with a legible humanist sans) — see `BRAND_IDENTITY.md` §14. **Specific typefaces are not yet selected.**
- Photography and art direction principles — see `BRAND_IDENTITY.md` §15–§16.
- How Food Central relates visually to Wine & Spirits: same palette and system, different emphasis only — see `BRAND_IDENTITY.md` §13 and `PRODUCT_BLUEPRINT.md` §2.

## What is still not decided (this document's actual remaining scope)

- **Logo:** mark, wordmark, lockup rules, favicon, clear-space and minimum-size rules.
- **Exact typeface selection:** specific display and body typefaces satisfying the direction in `BRAND_IDENTITY.md` §14, plus licensing and web-font-loading decisions.
- **Exact color tokens:** precise tints/shades/opacities derived from the four approved colors for specific UI roles (e.g. a button hover state, a disabled state) — built on `BRAND_IDENTITY.md` §13's hierarchy and contrast findings, not a re-decision of the colors themselves.
- **Icon set:** the specific icon library/style satisfying `BRAND_IDENTITY.md` §18's clarity-first principle.
- **Physical/operational branding:** rider uniforms, delivery bags, packaging, receipts — anything a customer encounters outside the app.
- **Social and marketing assets:** templates for social posts, ads, and email.

## How this document should be filled in

Once these decisions are made (by Paul, or a designer engaged for this purpose), populate this document with the actual specs and asset references — logo files and usage rules, the final type stack, a color-token table, the icon library, and physical-branding specs — each one explicitly satisfying a principle from `BRAND_IDENTITY.md` rather than introduced independently of it.

Each addition should be logged in `DECISION_LOG.md` and reflected in `PROJECT_STATUS.md`.
