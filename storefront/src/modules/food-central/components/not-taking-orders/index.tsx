import EmptyState from "@modules/common/components/empty-state"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * 01_NAVIGATION_SPECIFICATION.md §14/§24 — the Food Central navigation
 * entries (Today's Menu, Scheduled Orders, Pickup) must remain visible
 * and clickable at all times, leading here rather than disappearing or
 * 404ing, "so a customer isn't confused about whether Food Central
 * exists at all." Food Central's actual menu/ordering behavior is
 * `09_FOOD_ORDERING_SPECIFICATION.md`'s own future implementation, not
 * built yet — this is the graceful placeholder that keeps the
 * destination real in the meantime, reusing Phase 0c's EmptyState
 * infrastructure rather than inventing new empty-state UI.
 */
export default function NotTakingOrders({ title }: { title: string }) {
  return (
    <div className="content-container">
      <EmptyState
        title={title}
        description="Food Central isn't taking orders yet. Check back soon."
        action={
          // A real, single <a> styled like the primary Button (not a
          // <button> nested inside a link) — the exact nested-interactive
          // pattern Phase 0c's axe-core audit already found and fixed
          // elsewhere in this codebase (see storefront/README.md).
          <LocalizedClientLink
            href="/store"
            className="inline-flex gap-2 items-center justify-center rounded-radius-md font-medium transition-colors duration-standard ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active px-4 py-2 text-body"
          >
            Browse Wine &amp; Spirits
          </LocalizedClientLink>
        }
      />
    </div>
  )
}
