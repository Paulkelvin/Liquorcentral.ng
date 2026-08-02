import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconChevronDown } from "@modules/common/icons"

export type BreadcrumbSegment = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  segments: BreadcrumbSegment[]
}

/**
 * 01_NAVIGATION_SPECIFICATION.md §18 — hierarchical location, not browsing
 * history. Always starts from Home (callers pass the rest). Every segment
 * except the last is a real link; the last is `aria-current="location"`
 * and not itself a link (§18, §21). Wrapped in its own labeled `<nav>`
 * landmark, distinct from primary/footer navigation for screen readers
 * (§21). Desktop shows the full trail; §18 allows mobile truncation, but
 * this component always renders the full trail and leaves truncation to
 * responsive CSS (`sm:hidden` on interior segments) rather than
 * conditional rendering, so the full trail is still in the DOM (and in
 * `BreadcrumbList` structured data, §26) regardless of viewport.
 *
 * Renders `BreadcrumbList` JSON-LD (§26) from the same segment list —
 * one source of truth for the visible trail and the structured data.
 */
export default function Breadcrumbs({ segments }: BreadcrumbsProps) {
  if (segments.length === 0) {
    return null
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      ...(segment.href ? { item: segment.href } : {}),
    })),
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="ds-container pt-6">
        <ol className="flex flex-wrap items-center gap-x-2 txt-small text-text-secondary">
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            // The narrow-viewport truncation hides the whole <li>, not
            // just its label: hiding the label alone left the leading
            // separator behind, so a trail two levels deep read as
            // "Wine & Spirits › › Whisky" on a phone.
            const truncatesOnMobile = index > 1 && !isLast

            return (
              <li
                key={`${segment.label}-${index}`}
                className={
                  truncatesOnMobile
                    ? "hidden items-center gap-x-2 sm:flex"
                    : "flex items-center gap-x-2"
                }
              >
                {/* A chevron, not a slash — Paul's direction, matching the
                    reference he sent. Drawn to the house icon spec rather
                    than typed as "›": a text chevron takes the label's font
                    and weight, so it changed size with the breadcrumb type
                    and sat on the text baseline instead of centred between
                    the two labels. `IconChevronDown` rotated 90° is the same
                    path the drawer's disclosure uses, so the separator and
                    the disclosure caret cannot drift apart. */}
                {index > 0 && (
                  <IconChevronDown
                    aria-hidden="true"
                    size={14}
                    className="-rotate-90 shrink-0 text-text-muted"
                  />
                )}
                {isLast || !segment.href ? (
                  <span
                    aria-current={isLast ? "location" : undefined}
                    className="text-text-primary"
                  >
                    {segment.label}
                  </span>
                ) : (
                  <LocalizedClientLink
                    href={segment.href}
                    className="hover:text-text-primary"
                  >
                    {segment.label}
                  </LocalizedClientLink>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
