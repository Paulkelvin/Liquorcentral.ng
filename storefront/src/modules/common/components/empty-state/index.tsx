import { ReactNode } from "react"
import { Heading, Text } from "@modules/common/components/ui"

/**
 * Empty-state infrastructure (Phase 0c — Storefront Foundation). A generic,
 * reusable shell for "there's nothing here yet" moments (empty cart, no
 * search results, no order history, an empty category) — every future
 * specification implementation supplies its own icon/title/description/
 * action copy; this component only provides the consistent structural and
 * visual treatment so every empty state looks and behaves the same way
 * (DESIGN_SYSTEM.md's Component Philosophy: "consistency is more valuable
 * than novelty").
 */
export type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center gap-3 py-16 px-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && (
        <div className="text-text-muted" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading level="h3">{title}</Heading>
      {description && (
        <Text muted className="max-w-sm">
          {description}
        </Text>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
