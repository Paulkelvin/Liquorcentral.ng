import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.4 — one or more named, editorially
 * curated Wine & Spirits shelves. §19's empty state: "No curated
 * collection configured: falls back to a general 'Shop Wine & Spirits'
 * link rather than rendering an empty or broken shelf." No collections
 * exist yet in this catalog (the exact set is an open merchandising
 * decision, §24), so this always renders the fallback today — the
 * fallback path is real, not a placeholder, and shelves appear
 * automatically the moment a Collection is created, with no code change.
 */
export default async function CuratedCollections({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  const { collections } = await listCollections({ limit: "2" })

  if (!region) {
    return null
  }

  if (collections.length === 0) {
    return (
      <div className="content-container py-12 small:py-24 text-center">
        <Text muted className="mb-4">
          Curated collections are coming soon.
        </Text>
        <LocalizedClientLink
          href="/categories"
          className="txt-medium-plus text-text-primary underline hover:text-interactive"
        >
          Shop Wine &amp; Spirits
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <>
      {collections.map((collection) => (
        <ProductRail
          key={collection.id}
          collection={collection}
          region={region}
        />
      ))}
    </>
  )
}
