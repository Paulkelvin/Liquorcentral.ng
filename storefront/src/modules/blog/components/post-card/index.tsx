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
          // The border stays — Paul asked for it back — but it's the
          // same quiet neutral hairline (`border-divider`) every other
          // bordered surface in this app uses (the checkout step cards,
          // the drawer's line items), not the resting gold frame that
          // prompted "too bold... try to make it easy and smooth" in the
          // first place. Gold now only shows on hover, as a warmer
          // acknowledgement rather than a permanent outline — restrained
          // per `curated-mark/index.tsx`'s own rule (gold marks a single
          // curated moment, not a standing frame on a whole grid).
          // `overflow-hidden` is still load-bearing: it clips the image's
          // square bottom corners to the card's own rounded ones instead
          // of them poking past it.
          "flex h-full overflow-hidden rounded-radius-md border border-divider bg-surface shadow-elevation-1 transition-[border-color,box-shadow] duration-standard ease-in-out hover:border-accent/50 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4",
          // The lead reads as a magazine opener: image and headline side
          // by side from `small:` up, stacked like any other card below.
          // `small:gap-8` only matters in the row layout — the stacked
          // layout gets its image-to-copy spacing from the text block's
          // own `pt-4` instead, since there's no padding on this
          // container to fall back on anymore.
          lead
            ? "flex-col small:flex-row small:items-stretch small:gap-8"
            : "flex-col"
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
          // Rounded only where the image actually meets a card corner:
          // top corners when stacked, left corners once the lead lays
          // out as a row — see PostCover's own comment on why this
          // can't just be the component's unconditional default.
          rounded={
            lead
              ? "rounded-t-radius-md small:rounded-l-radius-md small:rounded-tr-none"
              : "rounded-t-radius-md"
          }
          className={clx(
            "shrink-0",
            lead ? "aspect-[4/3] small:aspect-auto small:w-[55%]" : "aspect-[4/3]"
          )}
        />

        <div
          className={clx(
            "flex flex-1 flex-col gap-2 px-4 pb-4 pt-4",
            // At small+ the lead lays out as a row (image left, copy
            // right): the gap that used to separate image from text
            // when stacked is now handled by this padding instead, so
            // it needs to reset the left side (the row's own gap
            // already spaces it from the image) and restore top.
            lead && "small:max-w-[38ch] small:px-0 small:py-6 small:pr-6"
          )}
        >
          {post.category && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {/* A gold mark, not gold text: `--color-accent` at 11px on
                  the card's light surface measures well under AA's 4.5:1
                  (editorial-card's gold kicker only clears AA because it
                  sits on an 86%-black photo scrim, not a plain surface).
                  A decorative dot carries the same accent without putting
                  copy at a contrast that fails. */}
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
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
