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
/**
 * The right-hand visual panel. Real product/lifestyle photography direction
 * is BRAND_IDENTITY.md §15–16's own open item, not something to invent here
 * by picking one catalog product's bottle shot to represent the whole
 * brand — that's a curation/marketing decision, not an engineering one. Per
 * the Design Audit's own explicit guidance ("never gray boxes or broken
 * image icons... use high-quality placeholders that establish the intended
 * visual language"), this is a warm, restrained abstract composition built
 * entirely from the existing brand tokens — never a literal photo — so the
 * hero has real visual presence today and swaps cleanly for real
 * photography later without any layout change.
 */
function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full aspect-[4/5] small:aspect-square rounded-radius-lg overflow-hidden bg-ink-900"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, var(--brand-gold) 0%, transparent 45%), radial-gradient(circle at 75% 75%, var(--brand-red) 0%, transparent 55%), linear-gradient(160deg, var(--ink-900) 0%, var(--ink-700) 100%)",
          opacity: 0.9,
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="200" cy="200" r="120" fill="none" stroke="var(--brand-off-white)" strokeWidth="1" />
        <circle cx="200" cy="200" r="170" fill="none" stroke="var(--brand-off-white)" strokeWidth="1" />
        <circle cx="200" cy="200" r="70" fill="none" stroke="var(--brand-gold)" strokeWidth="1" />
      </svg>
    </div>
  )
}

export default function Hero() {
  return (
    <div className="w-full border-b border-border bg-surface">
      <div className="ds-container grid grid-cols-1 small:grid-cols-2 items-center gap-10 py-16 small:py-24">
        <div className="flex flex-col gap-6 text-center small:text-left items-center small:items-start order-2 small:order-1">
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
              href="/store"
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
        <div className="order-1 small:order-2 w-full max-w-md small:max-w-none mx-auto">
          <HeroVisual />
        </div>
      </div>
    </div>
  )
}
