import { createClient } from "next-sanity"

export const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "nlse1pps"
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
export const SANITY_API_VERSION = "2026-02-01"

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
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate, tags },
    })
  } catch (error) {
    // A CMS outage must never take the storefront down with it. Callers
    // render an empty state; commerce pages carry on untouched.
    console.error("Sanity fetch failed:", error)
    return null
  }
}
