import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

/**
 * Shared by every product-grid listing route (`/store`, `/categories/*`,
 * `/collections/*`, `/search`, `/food-central`) — none of them had a
 * `loading.tsx`, so the App Router showed nothing at all while switching
 * between them (Paul's report: switching departments/categories should
 * feel instant, not freeze on the old page). Mirrors the real layout
 * (a sidebar column beside the grid on `small:` up) closely enough that
 * the swap to real content doesn't jump.
 */
export default function SkeletonListingPage() {
  return (
    <div
      className="ds-container flex animate-pulse flex-col gap-6 py-6 small:flex-row small:items-start small:gap-10"
      data-testid="listing-page-loader"
    >
      <div className="hidden w-56 shrink-0 flex-col gap-3 small:flex">
        <div className="h-5 w-24 bg-ink-100" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 w-full bg-ink-100" />
        ))}
      </div>
      <div className="w-full min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="h-7 w-40 bg-ink-100" />
          <div className="h-9 w-32 bg-ink-100" />
        </div>
        <SkeletonProductGrid />
      </div>
    </div>
  )
}
