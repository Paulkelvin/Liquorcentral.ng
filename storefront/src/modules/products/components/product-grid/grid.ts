/**
 * The one product grid.
 *
 * `04_PRODUCT_LISTING_SPECIFICATION.md` §9 says the product card is "specified
 * once, here, and referenced everywhere else — no page redefines it
 * independently". That held for the *card* but not for the *grid*: four
 * listings had each written their own column and gap classes, which is how the
 * homepage ended up with horizontally-scrolling rails while the category pages
 * used a grid. Paul asked for one treatment everywhere, so the layout is now a
 * single exported string for the same reason `CARD_SHELL` is — two copies of a
 * rule drift, one cannot.
 *
 * **`small:`, not `lg:`.** Tailwind's `lg` and this project's custom `small`
 * are both 1024px, so rules written with the two land in the same media query
 * and the winner is decided by emit order rather than by intent. Use the
 * project's own scale here; `lg:grid-cols-4` has already been silently lost
 * once to `small:grid-cols-3`.
 *
 * Two columns on a phone, three from 1024 up — the proportions Paul reviewed
 * and approved on the category pages. A fourth column at `medium:` was
 * deliberately *not* added: it would shrink every card below the size the
 * approved screenshots were judged at.
 */
export const PRODUCT_GRID =
  "grid w-full grid-cols-2 gap-x-3 gap-y-6 small:grid-cols-3 small:gap-x-6 small:gap-y-8"
