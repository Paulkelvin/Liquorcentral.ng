# Design System

**Status:** Draft (principles only — foundational tokens not yet defined)
**Version:** 1.0
**Owner:** Design
**Last Updated:** 2026-07-18

No visual tokens (specific colors, fonts, or component visuals) are defined here yet — those depend on `BRAND_IDENTITY.md` and `EXPERIENCE_PRINCIPLES.md` being approved first (see `PROJECT_STATUS.md`). This document captures the *rules a design system must follow*, established during the UX research phase, so that whenever visual-token work begins, it inherits these constraints rather than reinventing them.

## Why principles come before visuals

A design system built without agreed principles tends to accumulate inconsistency component by component. Agreeing on spacing, type scale, accessibility, grid, and motion rules now — before any screen exists — means the first screen built is already consistent with the hundredth.

## Spacing

**Principle:** one numeric spacing scale, applied everywhere via design tokens, rather than ad hoc pixel values per component (for example, a base-unit scale such as 4/8/12/16/24/32/48/64).

- **Why:** consistent spacing rhythm reads as considered and premium; inconsistent spacing is one of the fastest tells that a site wasn't designed as a system.
- **Medusa impact:** storefront-only. The customer-facing site defines its own tokens, independent of Medusa Admin's internal design system.

## Typography

**Principle:** a small, deliberate type scale (roughly 5–7 sizes with a clear ratio), one distinctive display face used sparingly for headings, and one highly legible body face used everywhere else.

- **Why:** premium feel comes from restraint and legibility, not font variety — and long product-information blocks (tasting notes, ingredient lists) specifically need a body face that stays comfortable to read at length.
- **Medusa impact:** storefront-only. The specific typefaces are a `BRAND_GUIDELINES.md` decision; the *scale* and its discipline are an engineering/design-system decision independent of that choice.

## Accessibility

**Principle:** WCAG-level basics — color contrast, keyboard navigation, alt text on all product photography, visible focus states, and forms that work with screen readers — are a launch requirement, built in from the start, not retrofitted later.

- **Why:** accessibility failures are usability failures under ordinary real-world conditions (glare, one-handed phone use, older screens), not a niche accommodation. It is also materially cheaper to build in from day one than to retrofit once component count grows.
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

## What's still open

- All specific visual tokens (colors, exact typefaces, iconography) — pending `BRAND_GUIDELINES.md`.
- Whether Wine & Spirits and Food Central sections share 100% of visual styling or have a subtle, deliberate distinction within the same system (see `BRAND_GUIDELINES.md`).
- The concrete component inventory (which components are needed first) — this should be derived from `USER_FLOWS.md` once visual design begins, not decided speculatively here.
