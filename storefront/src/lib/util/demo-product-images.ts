/**
 * Temporary product photography, supplied by Paul and committed to the repo.
 *
 * ---
 *
 * **Why this file exists rather than the images living in Medusa.**
 *
 * Product images normally live on the Product in Medusa, which is where the
 * current Wikimedia thumbnails come from. But the production storefront reads
 * the *production* Medusa database, and this environment only has a local one
 * — so setting thumbnails through the Admin API here would never reach the
 * deployed site. Shipping the images in the repo and overriding by handle is
 * the only route that actually puts them in front of Paul.
 *
 * **This is scaffolding, not architecture. Delete it** once the images are
 * uploaded to Medusa properly: remove this file, drop the three call sites
 * (`ProductPreview`, `EditorialProductCard`, `DishCard`), and delete
 * `public/brand/products/`. Nothing else depends on it.
 *
 * ---
 *
 * **What was done to the source files.** Paul supplied studio renders on a
 * plain light ground. They are committed as **transparent cut-outs**, because
 * a white-ground photograph on the card's `ink-100` tile shows up as a white
 * rectangle — the tile tint only does its job if the bottle floats on it.
 *
 * The background was removed by flood-filling inward from the border rather
 * than by a global lightness threshold. That distinction matters: every one of
 * these bottles carries a cream or white label, and a global threshold punches
 * holes straight through them. Only background *connected to the edge* is
 * removed, which is also why the cognac case's white satin lining survives —
 * it is enclosed, not edge-connected.
 *
 * Each is then trimmed and scaled so the subject occupies the same 70% of a
 * 900px square canvas, so no bottle renders larger than another, and saved as
 * WebP with alpha (4.49 MB of PNG → 0.38 MB).
 *
 * ---
 *
 * **⚠️ The brands on these bottles are invented, and they do not match the
 * product names they are attached to.**
 *
 * The photographs read "High Coast Distillery", "Cristal Vodka", "The Wildwood
 * Botanical Gin", "Caribeño's Reserve", "Château Bordeaux", "Glen Glassaugh",
 * "Obsidian Brewery", "El Tesoro de Agave", "Maison d'Or", "Domaine du
 * Soleil", "The Crown & Key", "Château Val de Paix" and "Barnerine". The
 * catalog products are named after real brands — Macallan, Grey Goose, Bombay
 * Sapphire, Bacardi, Château Margaux, Heineken, Patrón, Hennessy, Tanqueray,
 * Baileys. So a customer on the live site sees a bottle whose label
 * contradicts the product title.
 *
 * That is a real mismatch, not a cosmetic one. **The clean fix is to rename
 * the demo products to the invented brands** — which is also strictly better
 * than the status quo, because the catalog currently uses real trademarked
 * names for a business that does not represent those producers. Paul's call;
 * it has been put to him.
 *
 * The mapping below is by *bottle type*, so the shape, colour and category are
 * at least honest even while the label is not.
 */

type DemoImage = {
  src: string
  /**
   * Describes what is actually in the frame, not what the product is called.
   * `04_PRODUCT_LISTING_SPECIFICATION.md` §24 wants descriptive alt text, and
   * describing a High Coast bottle as "The Macallan 12" would push the
   * mismatch into the accessibility layer as well as the visual one.
   */
  alt: string
}

const P = "/brand/products/"

const WHISKY: DemoImage = {
  src: `${P}whisky-single-malt.webp`,
  alt: "A tall bottle of amber single malt Scotch whisky with a cream label",
}
const WHISKY_GIFT: DemoImage = {
  src: `${P}whisky-gift-tube.webp`,
  alt: "A bottle of aged single malt Scotch whisky beside its black presentation tube",
}
const VODKA: DemoImage = {
  src: `${P}vodka-clear.webp`,
  alt: "A clear glass bottle of vodka beside its black cylindrical presentation tube",
}
const GIN: DemoImage = {
  src: `${P}gin-botanical.webp`,
  alt: "A clear bottle of botanical gin with an illustrated wildflower label, beside its matching tube",
}
const GIN_LONDON_DRY: DemoImage = {
  src: `${P}gin-london-dry.webp`,
  alt: "A pale green bottle of London dry gin beside its illustrated navy presentation box",
}
const RUM: DemoImage = {
  src: `${P}rum-dark.webp`,
  alt: "A bottle of dark aged rum with a cream and burgundy label, beside its presentation tube",
}
const COGNAC: DemoImage = {
  src: `${P}cognac-xo.webp`,
  alt: "A rounded decanter of XO cognac in an open satin-lined presentation case",
}
const TEQUILA: DemoImage = {
  src: `${P}tequila-reposado.webp`,
  alt: "A bottle of pale gold reposado tequila with a wooden stopper and cream label",
}
const BEER: DemoImage = {
  src: `${P}beer-craft-stout.webp`,
  alt: "A chilled brown glass bottle of craft stout with a black and cream label",
}
const RED_WINE: DemoImage = {
  src: `${P}wine-red-bordeaux.webp`,
  alt: "A bottle of red Bordeaux wine with a classic cream château label",
}
const ROSE_WINE: DemoImage = {
  src: `${P}wine-rose.webp`,
  alt: "A tall bottle of pale pink Provence rosé with a cream label",
}
/**
 * A liqueur, but not the *same* liqueur — see the mismatch note above, which
 * this stretches one step further than the rest. Baileys is an opaque cream
 * liqueur; this is a clear dark herbal one. It is used anyway because the
 * alternative is worse: it would be the only spirits card still rendering a
 * grey Wikimedia snapshot next to twenty studio cut-outs, and a card that
 * looks broken reads as a broken shop. Replace it the moment there is a real
 * photograph.
 */
const HERBAL_LIQUEUR: DemoImage = {
  src: `${P}liqueur-herbal.webp`,
  alt: "A dark amber bottle of herbal liqueur with an ornate cream label",
}

/**
 * Handle → image. Duplicates are intentional: Paul asked for these to fill
 * every card, and thirteen photographs cannot cover the catalog uniquely.
 *
 * **Still uncovered**, and kept on their existing images until the next batch
 * — listed here so that batch can be aimed rather than guessed:
 *   • Champagne — `dom-perignon-vintage-2013`, `veuve-clicquot-yellow-label`.
 *     Nothing supplied so far is close: a champagne bottle is unmistakable
 *     (heavy, wide-shouldered, foil and wire cage), and a still-wine bottle
 *     standing in for one misrepresents what arrives, not just how it looks.
 *   • Accessories — `sommelier-corkscrew-set`. Every image supplied is a
 *     bottle or a can; none is a corkscrew.
 *
 * **Supplied but unused**, held out of the repo rather than forced onto the
 * wrong product: an apple cider and an energy-drink mixer four-pack. The
 * catalog has no cider and no mixer — they would have to become products
 * first. See the note to Paul; the cut-out step is scripted and takes a
 * minute to redo.
 *
 * `wine-white-sauvignon.webp` is on disk but no longer referenced: the rosé
 * below took `pink-moscato`, which is a pink wine and was the only home the
 * white bottle had. Kept for the first white wine added to the catalog.
 *
 * Food Central dishes are deliberately excluded: they already have real food
 * photography, which is the one part of this catalog that is honest today.
 */
const DEMO_IMAGES: Record<string, DemoImage> = {
  // Whisky / whiskey.
  "macallan-12-double-cask": WHISKY,
  "glenfiddich-12": WHISKY,
  "chivas-regal-12": WHISKY,
  "jameson-irish-whiskey": WHISKY,
  "jack-daniels-old-no-7": WHISKY,
  // The two that come boxed get the bottle-plus-tube shot.
  "johnnie-walker-blue-label": WHISKY_GIFT,
  "premium-whisky-gift-set": WHISKY_GIFT,

  // Clear spirits.
  "grey-goose-vodka": VODKA,
  "absolut-vodka": VODKA,
  "bombay-sapphire-gin": GIN,
  "tanqueray-gin": GIN_LONDON_DRY,

  // Aged spirits.
  "bacardi-superior-rum": RUM,
  "captain-morgan-spiced-rum": RUM,
  "hennessy-vsop": COGNAC,
  "courvoisier-cognac": COGNAC,

  // Agave.
  "patron-silver-tequila": TEQUILA,
  "don-julio-blanco-tequila": TEQUILA,

  // Liqueur. Wrong *kind* of liqueur — see `HERBAL_LIQUEUR` above.
  "baileys-irish-cream": HERBAL_LIQUEUR,

  // Beer. A single stout bottle stands in for a crate — the closest of the
  // ten, and flagged as a stretch.
  "heineken-lager-crate": BEER,

  // Wine.
  "chateau-margaux-2015": RED_WINE,
  "casillero-del-diablo-cabernet-sauvignon": RED_WINE,
  "jacobs-creek-shiraz-cabernet": RED_WINE,
  "pink-moscato": ROSE_WINE,
}

/** The demo photograph for a product handle, or `undefined` to use its own. */
export function demoImageFor(handle?: string | null): DemoImage | undefined {
  return handle ? DEMO_IMAGES[handle] : undefined
}
