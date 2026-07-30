import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/common/components/ui"
import { ACTIVE_CAMPAIGN } from "./campaign"
import EditorialCard from "./editorial-card"
import EditorialProductCard from "./editorial-product-card"

/**
 * `02_HOMEPAGE_SPECIFICATION.md` §8.4 (Curated Collections), given the
 * editorial treatment Paul approved.
 *
 * This is §8.4's job — "one or more named, editorially curated shelves" —
 * rendered as a magazine spread rather than another product grid. It replaces
 * the previous presentation (a plain heading over a rail) rather than being
 * added alongside it: two adjacent curated sections would have produced
 * exactly the database-driven feel the direction exists to avoid.
 *
 * **The composition is asymmetric on purpose.** One wide editorial card, then
 * narrower product cards, in a single horizontally-scrolling row that runs off
 * the right edge of the viewport. The first product card is therefore always
 * partly cut at desktop widths — that is the intended "bleed," and it does two
 * things at once: it signals there is more to scroll without needing an arrow
 * control, and it stops the row resolving into a tidy symmetrical grid.
 *
 * Because of that, **do not "fix" the row by making the cards fit.** A layout
 * where every card lands neatly inside the container is the failure state
 * here, not the goal.
 *
 * The campaign — image, title, copy, and which collection's products appear —
 * lives entirely in `campaign.ts`. Nothing in this file needs to change to run
 * a different campaign.
 */
export default async function FeaturedCollection({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const { collections } = await listCollections({
    handle: ACTIVE_CAMPAIGN.collectionHandle,
    limit: "1",
  }).catch(() => ({ collections: [] as { id: string; handle: string }[] }))

  const collection = collections?.[0]
  if (!collection) {
    // §19's empty-state discipline: with no collection configured the section
    // does not render. It deliberately does not fall back to "any products we
    // happen to have" — an editorial card promising a curated selection, over
    // an arbitrary query, is a claim the page cannot keep.
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: [collection.id],
      limit: 8,
      // `food_details` decides each card's catalog label and quick-add accent;
      // without it a dish in a mixed collection renders as a wine card.
      fields: "*variants.calculated_price,+food_details.*",
    },
  }).catch(() => ({ response: { products: [] as never[] } }))

  if (!products?.length) {
    return null
  }

  const href = ACTIVE_CAMPAIGN.href ?? `/collections/${collection.handle}`

  return (
    <section
      aria-labelledby="featured-collection-heading"
      className="w-full bg-surface"
    >
      <div className="ds-container pt-4 pb-12 small:pt-6 small:pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <Heading
              level="h2"
              display
              id="featured-collection-heading"
              className="!text-[24px] font-semibold tracking-[-0.01em] text-text-primary small:!text-[30px]"
            >
              Featured collection
            </Heading>
            <Text muted className="mt-1">
              Chosen by us, not by an algorithm.
            </Text>
          </div>
          <LocalizedClientLink
            href={href}
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-text-primary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-interactive"
          >
            See the collection
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* The negative margin plus matching padding lets the row bleed to the
            screen edge while the first card still lines up with the container
            — so the cut card reads as "the row continues" rather than as a
            layout that overflowed by accident. `pb-4` leaves room for the
            hover lift and the card shadow, which a tight `overflow-x` would
            otherwise clip mid-animation. */}
        <ul className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 small:-mx-6 small:px-6">
          <li className="snap-start">
            <EditorialCard campaign={ACTIVE_CAMPAIGN} />
          </li>
          {products.map((product) => (
            <li key={product.id} className="snap-start">
              <EditorialProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
