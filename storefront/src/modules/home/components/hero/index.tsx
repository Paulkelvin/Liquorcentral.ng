import Image from "next/image"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.3 — one brand statement, two clearly
 * weighted entry points, no auto-rotating carousel (current research is
 * unambiguous that carousels harm both engagement and LCP — see the
 * spec's own Sources). Both entry points are real links (§8.3
 * accessibility requirement), never `<div>`-based fake controls.
 *
 * Copy is Paul's own approved text, not invented here: the supporting
 * line is `BRAND_IDENTITY.md` §11's Value Proposition. The headline is a
 * **shortened** form of §10's Positioning Statement — the full statement
 * is a 20-word sentence that cannot carry a display size without wrapping
 * to four lines and losing all impact, which is the specific thing this
 * layout depends on. The words are still his; the trim is not, and is
 * flagged for his confirmation (see `DECISION_LOG.md`).
 */

/** Swap this one constant when real photography lands. See `public/brand/IMAGE_CREDITS.md`. */
const HERO_IMAGE = "/brand/hero-food-drink.jpg"

/**
 * The right-hand visual.
 *
 * **Note what isn't here: no blend mode, no filter, no mask, no synthetic
 * shadow.** That is the point. This image was produced to sit on this page,
 * so its ground was normalised offline to the page's own `#F3F5F0` (measured
 * afterwards at every corner, within ±2 — JPEG noise, invisible). With the
 * ground already matching, the photograph has no edge to hide and needs
 * nothing at runtime to disguise one.
 *
 * The previous stand-in needed `mix-blend-mode: multiply` plus a brightness
 * lift, a two-ended mask and a hand-drawn ellipse purely to fake this
 * condition, and each of those cost something: the lift washed out the wine
 * and erased the photo's own contact shadow, which then had to be redrawn.
 * Here the real shadow under the pedestal survives untouched, because nothing
 * is being done to the pixels.
 *
 * **So if you swap this image, match its background to the section colour
 * first** (see `HERO_IMAGE_BRIEF.md`). Reaching for a blend mode instead is
 * the worse version of this, and is what the git history above shows.
 */
function HeroVisual() {
  return (
    // **Full-bleed on a phone, contained from `small:` up.** On mobile the
    // image previously sat inside the container's own 16px gutters at
    // `max-w-[560px]`, which left it floating in the middle of a large empty
    // ground — Paul's "sticker" note. `-mx-4` cancels `ds-container`'s
    // padding so it runs edge to edge instead.
    //
    // **It is deliberately not put in a tinted card, which was the other
    // option offered.** This file's ground is baked to the page's exact
    // `#F3F5F0` (see the note above), so *any* card colour behind it —
    // white, `ink-100`, anything — would make the image's own background
    // show up as a rectangle inside the card. The thing that makes the photo
    // sit seamlessly on the page is the same thing that rules out framing
    // it. Full bleed keeps the seam invisible and still removes the float.
    //
    // The rounded corners are therefore `small:` only: they do nothing while
    // the ground matches, but they are correct if the image is ever swapped
    // for one with its own background, and rounding a full-bleed edge would
    // be wrong.
    // The 5:4 crop is the other half of "tighten the flow." Square at full
    // bleed the image is 390px tall on a 390px phone, which alone pushes the
    // headline past the fold. The source has generous empty ground above and
    // below the board, so cropping to 5:4 takes ~20% off the height without
    // touching the subject.
    <div className="relative -mx-4 aspect-[5/4] overflow-hidden small:mx-auto small:aspect-auto small:max-w-[560px] small:rounded-radius-lg">
      <Image
        src={HERO_IMAGE}
        alt="A bottle of red wine, a poured glass, a linen napkin and a bowl of Nigerian jollof rice with grilled chicken, arranged on a round wooden serving board"
        width={1024}
        height={1024}
        priority
        sizes="(max-width: 1024px) 100vw, 560px"
        className="h-full w-full object-cover small:h-auto"
      />
    </div>
  )
}

/**
 * The social-proof row from the reference layout: overlapping circular
 * avatars beside a short trust line.
 *
 * ⚠️ **`SOCIAL_PROOF_COUNT` is not a real figure and must be set or removed
 * before launch.** This platform has no customers and no review mechanism
 * yet, so any number here is a claim to the public that isn't backed by
 * anything — which in Nigeria falls under the FCCPA's prohibition on
 * misleading representations, quite apart from `BRAND_IDENTITY.md` §5's own
 * "structured honesty" value. It is built because Paul asked for it
 * directly and twice; the honest number is the only part left to him.
 *
 * The circles are brand-toned initials, not stock photographs of people.
 * Faces of "customers" who never bought anything are a fabrication of a
 * different order from a number — and swapping in real photos later is a
 * one-line change to `AVATARS`.
 */
const SOCIAL_PROOF_COUNT = "10,000+"
// Every pairing below clears WCAG AA at this 11px size. Brand green was the
// obvious fourth colour and was tried first, but white on `#1A9902` measures
// 3.74:1 against the 4.5:1 small-text threshold — confirmed by a live axe-core
// run, not estimated. Gold works only because it takes dark text, not light.
const AVATARS = [
  { initials: "AO", className: "bg-ink-900 text-surface-elevated" },
  { initials: "CN", className: "bg-primary text-surface-elevated" },
  { initials: "FA", className: "bg-ink-700 text-surface-elevated" },
  { initials: "TB", className: "bg-accent text-ink-900" },
]

function SocialProof() {
  return (
    <div className="order-5 mt-2 flex flex-col items-center gap-3 sm:flex-row small:items-center">
      {/* Overlap is deliberately looser than the reference's. Its circles are
          photographs, where overlap costs nothing; initials get their right
          edge clipped by the next circle and become unreadable. Tighten this
          back up once real photos replace them. */}
      <div className="flex -space-x-1.5">
        {AVATARS.map((a) => (
          <span
            key={a.initials}
            aria-hidden="true"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-radius-full text-[11px] font-semibold ring-2 ring-surface ${a.className}`}
          >
            {a.initials}
          </span>
        ))}
      </div>
      <p className="text-caption text-text-secondary">
        Trusted by {SOCIAL_PROOF_COUNT} happy customers
      </p>
    </div>
  )
}

export default function Hero() {
  return (
    // One continuous surface across the full width — deliberately no
    // `border-b`. A rule here would cut the hero off as a band and
    // re-introduce exactly the boxed-in feel the visual above works to
    // avoid; the section below provides its own separation by contrast.
    <div className="w-full bg-surface">
      {/* Mobile vertical rhythm is tightened hard (`py-8` / `gap-8` against
          the previous `py-16` / `gap-12`) so the headline is not pushed most
          of a screen down before it is reached. Desktop keeps its generous
          `py-24`, where the space is doing something.

          **The text column comes before the image on mobile — reversed
          from the original stacking.** The photo used to run first, and at
          full-bleed 5:4 that alone is most of a phone screen, so the "Shop
          Wine & Spirits" button sat below the fold on first paint: nothing
          answering the headline was visible without scrolling. Paul's own
          diagnosis — "the button [needs to be] visible from the very first
          landing on the page" — is exactly the failure mode a hero exists
          to prevent. Both columns still carry an explicit `order-*` (1 for
          text, 2 for image) rather than reordering the JSX itself, so the
          markup's own reading order — text, then image — now matches the
          visual order at every width; only the desktop grid's own two-up
          layout (`small:grid-cols-[...]`) puts them side by side again,
          which `order` also governs there since neither column sets an
          explicit `grid-column`. */}
      <div className="ds-container grid grid-cols-1 items-center gap-8 py-8 small:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] small:gap-16 small:py-24">
        <div className="order-1 flex flex-col items-center gap-5 text-center small:items-start small:gap-6 small:text-left">
          {/* Eyebrow. States the platform's single strongest true claim —
              structurally guaranteed by the no-marketplace decision
              (`BUSINESS_RULES.md`), so it can never quietly stop being true.

              **Sits above the headline at every width**, the same as
              desktop always has. It used to be pushed below the H1 on
              mobile specifically because the image sat *above* this whole
              column back then — the badge landed between the photograph
              and the H1 and read as a divider between them rather than as
              a claim about the brand. Now that the column comes before the
              image (Paul's direction: the CTA has to be reachable without
              scrolling past a full-screen photo first), there is nothing
              above it to divide, so it introduces the headline the same
              way it already did on desktop. Every sibling below still
              carries an explicit order — once one item is ordered, leaving
              the rest at the default 0 would float them all above it. */}
          <span className="order-1 inline-flex items-center gap-2 rounded-radius-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-radius-full bg-success" />
            Sold &amp; delivered directly by us
          </span>

          {/* Tighter leading and a hard size step are what give a display line
              presence; at the default body leading the same words read as a
              paragraph that happens to be large.

              `!` on every size step is load-bearing, not habit. `Heading`
              hardcodes `text-heading-1` (39px) for an h1 and offers no way to
              opt out, and a plain `text-[26px]` has *identical* specificity —
              so which one wins is decided by Tailwind's emitted source order
              rather than by intent. That silently cost the two-line headline
              once already: a build ordered it the other way and mobile went
              back to three lines. Same reason `Thumbnail` overrides
              `Container` with `!p-0`. */}
          <Heading
            level="h1"
            display
            className="order-2 max-w-[24ch] text-balance !text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-text-primary xsmall:!text-[34px] small:!text-[42px] small:tracking-[-0.02em] medium:!text-[50px]"
          >
            Nigeria&rsquo;s premium wine, spirits &amp; kitchen.
          </Heading>

          <Text
            muted
            className="order-3 max-w-[46ch] text-body-lg leading-relaxed"
          >
            Premium wine and spirits, delivered nationwide. Fresh Nigerian
            food, cooked to order and delivered fast in Lagos. Always sold
            and delivered by us — never a stranger.
          </Text>

          {/* 8px on top of the column's own 20/24px gap — 28px on mobile,
              32px from `small:` up. The extra step exists to separate the
              supporting paragraph from the actions rather than letting the
              whole column read as one evenly-spaced list. */}
          <div className="order-4 mt-2 flex w-full max-w-[30rem] flex-col gap-3 sm:flex-row">
            <LocalizedClientLink
              href="/store"
              className="group inline-flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-radius-md bg-primary px-5 font-medium text-surface-elevated transition-colors duration-standard ease-in-out sm:flex-1 hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              data-testid="hero-wine-spirits-link"
            >
              Shop Wine &amp; Spirits
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 transition-transform duration-standard ease-in-out group-hover:translate-x-0.5"
              >
                <path
                  d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/food-central"
              // `text-[15px]` and the tighter `px-4`: at the shared 16px both
              // buttons together measured wider than their 480px track at
              // `small:` (1024px), where the text column is at its narrowest
              // — with `whitespace-nowrap` that overflows rather than wraps.
              // One point off the longer label is what buys the crisp single
              // line. The height is fixed rather than derived from padding so
              // the two stay identical whatever their labels do.
              className="inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-radius-md border border-border bg-surface-elevated px-4 text-[15px] font-medium text-text-primary transition-colors duration-standard ease-in-out sm:flex-1 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              data-testid="hero-food-central-link"
            >
              Order from Food Central
            </LocalizedClientLink>
          </div>

          <SocialProof />
        </div>

        <div className="order-2 w-full">
          <HeroVisual />
        </div>
      </div>
    </div>
  )
}
