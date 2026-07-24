import { ArrowUpRightMini } from "@medusajs/icons"
import { Text, clx } from "@modules/common/components/ui"
import LocalizedClientLink from "../localized-client-link"
type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  /**
   * A quieter, editorial treatment for a "View all"-style action
   * sitting beside a section heading — small uppercase tracking-wide
   * text in the secondary color, instead of the default brand
   * `text-interactive` link color this component otherwise renders
   * everywhere else (e.g. empty-state/not-found CTAs, where the bolder
   * default is the correct, more prominent action).
   */
  subtle?: boolean
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  subtle,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group shrink-0 whitespace-nowrap"
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text
        size={subtle ? "caption" : undefined}
        className={clx(
          "whitespace-nowrap",
          subtle
            ? "text-text-secondary uppercase tracking-wider"
            : "text-interactive"
        )}
      >
        {children}
      </Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-in-out duration-150"
        color={subtle ? "var(--color-text-secondary)" : "var(--color-interactive)"}
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
