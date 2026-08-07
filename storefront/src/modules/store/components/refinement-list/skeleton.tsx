/**
 * Placeholder for `CategoriesSidebar` while its own `listCategories`
 * fetch is in flight — sized to roughly match the real trigger (the
 * mobile pill, the desktop sidebar column) so there's no layout jump
 * once the real content lands.
 */
export default function RefinementListSkeleton() {
  return (
    <div
      className="w-full small:w-[240px] small:shrink-0"
      aria-hidden="true"
    >
      <div className="h-8 w-32 animate-pulse rounded-radius-full bg-ink-200 small:hidden" />
      <div className="hidden small:block small:space-y-3">
        <div className="h-3 w-16 animate-pulse bg-ink-200" />
        <div className="h-4 w-full animate-pulse bg-ink-100" />
        <div className="h-4 w-5/6 animate-pulse bg-ink-100" />
        <div className="h-4 w-4/6 animate-pulse bg-ink-100" />
      </div>
    </div>
  )
}
