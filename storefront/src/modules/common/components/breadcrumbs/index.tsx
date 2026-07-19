import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
      <nav aria-label="Breadcrumb" className="content-container pt-6">
        <ol className="flex flex-wrap items-center gap-x-2 txt-small text-text-secondary">
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1

            return (
              <li
                key={`${segment.label}-${index}`}
                className="flex items-center gap-x-2"
              >
                {index > 0 && (
                  <span aria-hidden="true" className="text-text-muted">
                    /
                  </span>
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
                    className={
                      index > 1
                        ? "hidden sm:inline hover:text-text-primary"
                        : "hover:text-text-primary"
                    }
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
