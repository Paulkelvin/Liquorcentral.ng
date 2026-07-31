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
   * **Each slide labels its own price.** The first version of this file used
   * the active slide's total for every button, so slide 2 advertised slide
   * 1's ₦63,500 while adding ₦76,500 of goods — the exact misleading-price
   * failure this section was built to avoid, reintroduced by the render.
   * Keep the per-slide argument.
   */
  const ctaLabelFor = (slide: ResolvedPairing) => {
    const state = status?.slideId === slide.id ? status.state : null
    if (state === "added") return "Added to cart"
    if (state === "error") return "Try again"
    return `Add pairing to cart (${slide.totalLabel})`
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
                {/* Mobile stacks image over copy so nothing sits on the food.
                    From `small:` the photograph becomes the panel's background
                    and the copy takes the right half — which is the half both
                    photographs deliberately leave empty. */}
                <div className="flex flex-col small:relative small:block">
                  <div className="relative aspect-[16/10] w-full small:aspect-[1376/620]">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1280px"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>

                  {/* A scrim only from `small:` up, and only across the copy's
                      half. On mobile the copy sits on its own solid panel
                      below the photograph, so no scrim is needed — and one
                      would only dim the food for nothing. */}
                  <div
                    aria-hidden="true"
                    className="hidden small:absolute small:inset-0 small:block"
                    style={{
                      background: dark
                        ? "linear-gradient(to left, rgba(26,22,18,0.92) 0%, rgba(26,22,18,0.78) 34%, rgba(26,22,18,0) 62%)"
                        : "linear-gradient(to left, rgba(250,247,242,0.94) 0%, rgba(250,247,242,0.82) 34%, rgba(250,247,242,0) 62%)",
                    }}
                  />

                  <div
                    className={clx(
                      "flex flex-col items-start gap-3 p-6 small:absolute small:inset-y-0 small:right-0 small:w-1/2 small:justify-center small:p-10 medium:p-14",
                      dark
                        ? "bg-ink-900 small:bg-transparent"
                        : "bg-surface-warm small:bg-transparent"
                    )}
                  >
                    <span
                      className={clx(
                        "text-[11px] font-semibold uppercase tracking-[0.12em]",
                        dark ? "text-ink-200" : "text-text-secondary"
                      )}
                    >
                      {slide.eyebrow}
                    </span>

                    {/* `h3`, not `h2` — the section's own `h2` is the visually
                        hidden heading above, so the slides sit beneath it and
                        the outline stays in order. */}
                    <h3
                      className={clx(
                        "font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.01em] small:text-[30px] medium:text-[34px]",
                        dark ? "text-surface-elevated" : "text-text-primary"
                      )}
                    >
                      {slide.title}
                    </h3>

                    <p
                      className={clx(
                        "max-w-[46ch] text-body leading-relaxed",
                        dark ? "text-ink-200" : "text-text-secondary"
                      )}
                    >
                      {slide.body}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAdd(slide)}
                      disabled={
                        status?.slideId === slide.id &&
                        status.state === "adding"
                      }
                      data-testid="pairing-add-button"
                      aria-label={`${ctaLabelFor(slide)} — ${slide.itemsLabel}`}
                      className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-radius-md bg-primary px-6 text-[15px] font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-primary-hover active:bg-primary-active disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
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
