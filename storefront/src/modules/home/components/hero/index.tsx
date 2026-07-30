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
    <div className="relative mx-auto w-full max-w-[480px]">
      <Image
        src={HERO_IMAGE}
        alt="A bottle of red wine and a poured glass beside a plate of Nigerian jollof rice with grilled chicken, on a wooden serving pedestal"
        width={928}
        height={1152}
        priority
        sizes="(max-width: 1024px) 85vw, 480px"
        className="h-auto w-full"
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
    <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row small:items-center">
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
      <div className="ds-container grid grid-cols-1 items-center gap-12 py-16 small:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] small:gap-16 small:py-24">
        <div className="order-2 flex flex-col items-center gap-6 text-center small:order-1 small:items-start small:text-left">
          {/* Eyebrow. States the platform's single strongest true claim —
              structurally guaranteed by the no-marketplace decision
              (`BUSINESS_RULES.md`), so it can never quietly stop being true. */}
          <span className="inline-flex items-center gap-2 rounded-radius-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-radius-full bg-success" />
            Sold &amp; delivered directly by us
          </span>

          {/* Tighter leading and a hard size step are what give a display
              line presence; at the default body leading the same words read
              as a paragraph that happens to be large. */}
          <Heading
            level="h1"
            display
            className="max-w-[24ch] text-balance text-[26px] font-semibold leading-[1.08] tracking-[-0.02em] text-text-primary xsmall:text-[34px] small:text-[42px] medium:text-[50px]"
          >
            Nigeria&rsquo;s premium wine, spirits &amp; kitchen.
          </Heading>

          <Text muted className="max-w-[46ch] text-body-lg leading-relaxed">
            Premium wine and spirits, delivered nationwide. Fresh Nigerian
            food, cooked to order and delivered fast in Lagos. Always sold
            and delivered by us — never a stranger.
          </Text>

          <div className="mt-2 flex w-full max-w-[30rem] flex-col gap-3 sm:flex-row">
            <LocalizedClientLink
              href="/store"
              className="group inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-radius-md bg-primary px-6 py-3.5 font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
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
              className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-radius-md border border-border bg-surface-elevated px-6 py-3.5 font-medium text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              data-testid="hero-food-central-link"
            >
              Order from Food Central
            </LocalizedClientLink>
          </div>

          <SocialProof />
        </div>

        <div className="order-1 w-full small:order-2">
          <HeroVisual />
        </div>
      </div>
    </div>
  )
}
