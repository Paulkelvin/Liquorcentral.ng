import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

/**
 * A "see all" text link centred below a homepage product grid — mobile
 * only. Paul asked for the same destination `SectionLink` already offers
 * at the top of Featured Collection and Today's Menu, "also at the
 * bottom" on a phone, so a customer who has scrolled past six cards
 * doesn't have to scroll back up to keep going.
 *
 * **A link, not a bordered button — deliberately walked back from a first
 * version that was one.** A full-width box sitting directly under two rows
 * of already-outlined "Add to cart" buttons made the bottom of the section
 * read as one more rectangle in a stack of rectangles. Paul's own read:
 * "lighter" — this drops the border and the fill entirely and keeps only
 * the underlined-text-plus-arrow treatment `SectionLink` already uses at
 * the top, centred instead of right-aligned since there is no heading
 * beside it down here to align against.
 *
 * **Still a 44px target despite looking like a line of text.** The visible
 * label is one line, but `DESIGN_SYSTEM.md` §B11's 44px floor is
 * unconditional, so the `::before` pseudo-element expands the *hit area*
 * without touching what's drawn — the same technique the compact quick-add
 * button and the pairing carousel's dots already use for the same reason.
 *
 * **Desktop is deliberately excluded (`small:hidden`), not just visually
 * de-emphasised.** The header link is already in easy reach with a mouse at
 * that width — a second identical control a full page-scroll away answers a
 * problem desktop doesn't have. Duplicating it there would just be noise.
 */
export default function SectionCTAButton({
  href,
  children,
  className,
  "data-testid": dataTestid,
}: {
  href: string
  children: React.ReactNode
  className?: string
  "data-testid"?: string
}) {
  return (
    // The centring wrapper is a separate element from the link on purpose:
    // the link's own box must stay content-sized (`inline-flex`) so the
    // `::before` hit-area expansion below sits directly over the visible
    // text rather than stretching across a full-width parent, which would
    // have put a chunk of invisible tap target over empty page background.
    <div className={clx("mt-8 flex justify-center small:hidden", className)}>
      <LocalizedClientLink
        href={href}
        data-testid={dataTestid}
        className="relative inline-flex items-center gap-1.5 whitespace-nowrap text-body font-medium text-text-primary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-interactive before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
      >
        {children}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-3.5 w-3.5"
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
    </div>
  )
}
