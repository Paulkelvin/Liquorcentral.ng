import { sanityFetch } from "../../../../sanity/client"
import {
  HOME_POSTS_QUERY,
  PostCard as PostCardType,
} from "../../../../sanity/queries"
import PostCard from "@modules/blog/components/post-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * The journal on the homepage.
 *
 * Sits late in the page on purpose: it is the one section that sells
 * nothing. Its job is the "legitimacy content" `PRODUCT_BLUEPRINT.md`
 * §11 asks for — evidence that people with opinions about wine and food
 * are behind the catalog — which is worth more after a customer has
 * seen the products than before.
 *
 * Renders nothing at all when the CMS has no posts (or is unreachable),
 * rather than showing an empty rail. The same restraint §19 already
 * applies to the pairing section.
 */
export default async function JournalStrip() {
  const posts =
    (await sanityFetch<PostCardType[]>({
      query: HOME_POSTS_QUERY,
      tags: ["post"],
    })) ?? []

  if (posts.length === 0) {
    return null
  }

  return (
    <section
      className="border-t border-divider bg-surface-warm py-14 small:py-20"
      data-testid="home-journal-strip"
    >
      <div className="ds-container">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[26px] leading-tight text-text-primary small:text-[34px]">
            From the journal
          </h2>
          <LocalizedClientLink
            href="/blog"
            className="shrink-0 whitespace-nowrap text-[14px] font-medium text-text-secondary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            data-testid="home-journal-view-all"
          >
            Read all
          </LocalizedClientLink>
        </div>
        <p className="mb-10 max-w-xl text-[14px] leading-relaxed text-text-secondary">
          What to drink with what you are cooking, and what comes out of our
          kitchen — written by the people who do both.
        </p>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 small:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
