import { Metadata } from "next"

import { sanityFetch } from "../../../../sanity/client"
import { POSTS_QUERY, PostCard as PostCardType } from "../../../../sanity/queries"
import PostCard from "@modules/blog/components/post-card"
import EmptyState from "@modules/common/components/empty-state"

export const metadata: Metadata = {
  title: "The Journal | LiquorCentral",
  description:
    "Notes on wine, spirits and Nigerian cooking from the people who source, cook and deliver it. Pairings, plain-language guides, and what comes out of our kitchen.",
}

export default async function BlogIndexPage() {
  const posts =
    (await sanityFetch<PostCardType[]>({
      query: POSTS_QUERY,
      tags: ["post"],
    })) ?? []

  const [lead, ...rest] = posts

  return (
    <div className="pb-10 small:pb-16">
      {/* The masthead is set on the warm sand surface and bleeds full
          width, so the journal announces itself as a different room in
          the same house before a single card is read. No top padding on
          this outer wrapper on purpose — the masthead's own background
          is what should meet the nav directly, not a band of plain page
          background sitting between them (Paul: "I don't want any space
          there"). The masthead's own `py-12`/`py-20` already carries the
          internal breathing room. */}
      <header className="border-y border-divider bg-surface-warm py-12 small:py-20">
        <div className="ds-container">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            The Journal
          </p>
          <h1 className="max-w-3xl font-display text-[34px] leading-[1.1] text-text-primary small:text-[52px]">
            What to drink, what we cook, and why.
          </h1>
          <p className="mt-5 max-w-xl text-body leading-relaxed text-text-secondary">
            Written by the people who source the wine and run the kitchen —
            in plain language, without the wine-shop performance.
          </p>
          <span className="mt-8 block h-px w-16 bg-accent" />
        </div>
      </header>

      <div className="ds-container mt-12 small:mt-16">
        {posts.length === 0 ? (
          <EmptyState
            title="Nothing published yet"
            description="The first entries are being written. Check back shortly."
          />
        ) : (
          <>
            {/* The lead gets its own row: cover beside the headline, the
                way a magazine opens. Spanning it across two columns of
                the grid instead left the card next to it floating at the
                top of a much taller row, which read as a layout fault
                rather than a hierarchy. */}
            {lead && (
              <PostCard post={lead} lead priority className="mb-14 small:mb-20" />
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 small:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
