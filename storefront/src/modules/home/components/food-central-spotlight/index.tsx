import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import NotTakingOrders from "@modules/food-central/components/not-taking-orders"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Heading, Text } from "@modules/common/components/ui"
import DishCard from "./dish-card"

/**
 * 02_HOMEPAGE_SPECIFICATION.md §8.5 — a small snapshot of today's menu,
 * not the full menu, with a direct link into Food Central. §19's empty
 * state: "Kitchen closed / no available menu items: shows a clear 'not
 * currently taking orders' message... rather than an empty grid" — this
 * project has never seeded a single product of either catalog (field-list
 * decisions are still open, `docs/PROJECT_STATUS.md`), so this always
 * renders that state today, via the same `NotTakingOrders` component
 * `01_NAVIGATION_SPECIFICATION.md`'s Food Central destinations already
 * use, not a second, duplicate empty-state implementation.
 *
 * `PRODUCT_CATALOG.md` models both catalogs as ordinary Products
 * distinguished by which attribute module they're linked to (a dish has
 * `food_details`, a wine has `wine_details`) — not a "Food Central"
 * Product Category (`01_NAVIGATION_SPECIFICATION.md`'s own seed script
 * deliberately doesn't create one; see its comment). Filtering on
 * `+food_details.*` is the correct, already-established mechanism.
 */
export default async function FoodCentralSpotlight({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100, fields: "+food_details.*" },
  })

  const foodProducts = response.products
    .filter(
      (product) => (product as unknown as { food_details?: unknown }).food_details
    )
    .slice(0, 4)

  return (
    // A warm sand band, so the kitchen reads as a different kind of section
    // from the retail rows around it. It is `surface-warm` rather than
    // `ink-100` because the Featured Collection band directly above already
    // uses `ink-100` — reusing it would merge the two into one long tinted
    // block instead of two sections.
    <section
      aria-labelledby="todays-menu-heading"
      className="w-full bg-surface-warm"
      data-testid="todays-menu"
    >
      <div className="ds-container py-12 small:py-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <Heading
              level="h2"
              display
              id="todays-menu-heading"
              className="!text-[24px] font-semibold tracking-[-0.01em] text-text-primary small:!text-[30px]"
            >
              Today&rsquo;s Menu
            </Heading>
            {/* `text-secondary`, not `muted`. On this warm tint `muted`
                (ink-500) measures 4.45:1 — under the 4.5 floor, and caught
                by a live axe run rather than by eye. Any tinted band lowers
                the contrast ceiling; the same swap was needed on the
                Featured Collection's band for the same reason. */}
            <Text className="mt-1 text-text-secondary">
              Cooked to order, delivered across Lagos.
            </Text>
          </div>
          <InteractiveLink href="/food-central">
            View Food Central
          </InteractiveLink>
        </div>

        {foodProducts.length === 0 ? (
          <NotTakingOrders title="Today's Menu" />
        ) : (
          /* A snapping horizontal row on a phone, a plain grid from
             `small:` up.

             `basis-[78%]` is what puts ~1.2 cards on screen: the next card
             is deliberately cut by the viewport's right edge, which is the
             affordance telling the customer the row scrolls. `-mr-4` +
             `pr-4` bleeds it to that edge; there is no matching left
             margin, because with `snap-mandatory` the browser snaps the
             first item to the scrollport edge on load and would scroll a
             left padding away — the same trap the Featured Collection row
             documents.

             `py-4` (not `pb-4`) leaves room on both sides for the hover
             lift, which a bottom-only pad clips at the top mid-animation.

             The four-column step is `medium:` (1280), **not** `lg:`.
             Tailwind's `lg` and this project's custom `small` are both
             1024px, so the two rules land in the same media query and the
             winner is decided by emit order, not intent — `lg:grid-cols-4`
             silently lost to `small:grid-cols-3` and the row rendered 3+1.
             Use the project's own scale here. */
          <ul className="-mr-4 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto py-4 pr-4 small:mr-0 small:grid small:grid-cols-3 small:overflow-visible small:pr-0 medium:grid-cols-4">
            {foodProducts.map((product) => (
              <li
                key={product.id}
                className="flex shrink-0 basis-[78%] snap-start xsmall:basis-[46%] small:basis-auto"
              >
                <DishCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
