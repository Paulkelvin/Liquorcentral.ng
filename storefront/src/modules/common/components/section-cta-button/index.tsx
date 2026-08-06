import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

/**
 * A full-width "see all" button below a homepage product grid — mobile
 * only. Paul asked for it explicitly: the same destination `SectionLink`
 * already offers at the top of Featured Collection and Today's Menu, "also
 * at the bottom" on a phone, so a customer who has scrolled past six cards
 * doesn't have to scroll back up to keep going.
 *
 * **Desktop is deliberately excluded (`small:hidden`), not just visually
 * de-emphasised.** The header link is already in easy reach with a mouse at
 * that width — a second identical control a full page-scroll away answers a
 * problem desktop doesn't have. Duplicating it there would just be noise.
 *
 * **Outlined, not solid**, matching the quieted card CTAs
 * (`quick-add-button.tsx`): this button's only job is to hand off to a
 * fuller listing, not to compete with the row of "Add to cart" buttons
 * directly above it for attention.
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
    <LocalizedClientLink
      href={href}
      data-testid={dataTestid}
      className={clx(
        "mt-8 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-radius-md border border-border px-4 text-body font-medium text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 active:scale-[0.98] small:hidden",
        className
      )}
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
