/**
 * The editorial campaign shown in the Featured Collection section.
 *
 * **This is the only file that changes between campaigns.** The layout,
 * card structure and behaviour in `index.tsx` never change — swap the values
 * here (and drop a new image into `public/brand/campaigns/`) and the section
 * re-skins itself. That was an explicit requirement: "Do not hardcode
 * 'Weekend Collection' … the layout should never change. Only the campaign
 * image and text should change."
 *
 * `collectionHandle` decides which real products appear beside the editorial
 * card, so the campaign and the merchandise can never drift apart — pointing
 * this at a different Medusa Collection changes both at once.
 *
 * Candidate campaigns, kept here so the next person doesn't have to invent
 * one from nothing:
 *   Wine & Spirits — Weekend Collection · Celebrate Tonight · Rare Finds ·
 *                    Premium Selection · Staff Picks · Dinner Party Essentials
 *   Food Central   — Chef's Specials · Dinner Tonight · Fresh Today ·
 *                    Made Fresh Daily · Family Feast · Weekend Kitchen
 */
export type Campaign = {
  /** Medusa Collection handle. Decides where "See the collection" goes, and
   *  supplies the products when `productHandles` is not set. */
  collectionHandle: string
  /**
   * The exact products shown, in this order.
   *
   * **Optional, and it overrides the collection.** Paul asked for six cards
   * on the homepage, and the seeded campaign collection holds four — so
   * without this the row could only be fixed by editing the collection in
   * Medusa Admin, which is not something you can do from the repo. Listing
   * handles here makes the row editable in one line, which was the explicit
   * requirement: "the most important thing is that we can easily change them
   * later."
   *
   * Order is honoured. Medusa returns products in its own order, so
   * `index.tsx` re-sorts the response to match this list — otherwise
   * rearranging these lines would appear to do nothing.
   *
   * A handle that does not exist is skipped rather than rendering a hole, so
   * a typo costs a card, not the section. Leave this out entirely to go back
   * to "whatever is in the collection".
   */
  productHandles?: string[]
  /** Small label above the title. Keep it to two or three words. */
  eyebrow: string
  title: string
  /** One sentence. The photograph is doing the selling, not this. */
  description: string
  ctaLabel: string
  /** Landscape, ~3:2. See `CAMPAIGN_IMAGE_BRIEF.md` in that folder. */
  image: string
  /** Never decorative — this photo carries meaning, so it needs real alt text. */
  imageAlt: string
  /** Where the CTA goes. Defaults to the collection listing if omitted. */
  href?: string
}

export const ACTIVE_CAMPAIGN: Campaign = {
  collectionHandle: "featured-wines-spirits",
  eyebrow: "Liquor",
  title: "Weekend Collection",
  description:
    "Curated bottles for slow evenings and unforgettable gatherings.",
  ctaLabel: "Explore Collection",
  // Explicit, rather than the default `/collections/${collectionHandle}` —
  // the seeded "Featured Liquor" collection holds only 4 real products
  // while this campaign's `productHandles` below shows 6, so following the
  // default CTA landed a shopper on a page that looked like it had lost
  // two bottles. Sends to the full liquor catalog instead — a genuine "see
  // everything" the homepage otherwise has no other link to, since the
  // header's own catalog entry is the mega-menu dropdown, not a page link.
  href: "/store",
  image: "/brand/campaigns/weekend-collection.jpg",
  imageAlt:
    "Three unlabelled bottles — whisky, red wine and a clear spirit — grouped on dark stone under low, warm light",
  // Six, chosen for spread rather than for price: a red, a sparkling, a
  // cognac, two whiskies and an agave spirit, so the row reads as a range
  // rather than as one shelf. Reorder or replace freely — the row follows
  // this list exactly.
  productHandles: [
    "chateau-margaux-2015",
    "dom-perignon-vintage-2013",
    "hennessy-vsop",
    "macallan-12-double-cask",
    "johnnie-walker-blue-label",
    "patron-silver-tequila",
  ],
}
