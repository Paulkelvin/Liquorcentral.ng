/**
 * The Perfect Pairing banner's slides.
 *
 * **This is the only file a new pairing touches** — same pattern as the
 * Featured Collection's `campaign.ts`. Layout, transitions and the add-to-cart
 * behaviour never change; the copy, imagery and the two product handles do.
 *
 * ---
 *
 * **Prices are deliberately NOT in this file, and must never be.**
 *
 * Paul's brief specified the CTAs as "Add Pairing to Cart (₦53,500)" and
 * "(₦113,000)". Checked against the live catalog, neither figure matches any
 * real combination:
 *
 * | Stated | Real components | Real total |
 * |---|---|---|
 * | ₦53,500 | Asun ₦9,500 + Glenfiddich 12 ₦54,000 | **₦63,500** |
 * | ₦113,000 | Grilled Tilapia ₦8,500 + Veuve Clicquot ₦68,000 | **₦76,500** |
 *
 * A button that announces one price and then puts a different total in the
 * cart is a misleading price representation — prohibited under the FCCPA,
 * and against `BRAND_IDENTITY.md` §5's "structured honesty" besides. It is
 * also the exact failure mode this project's server-authoritative money rule
 * exists to prevent.
 *
 * So the component computes each pairing's total from the *region-priced
 * variants it is about to add*, at render time. Change a price in Admin and
 * the button follows it. There is no number here to drift.
 *
 * ---
 *
 * **⚠️ Slide 2's dish is a stand-in and needs Paul's decision.**
 *
 * The brief asks for "Seafood Okro & Chilled Champagne". **There is no
 * Seafood Okro in the catalog** — it has never been seeded. A slide headed
 * "Seafood Okro" whose button adds Grilled Tilapia would be precisely the
 * bait-and-switch `BRAND_IDENTITY.md` §15 rules out, so the heading names
 * what is actually added.
 *
 * Two ways to get Paul's original copy back, either of which is a one-line
 * change here:
 *   1. Create the dish in Admin, then set `dishHandle: "seafood-okro"` and
 *      restore the title and body.
 *   2. Tell me which existing dish to use, and I will rewrite the copy to
 *      match it properly rather than approximate.
 *
 * Until then the pictured plantain and the tilapia dish at least agree with
 * each other, and the price is real.
 */
export type PairingSlide = {
  /** Stable key for React and for the dot controls. */
  id: string
  eyebrow: string
  /** Shorter eyebrow for the ~180px-wide compact panel (below 768px). */
  eyebrowShort: string
  title: string
  /**
   * Shorter title below 768px. The full title wraps to four or five lines in
   * the compact panel, which is half of a 390px screen minus padding — about
   * 160px. This is not a nicety; without it the copy overruns the 16:9 frame.
   */
  titleShort: string
  /** Hidden below `md:` (768px) — see the carousel's note on the panel. */
  body: string
  /** Product handles. Both must exist and be purchasable or the slide is skipped. */
  dishHandle: string
  drinkHandle: string
  image: string
  imageAlt: string
  /**
   * Which way the photograph runs. `dark` puts light text on a dark
   * photograph; `light` puts dark text on a pale one. It is not decoration —
   * it decides every text colour in the panel, and getting it wrong on a new
   * image means unreadable copy rather than an off-brand look.
   */
  theme: "dark" | "light"
}

export const PAIRING_SLIDES: PairingSlide[] = [
  {
    id: "asun-single-malt",
    eyebrow: "Sommelier & Chef Selection",
    eyebrowShort: "Sommelier & Chef",
    title: "Smoky Asun & Aged Single Malt",
    titleShort: "Smoky Asun & Single Malt",
    body: "The bold, peppered spice of our wood-fired goat meat demands depth. Pair it with an aged single malt to slice through the heat and elevate every bite.",
    dishHandle: "peppered-goat-meat-asun",
    drinkHandle: "glenfiddich-12",
    image: "/brand/pairings/asun-single-malt.jpg",
    imageAlt:
      "A bottle and glass of aged single malt whisky beside a clay bowl of peppered goat meat on a dark wooden table",
    theme: "dark",
  },
  {
    id: "seafood-champagne",
    eyebrow: "The Sunday Special",
    eyebrowShort: "Sunday Special",
    // Paul's original: "Seafood Okro & Chilled Champagne" — restore once the
    // dish exists. See the file header.
    title: "Grilled Tilapia & Chilled Champagne",
    titleShort: "Tilapia & Champagne",
    body: "Rich ocean flavours meet crisp luxury. Vibrant citrus notes and fine bubbles cut perfectly through our signature seafood broth.",
    dishHandle: "grilled-tilapia-fried-plantain",
    drinkHandle: "veuve-clicquot-yellow-label",
    image: "/brand/pairings/seafood-champagne.jpg",
    imageAlt:
      "A champagne bottle on ice and a poured flute beside a seafood bowl and a plate of fried plantain on a marble table",
    theme: "light",
  },
]

/** Seconds between automatic advances. */
export const AUTOPLAY_SECONDS = 7
