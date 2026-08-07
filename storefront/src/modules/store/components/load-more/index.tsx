"use client"

import { useEffect, useRef, useTransition } from "react"
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
 *
 * **Restyled to match the underlined text-plus-arrow treatment used
 * everywhere else this pattern appears** (the homepage's "see all"s, the
 * Food Central menu's own Load More) — this was the one surface still
 * drawing it as a bordered button, which Paul's own read called "the
 * former styling" once the rest of the site had moved on from it.
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wasPendingRef = useRef(false)

  /**
   * `{ scroll: false }` below is supposed to be enough on its own, and
   * usually is — but the grid this button sits under
   * (`PaginatedProducts`) lives inside a `Suspense` boundary
   * (`categories/templates/index.tsx`), and re-suspending it for the
   * larger cumulative page mid-transition is enough to make Next reset
   * scroll to the top anyway (a known App Router gap: `scroll: false`
   * only reliably holds when the boundary doesn't re-suspend).
   *
   * Once the transition settles, land on the **first product of the
   * batch that was just loaded** — marked `data-new-batch-start` by
   * `PaginatedProducts`. Anchoring to the button instead (what this did
   * before) put the customer at the *bottom* of the new products, having
   * scrolled straight past everything they had just asked for. Focus
   * moves with the scroll so keyboard and screen-reader users continue
   * from the same place rather than from the top of the document.
   */
  useEffect(() => {
    if (!wasPendingRef.current || isPending) {
      wasPendingRef.current = isPending
      return
    }
    wasPendingRef.current = isPending

    const firstNew = document.querySelector<HTMLElement>(
      "[data-new-batch-start]"
    )
    const target = firstNew ?? buttonRef.current

    if (!target) {
      return
    }

    target.scrollIntoView({ block: "start", behavior: "smooth" })
    if (firstNew) {
      firstNew.focus({ preventScroll: true })
    }
  }, [isPending])

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
          ref={buttonRef}
          type="button"
          onClick={loadMore}
          disabled={isPending}
          data-testid="load-more-button"
          className="relative inline-flex items-center gap-1.5 whitespace-nowrap text-body font-medium text-text-primary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-interactive disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
        >
          {isPending ? "Loading more…" : "Load more"}
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
        </button>
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {newlyLoadedCount > 0 &&
          `${newlyLoadedCount} more result${newlyLoadedCount === 1 ? "" : "s"} loaded`}
      </div>
    </div>
  )
}
