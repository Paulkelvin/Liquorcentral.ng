import { defineQuery } from "next-sanity"

/**
 * Shared projection for a post as it appears on a card — index grid,
 * homepage strip, related list. Kept in one place so a new field shows
 * up everywhere at once rather than on whichever surface was edited last.
 */
const postCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  readingTime,
  featured,
  "coverUrl": mainImage.asset->url,
  "coverAlt": mainImage.alt,
  "coverLqip": mainImage.asset->metadata.lqip,
  "category": categories[0]->{ title, "slug": slug.current }
`

export const POSTS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)]
    | order(featured desc, publishedAt desc) {
      ${postCardFields}
    }
`)

/** The homepage journal strip — newest three, featured first. */
export const HOME_POSTS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)]
    | order(featured desc, publishedAt desc)[0...3] {
      ${postCardFields}
    }
`)

/**
 * Images inside a rich-text body are references until they are expanded
 * here — without this the renderer receives an asset `_ref` and silently
 * drops every inline image.
 */
const bodyWithImages = /* groq */ `
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{ url, metadata { lqip } }
    }
  }
`

export const POST_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug][0] {
    ${postCardFields},
    ${bodyWithImages},
    "author": author->{ name, role, bio, "imageUrl": image.asset->url },
    "categories": categories[]->{ _id, title, "slug": slug.current },
    seo
  }
`)

/** Same category first, then anything else recent. Never the post itself. */
export const RELATED_POSTS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current) && slug.current != $slug]
    | order(count(categories[@._ref in $categoryIds]) desc, publishedAt desc)[0...3] {
      ${postCardFields}
    }
`)

export const POST_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)].slug.current
`)

export const ABOUT_QUERY = defineQuery(/* groq */ `
  *[_type == "aboutPage"][0] {
    title,
    heroStatement,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    ${bodyWithImages},
    values[]{ _key, title, description },
    promises[]{ _key, label, detail },
    seo
  }
`)

export type PostCard = {
  _id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  readingTime?: number
  featured?: boolean
  coverUrl?: string
  coverAlt?: string
  coverLqip?: string
  category?: { title: string; slug: string } | null
}

export type Post = PostCard & {
  body?: unknown[]
  author?: {
    name: string
    role?: string
    bio?: string
    imageUrl?: string
  } | null
  categories?: { _id: string; title: string; slug: string }[]
  seo?: { title?: string; description?: string }
}

export type AboutPage = {
  title: string
  heroStatement: string
  heroImageUrl?: string
  heroImageAlt?: string
  body?: unknown[]
  values?: { _key: string; title: string; description: string }[]
  promises?: { _key: string; label: string; detail?: string }[]
  seo?: { title?: string; description?: string }
}
