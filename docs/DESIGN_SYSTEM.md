# Design System

**Status:** Under Review (Part A: Principles — Approved; Part B: Foundations v1 — Draft, includes new functional colors pending sign-off)
**Version:** 2.0
**Owner:** Design
**Last Updated:** 2026-07-18

This document has two parts. **Part A (Principles)** was approved during the Brand Identity phase and hasn't changed. **Part B (Foundations)** is new — concrete, implementable tokens built on top of Part A and `BRAND_IDENTITY.md`, per Paul's Design System Foundations recommendation (`ROADMAP.md` Phase 0b). Building actual UI components/screens should wait until Part B is reviewed, since it introduces a small number of new functional colors not among the four originally approved brand colors — flagged clearly below, not assumed.

---

# Part A — Principles

## Why principles come before visuals

A design system built without agreed principles tends to accumulate inconsistency component by component. Agreeing on spacing, type scale, accessibility, grid, and motion rules now — before any screen exists — means the first screen built is already consistent with the hundredth.

## Spacing

**Principle:** one numeric spacing scale, applied everywhere via design tokens, rather than ad hoc pixel values per component.

- **Why:** consistent spacing rhythm reads as considered and premium; inconsistent spacing is one of the fastest tells that a site wasn't designed as a system.
- **Medusa impact:** storefront-only. The customer-facing site defines its own tokens, independent of Medusa Admin's internal design system.

## Typography

**Principle:** a small, deliberate type scale (roughly 5–7 sizes with a clear ratio), one distinctive display face used sparingly for headings, and one highly legible body face used everywhere else.

- **Why:** premium feel comes from restraint and legibility, not font variety — and long product-information blocks (tasting notes, ingredient lists) specifically need a body face that stays comfortable to read at length.
- **Medusa impact:** storefront-only. Final typeface selection is a `BRAND_GUIDELINES.md` decision; the *scale* and its discipline are defined concretely in Part B below.

## Accessibility

**Principle:** WCAG-level basics — color contrast, keyboard navigation, alt text on all product photography, visible focus states, and forms that work with screen readers — are a launch requirement, built in from the start, not retrofitted later.

- **Why:** accessibility failures are usability failures under ordinary real-world conditions (glare, one-handed phone use, older screens), not a niche accommodation. Also materially cheaper to build in from day one than to retrofit once component count grows.
- **Medusa impact:** storefront-only. Independent of backend architecture; applies identically to both Wine & Spirits and Food Central sections.

## Responsive grids

**Principle:** a mobile-first, content-driven grid — not a rigid desktop grid squeezed down — so product listings, product detail layout, and filters reflow naturally rather than being redesigned per breakpoint as an afterthought.

- **Why:** this is the implementation-level expression of the platform's mobile-first requirement (see `BUSINESS_RULES.md`); designing desktop-first and retrofitting mobile reliably produces worse mobile experiences than designing mobile-first from the start.
- **Medusa impact:** storefront-only.

## Motion

**Principle:** motion communicates state changes (item added to cart, filter applied, delivery slot selected) — it does not decorate. All motion must respect reduced-motion preferences.

- **Why:** purposeful motion improves perceived responsiveness and confirms an action registered; decorative or excessive motion undermines a calm, premium brand feel more than it enhances it.
- **Medusa impact:** storefront-only.

## Component consistency

**Principle:** one shared component library (buttons, form fields, cards, badges, filters) used identically across every customer-facing surface, rather than each surface reinventing its own version.

- **Why:** consistency reduces relearning cost as the product grows, and is cheaper to maintain long-term. This mirrors how Medusa itself separates a shared UI layer (used by its own Admin dashboard) from individual applications.
- **Medusa impact:** storefront-only. This component library lives in LiquorCentral's own frontend codebase(s), entirely separate from Medusa Admin's internal component library — the two should not be conflated or shared.

---

# Part B — Foundations v1 (Draft)

Concrete tokens implementing Part A, covering exactly the list Paul specified: typography scale, spacing scale, grid system, elevation/shadows, border radius, color roles, motion timing, breakpoints, icon sizing, form behaviors, and accessibility tokens.

**These are foundational rules, not page layouts.** Nothing here designs a screen — it defines the vocabulary every future screen will be built from.

## B1. Typography scale

A 7-step scale on a ~1.25 ratio from a 16px base, implementing `BRAND_IDENTITY.md` §14's direction (a warm serif/slab display face, used sparingly, paired with a legible humanist sans body face — specific typefaces still pending in `BRAND_GUIDELINES.md`).

| Token | Size | Line height | Typical use |
|---|---|---|---|
| `text-caption` | 13px | 1.5 | Fine print, metadata, timestamps |
| `text-body` | 16px (base) | 1.6 | Default body copy, tasting notes, ingredient lists |
| `text-body-lg` | 18px | 1.6 | Lead paragraphs, emphasized body text |
| `text-heading-4` | 20px | 1.3 | Card titles, small section headers |
| `text-heading-3` | 25px | 1.25 | Section headings |
| `text-heading-2` | 31px | 1.2 | Page-level headings |
| `text-heading-1` | 39px | 1.15 | Hero/display headings |

Weights: three only — **regular (400)** for body, **medium (600)** for emphasis/labels, **bold (700)** for headings — deliberately restrained, per Part A.

- **Why this ratio/scale:** small and deliberate, per `BRAND_IDENTITY.md` §14; generous line-height on body text (1.6) directly serves legibility for the long, information-dense wine/food fact sheets central to this product.
- **Business value:** a fixed scale is what lets every future screen look considered without a designer re-deriving sizes each time.
- **Technical impact:** implemented as design tokens (e.g. CSS custom properties or a Tailwind-style config) in the storefront codebase; no backend impact.
- **Risks/trade-offs:** final typeface choice (not decided here) affects perceived size/weight — this scale may need minor numeric tuning once actual typefaces are selected in `BRAND_GUIDELINES.md`.
- **Paul's approval needed?** No — a standard, defensible scale; flag only if the final typeface makes these sizes feel wrong in practice.

## B2. Spacing scale

A 4px base unit, following the exact progression named in `BRAND_IDENTITY.md` §20.

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

- **Why:** one scale, applied everywhere, is what makes the generous-white-space philosophy (`BRAND_IDENTITY.md` §20) real rather than aspirational.
- **Business value:** nearly free to implement, outsized effect on perceived quality (per Part A).
- **Technical impact:** storefront-only design tokens.
- **Risks/trade-offs:** none material.
- **Paul's approval needed?** No.

## B3. Grid system

Mobile-first, four-column base grid expanding at each breakpoint (see B7):

| Breakpoint | Columns | Margin | Gutter |
|---|---|---|---|
| Base (mobile) | 4 | 16px | 16px |
| `md` (tablet) | 8 | 24px | 16px |
| `lg`+ (desktop) | 12 | 32px | 24px |

Max content width: 1280px, centered, with margins absorbing any extra width beyond that on very large screens — consistent with the white-space philosophy rather than stretching content edge-to-edge.

- **Why:** implements the mobile-first, content-driven grid principle in Part A concretely.
- **Business value:** consistent, predictable layout behavior across the whole catalog as it grows.
- **Technical impact:** storefront-only.
- **Risks/trade-offs:** Food Central's menu (speed-first, per `EXPERIENCE_PRINCIPLES.md`) may need denser spacing within this same grid — the grid provides structure, not a mandate for identical density everywhere (see Part A's "white space vs. speed" balance already noted in `BRAND_IDENTITY.md` §20).
- **Paul's approval needed?** No.

## B4. Elevation / shadows

A restrained, three-step shadow scale — soft and diffuse, never hard or dark, consistent with "premium through discipline" (`EXPERIENCE_PRINCIPLES.md` #3):

| Token | Use | Value (example) |
|---|---|---|
| `elevation-0` | Flat — most content, cards at rest | none |
| `elevation-1` | Product cards, raised surfaces | `0 1px 2px rgba(20,15,10,0.06), 0 2px 6px rgba(20,15,10,0.04)` |
| `elevation-2` | Dropdowns, popovers | `0 4px 12px rgba(20,15,10,0.10), 0 12px 32px rgba(20,15,10,0.08)` |
| `elevation-3` | Modals, cart drawer, top-level overlays | `0 8px 24px rgba(20,15,10,0.14), 0 24px 64px rgba(20,15,10,0.12)` |

- **Why:** soft, restrained shadows read as considered; heavy/dark shadows read as generic template UI.
- **Business value:** reinforces premium perception without adding visual noise.
- **Technical impact:** storefront-only.
- **Risks/trade-offs:** exact shadow values are a reasonable starting proposal, not a pixel-perfect final spec — expect minor tuning once real screens exist.
- **Paul's approval needed?** No.

## B5. Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Form inputs, small controls, checkboxes |
| `radius-md` | 8px | Buttons, cards |
| `radius-lg` | 16px | Modals, large containers |
| `radius-full` | 9999px | Pills, badges, avatars |

- **Why:** moderate, consistent rounding — neither sharp/corporate nor bubbly/casual — fits the "warm but confident" personality (`BRAND_IDENTITY.md` §4).
- **Business value:** one visual signature detail applied consistently across every component.
- **Technical impact:** storefront-only.
- **Risks/trade-offs:** none material.
- **Paul's approval needed?** No.

## B6. Color roles

Semantic roles mapped onto the four **approved** brand colors, respecting the usage hierarchy and contrast findings already established in `BRAND_IDENTITY.md` §13.

### Roles filled directly by approved colors

| Role | Color | Notes |
|---|---|---|
| `color-primary` | Red `#EC2D07` | Primary CTAs only ("Add to Cart," "Order Now"). Large text/buttons only — never small body text on off-white (§13). |
| `color-secondary` | Green `#1A9902` | Supporting actions, confirmation states, Food Central emphasis. Same contrast caveat as primary. |
| `color-success` | Green `#1A9902` | Reuses secondary — green already reads as "confirmed/go," no new color needed. |
| `color-accent` | Gold `#CFCA43` | Rare "seal of distinction" only (badges, premium moments) — dark-ground contexts only, per §13's finding that gold fails contrast on the off-white base at every text size. |
| `color-surface` | Off White `#F3F5F0` | Dominant background, 60–70% of any composition. |

### Roles needing new functional colors — not among the four approved, flagged for sign-off

The four approved colors cover brand/accent roles but do not include a neutral grayscale for body text/borders, nor safe, distinguishable colors for warning/danger/info states. Reusing Red for both "primary CTA" and "error" risks confusing a call-to-action with a problem; reusing Gold for "warning" would cheapen its status as a rare premium seal. The following are **proposed**, not decided:

| Role | Proposed color | Reasoning |
|---|---|---|
| `color-text` / `color-text-muted` / `color-border` | A warm-neutral grayscale (e.g. ink `#1A1A1A` → `#7A7A75` → `#EDEDE8`) | None of the four approved colors are neutral enough for extensive text/border/surface use at scale; a grayscale with a faint warm undertone (echoing Off White) is proposed to harmonize rather than clash. |
| `color-danger` | A deeper, cooler red distinct from Primary Red (e.g. `#B3261E`) | Keeps "something's wrong" visually distinct from "buy now," avoiding a known UI anti-pattern. |
| `color-warning` | A deep amber (e.g. `#A66A00`) | A "family member" of Gold but darkened enough to pass contrast on the off-white base for large text/icons — Gold itself cannot (§13) and shouldn't be diluted from its "rare seal" role. |
| `color-info` | A muted blue (e.g. `#2B6CB0`) | A conventional, low-risk informational color with strong contrast; nothing in the approved four palette fills this role. |
| `color-focus-ring` | Ink `#1A1A1A` (from the proposed neutral scale) | The most robust choice for a focus indicator regardless of surrounding color — brand colors are not reliable enough at every contrast context to serve this safety-critical role. |

- **Why:** a complete, accessible UI needs more roles than four brand/accent colors can fill without compromising either accessibility (contrast) or the brand's own usage hierarchy (e.g. not overusing Gold). These proposals are chosen to harmonize with the approved palette (warm undertones, gold-adjacent warning) rather than introduce clashing new colors.
- **Business value:** prevents two real failure modes — customers confusing an error state with a call-to-action, and the brand's premium gold accent being cheapened by everyday use.
- **Customer experience benefit:** clearer, safer, more accessible signaling of state (error, warning, info) than forcing the brand palette to do jobs it isn't suited for.
- **Implementation impact:** these become new design tokens in the storefront codebase; **no change to the four originally approved brand colors themselves.**
- **Risks/trade-offs:** these are new colors being introduced to the brand's functional palette — a real, if narrow, brand decision, not a technical detail.
- **Paul's approval needed? Yes** — this is the one part of Part B that isn't purely mechanical. Everything else in Part B can proceed without further sign-off; these five functional colors should be confirmed (or adjusted) before they appear in shipped UI.

## B7. Breakpoints

| Token | Min-width | Target devices |
|---|---|---|
| `base` | 0px | Small phones |
| `sm` | 480px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

- **Why:** standard, widely-tested breakpoint steps; matches the mobile-first grid in B3.
- **Paul's approval needed?** No.

## B8. Icon sizing

| Token | Size | Use |
|---|---|---|
| `icon-sm` | 16px | Inline with caption/small text |
| `icon-md` | 20px | Inline with body text, form fields |
| `icon-base` | 24px | Default standalone icon (nav, buttons) |
| `icon-lg` | 32px | Feature callouts, empty states |

Regardless of visual icon size, the **tappable touch target is always at least 44×44px** (see B11) — a small visual icon can still sit inside a larger tap area.

- **Why:** a consistent scale plus a fixed minimum touch target satisfies both the clarity-first iconography principle (`BRAND_IDENTITY.md` §18) and basic mobile usability.
- **Paul's approval needed?** No.

## B9. Form behaviors

Concrete rules serving `EXPERIENCE_PRINCIPLES.md` principles 1 (Confidence Before Complexity), 11 (Consistency Creates Confidence), and 12 (Reduce Cognitive Load):

- Labels are always visible above the field — never placeholder-only labels (a placeholder disappears the moment a customer starts typing, removing context exactly when it's needed).
- Validation runs on blur (when a customer leaves a field), not on every keystroke — avoids interrupting someone mid-entry.
- Error messages appear directly below the affected field, in plain language, stating what's wrong and how to fix it — never a generic "invalid input."
- Required fields are marked clearly; the number of required fields is minimized to what checkout genuinely needs, consistent with the guest-checkout and low-friction goals in `PRODUCT_BLUEPRINT.md` §9.
- Success/confirmation is shown inline (e.g., a checkmark on the field) in addition to any toast, since a toast alone can be missed.

- **Why:** these are the concrete, testable expression of "reduce cognitive load" and "confidence before complexity" at the level of an actual form.
- **Paul's approval needed?** No.

## B10. Motion timing

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-micro` | 100–150ms | ease-out | Hover/press feedback |
| `motion-standard` | 200–250ms | ease-in-out | State transitions (add-to-cart confirmation, filter applied) |
| `motion-entrance` | 300–350ms | ease-out | Modals/drawers appearing |
| `motion-exit` | 200–250ms | ease-in | Modals/drawers dismissing |

All motion is skipped or reduced to near-instant when the visitor's device requests reduced motion (`prefers-reduced-motion`), per Part A and `BRAND_IDENTITY.md` §17.

- **Why:** concrete durations implementing the "calm, confident gesture" principle — fast enough to feel responsive, slow enough to feel deliberate rather than jumpy.
- **Paul's approval needed?** No.

## B11. Accessibility tokens

The concrete, testable expression of `BRAND_IDENTITY.md` §22 and `EXPERIENCE_PRINCIPLES.md` principle 13:

- **Minimum text contrast:** 4.5:1 for body text, 3:1 for large text (18pt+/14pt bold) and non-text UI components — the same WCAG AA standard computed against the brand colors in `BRAND_IDENTITY.md` §13.
- **Minimum touch target:** 44×44px for any interactive element, regardless of its visual size.
- **Focus indicator:** always visible, minimum 3:1 contrast against its background, never removed without a replacement (`outline: none` alone is never acceptable).
- **Motion:** `prefers-reduced-motion` always respected (see B10).
- **Text resize:** content and functionality remain usable at up to 200% browser zoom.

- **Why:** makes "accessibility is premium, not a checkbox" (`EXPERIENCE_PRINCIPLES.md` #13) concrete and testable rather than aspirational.
- **Paul's approval needed?** No — these are standard, non-negotiable technical minimums, not creative choices.

---

## What's still open

- **The five proposed functional colors in B6** — the one genuine open decision in this document; everything else in Part B can be treated as settled engineering detail.
- Final typeface selection (`BRAND_GUIDELINES.md`) — may prompt minor numeric tuning of the type scale (B1).
- The concrete component inventory (which components get built first) — should be derived from `USER_FLOWS.md` once component/screen work begins, not decided speculatively here.
