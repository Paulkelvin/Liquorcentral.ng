import { createClient } from "next-sanity"

export const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "nlse1pps"
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
export const SANITY_API_VERSION = "2026-02-01"

/**
 * How long a single editorial fetch may take before it is abandoned and
 * the caller falls back to its empty state. Editorial content is never
 * on the critical path of a purchase, so waiting longer than this only
 * ever costs a customer time it cannot buy back.
 */
const SANITY_TIMEOUT_MS = 5_000

/**
 * Sanity is the source of truth for *editorial* content only — the
 * journal, the About page, and marketing copy. Products, prices,
 * inventory, carts and orders stay in Medusa. Nothing in this folder
 * should ever reach for commerce data.
 *
 * The dataset is public, so reads need no token. Keep it that way: a
 * read token in the browser bundle would be a needless liability for
 * content that is public the moment it is published.
 */
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
})

/**
 * Editorial content changes rarely and never has to be transactionally
 * fresh, so it is cached by tag and revalidated on a slow timer. Both
 * knobs are here rather than at each call site: a page asks for content,
 * not for a caching policy.
 *
 * `tags` exist so a future Sanity webhook can call `revalidateTag("post")`
 * and update every surface at once instead of waiting out the timer.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 300,
}: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
  revalidate?: number
}): Promise<T | null> {
  // The `catch` below only ever handled a CMS that *answers* with an
  // error. A CMS that simply doesn't answer — DNS blackhole, dropped
  // connection, an overloaded API — has no timeout of its own, so the
  // request hangs for as long as the platform's socket timeout allows
  // and the page hangs with it. Observed live: the first uncached
  // request to /blog hung past 25s and then failed, which is the exact
  // "a CMS outage must never take the storefront down" outcome the
  // guard was written to prevent, arrived at through slowness rather
  // than through an error. A bounded wait turns it into the empty state
  // callers already handle.
  const timeout = AbortSignal.timeout(SANITY_TIMEOUT_MS)

  try {
    return await sanityClient.fetch<T>(query, params, {
      signal: timeout,
      next: { revalidate, tags },
    })
  } catch (error) {
    // A CMS outage must never take the storefront down with it. Callers
    // render an empty state; commerce pages carry on untouched.
    console.error("Sanity fetch failed:", error)
    return null
  }
}
