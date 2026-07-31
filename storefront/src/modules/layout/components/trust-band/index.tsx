import { Text } from "@modules/common/components/ui"

/**
 * The pre-footer trust band — `02_HOMEPAGE_SPECIFICATION.md` §8.7/§13's four
 * required trust statements, presented as a banner rather than a checklist.
 *
 * **The four claims are §13's own list and are not editorial.** §13 names
 * them exactly: "sold and delivered directly by LiquorCentral (no
 * third-party sellers); Wine & Spirits ships nationwide; Food Central
 * delivers in Lagos only, same-day/scheduled/pickup available; secure
 * payment." What changed on Paul's direction is only the *presentation* —
 * splitting each into a title and a subtitle, and swapping the green
 * check for a drawn icon. The substance of every claim survives intact,
 * including Food Central's "Lagos only," which is a limitation the customer
 * has to be told and must never be softened into something vaguer to make
 * the row scan more evenly.
 *
 * **This moved out of `modules/home`.** It used to be a homepage section;
 * it is now layout furniture directly above the footer, so it appears on
 * every page rather than only the one. Trust statements that vanish once
 * the customer navigates to a product are doing half a job.
 *
 * Icons are inline SVG rather than an icon-font or the Medusa set, because
 * none of the four shapes needed exist there. Each is `aria-hidden` — every
 * one sits beside its own text, which §8.7 requires (never icon-only), so
 * announcing the icon too would just repeat the title.
 */

const STROKE = 1.5

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path
        d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 8.5 4.1-.9 7-4.3 7-8.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="m9.2 11.8 2 2 3.6-3.8"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StorefrontIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path
        d="M4 9.5V20h16V9.5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 9.5 4.8 4.5h14.4L21 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20v-5.5h5V20"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path
        d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5V6.5Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M9 4v13.5M15 6.5V20"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeliveryPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path
        d="M3 7.5h9V16H3V7.5Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5h3.6L18 13.2V16h-6"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx="7" cy="17.5" r="1.8" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="16" cy="17.5" r="1.8" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M20 3c1.4 0 2.5 1.1 2.5 2.4 0 1.7-2.5 4.1-2.5 4.1s-2.5-2.4-2.5-4.1C17.5 4.1 18.6 3 20 3Z"
        stroke="currentColor"
        strokeWidth={STROKE}
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
    Icon: MapIcon,
    title: "Nationwide delivery",
    subtitle: "Wine & Spirits, anywhere in Nigeria",
  },
  {
    Icon: DeliveryPinIcon,
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
      // Bordered top and bottom, on the same warm `ink-100` used elsewhere
      // for a recessed band. It separates the page above from the footer
      // below without introducing a new colour.
      className="w-full border-y border-border bg-ink-100"
      data-testid="trust-band"
    >
      <div className="ds-container py-8 small:py-10">
        {/* 2×2 on a phone, one row of four from `small:` up. `grid-cols-2`
            at the smallest size is deliberate — four stacked rows is most
            of a screen spent on reassurance the customer has not asked
            for yet. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-8">
          {STATEMENTS.map(({ Icon, title, subtitle }) => (
            <li
              key={title}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="text-text-primary">
                <Icon />
              </span>
              <span className="text-caption font-semibold text-text-primary">
                {title}
              </span>
              <Text className="max-w-[24ch] !text-[12px] leading-snug text-text-secondary">
                {subtitle}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
