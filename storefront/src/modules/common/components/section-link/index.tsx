import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

/**
 * The "see more" link that sits at the right of a homepage section heading —
 * "View all", "See the collection", "View Food Central".
 *
 * It exists as one component because the markup was copied into three
 * sections and had already drifted: Today's Menu was still using
 * `InteractiveLink` (brand green, green arrow) while Shop by Category and
 * Featured Collection had moved to this underlined dark treatment, so one
 * of three section headers looked like a different kind of control.
 *
 * **Not `InteractiveLink`, deliberately.** Green is this palette's
 * success/Food Central accent. Beside a section heading it reads as a
 * status or a department marker rather than as navigation, and on the
 * homepage it competed with the hero's own primary action — the same
 * reasoning that moved the cart's promotion-code control off green.
 */
export default function SectionLink({
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
    <LocalizedClientLink
      href={href}
      className={clx(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-text-primary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-interactive",
        className
      )}
      data-testid={dataTestid}
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
  )
}
