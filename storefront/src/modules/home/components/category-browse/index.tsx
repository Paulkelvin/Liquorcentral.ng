import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text, clx } from "@modules/common/components/ui"

/**
 * A browse-by-category row: one circular tile per top-level category,
 * plus Food Central.
 *
 * **This section is not in `02_HOMEPAGE_SPECIFICATION.md`.** That document's
 * §7 lists nine sections and this is not among them; §4 in fact deliberately
 * chose curated shelves *over* "a raw category list" for the Guided Browser,
 * and §22's v1 scope doesn't include it. It exists because Paul asked for it
 * directly, which `DOCUMENTATION_GOVERNANCE.md` §5 treats as the one thing
 * that may change a frozen specification. Logged in `DECISION_LOG.md`.
 *
 * It sits between the Hero and Curated Collections on purpose: broad,
 * self-directed entry first for the visitor who already knows what they
 * want, then editorial curation for the one who doesn't. That ordering keeps
 * §4's intent intact rather than replacing it.
 *
 * Data-driven from the real Medusa category tree, the same source the mega
 * menu uses — so a category added in Admin appears here with no code change,
 * and one removed disappears. Only the icon lookup is local, and it falls
 * back gracefully for a handle it doesn't recognise.
 */

/** Consistent 1.5 stroke, 24px box, no fills — `BRAND_IDENTITY.md` §18. */
const ICONS: Record<string, React.ReactNode> = {
  wines: (
    <>
      <path d="M9 3h6v5a3 3 0 0 1-3 3 3 3 0 0 1-3-3V3Z" />
      <path d="M12 11v7" />
      <path d="M9 21h6" />
    </>
  ),
  // A flute, not a wine glass: tall and narrow, which is the only thing
  // distinguishing it from `wines` at this size. An earlier version added
  // bubble ticks beside the bowl and they read as a flag on a pole.
  champagne: (
    <>
      <path d="M9.5 3h5l-.6 8.5a1.9 1.9 0 0 1-3.8 0L9.5 3Z" />
      <path d="M12 13.5V20" />
      <path d="M9.5 20h5" />
    </>
  ),
  spirits: (
    <>
      <path d="M10 2h4v3l3 5v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l3-5V2Z" />
      <path d="M7 13h10" />
    </>
  ),
  beer: (
    <>
      <path d="M5 8h11v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8Z" />
      <path d="M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <path d="M5 8a3 3 0 0 1 3-3 3 3 0 0 1 5-1 3 3 0 0 1 3 4" />
    </>
  ),
  "gift-sets": (
    <>
      <path d="M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" />
      <path d="M2 7h20v4H2z" />
      <path d="M12 7v14" />
      <path d="M12 7S10.5 3 8.5 3a2 2 0 0 0 0 4H12Zm0 0s1.5-4 3.5-4a2 2 0 0 1 0 4H12Z" />
    </>
  ),
  // A corkscrew: winged handle, shaft, helix. The previous attempt was a
  // stemmed shape with two uprights and read unmistakably as a plug.
  accessories: (
    <>
      <path d="M12 3v5" />
      <path d="M7.5 5.5h9" />
      <path d="M12 8v3" />
      <path d="M12 11c1.8 0 1.8 2 0 2s-1.8 2 0 2 1.8 2 0 2-1.8 2 0 2" />
    </>
  ),
  "food-central": (
    <>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M2 20h20" />
      <path d="M9 8c0-1.5 1-2 1-3.5" />
      <path d="M13 8c0-1.5 1-2 1-3.5" />
    </>
  ),
}

/** A handle this file has no icon for still renders — as a wine glass. */
const FALLBACK_ICON = ICONS.wines

function CategoryIcon({ handle }: { handle: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 small:h-9 small:w-9"
    >
      {ICONS[handle] ?? FALLBACK_ICON}
    </svg>
  )
}

type Tile = { handle: string; name: string; href: string; foodCentral?: boolean }

function CategoryTile({ tile }: { tile: Tile }) {
  return (
    <LocalizedClientLink
      href={tile.href}
      // `group` so the circle can respond to a hover anywhere on the tile,
      // including the label — a 44px-tall word is an easier target than a
      // circle alone, especially on touch.
      className="group flex w-[92px] shrink-0 flex-col items-center gap-3 small:w-auto"
      data-testid="category-tile"
    >
      <span
        className={clx(
          "inline-flex h-[72px] w-[72px] items-center justify-center rounded-radius-full transition-colors duration-standard ease-in-out small:h-20 small:w-20",
          // The tint carries which product line the category belongs to,
          // using the roles `BRAND_IDENTITY.md` §13 already assigns: green is
          // "Food Central emphasis". Wine & Spirits deliberately takes a warm
          // neutral rather than §13's red, because red there is reserved for
          // calls to action — seven red circles above the fold would compete
          // directly with the hero's own primary button.
          tile.foodCentral
            ? "bg-success-tint text-success group-hover:bg-success group-hover:text-surface-elevated"
            : "bg-ink-100 text-ink-900 group-hover:bg-ink-900 group-hover:text-surface-elevated"
        )}
      >
        <CategoryIcon handle={tile.handle} />
      </span>
      <span className="text-center text-caption font-medium leading-snug text-text-primary group-hover:text-interactive">
        {tile.name}
      </span>
    </LocalizedClientLink>
  )
}

export default async function CategoryBrowse() {
  // Failing soft, per §21's "each section fails independently": a category
  // fetch problem should cost this row, never the rest of the homepage.
  const categories = await listCategories({
    fields: "handle,name,rank,parent_category",
    limit: 30,
  }).catch(() => [])

  const topLevel = categories
    .filter((c) => !c.parent_category)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map<Tile>((c) => ({
      handle: c.handle,
      name: c.name,
      href: `/categories/${c.handle}`,
    }))

  // Food Central is not a Medusa category — Milestone 7 established it as a
  // deliberately static route, so it is appended by hand rather than being
  // absent from a data-driven row that claims to show everything on sale.
  const tiles: Tile[] = [
    ...topLevel,
    { handle: "food-central", name: "Food Central", href: "/food-central", foodCentral: true },
  ]

  // One real category plus Food Central is not a browse row worth showing.
  if (topLevel.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="category-browse-heading"
      className="w-full bg-surface"
    >
      <div className="ds-container py-12 small:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <Heading
              level="h2"
              display
              id="category-browse-heading"
              className="!text-[24px] font-semibold tracking-[-0.01em] text-text-primary small:!text-[30px]"
            >
              Shop by category
            </Heading>
            <Text muted className="mt-1">
              Everything we sell, sourced and delivered by us.
            </Text>
          </div>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-text-primary underline underline-offset-4 transition-colors duration-standard ease-in-out hover:text-interactive"
          >
            View all
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* Scrolls horizontally on a phone rather than wrapping to three
            ragged rows, and becomes an evenly-spread row once there is width
            for it. `-mx-*`/`px-*` let the strip bleed to the screen edge while
            keeping the first and last tile clear of it, so a half-cut tile
            signals "more this way" instead of looking clipped. */}
        <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 small:mx-0 small:justify-between small:gap-2 small:overflow-visible small:px-0 small:pb-0">
          {tiles.map((tile) => (
            <li key={tile.handle}>
              <CategoryTile tile={tile} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
