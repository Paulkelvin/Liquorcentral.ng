"use client"

import { addToCart } from "@lib/data/cart"
import { useCart } from "@lib/context/cart-context"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { AUTOPLAY_SECONDS, type PairingSlide } from "./pairings"

export type ResolvedPairing = PairingSlide & {
  variantIds: string[]
  totalLabel: string
  itemsLabel: string
}

/**
 * The two-slide pairing carousel.
 *
 * **On autoplay and WCAG 2.2.2.** Content that moves automatically, starts on
 * its own and runs longer than five seconds must offer a way to pause, stop or
 * hide it. The explicit play/pause button that used to sit under the card was
 * removed on Paul's direction, so **that obligation now rests entirely on the
 * three behaviours below** — none of them is a nicety, and removing any one
 * would leave the section non-conformant:
 *
 * - **a dot press stops autoplay permanently** (`userTookOver`), which is the
 *   "stop" mechanism SC 2.2.2 requires. It is also the right behaviour on its
 *   own terms: once the customer has said which slide they want, moving it
 *   again fights them;
 * - **hover and keyboard focus pause it**, so nobody loses a slide mid-read or
 *   mid-tab;
 * - **it never starts under `prefers-reduced-motion`** — the media query is
 *   checked, not assumed, and a live listener keeps it honest if the setting
 *   changes while the page is open.
 *
 * This is flagged in `DECISION_LOG.md` rather than assumed to be fine: relying
 * on the dots is defensible, but it is less obvious than a labelled control,
 * and Paul should know that is the trade he made.
 *
 * **On the inactive slide.** Both slides stay mounted so the copy can cross-
 * fade, which means the hidden one still contains a real button. `inert`
 * (React 19) takes it out of the tab order and the accessibility tree at once
 * — `aria-hidden` alone would leave a keyboard user able to tab into an
 * invisible "Add pairing" button and add the wrong thing. **Do not replace
 * `inert` with `aria-hidden` + `pointer-events-none`;** that combination
 * silences the announcement but keeps the focus bug.
 */
export default function PairingCarousel({
  slides,
  countryCode,
}: {
  slides: ResolvedPairing[]
  countryCode: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  // Distinct from `paused`: a manual dot press ends autoplay for good, where
  // a hover only suspends it.
  const [userTookOver, setUserTookOver] = useState(false)
  // Keyed by slide id, not a bare status: both slides are mounted, so a
  // single shared status would light up the hidden slide's button too — and
  // the same mistake at the price level is what made every slide advertise
  // slide 1's total in the first version of this file.
  const [status, setStatus] = useState<{
    slideId: string
    state: "adding" | "added" | "error"
  } | null>(null)
  const { openDrawer } = useCart()
  const liveRegionRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const autoplayRunning =
    slides.length > 1 && !paused && !userTookOver && !reducedMotion

  useEffect(() => {
    if (!autoplayRunning) {
      return
    }
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      AUTOPLAY_SECONDS * 1000
    )
    return () => window.clearInterval(id)
  }, [autoplayRunning, slides.length])

  const goTo = useCallback((i: number) => {
    setIndex(i)
    setUserTookOver(true)
  }, [])

  const active = slides[index]

  const handleAdd = useCallback(
    // **Takes the slide it belongs to.** It must never read the "active"
    // slide instead: the hidden slide's button is a real button, and closing
    // over the active one would let it add the wrong pairing.
    async (slide: ResolvedPairing) => {
      if (status?.state === "adding") {
        return
      }
      setStatus({ slideId: slide.id, state: "adding" })
      // Opened before the requests resolve so the drawer is already sliding
      // in as the finger lifts; its contents fill in from the server after.
      openDrawer()
      try {
        // Sequential, not `Promise.all`: two concurrent line-item writes to
        // the same cart race each other, and the second can land on a stale
        // version of the first.
        for (const variantId of slide.variantIds) {
          await addToCart({ variantId, quantity: 1, countryCode })
        }
        setStatus({ slideId: slide.id, state: "added" })
        window.setTimeout(() => setStatus(null), 2500)
      } catch {
        setStatus({ slideId: slide.id, state: "error" })
        window.setTimeout(() => setStatus(null), 3000)
      }
    },
    [countryCode, openDrawer, status]
  )

  /**
   * **Each slide labels its own price.** An earlier version of this file used
   * the active slide's total for every button, so slide 2 advertised slide
   * 1's ₦63,500 while adding ₦76,500 of goods — the exact misleading-price
   * failure this section was built to avoid, reintroduced by the render.
   * Keep the per-slide argument.
   *
   * The visible price moved out of this label and onto its own line beside
   * the button, so the button reads the same at both widths. The total is
   * still in the button's `aria-label`, where it must stay: a screen-reader
   * user gets no benefit from two elements being visually adjacent.
   */
  const ctaLabelFor = (slide: ResolvedPairing) => {
    const state = status?.slideId === slide.id ? status.state : null
    if (state === "added") return "Added to cart"
    if (state === "error") return "Try again"
    return "Add pairing"
  }

  return (
    <section
      aria-labelledby="pairing-banner-heading"
      aria-roledescription="carousel"
      className="w-full bg-surface"
      data-testid="pairing-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="ds-container py-12 small:py-16">
        <h2 id="pairing-banner-heading" className="sr-only">
          The perfect pairing
        </h2>

        {/* The card is the positioning context for the dots, which now live
            *inside* it (Paul's direction) rather than in a strip below. */}
        <div className="relative overflow-hidden rounded-radius-lg border border-border">
          {slides.map((slide, i) => {
            const isActive = i === index
            const dark = slide.theme === "dark"
            return (
              <div
                key={slide.id}
                // `inert` on the hidden slide — see the note above. React 19
                // passes it through as a real attribute.
                inert={!isActive}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
                className={clx(
                  "transition-opacity duration-500 ease-in-out",
                  isActive
                    ? "relative z-10 opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                )}
              >
                {/* **One layout at every width** — side by side, 16:9,
                    photograph left, copy right. Paul's direction after
                    seeing the stacked mobile version.

                    `object-left` is what makes it survive the squeeze: the
                    frame narrows on a phone but the crop is anchored to the
                    left edge, so the bottle and dish stay whole instead of
                    being centre-cropped out of view. Both source images are
                    1376×768 — already 16:9 — so at desktop there is no crop
                    at all.

                    **The scrim now runs at every width, not just on desktop.**
                    When the copy sat on its own solid panel below the image
                    on mobile it needed no help; over the photograph it does,
                    and on a 390px screen the copy half is only ~195px wide,
                    where an unscrimmed marble or wood grain is the
                    difference between readable and not. */}
                {/* **A fixed 300px below 768px, 16:9 above.** Paul asked for
                    a taller, more generous mobile banner than 16:9 gives at
                    phone widths — at 390px wide that ratio is only 219px
                    tall, which is what made the right column feel cramped. A
                    fixed height also means the copy panel has a known height
                    to distribute itself down, which the layout below relies
                    on. */}
                <div className="relative h-[300px] w-full md:h-auto md:aspect-[16/9]">
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1280px"
                    className="object-cover object-left"
                    priority={i === 0}
                  />

                  {/* Two scrims, not one, because the copy column is a
                      different width at each breakpoint (62% below 768px,
                      50% above) and a gradient tuned for one leaves the
                      other's first words sitting on bare photograph. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 md:hidden"
                    style={{
                      background: dark
                        ? "linear-gradient(to left, rgba(26,22,18,0.94) 0%, rgba(26,22,18,0.9) 52%, rgba(26,22,18,0) 82%)"
                        : "linear-gradient(to left, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.92) 52%, rgba(250,247,242,0) 82%)",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 hidden md:block"
                    style={{
                      background: dark
                        ? "linear-gradient(to left, rgba(26,22,18,0.94) 0%, rgba(26,22,18,0.86) 38%, rgba(26,22,18,0) 66%)"
                        : "linear-gradient(to left, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.88) 38%, rgba(250,247,242,0) 66%)",
                    }}
                  />

                  {/* **Left-aligned stack, vertically centred** — eyebrow,
                      headline, price, button, one under the other.

                      **62% wide below 768px, not 50%.** Paul asked for each
                      line to sit on a single line, and the longer headline
                      ("Smoky Asun & Single Malt") does not fit one line in
                      half of a phone screen at any readable size. He also
                      said he does not mind the copy crossing into the
                      photograph, so the column takes the width it needs and
                      the scrim above was widened to match. Above 768px the
                      body paragraph returns and 50% is right again. */}
                  <div
                    data-testid="pairing-panel"
                    // `pt-20` below 768px sits the copy lower in the card
                    // (Paul: "bring the text down a bit"). It is padding
                    // rather than `justify-end` on purpose: the group stays
                    // centred, just inside a shorter box, so it shifts by a
                    // predictable half of the padding — 40px here — instead
                    // of pinning to the bottom edge where it would crowd the
                    // pagination dots. Desktop is untouched; Paul likes it.
                    className="absolute inset-y-0 right-0 flex w-[62%] flex-col items-start justify-center gap-1.5 px-4 pt-20 text-left md:w-1/2 md:gap-3 md:px-8 md:pt-0 medium:px-14"
                  >
                    <span
                      className={clx(
                        // `whitespace-nowrap`: Paul asked for one line each.
                        // Verified to fit at 320px — if a longer eyebrow is
                        // ever added, it will clip rather than wrap, so
                        // re-measure before changing the copy.
                        "whitespace-nowrap text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] md:text-[11px] md:tracking-[0.12em]",
                        dark ? "text-ink-200" : "text-text-secondary"
                      )}
                    >
                      {/* Two lengths, one element: the long form would wrap
                          to three lines in the mobile panel. */}
                      <span className="md:hidden">{slide.eyebrowShort}</span>
                      <span className="hidden md:inline">{slide.eyebrow}</span>
                    </span>

                    {/* `h3`, not `h2` — the section's own `h2` is the visually
                        hidden heading above, so the slides sit beneath it and
                        the outline stays in order. */}
                    <h3
                      className={clx(
                        // One line below 768px (`whitespace-nowrap`), wrapping
                        // allowed above where the column is wide and the full
                        // title is long. The compact sizes are set so the
                        // longest `titleShort` fits at 320px — measured, not
                        // estimated. Lengthen a `titleShort` and it clips.
                        // **One line at every width** (`whitespace-nowrap`,
                        // never overridden). Paul asked for it, so the type
                        // scale is set by what fits rather than the other way
                        // round: the desktop steps came down from 26/30/34 to
                        // 22/26/28 because the full title
                        // ("Smoky Asun & Aged Single Malt") wrapped to two
                        // lines at 34px in a 495px column. Every size here is
                        // measured against the longest title on the narrowest
                        // viewport it applies to — **lengthen a title and it
                        // clips rather than wraps.**
                        "whitespace-nowrap font-display text-[13px] font-semibold leading-[1.2] tracking-[-0.01em] sm:text-[15px] xsmall:text-[17px] md:text-[22px] md:leading-[1.15] small:text-[26px] medium:text-[28px]",
                        dark ? "text-surface-elevated" : "text-text-primary"
                      )}
                    >
                      <span className="md:hidden">{slide.titleShort}</span>
                      <span className="hidden md:inline">{slide.title}</span>
                    </h3>

                    {/* Hidden below `md:` (768px, Paul's stated breakpoint —
                        note this is Tailwind's own `md`, *not* this project's
                        custom `small`, which is 1024). There is
                        no room for three lines of prose beside the title in
                        a 195px column. It stays in the DOM rather than being
                        dropped from the data, so the desktop copy and the
                        mobile copy are the same content, not two versions
                        that can drift. */}
                    <p
                      className={clx(
                        "hidden max-w-[46ch] text-body leading-relaxed md:block",
                        dark ? "text-ink-200" : "text-text-secondary"
                      )}
                    >
                      {slide.body}
                    </p>

                    {/* Price above, button below — Paul's "then the button
                        follows below". They were a single row before.

                        The price stays a sibling of the button rather than
                        going back inside its label, and the button's
                        `aria-label` still carries the total: visual adjacency
                        communicates nothing to a screen reader. */}
                    <div className="flex w-full flex-col items-start gap-1.5 md:gap-2">
                      <span
                        className={clx(
                          "whitespace-nowrap text-[12px] font-semibold md:text-caption md:font-medium",
                          dark ? "text-surface-elevated" : "text-text-primary"
                        )}
                        data-testid="pairing-price"
                      >
                        {slide.totalLabel}
                      </span>

                      {/* 36px drawn below 768px per Paul's compact spec, 48px
                          above. `DESIGN_SYSTEM.md` §B11's 44px floor is met by
                          the invisible `::before`, the same allowance the
                          compact quantity stepper, footer social icons and
                          these carousel dots already use. **This button must
                          never gain `overflow-hidden`** — it would clip the
                          expanded hit area along with everything else and
                          silently void the guarantee. */}
                      <button
                        type="button"
                        onClick={() => handleAdd(slide)}
                        disabled={
                          status?.slideId === slide.id &&
                          status.state === "adding"
                        }
                        data-testid="pairing-add-button"
                        aria-label={`${ctaLabelFor(slide)} — ${slide.totalLabel} — ${slide.itemsLabel}`}
                        className="relative inline-flex h-9 min-w-0 max-w-full items-center justify-center whitespace-nowrap rounded-radius-full bg-primary px-4 text-[12px] font-medium text-surface-elevated transition-colors duration-standard ease-in-out before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-primary-hover active:bg-primary-active disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 md:h-12 md:rounded-radius-md md:px-6 md:text-[15px]"
                      >
                        {/* One label at every width. The "+ Add" fallback the
                            previous layout needed is gone: with the button on
                            its own line instead of beside the price, "Add
                            pairing" measures ~98px against a 111px column even
                            at 320px. */}
                        {ctaLabelFor(slide)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* **Inside the card, over the photograph** — Paul's direction, in
              place of the strip that used to sit below it.

              Bottom-left below 768px, bottom-centre from 768px up. Not
              bottom-right at either width: on a phone the card's bottom-right
              is exactly where the price and CTA row sits, and dots there would
              land on the button.

              The capsule is `bg-scrim` (ink-900 at 70%) with `backdrop-blur`,
              not a translucent white or black: the dots have to stay legible
              over *both* a near-black wood table and a pale marble worktop,
              and a single scrim gives them one predictable background instead
              of two gambles. It is also why the dots themselves use solid
              tokens — `/50`-style opacity modifiers compile to `transparent`
              in this design system (see `globals.css`'s `--ink-900-70`). */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-radius-full bg-scrim px-2.5 py-1.5 backdrop-blur-sm md:left-1/2 md:-translate-x-1/2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show pairing ${i + 1}: ${slide.title}`}
                  aria-current={i === index ? "true" : undefined}
                  data-testid="pairing-dot"
                  className={clx(
                    // `before:-inset-x-1`, **not** a fixed 44px-wide box.
                    // These dots sit 8px apart, so two 44px-wide hit areas
                    // overlap almost completely and the later one in the DOM
                    // swallows taps meant for the earlier — caught when a
                    // click on dot 1 was intercepted by dot 2. Extending each
                    // dot by 4px a side makes the areas meet exactly at the
                    // midpoint of the gap: contiguous, never overlapping.
                    // Height still reaches §B11's 44px.
                    "relative h-1.5 rounded-radius-full transition-all duration-standard ease-in-out before:absolute before:-inset-x-1 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                    i === index
                      ? "w-5 bg-surface-elevated"
                      : "w-1.5 bg-ink-300 hover:bg-surface-elevated"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Announces the slide change to a screen reader without moving focus.
            `polite`, so it waits for a gap rather than interrupting. */}
        <p ref={liveRegionRef} aria-live="polite" className="sr-only">
          {`Pairing ${index + 1} of ${slides.length}: ${active.title}`}
        </p>
      </div>
    </section>
  )
}
