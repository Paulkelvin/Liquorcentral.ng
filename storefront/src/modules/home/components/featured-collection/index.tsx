import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import SectionLink from "@modules/common/components/section-link"
import { Heading, Text } from "@modules/common/components/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { PRODUCT_GRID } from "@modules/products/components/product-grid/grid"
import { ACTIVE_CAMPAIGN } from "./campaign"
import EditorialCard from "./editorial-card"

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
 * **This section used to be a horizontally-scrolling rail, and deliberately
 * so** — one wide editorial card followed by narrower product cards, running
 * off the right edge, with the bleed doing the work of a "there is more" arrow.
 * Paul reversed that directly: he asked for the category pages' grid card
 * across the whole site, horizontal scrolling for products removed, "because
 * it really makes sense, and I like it". That supersedes the earlier note here,
 * which told the next reader *not* to make the cards fit. It is recorded rather
 * than deleted because the old instruction was emphatic and someone finding
 * this row in a grid could reasonably think it had regressed. It has not.
 *
 * What survives the change is the composition: the editorial card still leads,
 * now as a full-width banner in the grid's first row rather than as the first
 * item in a track. Keeping it inside the grid rather than floating it above
 * means one set of gaps governs the whole section.
 *
 * **The product limit is 6, down from 8** — a cap, not a count. It is the
 * largest number that fills the shared grid cleanly at both widths (three rows
 * of two on a phone, two rows of three from `small:` up) if the collection is
 * big enough. The seeded campaign collection holds four, so today it renders
 * four and the desktop row is 3+1; that is a content decision, not a layout
 * one, and partial final rows are normal on the category pages too.
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
      limit: 6,
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
    // **This band was `ink-100` and is now the page's own `surface`.** The
    // tint existed to make the old white, bordered cards read as sitting *on*
    // something. Those cards are gone: the product card is borderless and
    // draws its image on an `ink-100` tile, so on an `ink-100` band the tile
    // and the background were the same colour and every card lost its tile —
    // the one thing carrying the card now that there is no border.
    //
    // Separation from "Shop by category" directly above is carried instead by
    // the editorial banner, which opens this section with a full-width
    // photograph. Do not put the tint back without also moving the card's
    // tile; the two are a pair.
    <section
      aria-labelledby="featured-collection-heading"
      className="w-full bg-surface"
    >
      <div className="ds-container py-12 small:py-16">
        {/* `justify-between` inside `ds-container` is what right-aligns the
            link: the container's content box is the same box the grid starts
            from, so the link's right edge and the grid's last column share one
            line. */}
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
            <Text className="mt-1 text-text-secondary">
              Chosen by us, not by an algorithm.
            </Text>
          </div>
          <SectionLink href={href}>See the collection</SectionLink>
        </div>

        {/* `col-span-full` rather than a fixed `col-span-2`/`col-span-3` pair:
            the banner then spans whatever the grid is currently doing, so
            adding or removing a column upstream cannot leave it half a row
            wide. */}
        <ul className={PRODUCT_GRID}>
          <li className="col-span-full">
            <EditorialCard campaign={ACTIVE_CAMPAIGN} />
          </li>
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
