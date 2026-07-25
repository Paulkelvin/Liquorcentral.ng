import { ArrowRightMini } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group shrink-0 whitespace-nowrap"
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text className="text-interactive font-medium whitespace-nowrap">
        {children}
      </Text>
      <ArrowRightMini
        className="transition-transform ease-in-out duration-150 group-hover:translate-x-0.5"
        color="var(--color-interactive)"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
