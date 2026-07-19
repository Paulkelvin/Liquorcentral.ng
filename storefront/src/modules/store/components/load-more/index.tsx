"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type LoadMoreProps = {
  hasMore: boolean
  nextPage: number
  newlyLoadedCount: number
}

/**
 * 04_PRODUCT_LISTING_SPECIFICATION.md §13 — "Load More" is the adopted
 * default pattern, replacing classic page-number pagination (still a
 * reasonable fallback for very deep catalogs, but not this platform's
 * primary pattern). A real, keyboard-operable control (§13, §24) — not a
 * scroll-triggered side effect. Incrementing `page` in the URL via
 * `router.push` re-requests the server component with a larger
 * cumulative window (`listProductsWithSort`'s `cumulative` mode) rather
 * than fetching and appending client-side — the simplest way to keep
 * "every loaded page reflected in the URL" (§13, §20) and "first-loaded
 * state is complete, server-rendered content" (§26) both true at once,
 * without a separate client-side fetch/cache layer to keep in sync.
 *
 * Newly-loaded results are announced via a polite live region (§24) —
 * `newlyLoadedCount` is computed server-side (the delta between this
 * page's total and the previous page's total), not inferred client-side.
 */
export default function LoadMore({
  hasMore,
  nextPage,
  newlyLoadedCount,
}: LoadMoreProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const loadMore = () => {
    const params = new URLSearchParams(searchParams)
    params.set("page", nextPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full mt-12">
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isPending}
          data-testid="load-more-button"
          className="w-full sm:w-auto min-h-[44px] px-8 rounded-radius-md font-medium border border-border text-text-primary hover:bg-surface-elevated disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {isPending ? "Loading more…" : "Load more"}
        </button>
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {newlyLoadedCount > 0 &&
          `${newlyLoadedCount} more result${newlyLoadedCount === 1 ? "" : "s"} loaded`}
      </div>
    </div>
  )
}
