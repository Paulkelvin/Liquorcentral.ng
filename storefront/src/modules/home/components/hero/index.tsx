import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.3 — one brand statement, two clearly
 * weighted entry points, no auto-rotating carousel (current research is
 * unambiguous that carousels harm both engagement and LCP — see the
 * spec's own Sources). Both entry points are real links (§8.3
 * accessibility requirement), never `<div>`-based fake controls.
 *
 * Copy is Paul's own finalized text, not invented here: the headline is
 * `BRAND_IDENTITY.md` §10's Positioning Statement (itself flagged there
 * as "candidate for direct or near-direct use in... hero copy"); the
 * supporting line is §11's Value Proposition ("candidate for near-literal
 * use in early homepage copy"). Neither has had a copywriting pass yet
 * (§11 itself calls its text "a functional draft, not final marketing
 * copy") — using them as-is here rather than paraphrasing keeps this
 * component honest about that, instead of inventing a third version.
 */
export default function Hero() {
  return (
    <div className="w-full border-b border-border bg-surface">
      <div className="content-container flex flex-col items-center text-center gap-6 py-24 small:py-32">
        <Heading level="h1" display className="text-heading-1 max-w-2xl">
          Nigeria&rsquo;s premium destination for curated wines, spirits,
          and complementary culinary experiences.
        </Heading>
        <Text muted className="max-w-xl">
          Premium wine and spirits, delivered nationwide. Fresh Nigerian
          food, cooked to order and delivered fast in Lagos. Always sold
          and delivered by us — never a stranger.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full max-w-md">
          <LocalizedClientLink
            href="/categories"
            className="flex-1 inline-flex items-center justify-center rounded-radius-md font-medium bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            data-testid="hero-wine-spirits-link"
          >
            Shop Wine &amp; Spirits
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/food-central"
            className="flex-1 inline-flex items-center justify-center rounded-radius-md font-medium border border-border text-text-primary hover:bg-surface-elevated px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            data-testid="hero-food-central-link"
          >
            Order from Food Central
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
