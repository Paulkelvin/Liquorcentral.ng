/**
 * The 4 products shown in the homepage's "Best sellers" section.
 *
 * **This is the only file that changes to update the row** — same
 * one-file-to-edit convention as `featured-collection/campaign.ts`. Order
 * is honoured (see that file's own note on why: Medusa doesn't return a
 * multi-handle query in request order, so `index.tsx` re-sorts to match
 * this list). A handle that doesn't exist is skipped, not a broken card.
 *
 * Picked for a real, recognisable spread rather than overlapping
 * `campaign.ts`'s picks directly above this section on the page: a
 * whisky, a vodka, a liqueur and a beer, none of which repeat that row's
 * six. Paul asked for names now and will supply real photography later —
 * these are real seeded products, so the row renders with real prices and
 * whatever placeholder photography that product currently has; swapping
 * in better photos is a normal Admin product-image edit, no code change.
 */
export const BEST_SELLER_HANDLES = [
  "jameson-irish-whiskey",
  "grey-goose-vodka",
  "baileys-irish-cream",
  "heineken-lager-crate",
]
