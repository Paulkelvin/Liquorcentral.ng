import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionLink from "@modules/common/components/section-link"
import { Heading, Text, clx } from "@modules/common/components/ui"
import { CategoryIcon } from "@modules/common/icons"

/**
 * A browse-by-category row: one circular tile per top-level category,
 * plus Food Central.
 *
 * `02_HOMEPAGE_SPECIFICATION.md` **§8.10** — added by that document's v1.1
 * amendment on Paul's explicit instruction. Note the section number is out of
 * page order: this row is fourth on the page (§7 item 4) but numbered §8.10
 * because §8.4–§8.9 are cited by five other frozen specifications and by
 * source elsewhere in this repo, so inserting would have invalidated them all.
 *
 * It sits between the Hero and Curated Collections on purpose, and §8.10 is
 * explicit that this must not move: §4 still wants curation to be the Guided
 * Browser's entry point, so this row is an *addition* ahead of it, never a
 * replacement for §8.4. Placing it after Curated Collections would contradict
 * §4.
 *
 * Data-driven from the real Medusa category tree, the same source the mega
 * menu uses — so a category added in Admin appears here with no code change,
 * and one removed disappears.
 *
 * The glyphs used to be drawn inline here. They now live in
 * `@modules/common/icons`, because the mobile drawer was rendering an entirely
 * different icon for the same category — see that module's note.
 */

type Tile = { handle: string; name: string; href: string; foodCentral?: boolean }

function CategoryTile({ tile }: { tile: Tile }) {
  return (
    <LocalizedClientLink
      href={tile.href}
      // `group` so the circle can respond to a hover anywhere on the tile,
      // including the label — a 44px-tall word is an easier target than a
      // circle alone, especially on touch.
      className="group flex w-full shrink-0 flex-col items-center gap-3 small:w-auto"
      data-testid="category-tile"
    >
      <span
        className={clx(
          // The circle *scales* on mobile — see the note on the `<ul>`. A
          // fixed diameter cannot satisfy both "three and a half tiles fit"
          // and "the first circle sits on the heading's line" at every phone
          // width; freeing it is what makes both true at once. 56px at 320,
          // 76px at 390 (the old fixed value was 72), 87px at 430.
          "inline-flex h-[calc((100vw-124px)/3.5)] w-[calc((100vw-124px)/3.5)] items-center justify-center rounded-radius-full transition-colors duration-standard ease-in-out small:h-20 small:w-20",
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
        <CategoryIcon handle={tile.handle} size={32} className="small:h-9 small:w-9" />
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
  // deliberately static route, so it is added by hand rather than being
  // absent from a data-driven row that claims to show everything on sale.
  // Leads the row (Paul's direct instruction) rather than trailing the
  // data-driven categories, so it's the tile that's already fully visible
  // rather than the half-cut one at the edge of the mobile scroll strip.
  const tiles: Tile[] = [
    { handle: "food-central", name: "Food Central", href: "/food-central", foodCentral: true },
    ...topLevel,
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
            {/* `text-secondary`, matching the other two section subtitles.
                `muted` passes contrast here (this section is on the
                untinted page) but not on the tinted bands below, so
                keeping it would have made one of three headers a
                different colour for a reason invisible on this section. */}
            <Text className="mt-1 text-text-secondary">
              Everything we sell, sourced and delivered by us.
            </Text>
          </div>
          <SectionLink href="/store">View all</SectionLink>
        </div>

        {/* Scrolls horizontally on a phone rather than wrapping to three
            ragged rows, and becomes an evenly-spread row once there is width
            for it. This is the one row on the page that still scrolls: Paul
            removed horizontal scrolling for *products*, and asked for this
            strip to keep it and to advertise it more clearly.

            **Exactly three and a half tiles fit the viewport, at every phone
            width, and the half is the point.** A tile cut cleanly in half at
            the right edge is unambiguously "there is more this way"; the
            previous fixed 92px column happened to leave ~65% of the fourth
            tile showing at 390px, which reads as a tile that didn't quite fit
            rather than as an invitation. Nothing about it held at other
            widths either — at 360px it left 40%, at 430px it left 88%.

            The sizing below is the solution to that constraint. Two things
            have to be true at once:

              L + 3.5w + 3g = 100vw        (three and a half tiles fit)
              L + i = 16px                 (first circle on the heading's line)

            `w` is the column, `g` the 16px gap, `L` the strip's left padding,
            and `i` the circle's inset inside its own column — because what
            the eye lines up against the heading is the *circle*, not the
            column, and the column is wider than the circle so labels like
            "Champagne" have room. Three gaps, not 3.5: the half-visible
            fourth tile is preceded by three whole ones.

            **The circle's diameter has to be free for both to hold.** With it
            pinned at 72px the system is over-determined, and the first
            attempt here — solving for `w` alone — drove `L` negative above
            ~414px, where it silently clamps to 0 and the circle lands 3px
            right of the heading. Measured, not predicted.

            So `i` is fixed at 10px instead (making `L` 6px, which is where
            this file's old `pl-[6px]` came from), `w = C + 2i`, and

              C = (100vw − 124px) / 3.5

            Substituting back: 3.5(C + 20) + 48 + 6 = 3.5C + 124 = 100vw. ✓
            The circle then runs 56px at 320 to 87px at 430, passing through
            76px at 390 — near the 72px it replaces, so the common case barely
            moves. If the gap or the 10px inset changes, both `calc`s change
            with them.

            **`100vw`, not `100%`.** The `ul` is a flex scroll container, so a
            percentage on the `li` resolves against the *scrollable* content
            box, not the visible one — it would size against all seven tiles.
            `vw` is safe here because this rule is scoped to mobile, where
            there is no classic scrollbar to make `vw` overshoot; `small:`
            resets everything to the evenly-spread row.

            `pr-4` still keeps the *seventh* tile clear of the edge once the
            strip is scrolled to the end — that is the resting state at the
            far right, and a tile jammed against the bezel there looks
            clipped rather than deliberate. */}
        <ul className="-mx-4 flex gap-4 overflow-x-auto pb-2 pl-[6px] pr-4 small:mx-0 small:justify-between small:gap-2 small:overflow-visible small:px-0 small:pb-0">
          {tiles.map((tile) => (
            <li
              key={tile.handle}
              className="w-[calc((100vw-124px)/3.5+20px)] shrink-0 small:w-auto"
            >
              <CategoryTile tile={tile} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
