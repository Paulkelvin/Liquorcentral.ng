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
  /** Medusa Collection handle. Its products fill the rest of the row. */
  collectionHandle: string
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
  eyebrow: "Wine & Spirits",
  title: "Weekend Collection",
  description:
    "Curated bottles for slow evenings and unforgettable gatherings.",
  ctaLabel: "Explore Collection",
  image: "/brand/campaigns/weekend-collection.jpg",
  imageAlt:
    "Red wine being poured from a bottle into a glass held over a table",
}
