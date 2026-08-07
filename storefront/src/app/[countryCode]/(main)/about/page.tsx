import { Metadata } from "next"
import Image from "next/image"

import { sanityFetch } from "../../../../sanity/client"
import { ABOUT_QUERY, AboutPage } from "../../../../sanity/queries"
import PortableText from "@modules/blog/components/portable-text"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EmptyState from "@modules/common/components/empty-state"

export async function generateMetadata(): Promise<Metadata> {
  const about = await sanityFetch<AboutPage>({
    query: ABOUT_QUERY,
    tags: ["aboutPage"],
  })

  return {
    title: `${about?.seo?.title || about?.title || "About"} | LiquorCentral`,
    description: about?.seo?.description || about?.heroStatement,
  }
}

/**
 * The company page, driven entirely by Sanity — `01_NAVIGATION_SPECIFICATION.md`
 * §8's footer "Company/Trust" destination, and `PRODUCT_BLUEPRINT.md` §11's
 * "legitimacy content". This used to be a placeholder because the copy
 * was nobody's to invent; it now renders whatever the CMS holds, so the
 * page changes without a deploy.
 */
export default async function AboutPageRoute() {
  const about = await sanityFetch<AboutPage>({
    query: ABOUT_QUERY,
    tags: ["aboutPage"],
  })

  if (!about) {
    return (
      <div className="ds-container py-16">
        <EmptyState
          title="About LiquorCentral"
          description="This page is being written. Please check back shortly."
        />
      </div>
    )
  }

  return (
    <>
      {/* The hero statement is set at display scale on the warm sand
          band — one sentence carrying the whole positioning, which is
          what the brand documents ask this page to do before it explains
          anything. */}
      <header className="border-b border-divider bg-surface-warm py-16 small:py-24">
        <div className="ds-container">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {about.title}
          </p>
          <p className="max-w-4xl font-display text-[30px] leading-[1.2] text-text-primary small:text-[52px]">
            {about.heroStatement}
          </p>
          <span className="mt-8 block h-px w-16 bg-accent" />
        </div>
      </header>

      {about.heroImageUrl && (
        <div className="ds-container -mt-8 small:-mt-12">
          <div className="relative aspect-[21/9] overflow-hidden rounded-radius-md bg-surface-warm shadow-elevation-2">
            <Image
              src={about.heroImageUrl}
              alt={about.heroImageAlt || ""}
              fill
              priority
              sizes="(min-width: 1024px) 1280px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {!!about.promises?.length && (
        // Checkable commitments, not slogans. Each one is something the
        // company can be held to, which is the point of putting them
        // above the prose rather than below it.
        <section className="ds-container py-12 small:py-16">
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-radius-md border border-divider bg-divider sm:grid-cols-2 small:grid-cols-4">
            {about.promises.map((promise) => (
              <li
                key={promise._key}
                className="bg-surface-elevated p-5"
                data-testid="about-promise"
              >
                <p className="text-[15px] font-semibold leading-snug text-text-primary">
                  {promise.label}
                </p>
                {promise.detail && (
                  <p className="mt-1.5 text-caption text-text-secondary">
                    {promise.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="ds-container pb-4">
        <div className="mx-auto max-w-[68ch]">
          <PortableText value={about.body} />
        </div>
      </section>

      {!!about.values?.length && (
        <section className="border-t border-divider bg-surface-warm py-14 small:py-20">
          <div className="ds-container">
            <h2 className="font-display text-[26px] text-text-primary small:text-[34px]">
              What we hold to
            </h2>
            <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 small:grid-cols-3">
              {about.values.map((value) => (
                <div key={value._key} data-testid="about-value">
                  <dt className="font-display text-[20px] text-text-primary">
                    {value.title}
                  </dt>
                  <dd className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                    {value.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="ds-container py-14 small:py-20">
        <div className="flex flex-col items-start gap-6 rounded-radius-md border border-divider bg-surface-elevated p-8 small:flex-row small:items-center small:justify-between small:p-10">
          <div>
            <h2 className="font-display text-[24px] text-text-primary small:text-[30px]">
              Start with a bottle, or dinner.
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-text-secondary">
              Wine and spirits ship nationwide. Food is cooked to order and
              delivered across Lagos.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex min-h-[48px] items-center justify-center rounded-radius-md bg-primary px-6 text-body font-medium text-surface-elevated transition-colors duration-standard ease-in-out hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              Shop wine &amp; spirits
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/food-central"
              className="inline-flex min-h-[48px] items-center justify-center rounded-radius-md border border-border px-6 text-body font-medium text-text-primary transition-colors duration-standard ease-in-out hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              Today&apos;s menu
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}
