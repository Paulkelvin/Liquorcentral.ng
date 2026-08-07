import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import PostCover from "../post-cover"
import PostMeta from "../post-meta"
import { PostCard as PostCardType } from "../../../../sanity/queries"

/**
 * One journal entry as a card.
 *
 * `lead` is the index page's opening story: same component, wider
 * proportions and a larger headline, so the page has a clear first read
 * without a second component to keep in sync.
 */
export default function PostCard({
  post,
  lead = false,
  priority = false,
  className,
}: {
  post: PostCardType
  lead?: boolean
  priority?: boolean
  className?: string
}) {
  return (
    <article className={clx("group", className)}>
      <LocalizedClientLink
        href={`/blog/${post.slug}`}
        className={clx(
          "flex h-full rounded-radius-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4",
          // The lead reads as a magazine opener: image and headline side
          // by side from `small:` up, stacked like any other card below.
          lead
            ? "flex-col gap-6 small:flex-row small:items-center small:gap-10"
            : "flex-col gap-4"
        )}
        data-testid="blog-post-card"
      >
        <PostCover
          post={post}
          priority={priority}
          sizes={
            lead
              ? "(min-width: 1024px) 55vw, 100vw"
              : "(min-width: 1024px) 33vw, 100vw"
          }
          className={clx(
            lead ? "aspect-[4/3] small:w-[55%] small:shrink-0" : "aspect-[4/3]"
          )}
        />

        <div
          className={clx(
            "flex flex-1 flex-col gap-2",
            lead && "small:max-w-[38ch]"
          )}
        >
          {post.category && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {post.category.title}
            </span>
          )}

          {/* The serif is the whole point of the journal reading as
              editorial rather than as more storefront. */}
          <h3
            className={clx(
              "font-display leading-tight text-text-primary transition-colors duration-standard ease-in-out group-hover:text-primary",
              lead ? "text-[28px] small:text-[36px]" : "text-[20px]"
            )}
          >
            {post.title}
          </h3>

          <p
            className={clx(
              "text-text-secondary",
              lead ? "text-body line-clamp-3" : "text-[14px] leading-relaxed line-clamp-2"
            )}
          >
            {post.excerpt}
          </p>

          <div className="mt-auto pt-2">
            <PostMeta
              publishedAt={post.publishedAt}
              readingTime={post.readingTime}
            />
          </div>
        </div>
      </LocalizedClientLink>
    </article>
  )
}
