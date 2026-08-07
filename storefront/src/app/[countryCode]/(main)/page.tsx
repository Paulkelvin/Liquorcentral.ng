import { Metadata } from "next"
import { Suspense } from "react"

import Hero from "@modules/home/components/hero"
import CategoryBrowse from "@modules/home/components/category-browse"
import FeaturedCollection from "@modules/home/components/featured-collection"
import PairingBanner from "@modules/home/components/pairing-banner"
import FoodCentralSpotlight from "@modules/home/components/food-central-spotlight"
import ReturningCustomerStrip from "@modules/home/components/returning-customer-strip"
import JournalStrip from "@modules/home/components/journal-strip"

export const metadata: Metadata = {
  title: "LiquorCentral — Nigeria's Premium Wine, Spirits & Food Central",
  description:
    "Nigeria's premium destination for curated wines, spirits, and complementary culinary experiences — sold and delivered directly by LiquorCentral.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * 02_HOMEPAGE_SPECIFICATION.md §7 — section order. The persistent
 * header/shell (§8.1) and footer (§8.9) live in the shared `(main)`
 * layout, not here; the Age Verification Gate (§8.2) is also mounted in
 * that layout so it's genuinely site-wide (§24), not homepage-only.
 * "Wine & Food, Connected" (§8.6) is deliberately absent: its backend
 * "pairs with" relationship doesn't exist yet (`MEDUSA_EXTENSIONS.md`'s
 * own open item), and §19 is explicit that with no pairing content
 * configured, the section "does not render rather than showing a broken
 * or placeholder pairing."
 *
 * Each section fails independently (§21) — they're separate `async`
 * components under their own `Suspense` boundaries where they fetch
 * live data, so one section's data failure can't blank the rest of the
 * page.
 */
export default async function Home({ params }: Props) {
  const { countryCode } = await params

  return (
    <>
      <Hero />
      {/* §7 item 4, behaviour in §8.10 (numbered out of sequence — see that
          document's amendment note). Must stay ahead of Curated Collections:
          §8.10 states that moving it after, or letting it replace §8.4, would
          contradict §4's curation-first intent for the Guided Browser. */}
      <Suspense fallback={null}>
        <CategoryBrowse />
      </Suspense>
      {/* §8.4 Curated Collections, in the editorial treatment Paul approved.
          Replaces the previous plain-rail presentation rather than sitting
          beside it — two adjacent curated sections would read as exactly the
          database-driven page the direction exists to avoid. */}
      <Suspense fallback={null}>
        <FeaturedCollection countryCode={countryCode} />
      </Suspense>
      <Suspense fallback={null}>
        {/* Between the cellar and the kitchen — the one section that spans
          both catalogs in a single action. */}
      <PairingBanner countryCode={countryCode} />
      <FoodCentralSpotlight countryCode={countryCode} />
      </Suspense>
      {/* Editorial before the returning-customer prompt: it earns trust,
          which is what makes the prompt after it worth answering. Its own
          boundary, so a Sanity outage cannot blank the commerce sections
          above it (§21). */}
      <Suspense fallback={null}>
        <JournalStrip />
      </Suspense>
      <Suspense fallback={null}>
        <ReturningCustomerStrip />
      </Suspense>
    </>
  )
}
