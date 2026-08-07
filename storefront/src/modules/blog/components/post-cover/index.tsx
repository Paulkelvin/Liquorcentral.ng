import Image from "next/image"
import { clx } from "@modules/common/components/ui"
import { PostCard } from "../../../../sanity/queries"

/**
 * A post's cover.
 *
 * Covers are optional in the CMS, and a journal whose cards collapse to
 * grey rectangles until someone uploads photography looks broken rather
 * than unfinished. The fallback is therefore a designed state, not a
 * placeholder: the warm sand surface, a hairline gold rule and the
 * title's own initial set in the display serif. It is meant to look
 * deliberate on its own, and to quietly step aside the moment a real
 * photograph exists.
 */
export default function PostCover({
  post,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  hideWhenEmpty = false,
}: {
  post: Pick<PostCard, "title" | "coverUrl" | "coverAlt" | "coverLqip" | "category">
  priority?: boolean
  className?: string
  sizes?: string
  /**
   * Render nothing rather than the fallback when there is no image.
   * The article page sets this: a card needs a visual anchor to be
   * clickable, but on the post itself a large empty tile between the
   * headline and the first paragraph only delays the reading.
   */
  hideWhenEmpty?: boolean
}) {
  if (!post.coverUrl && hideWhenEmpty) {
    return null
  }

  return (
    <div
      className={clx(
        // A hairline gold frame around every cover — the journal's one
        // recurring gold moment, not just the fallback's accent dash.
        // Border, not ring: a ring needs an offset color to sit against,
        // which the lead card's transparent gutter doesn't have.
        "relative isolate overflow-hidden rounded-radius-md bg-surface-warm border border-accent/30 shadow-elevation-1 transition-[border-color,box-shadow] duration-standard ease-in-out group-hover:border-accent/70 group-hover:shadow-elevation-2",
        className
      )}
    >
      {post.coverUrl ? (
        <Image
          src={post.coverUrl}
          alt={post.coverAlt || post.title}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={post.coverLqip ? "blur" : undefined}
          blurDataURL={post.coverLqip}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* A very large, very quiet initial — texture behind the card's
              real text, never competing with it. `ink-200` rather than an
              opacity modifier: Tailwind's `/opacity` syntax emits no CSS
              at all against these bare `var()` colours, so it would have
              silently rendered at full strength. */}
          <span className="select-none font-display text-[26vw] leading-none text-ink-200 sm:text-[9rem]">
            {post.title.trim().charAt(0)}
          </span>
          <span className="absolute bottom-4 left-4 h-px w-10 bg-accent" />
        </div>
      )}
    </div>
  )
}
