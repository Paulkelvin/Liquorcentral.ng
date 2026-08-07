import Image from "next/image"
import {
  PortableText as BasePortableText,
  PortableTextComponents,
} from "@portabletext/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ImageValue = {
  asset?: { url?: string; metadata?: { lqip?: string } }
  alt?: string
  caption?: string
}

/**
 * How a Sanity rich-text body renders on this site.
 *
 * Two decisions carry the article's look:
 *
 * - **The measure is capped at 68 characters** on the wrapper, not here.
 *   Long-form prose stops being readable somewhere past ~75 characters
 *   per line regardless of font size, and the site's own 1280px content
 *   width is far wider than that.
 * - **Headings are the display serif, body is the sans.** The serif does
 *   the editorial work; the body face stays the one the rest of the
 *   storefront uses, so an article still feels like the same site.
 *
 * Every element resolves through Tier-3 tokens — no raw hex, same rule
 * as the rest of the platform.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-body leading-[1.75] text-text-secondary">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-display text-[26px] leading-tight text-text-primary">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-10 font-display text-[21px] leading-tight text-text-primary">
        {children}
      </h3>
    ),
    // A pull-quote, not an indented paragraph: the gold rule is the
    // brand's "rare seal of distinction" accent, used here exactly once
    // per article at most.
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-2 border-accent pl-6 font-display text-[22px] leading-snug text-text-primary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 flex list-disc flex-col gap-2 pl-5 text-body leading-relaxed text-text-secondary marker:text-text-muted">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 flex list-decimal flex-col gap-2 pl-5 text-body leading-relaxed text-text-secondary marker:text-text-muted">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-text-primary">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = String(value?.href ?? "")
      const isInternal = href.startsWith("/")
      const className =
        "font-medium text-text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-standard ease-in-out hover:text-primary"

      if (isInternal) {
        return (
          <LocalizedClientLink href={href} className={className}>
            {children}
          </LocalizedClientLink>
        )
      }
      return (
        <a
          href={href}
          className={className}
          rel="noreferrer noopener"
          target="_blank"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }: { value: ImageValue }) => {
      const url = value?.asset?.url
      if (!url) {
        return null
      }
      return (
        <figure className="my-10">
          <div className="relative aspect-[3/2] overflow-hidden rounded-radius-md bg-surface-warm">
            <Image
              src={url}
              alt={value.alt || ""}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              placeholder={value.asset?.metadata?.lqip ? "blur" : undefined}
              blurDataURL={value.asset?.metadata?.lqip}
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-caption text-text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

export default function PortableText({ value }: { value: unknown }) {
  if (!Array.isArray(value)) {
    return null
  }
  return <BasePortableText value={value as never} components={components} />
}
