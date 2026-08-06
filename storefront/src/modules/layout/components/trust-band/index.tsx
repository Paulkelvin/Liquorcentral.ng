import { Text } from "@modules/common/components/ui"

/**
 * The pre-footer trust band — `02_HOMEPAGE_SPECIFICATION.md` §8.7/§13's four
 * required trust statements, presented as a banner rather than a checklist.
 *
 * **The four claims are §13's own list and are not editorial.** §13 names
 * them exactly: "sold and delivered directly by LiquorCentral (no
 * third-party sellers); Wine & Spirits ships nationwide; Food Central
 * delivers in Lagos only, same-day/scheduled/pickup available; secure
 * payment." Only the *presentation* changes here — the substance of every
 * claim survives intact, including Food Central's "Lagos only," which is a
 * limitation the customer has to be told and must never be softened into
 * something vaguer to make the row scan more evenly.
 *
 * This moved out of `modules/home`. It used to be a homepage section; it is
 * now layout furniture directly above the footer, so it appears on every
 * page rather than only the one. Trust statements that vanish once the
 * customer navigates to a product are doing half a job.
 *
 * **Redrawn — Paul's read of the previous version: "too bold," "templated."**
 * That version stacked a large (28px, 1.5-stroke) icon directly above bold
 * title-case text, centred — the generic "four-icon trust bar" pattern seen
 * on most storefront templates. Two changes move it off that pattern:
 *
 * 1. **A tinted circle behind a smaller, lighter icon (20px, 1.25-stroke),
 *    not a bare glyph floating on the dark band.** The circle gives the
 *    icon a designed home instead of it reading as clip-art dropped onto a
 *    background; the lighter stroke stops it competing with the text next
 *    to it for boldness.
 * 2. **Icon-beside-text, not icon-above-text.** A left-aligned row (icon,
 *    then title stacked over subtitle) is the same layout an editorial
 *    masthead or a settled fintech app uses for a feature list; centred
 *    icon-over-caption is what a page builder defaults to. Kept even on a
 *    phone, where it now reads as two rows of two short list items rather
 *    than four little centred islands.
 *
 * Icons are inline SVG rather than an icon-font or the Medusa set, because
 * none of the four shapes needed exist there. Each is `aria-hidden` — every
 * one sits beside its own text, which §8.7 requires (never icon-only), so
 * announcing the icon too would just repeat the title.
 */

const STROKE = 1.25

function StorefrontIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4.5 10v9h15v-9"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10 5 5h14l1.5 5a2.25 2.25 0 0 1-4.5.3 2.25 2.25 0 0 1-4.5 0 2.25 2.25 0 0 1-4.5 0A2.25 2.25 0 0 1 3.5 10Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M9.75 19v-4.5h4.5V19"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3 6.5h10v9H3v-9Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M13 10h3.6L19.5 13v2.5H13V10Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx="7" cy="16.5" r="1.6" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="16" cy="16.5" r="1.6" stroke="currentColor" strokeWidth={STROKE} />
    </svg>
  )
}

function ScooterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="5.5" cy="17" r="2" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="17.5" cy="17" r="2" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M5.5 17h4.2l2.3-6.5h3.4M11.3 10.5H9.6"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4 10.5c1.7 0 3.1 1.4 3.1 3.1 0 1.9-1.4 3.4-3.1 3.4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M14 6.5h2.2l.8 2"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3.5 6 6v5c0 4 2.6 6.9 6 7.7 3.4-.8 6-3.7 6-7.7V6l-6-2.5Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="m9.3 11.6 1.9 1.9 3.5-3.7"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const STATEMENTS = [
  {
    Icon: StorefrontIcon,
    title: "Sold directly by us",
    subtitle: "No third-party sellers, ever",
  },
  {
    Icon: TruckIcon,
    title: "Nationwide delivery",
    subtitle: "Wine & Spirits, anywhere in Nigeria",
  },
  {
    Icon: ScooterIcon,
    title: "Food Central, Lagos only",
    subtitle: "Same-day, scheduled or pickup",
  },
  {
    Icon: ShieldIcon,
    title: "Secure checkout",
    subtitle: "Safe and encrypted payments",
  },
]

export default function TrustBand() {
  return (
    <section
      aria-label="Why shop with LiquorCentral"
      // `ink-900` — the only dark full-width block on the page, which is
      // what makes it read as a breaker between the content above and the
      // footer below. A dark band needs no border to separate itself.
      className="w-full bg-ink-900"
      data-testid="trust-band"
    >
      <div className="ds-container py-10 small:py-12">
        {/* Two short rows on a phone, one row of four from `small:` up.
            Hairline dividers only appear between columns at `small:` — on
            a 2-column phone grid a vertical rule mid-row reads as a stray
            line, so the row gap alone separates the pairs there. */}
        <ul className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 small:grid-cols-4 small:divide-x small:divide-white/10 small:gap-y-0">
          {STATEMENTS.map(({ Icon, title, subtitle }) => (
            <li
              key={title}
              className="flex items-center gap-3 small:px-6 small:first:pl-0 small:last:pr-0"
            >
              {/* The tinted circle is what makes this a designed icon
                  rather than a glyph floating on the background — `white/8`
                  with a hairline `white/15` ring, subtle enough to stay
                  quiet next to the text it introduces. */}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-radius-full bg-white/8 text-surface-elevated ring-1 ring-inset ring-white/15"
              >
                <Icon />
              </span>
              <span className="flex flex-col">
                <span className="text-caption font-medium text-surface-elevated">
                  {title}
                </span>
                {/* `ink-300`, not a translucent white — see the previous
                    version's own note: an opacity value shifts if the
                    background ever does, a token does not. */}
                <Text className="!text-[12px] leading-snug text-ink-300">
                  {subtitle}
                </Text>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
