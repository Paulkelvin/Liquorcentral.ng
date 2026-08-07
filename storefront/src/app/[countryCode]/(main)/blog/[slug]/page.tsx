import { Metadata } from "next"
import { notFound } from "next/navigation"

import { sanityClient, sanityFetch } from "../../../../../sanity/client"
import {
  POST_QUERY,
  POST_SLUGS_QUERY,
  RELATED_POSTS_QUERY,
  Post,
  PostCard as PostCardType,
} from "../../../../../sanity/queries"
import PortableText from "@modules/blog/components/portable-text"
import PostCard from "@modules/blog/components/post-card"
import PostCover from "@modules/blog/components/post-cover"
import PostMeta from "@modules/blog/components/post-meta"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Breadcrumbs from "@modules/common/components/breadcrumbs"

type Props = { params: Promise<{ slug: string; countryCode: string }> }

export async function generateStaticParams() {
  try {
    // `useCdn: false` at build time — the CDN can lag a publish by a
    // minute or two, which is exactly long enough to miss a brand-new
    // post from the generated set.
    const slugs = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<string[]>(POST_SLUGS_QUERY)
    return (slugs ?? []).map((slug) => ({ slug }))
  } catch {
    // A CMS outage at build time must not fail the whole build; these
    // pages simply render on demand instead.
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const post = await sanityFetch<Post>({
    query: POST_QUERY,
    params: { slug },
    tags: [`post:${slug}`],
  })

  if (!post) {
    return { title: "Not found" }
  }

  const title = post.seo?.title || post.title
  const description = post.seo?.description || post.excerpt

  return {
    title: `${title} | LiquorCentral`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  }
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params
  const post = await sanityFetch<Post>({
    query: POST_QUERY,
    params: { slug },
    tags: [`post:${slug}`, "post"],
  })

  if (!post) {
    notFound()
  }

  const related =
    (await sanityFetch<PostCardType[]>({
      query: RELATED_POSTS_QUERY,
      params: {
        slug,
        // Posts sharing a category sort first; everything else falls back
        // to recency, so this never returns an empty "keep reading" rail.
        categoryIds: (post.categories ?? []).map((c) => c._id),
      },
      tags: ["post"],
    })) ?? []

  return (
    <>
      <Breadcrumbs
        segments={[
          { label: "Home", href: "/" },
          { label: "Journal", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className="ds-container py-8 small:py-12">
        {/* The measure is capped well below the site's content width —
            prose stops being readable past roughly 75 characters a line
            however large the type is. */}
        <header className="mx-auto max-w-[68ch]">
          {post.category && (
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {post.category.title}
            </p>
          )}
          <h1 className="font-display text-[32px] leading-[1.15] text-text-primary small:text-[46px]">
            {post.title}
          </h1>
          <p className="mt-5 text-body-lg leading-relaxed text-text-secondary">
            {post.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-3 border-t border-divider pt-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-radius-full bg-ink-900 font-display text-[15px] text-surface-elevated">
              {(post.author?.name ?? "L").charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-medium text-text-primary">
                {post.author?.name ?? "LiquorCentral"}
              </p>
              <PostMeta
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
              />
            </div>
          </div>
        </header>

        <PostCover
          post={post}
          priority
          hideWhenEmpty
          sizes="(min-width: 1024px) 900px, 100vw"
          className="mx-auto mt-10 aspect-[16/9] max-w-4xl"
        />

        <div className="mx-auto mt-12 max-w-[68ch]">
          <PortableText value={post.body} />
        </div>

        {post.author?.bio && (
          <aside className="mx-auto mt-14 max-w-[68ch] rounded-radius-md border border-divider bg-surface-warm p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              Written by
            </p>
            <p className="mt-2 font-display text-[20px] text-text-primary">
              {post.author.name}
              {post.author.role && (
                <span className="text-text-muted"> · {post.author.role}</span>
              )}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              {post.author.bio}
            </p>
          </aside>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-divider bg-surface-warm py-14 small:py-20">
          <div className="ds-container">
            <div className="mb-8 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[24px] text-text-primary small:text-[30px]">
                Keep reading
              </h2>
              <LocalizedClientLink
                href="/blog"
                className="shrink-0 whitespace-nowrap text-[14px] font-medium text-text-secondary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-text-primary"
              >
                All entries
              </LocalizedClientLink>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 small:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item._id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
