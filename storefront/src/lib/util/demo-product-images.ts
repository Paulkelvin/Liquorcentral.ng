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
 * uploaded to Medusa properly: remove this file, drop its single call site
 * (`ProductPreview` — every listing on the site now renders that one card),
 * and delete `public/brand/products/`. Nothing else depends on it.
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
 * Soleil", "The Crown & Key", "Château Val de Paix", "Barnerine", "Villa
 * d'Oro", "O'Brien's", "Alta
 * Agave", "Mezcal Artesanal Oaxaqueño" and "Premium Spiced Gold Rum". The
 * catalog products are named after real brands — Macallan, Grey Goose, Bombay
 * Sapphire, Bacardi, Château Margaux, Heineken, Patrón, Hennessy, Tanqueray,
 * Baileys, Don Julio, Captain Morgan. So a customer on the live site sees a
 * bottle whose label contradicts the product title.
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
const RUM_SPICED: DemoImage = {
  src: `${P}rum-spiced.webp`,
  alt: "A bottle of amber spiced rum with an ornate gold label and a wax-sealed neck",
}
const COGNAC: DemoImage = {
  src: `${P}cognac-xo.webp`,
  alt: "A rounded decanter of XO cognac in an open satin-lined presentation case",
}
const TEQUILA_BLANCO: DemoImage = {
  src: `${P}tequila-blanco.webp`,
  alt: "A clear bottle of blanco tequila with a cream label and a brushed silver cap",
}
const MEZCAL: DemoImage = {
  src: `${P}mezcal-artesanal.webp`,
  alt: "A clear bottle of artisanal mezcal beside its navy presentation box",
}
const BEER: DemoImage = {
  src: `${P}beer-craft-stout.webp`,
  alt: "A chilled brown glass bottle of craft stout with a black and cream label",
}
const RED_WINE: DemoImage = {
  src: `${P}wine-red-bordeaux.webp`,
  alt: "A bottle of red Bordeaux wine with a classic cream château label",
}
const SPARKLING: DemoImage = {
  src: `${P}sparkling-prosecco.webp`,
  alt: "A green sparkling wine bottle with a gold foil capsule and a caged cork",
}
const ROSE_WINE: DemoImage = {
  src: `${P}wine-rose.webp`,
  alt: "A tall bottle of pale pink Provence rosé with a cream label",
}
const IRISH_CREAM: DemoImage = {
  src: `${P}liqueur-irish-cream.webp`,
  alt: "A dark rounded bottle of Irish cream liqueur with a cream and green label",
}
/**
 * Used for cognac, and that is a stretch worth naming: this is a herbal
 * liqueur, not a brandy. It earns the slot on *shape and colour* — a dark
 * amber spirit in a plain bottle with an ornate label — and it exists to stop
 * the two cognacs sharing one photograph of a presentation case, which read as
 * a duplicated card rather than as two products.
 *
 * It was previously on Baileys, which was worse: an opaque cream liqueur
 * rendered as a clear dark one. A real Irish cream arrived, so that stretch is
 * now retired.
 */
const HERBAL_LIQUEUR: DemoImage = {
  src: `${P}liqueur-herbal.webp`,
  alt: "A dark amber bottle of herbal liqueur with an ornate cream label",
}

/**
 * Handle → image. Duplicates are intentional: Paul asked for these to fill
 * every card, and eighteen photographs cannot cover the catalog uniquely.
 *
 * **One card still shows a photograph with its studio background**, which is
 * the thing Paul asked to be rid of: `sommelier-corkscrew-set`. Every image
 * supplied so far is a bottle or a can, so there is nothing to put on it —
 * named here to aim the next batch rather than guess at it.
 *
 * **Supplied but unused**, held out of the repo rather than forced onto the
 * wrong product: an apple cider, an energy-drink mixer four-pack, a pink gin,
 * and a coffee liqueur. The catalog has no cider, no mixer, no flavoured gin
 * and no coffee liqueur — each would have to become a product first. The
 * cut-out step is scripted, so wiring them up later costs a minute.
 *
 * **On disk but no longer referenced**, kept for the first product of their
 * kind rather than deleted:
 *   • `wine-white-sauvignon.webp` — the rosé took `pink-moscato`, the only
 *     pink-or-white wine in the catalog.
 *   • `tequila-reposado.webp` — both agave products are *blanco*, so both now
 *     carry a clear bottle; this one is aged and gold.
 *
 * Food Central dishes are deliberately excluded. Their photographs do have
 * backgrounds, but they are plated-food photography rather than packshots —
 * a dish on a plate is what arrives, and a dish floating on a tint would look
 * stranger than it does now. Flagged to Paul rather than changed unasked.
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
  "captain-morgan-spiced-rum": RUM_SPICED,
  "hennessy-vsop": COGNAC,
  "courvoisier-cognac": HERBAL_LIQUEUR,

  // Agave. Both catalog products are *blanco* — unaged and clear — so both
  // now carry a clear bottle. The reposado shot they shared was gold.
  "patron-silver-tequila": TEQUILA_BLANCO,
  "don-julio-blanco-tequila": MEZCAL,

  // Liqueur.
  "baileys-irish-cream": IRISH_CREAM,

  // Beer. A single stout bottle stands in for a crate — the closest of the
  // ten, and flagged as a stretch.
  "heineken-lager-crate": BEER,

  // Wine.
  "chateau-margaux-2015": RED_WINE,
  "casillero-del-diablo-cabernet-sauvignon": RED_WINE,
  "jacobs-creek-shiraz-cabernet": RED_WINE,
  "pink-moscato": ROSE_WINE,

  // Champagne. One bottle for both, at Paul's explicit direction — he asked
  // for duplicates wherever a card had no good image, and this is the format
  // that matters: sloped shoulders, foil capsule, caged mushroom cork. It is
  // a prosecco rather than a champagne, which is a different region and
  // method, but the *bottle* is the thing a customer recognises and the thing
  // that arrives. It replaces a press photograph on a black studio ground
  // carrying real Dom Pérignon branding — the single worst card on the site.
  "dom-perignon-vintage-2013": SPARKLING,
  "veuve-clicquot-yellow-label": SPARKLING,
}

/** The demo photograph for a product handle, or `undefined` to use its own. */
export function demoImageFor(handle?: string | null): DemoImage | undefined {
  return handle ? DEMO_IMAGES[handle] : undefined
}
