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
 * its own and runs longer than five seconds must offer a way to pause it.
 * That is not optional here, so this carousel:
 *
 * - ships a real **pause/play control**, not just the dots;
 * - **stops on hover and on keyboard focus**, so nobody loses a slide mid-read
 *   or mid-tab;
 * - **never starts at all under `prefers-reduced-motion`** — the media query
 *   is checked, not assumed, and the listener keeps it honest if the user
 *   changes the setting while the page is open;
 * - stops permanently once the customer touches a dot, because at that point
 *   they have said which slide they want and moving it again fights them.
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
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1280px"
                    className="object-cover object-left"
                    priority={i === 0}
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background: dark
                        ? "linear-gradient(to left, rgba(26,22,18,0.94) 0%, rgba(26,22,18,0.86) 38%, rgba(26,22,18,0) 66%)"
                        : "linear-gradient(to left, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.88) 38%, rgba(250,247,242,0) 66%)",
                    }}
                  />

                  <div className="absolute inset-y-0 right-0 flex w-1/2 flex-col justify-center gap-1.5 px-4 md:gap-3 md:px-8 medium:px-14">
                    <span
                      className={clx(
                        "text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] md:text-[11px] md:tracking-[0.12em]",
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
                        "font-display text-[15px] font-semibold leading-[1.2] tracking-[-0.01em] xsmall:text-[17px] md:text-[26px] md:leading-[1.15] small:text-[30px] medium:text-[34px]",
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

                    {/* The price as its own line, no longer inside the
                        button label. It stays adjacent to the CTA so the
                        two read as one statement — and the button's
                        `aria-label` still carries the total, so nothing is
                        lost for a screen reader when the visual pairing of
                        the two elements is unavailable. */}
                    <span
                      className={clx(
                        "text-[12px] font-medium md:text-caption",
                        dark ? "text-ink-200" : "text-text-secondary"
                      )}
                      data-testid="pairing-price"
                    >
                      {slide.totalLabel}
                    </span>

                    {/* 40px drawn on mobile, 48px from `small:`. The 40px is
                        Paul's compact spec; `DESIGN_SYSTEM.md` §B11's 44px
                        floor is met by the invisible `::before`, the same
                        allowance the compact quantity stepper and the footer
                        social icons already use. Consequence: this button
                        must never gain `overflow-hidden`, which would clip
                        the expanded hit area with it. */}
                    <button
                      type="button"
                      onClick={() => handleAdd(slide)}
                      disabled={
                        status?.slideId === slide.id &&
                        status.state === "adding"
                      }
                      data-testid="pairing-add-button"
                      aria-label={`${ctaLabelFor(slide)} — ${slide.totalLabel} — ${slide.itemsLabel}`}
                      className="relative mt-1 inline-flex h-10 w-full items-center justify-center rounded-radius-md bg-primary px-3 text-[12px] font-medium text-surface-elevated transition-colors duration-standard ease-in-out before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-primary-hover active:bg-primary-active disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 md:mt-2 md:h-12 md:w-auto md:self-start md:px-6 md:text-[15px]"
                    >
                      {ctaLabelFor(slide)}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {slides.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* Dots sit at 8px but carry a 44px target via the invisible
                `::before`, per DESIGN_SYSTEM.md §B11 — a literal 8px control
                is unusable on a phone. */}
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show pairing ${i + 1}: ${slide.title}`}
                aria-current={i === index ? "true" : undefined}
                data-testid="pairing-dot"
                className={clx(
                  "relative h-2 rounded-radius-full transition-all duration-standard ease-in-out before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                  i === index
                    ? "w-6 bg-text-primary"
                    : "w-2 bg-ink-300 hover:bg-ink-500"
                )}
              />
            ))}

            {/* WCAG 2.2.2. Hidden when autoplay could never run anyway —
                under reduced motion there is nothing to pause. */}
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setUserTookOver((v) => !v)}
                aria-label={
                  userTookOver
                    ? "Resume automatic slideshow"
                    : "Pause automatic slideshow"
                }
                data-testid="pairing-autoplay-toggle"
                className="relative ml-1 inline-flex h-11 w-11 items-center justify-center rounded-radius-full text-text-secondary transition-colors duration-standard ease-in-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  {userTookOver ? (
                    <path d="M6 4l10 6-10 6V4Z" />
                  ) : (
                    <>
                      <rect x="5" y="4" width="3.5" height="12" rx="1" />
                      <rect x="11.5" y="4" width="3.5" height="12" rx="1" />
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Announces the slide change to a screen reader without moving focus.
            `polite`, so it waits for a gap rather than interrupting. */}
        <p ref={liveRegionRef} aria-live="polite" className="sr-only">
          {`Pairing ${index + 1} of ${slides.length}: ${active.title}`}
        </p>
      </div>
    </section>
  )
}
