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
const HERO_IMAGE = "/brand/hero-wine.jpg"

const MASK =
  "linear-gradient(to bottom, transparent 0%, #000 9%, #000 79%, transparent 89%)"

/**
 * The right-hand visual.
 *
 * **The whole reason this reads as one composition rather than a photo
 * pasted onto a page is `mix-blend-mode: multiply`.** The source photo is
 * shot on a seamless near-white studio ground; multiplying it against the
 * section's own off-white surface makes those light pixels take the page
 * colour exactly, so the photograph has no edge, no frame, no box and no
 * corner radius — it simply *is* the background, with a bottle standing on
 * it. The photo's own soft studio shadow survives the blend and lands as a
 * real shadow on the page, which is what grounds the product instead of
 * leaving it floating.
 *
 * This is why the previous version read as a separate tile: it was a dark
 * `rounded-radius-lg` panel with its own fill, so no matter how well
 * composed, the eye still saw a card sitting on a page. A photo with a
 * hard rectangular edge over a differently-coloured background always
 * announces itself as a pasted-in asset.
 *
 * The trade-off to know before swapping the image: multiply only
 * disappears a background that is genuinely lighter than the surface. A
 * photo cut out on transparency, or shot on a dark or coloured ground,
 * must drop the blend mode or it will muddy — see `IMAGE_CREDITS.md`.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* The grounding shadow, and the reason it has to be re-created rather
          than inherited: the brightness lift below is what erases the photo's
          grey ground, but it erases the photo's own contact shadow along with
          it, leaving the bottle visibly floating. This ellipse puts that
          weight back under the base.

          It sits *behind* the image on purpose. Because the image multiplies
          against whatever is beneath it, the shadow reads through the light
          part of the frame and is masked out by the bottle itself — which is
          exactly how a real shadow behaves, and why compositing it on top
          would instead smear a grey blob across the glass. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[74%] h-[11%] w-[72%] -translate-x-1/2 rounded-[50%] opacity-30 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--ink-900) 0%, transparent 72%)",
        }}
      />
      <Image
        src={HERO_IMAGE}
        alt="A bottle of red wine beside a poured glass of red wine"
        width={681}
        height={1024}
        priority
        sizes="(max-width: 1024px) 80vw, 520px"
        className="relative mx-auto h-auto w-full mix-blend-multiply"
        style={{
          // Measured, not guessed: this photo's ground is not white but a
          // grey gradient running 190→233, so `multiply` alone leaves a
          // clearly visible rectangle (the tone is darker than the page, so
          // it darkens rather than disappears). Lifting brightness first
          // pushes that ground to effectively white, at which point multiply
          // erases it completely; `saturate` puts back the small amount of
          // colour the lift costs, keeping the wine a deep red rather than a
          // washed pink. Tested against 1.25/1.28/1.32 with and without a
          // radial mask — a radial mask was rejected because it visibly
          // clipped the corkscrew and cork at the bottom edge.
          filter: "brightness(1.28) saturate(1.06)",
          // Fades at both ends, for two different reasons. The very top is
          // the one part the brightness lift can't reach (the ground starts
          // darkest there), so without a fade a faint band survives. The
          // bottom fade removes the corkscrew, cork and glass base: the lift
          // erases their own small contact shadows too, and unlike the bottle
          // they are too scattered for one grounding ellipse to catch, so
          // they read as debris floating in the margin. Fading beats cropping
          // here — a hard crop cuts a visible horizontal line straight
          // through the frame, which was tried and looked worse.
          WebkitMaskImage: MASK,
          maskImage: MASK,
        }}
      />
    </div>
  )
}

/** A true claim, not a fabricated statistic. See the note in `Hero` below. */
function TrustPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 shrink-0 text-success"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  )
}

export default function Hero() {
  return (
    // One continuous surface across the full width — deliberately no
    // `border-b`. A rule here would cut the hero off as a band and
    // re-introduce exactly the boxed-in feel the visual above works to
    // avoid; the section below provides its own separation by contrast.
    <div className="w-full bg-surface">
      <div className="ds-container grid grid-cols-1 items-center gap-12 py-16 small:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] small:gap-16 small:py-24">
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
            className="max-w-[15ch] text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-text-primary small:text-[52px] medium:text-[60px]"
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

          {/* The reference layout carries a social-proof row here ("Trusted
              by 10,000+ Happy Customers", with customer avatars). That is
              deliberately NOT reproduced: this platform has no customers
              yet and no review mechanism, so both the number and the faces
              would be fabricated — the one thing `BRAND_IDENTITY.md` §5's
              "structured honesty" rules out outright. These two claims are
              structurally true today and occupy the same visual slot. */}
          <ul className="mt-2 flex flex-col items-center gap-x-6 gap-y-2 text-caption text-text-secondary sm:flex-row small:items-start">
            <TrustPoint>Nationwide delivery on wine &amp; spirits</TrustPoint>
            <TrustPoint>Same-day food across Lagos</TrustPoint>
          </ul>
        </div>

        <div className="order-1 w-full small:order-2">
          <HeroVisual />
        </div>
      </div>
    </div>
  )
}
