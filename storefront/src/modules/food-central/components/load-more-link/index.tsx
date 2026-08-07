"use client"

import { useEffect, useRef, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type LoadMoreLinkProps = {
  hasMore: boolean
  nextPage: number
  newlyLoadedCount: number
}

/**
 * The Food Central menu's "Load more" — visually the same underlined
 * text-plus-arrow treatment as `SectionCTAButton`, not the bordered
 * `<button>` `store/components/load-more` uses on every catalog listing.
 * Paul's own read of the bordered version, reiterated here: it competes
 * with the "Add to cart" buttons already stacked above it. This can't
 * reuse `SectionCTAButton` itself — that component is a static link to a
 * fixed `href`, where this needs a click handler that pushes an
 * incrementing `?page=` param — so the interaction is `store/load-more`'s
 * (URL-driven `router.push`, `useTransition`, a polite live region for
 * the newly-loaded count) wearing `SectionCTAButton`'s visual treatment.
 */
export default function LoadMoreLink({
  hasMore,
  nextPage,
  newlyLoadedCount,
}: LoadMoreLinkProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const wasPendingRef = useRef(false)

  /**
   * Land on the first dish of the batch just loaded, not below the last
   * one. Same behaviour as the catalog listings' own Load More — see
   * `store/components/load-more` for why `{ scroll: false }` alone is
   * not enough inside a Suspense boundary.
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
    if (!firstNew) {
      return
    }
    firstNew.scrollIntoView({ block: "start", behavior: "smooth" })
    firstNew.focus({ preventScroll: true })
  }, [isPending])

  const loadMore = () => {
    const params = new URLSearchParams(searchParams)
    params.set("page", nextPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2 w-full">
      {hasMore && (
        <button
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
