# Design System

**Status:** Approved — Authoritative Foundation (frozen)
**Version:** 2.0
**Owner:** Design
**Last Updated:** 2026-07-18

Approved in full by Paul, 2026-07-18, across three rounds of review: overall direction, the three-tier Color Architecture and its WCAG validation, and this final refinement (semantic token naming, future theme support, component philosophy, and a design quality checklist). **This is now the authoritative foundation all future UI and component work is checked against.** It has two parts: **Part A (Principles)**, approved during the Brand Identity phase, and **Part B (Foundations)** — concrete, implementable tokens built on top of Part A and `BRAND_IDENTITY.md`.

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

# Part B — Foundations (Approved)

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

## B6. Color Architecture

Refined 2026-07-18 per Paul's review — this section replaces the earlier, less structured "Color roles" draft. It explicitly separates three tiers: **Brand Colors** (fixed identity), **Functional UI Colors** (system states, independent of brand meaning), and **Semantic Design Tokens** (the only thing components ever reference). Every color below derives from `BRAND_IDENTITY.md`; none of it redefines that document.

### Why three tiers, not one color list

Collapsing "what LiquorCentral looks like" and "what a component should reference" into one list is what causes brand colors to get pressed into service for jobs they weren't designed for (e.g. Gold used for a warning banner because "it's the only yellow we have"). Separating the tiers means:

- **Brand Colors** stay exactly what `BRAND_IDENTITY.md` defined — untouched, and never reasoned about in terms of "does this work as an error color?"
- **Functional Colors** exist purely to communicate system state, chosen for accessibility and universal recognizability, independent of brand meaning.
- **Semantic Tokens** are the only thing a component's code ever references (`color.primary`, `color.danger`, etc.) — never a raw hex value. If the brand palette ever evolves, only the token *definitions* change; no component is rewritten.

### Tier 1 — Brand Colors (fixed, unchanged)

| Color | Hex | Status |
|---|---|---|
| Primary Red | `#EC2D07` | Approved, fixed |
| Green | `#1A9902` | Approved, fixed |
| Gold | `#CFCA43` | Approved, fixed |
| Off White | `#F3F5F0` | Approved, fixed |

These define LiquorCentral's visual identity per `BRAND_IDENTITY.md` and are not reinterpreted, tinted into new "brand" meanings, or replaced anywhere in this document. The usage hierarchy from `BRAND_IDENTITY.md` §13 still governs how often each appears (Off White dominant at 60–70%, Green 15–25%, Red 5–10% reserved, Gold under 5% and dark-ground only) — semantic tokens (Tier 3) don't override that discipline, they implement it.

### Tier 2 — Functional UI Colors

Independent of the brand palette, chosen solely for accessibility and to communicate state unambiguously. Each is computed against WCAG's contrast formula, the same method used for the Tier 1 analysis in `BRAND_IDENTITY.md` §13.

| State | Hex | Contrast on Off White | Reasoning |
|---|---|---|---|
| **Success** | Green `#1A9902` (reused from Tier 1) | ~3.4:1 (large text/UI only, per §13) | The one intentional, non-conflicting reuse: `BRAND_IDENTITY.md` §13 already established Green as the brand's "confirmation/go" accent — "success" is that same meaning, not a new one. Inventing a second, unrelated green purely for success states would create two greens in the system with no clear distinction. |
| **Warning** | `#B45309` (burnt orange) | ~4.6:1 (passes AA for normal text) | Chosen independently of Gold. Despite both sitting loosely in the amber/orange family — a near-universal convention for warning semantics that would be counter-intuitive to abandon entirely — this shade is shifted clearly toward orange (hue ≈ 28°) away from Gold's yellow-green mustard tone (hue ≈ 58–60°), so the two are never visually interchangeable. Gold is never used in a warning context and warning is never described as, or styled like, a variant of Gold. |
| **Danger / Error** | `#B3261E` (deep red) | ~5.95:1 (passes AA for normal text — better than Primary Red's own ~3.87:1) | Deliberately a *different* shade from Primary Red, not the same color doing double duty. This satisfies Paul's specific concern: Red retains one meaning (primary action) and Danger retains a different, distinct meaning (something's wrong) — related by hue family (red universally reads as "stop/error"), but never the literal same value, and used in entirely different contexts (a button vs. an inline error message). |
| **Information** | `#2B6CB0` (muted blue) | ~4.9:1 (passes AA for normal text) | A conventional, unambiguous informational blue; no brand color fills this role without conflict, so an independent color is used. |

- **Why (overall):** a complete, accessible UI needs more states than four brand/accent colors can fill without compromising either accessibility (contrast) or the brand's own usage hierarchy. These four are chosen to be accessible on their own terms, not squeezed out of the brand palette.
- **Business value:** prevents two real failure modes named directly in Paul's feedback — Gold's premium status being cheapened by everyday warning use, and Red's call-to-action meaning being confused with a destructive/error meaning.
- **Customer experience benefit:** clearer, safer, more accessible signaling of state than forcing the brand palette to do jobs it isn't suited for.
- **Implementation impact:** four new functional design tokens in the storefront codebase. **No change to the four Tier 1 brand colors.**
- **Risks/trade-offs:** Warning's amber/orange family membership is a deliberate, explained choice, not an oversight — flagged here so it's never mistaken for accidental overlap with Gold later.
- **Paul's approval needed?** No — these four specific hex values, reasoned above, are approved as of 2026-07-18.

### Gold Usage — explicit rule

Gold is a **premium brand accent**, never a functional system color.

**Appropriate uses:** premium collections, featured products, curated selections (e.g. "Sommelier's Picks"), awards/quality indicators, luxury/gifting highlights — always on a dark ground or as a small, rare accent, per `BRAND_IDENTITY.md` §13's contrast finding that Gold fails WCAG contrast against the Off White base at every text size.

**Gold must never communicate:** errors, warnings, success, information, or validation states of any kind. If a future component is tempted to reach for Gold to indicate "something needs attention," that is a sign the component needs a Tier 2 Functional Color (Warning/Danger/Info), not Gold.

### Neutral System

A dedicated warm-neutral grayscale (echoing Off White's slight warmth rather than a cold, clinical gray) covers everything text/UI-chrome-related that the four brand colors can't safely do at scale:

| Token | Hex | Contrast on Off White | Use |
|---|---|---|---|
| `ink-900` | `#1A1A1A` | ~15.9:1 (AAA) | Primary text |
| `ink-700` | `#46443F` | ~8.9:1 (AAA) | Secondary text, subheadings |
| `ink-500` | `#706C63` | ~4.8:1 (AA) | Muted text, placeholders, disabled text |
| `ink-300` | `#B8B4AA` | — (non-text) | Default borders, input outlines |
| `ink-200` | `#D8D5CC` | — (non-text) | Subtle dividers |
| `ink-100` | `#ECEAE3` | — (non-text) | Card/hover backgrounds, subtle alternate surfaces |
| `ink-900 @ 50% opacity` | `rgba(26,26,26,0.5)` | — (non-text) | Modal/drawer overlay backdrop |

- **Why this scale supports readability and accessibility:** every text-bearing step (`ink-900`, `ink-700`, `ink-500`) clears WCAG AA on the Off White base — `ink-500`, the lightest text-permitted step, still reaches ~4.8:1, comfortably above the 4.5:1 minimum for body text. This means designers never have to guess whether a "muted" text color is still legible — the scale is built so every step that's labeled for text use already passes. The warm undertone (each step's red/green/blue channels stay close together rather than perfectly neutral) keeps the whole system feeling considered against Off White's own warm-neutral base, rather than introducing a cold gray that would visually clash.
- **Disabled states:** use `ink-500` for disabled text/icons and `ink-100` for disabled surface fills — intentionally lower-contrast, since WCAG doesn't require inactive controls to meet the same contrast bar as active ones, but still legible enough to read as "present but inactive" rather than invisible.
- **Cards/backgrounds:** the page background resolves to Off White (Tier 1); `ink-100` is reserved for a *subtle* surface (hover states, alternating rows, input backgrounds) that needs to read as slightly recessed relative to the primary Off White ground. See **Surface Elevated** below for the separate, *raised*-surface case.
- **Paul's approval needed?** No — this is a standard, accessibility-driven neutral scale; flag only if the warm undertone reads wrong once real screens exist.

### Surface Elevated

A dedicated, distinct value for surfaces that sit *above* the page — cards, modals, dropdowns, the cart drawer — used together with the elevation shadows in B4:

| Token | Hex | Use |
|---|---|---|
| Surface Elevated | `#FFFFFF` (pure white) | Cards, modals, popovers, dropdowns — anything rendered with an elevation shadow |

- **Why a distinct value, not the same Off White as the page:** a card in the exact same tone as the page it sits on relies on its shadow alone to read as "raised" — a subtle brightness step (Off White's warm `#F3F5F0` → pure white `#FFFFFF`) combined with the shadow gives real, legible separation without needing a heavier border or a darker shadow to compensate. This is a small, restrained difference — consistent with "premium through discipline" (`EXPERIENCE_PRINCIPLES.md` #3) — not a strong color shift.
- **Paul's approval needed?** No — a standard elevation technique; flag only if it reads as inconsistent once real screens exist.

### Interactive States

Rather than hard-coding a separate fixed color for every element's hover and pressed state, **Interactive / Interactive Hover / Interactive Active are a state-layer mechanism**, not fixed hex values — they apply consistently on top of *whichever* color a given interactive element already uses (`color.primary`, `color.secondary`, or the default `color.interactive` below).

| Token | Definition |
|---|---|
| `color.interactive` | The resting-state color of a low-emphasis clickable element (a text link, a secondary list action) that isn't a full CTA — defaults to Green `#1A9902`, consistent with Green's existing "actionable" role in the brand hierarchy. |
| `color.interactive.hover` | The element's current base color (whether `color.primary`, `color.secondary`, or `color.interactive`) blended with an 8% black overlay. |
| `color.interactive.active` | The element's current base color blended with a 16% black overlay (pressed/active state). |

- **Why a state-layer mechanism, not a fixed hex per state:** a hardcoded "hover green" and "hover red" would need a new pair of colors defined for every current *and future* interactive color — and would need to be redefined entirely under a future theme. A percentage-based overlay applies uniformly to any base color, today or under any future theme, with zero new color decisions required as the system grows. This is the same reasoning behind Future Theme Support below.
- **Business value:** any future button, link, or interactive component — however many are eventually built — gets correct, consistent hover/press feedback automatically, without a designer choosing a new hover shade each time.
- **Customer experience benefit:** directly serves `EXPERIENCE_PRINCIPLES.md` #11 (Consistency Creates Confidence) — every interactive element darkens the same way on hover and press, everywhere.
- **Paul's approval needed?** No — a standard, mechanical technique; the 8%/16% figures are a reasonable starting point, tunable once real components exist.

### Tier 3 — Semantic Design Tokens: the canonical language

**These semantic names — not raw hex values, and not literal color names — are the canonical vocabulary of this system.** A designer or developer should say "use Primary" or "this is a Danger state," never "make it red" or "use `#EC2D07`." Every token resolves to a Tier 1 or Tier 2 color, or to the Interactive state-layer mechanism above — component code never references a raw hex directly.

| Semantic name | Token | Resolves to |
|---|---|---|
| **Primary** | `color.primary` | Red `#EC2D07` (Tier 1) |
| **Secondary** | `color.secondary` | Green `#1A9902` (Tier 1) |
| **Accent** | `color.accent` | Gold `#CFCA43` (Tier 1 — dark-ground/rare use only, per Gold Usage above) |
| **Surface** | `color.surface` | Off White `#F3F5F0` (Tier 1) |
| **Surface Elevated** | `color.surface.elevated` | White `#FFFFFF` (see Surface Elevated above) |
| **Text Primary** | `color.text.primary` | `ink-900` `#1A1A1A` |
| **Text Secondary** | `color.text.secondary` | `ink-700` `#46443F` |
| **Border** | `color.border` | `ink-300` `#B8B4AA` |
| **Divider** | `color.divider` | `ink-200` `#D8D5CC` |
| **Focus** | `color.focus` | `ink-900` `#1A1A1A` — most robust choice regardless of surrounding color |
| **Interactive** | `color.interactive` | Green `#1A9902` (default), or the state-layer mechanism described above |
| **Interactive Hover** | `color.interactive.hover` | Base color + 8% black overlay (mechanism) |
| **Interactive Active** | `color.interactive.active` | Base color + 16% black overlay (mechanism) |
| **Disabled** | `color.disabled` | `ink-500` `#706C63` (text/icon) / `ink-100` `#ECEAE3` (surface) |
| **Success** | `color.success` | Green `#1A9902` (reused, intentional — see Tier 2) |
| **Warning** | `color.warning` | `#B45309` (Tier 2) |
| **Danger** | `color.danger` | `#B3261E` (Tier 2) |
| **Information** | `color.information` | `#2B6CB0` (Tier 2) |

Two supplementary tokens exist beyond this canonical list, for technical completeness: `color.background` (Off White — same value as Surface today, kept as a separate token for forward flexibility) and `color.text.muted` (`ink-500` — a third text tier for placeholders/captions).

- **Why:** decouples implementation from the underlying palette — a component that renders a primary button references **Primary**, never `#EC2D07` directly. If the brand palette ever evolves, only these token definitions change.
- **Business value:** the brand can evolve (a new campaign color, a seasonal accent, a full refresh) without rewriting components — exactly the goal Paul specified.
- **Customer experience benefit:** guarantees the consistency principle in `EXPERIENCE_PRINCIPLES.md` #11 (Consistency Creates Confidence) — every "primary action" looks identical everywhere, because every component draws from the same token, not a locally-chosen hex.
- **Implementation impact:** implemented as design tokens (CSS custom properties or equivalent) in the storefront codebase; component code never hard-codes a color value.
- **Paul's approval needed?** No — the token names and structure are now approved; only the underlying Tier 2 hex values were subject to sign-off, and those are approved as of this version.

### Consistency check

This Color Architecture derives from, and does not redefine, the source documents:

- **`BRAND_IDENTITY.md` §13** — the four brand colors, their usage hierarchy, and the WCAG contrast findings (including that Gold fails contrast on Off White) are carried forward unchanged; Tier 2/3 exist specifically to avoid ever contradicting that hierarchy.
- **`EXPERIENCE_PRINCIPLES.md` #13 (Accessibility Is Premium)** — every Tier 2 color and the Neutral System were chosen to clear WCAG AA on their own terms, not retrofitted.
- **`PRODUCT_BLUEPRINT.md` §15 (Accessibility Principles)** — the same WCAG AA baseline governs this entire section; nothing here introduces a lower standard.

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

# Future Theme Support

Nothing in this section is built today — only the default (light) theme exists. This documents the *capability* the token architecture provides, so a future theme is an extension of this system, not a rewrite of it.

**The mechanism:** because every component references only Tier 3 semantic tokens (Primary, Surface, Text Primary, and so on) and never a raw hex or a Tier 1/2 color directly, a "theme" is simply an alternate set of values bound to those same token names. Switching a theme means changing the token-to-value mapping in one place; no component is touched.

**Illustrative examples (not implemented):**

- **Dark Mode** — Surface/Background would remap to a dark ink tone, Text Primary to a light neutral, and Primary/Secondary would likely need a lightness adjustment to hold contrast on a dark ground. Notably, **Gold would become more usable, not less** — `BRAND_IDENTITY.md` §13 and this document's own contrast analysis already found Gold exceeds AAA contrast on a dark ground (versus failing entirely on Off White), so a dark theme is where the Accent token could appear more freely, still within the "premium, rare" spirit of Gold Usage above.
- **Seasonal Themes** — e.g. a festive campaign could rebind Accent to a different value for a limited period, with zero component changes.
- **Brand Refreshes** — if the four Tier 1 colors themselves are ever revised, only Tier 1's definitions change; every Tier 3 token, and every component, follows automatically.
- **Accessibility Themes** — e.g. a high-contrast mode could remap the Neutral System to wider steps (pushing Text Secondary from AA to AAA), again without touching a single component.

- **Why:** documents the payoff of the Tier 1/2/3 separation and the Interactive state-layer mechanism — both were built with exactly this future flexibility in mind, not as an afterthought.
- **Business value:** the brand can evolve — a new season, a new market, a full refresh — without a component rewrite each time.
- **Paul's approval needed?** No — this is architecture documentation for a capability, not a proposal to build any of the illustrative themes now.

---

# Component Philosophy

Before any component is specified, this is the standard every future component is measured against.

- **Components solve problems, not decorate screens.** A component earns its place by removing friction, per `EXPERIENCE_PRINCIPLES.md` #2 (Simplicity Before Features) — never by making a screen look busier.
- **Consistency is more valuable than novelty.** A clever one-off interaction that isn't reused anywhere else costs more in relearning than it earns in delight — directly serves `EXPERIENCE_PRINCIPLES.md` #11 (Consistency Creates Confidence).
- **Accessibility is part of every component, not an afterthought applied to it.** Every component is built against B11's tokens from the start, not audited for accessibility after the fact.
- **Motion communicates state, not entertainment.** A component's animation exists to confirm something happened (B10) — if it would still make sense with the motion removed entirely, the motion wasn't necessary.
- **Components compose naturally.** A smaller component (a button, a badge) should combine into a larger one (a product card) without special-case overrides — if composing two components requires fighting one of them, one of them is wrong.
- **Every component has one obvious primary purpose.** A component trying to do several unrelated jobs becomes unpredictable exactly where predictability matters most — split it instead.
- **Components reference only semantic tokens, never raw values.** This is what makes Future Theme Support real rather than aspirational, and what makes the Design Quality Checklist below actually checkable.

**How future components are expected to evolve:** a new component that needs a value not yet in this system (a new spacing step, a new color, a new duration) is a signal to propose a new *token* at the appropriate tier in Part B first — never to hard-code a one-off value inside that single component. Every future component specification should open by naming which existing tokens it uses; needing an entirely new token should be the exception worth a second look, not the routine case.

---

# Design Quality Checklist

Every future component must be able to answer **yes** to all of the following before it's considered complete. A component that looks polished but fails one of these isn't finished.

- [ ] **Is it accessible?** Meets WCAG AA at minimum (B11), including for keyboard and screen-reader use.
- [ ] **Is it mobile-first?** Designed and tested at the smallest breakpoint first, not shrunk down from desktop (B3, B7).
- [ ] **Does it reduce cognitive load?** (`EXPERIENCE_PRINCIPLES.md` #12)
- [ ] **Does it reinforce trust?** (`EXPERIENCE_PRINCIPLES.md` #9; `BRAND_IDENTITY.md` §21)
- [ ] **Does it support the Brand Identity?** Consistent with the brand's personality, voice, and visual philosophy (`BRAND_IDENTITY.md`).
- [ ] **Does it align with the Experience Principles?** Checked against all 15 (`EXPERIENCE_PRINCIPLES.md`), not just the obviously relevant ones.
- [ ] **Does it follow the semantic token system?** No raw hex values, no hardcoded spacing/type/motion values — only Tier 3 tokens and Part B scales.
- [ ] **Is the interaction predictable?** Behaves the same way everywhere it appears (`EXPERIENCE_PRINCIPLES.md` #11).
- [ ] **Is the motion purposeful, not decorative?** (B10, Component Philosophy)
- [ ] **Is the component reusable across both Wine & Spirits and Food Central contexts**, not built for only one?
- [ ] **Would it still work correctly under a future theme** (dark mode, seasonal, accessibility) without code changes? (Future Theme Support)
- [ ] **Does it respect the brand color usage hierarchy** — Off White dominant, Red and Gold reserved and rare, never overused because they happen to be available? (`BRAND_IDENTITY.md` §13)

This document is now **Version 2.0 — the authoritative Design System foundation** for all future UI and component work.

---

## Consistency with source documents

This entire document is derived from, and does not redefine, `PRODUCT_BLUEPRINT.md`, `BRAND_IDENTITY.md`, and `EXPERIENCE_PRINCIPLES.md` — reviewed in full against all three as of this version:

- Every Part A principle traces to a specific `BRAND_IDENTITY.md` or `EXPERIENCE_PRINCIPLES.md` section (cited inline throughout).
- Every Part B foundation implements a Part A principle concretely — none introduces a new principle of its own.
- §B6's Color Architecture is the most detailed cross-check: it inherits `BRAND_IDENTITY.md` §13's brand colors, hierarchy, and contrast findings unchanged, and its Functional Colors/Neutral System exist solely to fill gaps those four colors cannot safely fill — never to compete with or reinterpret them.
- Mobile-first (B3, B7), accessibility (B11, §B6), and performance-relevant restraint (B4 shadows, B10 motion) all trace directly to `PRODUCT_BLUEPRINT.md` §14–§16.
- Future Theme Support and Component Philosophy both trace to `EXPERIENCE_PRINCIPLES.md` #11 (Consistency Creates Confidence) and #15 (Build Relationships, Not Just Transactions) — a system built to evolve without rewrites is itself a long-term-trust decision, not just an engineering convenience.
