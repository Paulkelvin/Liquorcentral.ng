import { Metadata } from "next"
import { Suspense } from "react"

import Hero from "@modules/home/components/hero"
import CuratedCollections from "@modules/home/components/curated-collections"
import FoodCentralSpotlight from "@modules/home/components/food-central-spotlight"
import TrustDeliveryBand from "@modules/home/components/trust-delivery-band"
import ReturningCustomerStrip from "@modules/home/components/returning-customer-strip"

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
      <Suspense fallback={null}>
        <CuratedCollections countryCode={countryCode} />
      </Suspense>
      <Suspense fallback={null}>
        <FoodCentralSpotlight countryCode={countryCode} />
      </Suspense>
      <TrustDeliveryBand />
      <Suspense fallback={null}>
        <ReturningCustomerStrip />
      </Suspense>
    </>
  )
}
