import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createCollectionsWorkflow,
  createProductsWorkflow,
  createShippingProfilesWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Seeds a first batch of real, purchasable products so the storefront has
 * genuine content to render against (placeholder photography via a stable
 * per-product image URL, since no real product photography/asset pipeline
 * exists yet) — a UI-review aid, not a merchandising decision. Every price
 * and description here is representative, not final catalog data.
 *
 * Idempotent: safe to re-run — skips any product whose handle already
 * exists rather than creating duplicates, matching
 * navigation-category-seed.ts's pattern.
 *
 * **This now runs on every deploy**, appended to `preDeployCommand` in
 * `backend/railway.json`. It had to be run by hand before, which is why the
 * production catalog sat at 43 products while the repo described more: a seed
 * nobody remembers to run is a seed that silently drifts from the code.
 *
 * That is only safe because of the idempotency above, so **keep it that way**.
 * Two rules follow, and breaking either would let a deploy rewrite live data:
 *
 *   1. **Append products; edit an existing entry only to change its image on
 *      purpose.** The refresh loop below rewrites the thumbnail of any
 *      existing product whose `realImageUrl` has changed. That is the
 *      sanctioned way to replace a photograph — it is how the four Food
 *      Central dishes moved off their Wikimedia stock shots onto transparent
 *      cut-outs — but it also means an accidental edit republishes an image
 *      on the next deploy, over anything added by hand in Admin.
 *   2. **Never delete an entry to remove a product.** Nothing here deletes;
 *      removing an entry just stops managing that product, leaving it live.
 *
 * If this ever fails it will block deploys, because `preDeployCommand` is a
 * gate. That is deliberate — a half-seeded catalog going live unnoticed is
 * worse — but if it does block one, dropping that third command from
 * `railway.json` unblocks it immediately.
 */

type WineDetailsSeed = {
  vintage?: number;
  producer?: string;
  region?: string;
  bottle_size?: string;
  abv?: number;
  tasting_notes?: string;
};

type FoodDetailsSeed = {
  ingredients?: string[];
  allergens?: string[];
  dietary_flags?: string[];
  safety_data_verified?: boolean;
  spice_level?: number;
  prep_time_minutes?: number;
  portion_size?: string;
};

type SeedProduct = {
  handle: string;
  /**
   * Optional. Omit it and the product is created with no thumbnail, so the
   * storefront renders its placeholder frame — which is the honest state for
   * the glassware and bar tools below, where no photography exists yet.
   * An empty string would be worse than absent: it produces a broken <img>.
   */
  realImageUrl?: string;
  title: string;
  description: string;
  price: number; // NGN, plain decimal amount (this project's convention)
  categoryHandles?: string[];
  optionTitle: string;
  optionValue: string;
  wine_details?: WineDetailsSeed;
  food_details?: FoodDetailsSeed;
};

const PRODUCTS: SeedProduct[] = [
  {
    handle: "chateau-margaux-2015",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Pavillon-Rouge-de-Margaux-1985.JPG",
    title: "Château Margaux 2015",
    description:
      "A legendary Bordeaux first-growth. Rich blackcurrant and cedar notes with a long, silky finish.",
    price: 850000,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      vintage: 2015,
      producer: "Château Margaux",
      region: "Bordeaux, France",
      bottle_size: "750ml",
      abv: 13.5,
      tasting_notes: "Rich blackcurrant and cedar notes with a long, silky finish.",
    },
  },
  {
    handle: "casillero-del-diablo-cabernet-sauvignon",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Casillero_del_Diablo_wine.jpg",
    title: "Casillero del Diablo Cabernet Sauvignon",
    description: "An approachable Chilean red with dark fruit and light spice, smooth tannins.",
    price: 12000,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      vintage: 2022,
      producer: "Concha y Toro",
      region: "Central Valley, Chile",
      bottle_size: "750ml",
      abv: 13.5,
      tasting_notes: "Dark fruit and light spice, smooth tannins.",
    },
  },
  {
    handle: "dom-perignon-vintage-2013",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/Dom_Perignon_1999.jpg",
    title: "Dom Pérignon Vintage 2013",
    description: "A prestige vintage champagne — crisp citrus and brioche with fine, persistent bubbles.",
    price: 250000,
    categoryHandles: ["champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      vintage: 2013,
      producer: "Moët & Chandon",
      region: "Champagne, France",
      bottle_size: "750ml",
      abv: 12.5,
      tasting_notes: "Crisp citrus and brioche notes with fine, persistent bubbles.",
    },
  },
  {
    handle: "veuve-clicquot-yellow-label",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Veuve_clicquot.jpg",
    title: "Veuve Clicquot Yellow Label",
    description: "A classic non-vintage champagne — bright apple and pear with a rich, toasty finish.",
    price: 68000,
    categoryHandles: ["champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Veuve Clicquot",
      region: "Champagne, France",
      bottle_size: "750ml",
      abv: 12,
      tasting_notes: "Bright apple and pear notes with a rich, toasty finish.",
    },
  },
  {
    handle: "johnnie-walker-blue-label",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Johnnie_Walker_Blue_Label_-_promotional_bottle_-_Suvarnabhumi_Airport.JPG",
    title: "Johnnie Walker Blue Label",
    description: "A rare blend of some of Scotland's finest aged whiskies — smoky, honeyed, and complex.",
    price: 175000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Johnnie Walker",
      region: "Scotland",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Smoky, honeyed, and complex — a rare blend of aged whiskies.",
    },
  },
  {
    handle: "macallan-12-double-cask",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Macallan_12.jpg",
    title: "The Macallan 12 Year Double Cask",
    description: "Single malt Scotch aged in a combination of American and European oak sherry casks.",
    price: 62000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      vintage: 12,
      producer: "The Macallan",
      region: "Speyside, Scotland",
      bottle_size: "700ml",
      abv: 40,
      tasting_notes: "Vanilla, citrus, and ginger with a rich, sweet oak finish.",
    },
  },
  {
    handle: "jack-daniels-old-no-7",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Jack_Daniel%27s_Old_No._7_1%2C14l.jpg",
    title: "Jack Daniel's Old No. 7",
    description: "Tennessee whiskey mellowed drop by drop through sugar maple charcoal.",
    price: 28000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Jack Daniel's",
      region: "Tennessee, USA",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Smooth caramel and charcoal notes, mellowed through sugar maple charcoal.",
    },
  },
  {
    handle: "hennessy-vsop",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Hennessy_cognac_bottle_with_drinking_glass.JPG",
    title: "Hennessy VSOP",
    description: "A rich, complex cognac with notes of dried fruit, toffee, and toasted almond.",
    price: 55000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Hennessy",
      region: "Cognac, France",
      bottle_size: "700ml",
      abv: 40,
      tasting_notes: "Notes of dried fruit, toffee, and toasted almond.",
    },
  },
  {
    handle: "grey-goose-vodka",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Grey_Goose_Bottle.jpg",
    title: "Grey Goose Vodka",
    description: "A clean, smooth French vodka with a subtle almond finish.",
    price: 32000,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Grey Goose",
      region: "France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Clean, smooth, with a subtle almond finish.",
    },
  },
  {
    handle: "bombay-sapphire-gin",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Bombay-sapphire.jpg",
    title: "Bombay Sapphire Gin",
    description: "A vibrant London Dry gin — bright juniper with citrus and warm spice notes.",
    price: 27000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Bombay Sapphire",
      region: "England",
      bottle_size: "750ml",
      abv: 47,
      tasting_notes: "Bright juniper with citrus and warm spice notes.",
    },
  },
  {
    handle: "bacardi-superior-rum",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/2023_Rum_Bacardi_Carta_Oro_%283%29.jpg",
    title: "Bacardi Superior Rum",
    description: "A light, crisp white rum with subtle vanilla and almond notes.",
    price: 21000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Bacardi",
      region: "Puerto Rico",
      bottle_size: "750ml",
      abv: 37.5,
      tasting_notes: "Light and crisp with subtle vanilla and almond notes.",
    },
  },
  {
    handle: "patron-silver-tequila",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/PatronGoldBottle.jpg",
    title: "Patrón Silver Tequila",
    description: "A smooth, 100% agave tequila with fresh agave, citrus, and light pepper notes.",
    price: 58000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Patrón",
      region: "Jalisco, Mexico",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Fresh agave with citrus and light pepper notes.",
    },
  },
  {
    handle: "baileys-irish-cream",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Baileys_Original_Irish_Cream_Bottle.jpg",
    title: "Baileys Irish Cream",
    description: "A smooth blend of Irish whiskey and cream with notes of cocoa and vanilla.",
    price: 18000,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Baileys",
      region: "Ireland",
      bottle_size: "700ml",
      abv: 17,
      tasting_notes: "Smooth Irish whiskey and cream with notes of cocoa and vanilla.",
    },
  },
  {
    handle: "heineken-lager-crate",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Heineken_Bottle.JPG",
    title: "Heineken Lager (Crate of 12)",
    description: "A crisp, balanced lager with a mild bitterness — crate of 12 bottles.",
    price: 9500,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "330ml x 12",
    wine_details: {
      producer: "Heineken",
      region: "Netherlands",
      bottle_size: "330ml x 12",
      abv: 5,
      tasting_notes: "Crisp, balanced lager with a mild bitterness.",
    },
  },
  {
    handle: "premium-whisky-gift-set",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Six_classic_malt_whiskys_of_Scotland_inside_box.JPG",
    title: "Premium Whisky Gift Set",
    description: "A curated set of classic single malt Scotch whiskies, boxed and ready to gift.",
    price: 95000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "6 x 50ml",
    wine_details: {
      producer: "Assorted Scottish Distilleries",
      region: "Scotland",
      bottle_size: "6 x 50ml",
      tasting_notes: "A tasting selection across six classic Scotch malt styles.",
    },
  },
  {
    handle: "sommelier-corkscrew-set",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Corkscrew_bottle_openers.jpg",
    title: "Sommelier Corkscrew & Bottle Opener Set",
    description: "A waiter's-friend style corkscrew and bottle opener set for wine and spirits.",
    price: 8500,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "Standard",
  },
  {
    handle: "jollof-rice-grilled-chicken",
    realImageUrl: "/brand/products/dish-jollof-plantain.webp",
    title: "Jollof Rice with Grilled Chicken",
    description: "Classic smoky-sweet jollof rice served with a grilled chicken quarter.",
    price: 6500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Rice", "Tomato", "Pepper", "Onion", "Chicken", "Spices"],
      allergens: [],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 2,
      prep_time_minutes: 25,
      portion_size: "1 generous plate, serves 1",
    },
  },
  {
    handle: "suya-platter-beef-skewers",
    realImageUrl: "/brand/products/dish-suya.webp",
    title: "Suya Platter (Beef Skewers)",
    description: "Spiced grilled beef skewers with yaji suya spice, served with onion and tomato.",
    price: 8000,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Beef", "Suya spice (yaji)", "Onion", "Groundnut"],
      allergens: ["Peanuts"],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 3,
      prep_time_minutes: 20,
      portion_size: "8 skewers with sliced onion & tomato",
    },
  },
  {
    handle: "peppered-goat-meat-asun",
    realImageUrl: "/brand/products/dish-asun.webp",
    title: "Peppered Goat Meat (Asun)",
    description: "Chopped, char-grilled goat meat tossed in a spicy pepper sauce.",
    price: 9500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Goat meat", "Bell pepper", "Onion", "Scotch bonnet", "Spices"],
      allergens: [],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 4,
      prep_time_minutes: 35,
      portion_size: "1 full plate, serves 1-2",
    },
  },
  {
    handle: "grilled-tilapia-fried-plantain",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Plated_grilled_fish.jpg",
    title: "Grilled Tilapia with Fried Plantain",
    description: "Whole grilled tilapia fish with a side of sweet fried plantain and pepper sauce.",
    price: 8500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Tilapia fish", "Plantain", "Pepper sauce", "Onion"],
      allergens: ["Fish"],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 2,
      prep_time_minutes: 30,
      portion_size: "1 whole fish with plantain",
    },
  },
  {
    handle: "chicken-shawarma-wrap",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Shawarma.png",
    title: "Chicken Shawarma Wrap",
    description: "Grilled chicken shawarma wrapped in pita with garlic sauce, lettuce, and pickles.",
    price: 4500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Chicken", "Pita bread", "Garlic sauce", "Lettuce", "Tomato", "Pickles"],
      allergens: ["Gluten", "Dairy"],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 1,
      prep_time_minutes: 15,
      portion_size: "1 large wrap",
    },
  },
  {
    handle: "small-chops-party-pack",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Small_chops.jpg",
    title: "Small Chops Party Pack",
    description: "An assorted party pack of spring rolls, samosa, puff puff, chicken drumettes, and fish rolls.",
    price: 15000,
    optionTitle: "Portion",
    optionValue: "Party Pack (30 pcs)",
    food_details: {
      ingredients: ["Spring rolls", "Samosa", "Puff puff", "Chicken drumettes", "Fish rolls"],
      allergens: ["Gluten"],
      dietary_flags: [],
      safety_data_verified: false,
      spice_level: 1,
      prep_time_minutes: 20,
      portion_size: "30-piece party pack",
    },
  },
  {
    handle: "absolut-vodka",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6a/A_bottle_of_Absolut_Vodka.jpg",
    title: "Absolut Vodka",
    description: "A Swedish vodka made from winter wheat, with a rich, complex, yet smooth character.",
    price: 24000,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Absolut",
      region: "Åhus, Sweden",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Rich, complex, yet smooth, with a distinct character of grain.",
    },
  },
  {
    handle: "tanqueray-gin",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Tanqueray_bottle_Gin.png",
    title: "Tanqueray London Dry Gin",
    description: "A classic four-botanical London Dry gin with a crisp juniper-forward profile.",
    price: 29000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Tanqueray",
      region: "England",
      bottle_size: "750ml",
      abv: 43.1,
      tasting_notes: "Crisp, juniper-forward with citrus and a hint of angelica root.",
    },
  },
  {
    handle: "captain-morgan-spiced-rum",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Captain_Morgan_Rum_-_Bottle.png",
    title: "Captain Morgan Original Spiced Rum",
    description: "A smooth spiced rum blended with Caribbean rum and warm notes of vanilla and caramel.",
    price: 19000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Captain Morgan",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 35,
      tasting_notes: "Warm vanilla and caramel notes over a smooth spiced rum base.",
    },
  },
  {
    handle: "jameson-irish-whiskey",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Jameson_Irish_Whiskey.JPG",
    title: "Jameson Irish Whiskey",
    description: "A triple-distilled blended Irish whiskey with a smooth, light, and fruity character.",
    price: 26000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Jameson",
      region: "Ireland",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Smooth, light, and fruity with notes of vanilla and toasted wood.",
    },
  },
  {
    handle: "chivas-regal-12",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/ChivasRegal-Wiki.JPG",
    title: "Chivas Regal 12 Year Old",
    description: "A rich, smooth blended Scotch whisky with notes of honey, apple, and vanilla.",
    price: 48000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      vintage: 12,
      producer: "Chivas Regal",
      region: "Scotland",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Honey, apple, and vanilla with a smooth, creamy finish.",
    },
  },
  {
    handle: "courvoisier-cognac",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Courvoisier_VS.jpg",
    title: "Courvoisier VS Cognac",
    description: "A young, vibrant cognac with fresh grape and toasted oak notes.",
    price: 45000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Courvoisier",
      region: "Cognac, France",
      bottle_size: "700ml",
      abv: 40,
      tasting_notes: "Fresh grape and toasted oak with a bright, vibrant finish.",
    },
  },
  {
    handle: "don-julio-blanco-tequila",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Don_Julio_2014.jpg",
    title: "Don Julio Blanco Tequila",
    description: "A 100% blue agave tequila with citrus and pepper notes and a smooth, clean finish.",
    price: 65000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Don Julio",
      region: "Jalisco, Mexico",
      bottle_size: "750ml",
      abv: 38,
      tasting_notes: "Citrus and pepper notes with a smooth, clean agave finish.",
    },
  },
  {
    handle: "jacobs-creek-shiraz-cabernet",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/JC_Shiraz_Cabernet.png",
    title: "Jacob's Creek Shiraz Cabernet",
    description: "An approachable Australian red blend with ripe berry fruit and soft tannins.",
    price: 14000,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Jacob's Creek",
      region: "South Eastern Australia",
      bottle_size: "750ml",
      abv: 13.5,
      tasting_notes: "Ripe berry fruit and soft spice with smooth, easy-drinking tannins.",
    },
  },
  {
    handle: "pink-moscato",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Pink_moscato_Asti.jpg",
    title: "Pink Moscato",
    description: "A light, sweet, gently sparkling rosé with fresh strawberry and peach notes.",
    price: 13500,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Assorted Producer",
      region: "Piedmont, Italy",
      bottle_size: "750ml",
      abv: 7.5,
      tasting_notes: "Fresh strawberry and peach notes with a light, gently sparkling sweetness.",
    },
  },
  {
    handle: "glenfiddich-12",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Bottle_of_Glenfiddich_12yo.jpg",
    title: "Glenfiddich 12 Year Old",
    description: "A single malt Scotch with fresh pear and subtle oak notes, matured in oak casks.",
    price: 54000,
    categoryHandles: ["spirits", "whisky"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      vintage: 12,
      producer: "Glenfiddich",
      region: "Speyside, Scotland",
      bottle_size: "700ml",
      abv: 40,
      tasting_notes: "Fresh pear and subtle oak with a distinctive, delicate character.",
    },
  },
  {
    handle: "egusi-soup-pounded-yam",
    realImageUrl: "/brand/products/dish-egusi-pounded-yam.webp",
    title: "Egusi Soup with Pounded Yam",
    description: "Rich melon-seed soup with assorted meat and fish, served with smooth pounded yam.",
    price: 7500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Egusi (melon seed)", "Yam", "Palm oil", "Assorted meat", "Fish", "Leafy greens"],
      allergens: ["Fish"],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 2,
      prep_time_minutes: 40,
      portion_size: "1 bowl of soup with a mound of pounded yam",
    },
  },
  {
    handle: "moin-moin",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Sliced_Moi_Moi.jpg",
    title: "Moin Moin",
    description: "Steamed savoury bean pudding made from blended black-eyed peas, pepper, and spices.",
    price: 3500,
    optionTitle: "Portion",
    optionValue: "Regular",
    food_details: {
      ingredients: ["Black-eyed peas", "Pepper", "Onion", "Palm oil", "Egg"],
      allergens: ["Egg"],
      dietary_flags: ["Vegetarian"],
      safety_data_verified: true,
      spice_level: 1,
      prep_time_minutes: 45,
      portion_size: "2 wrapped portions",
    },
  },
  {
    handle: "puff-puff",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Puff_Puff.jpg",
    title: "Puff Puff",
    description: "Deep-fried sweet dough balls, golden and fluffy — a classic Nigerian snack.",
    price: 2500,
    optionTitle: "Portion",
    optionValue: "Regular (10 pcs)",
    food_details: {
      ingredients: ["Flour", "Sugar", "Yeast", "Nutmeg"],
      allergens: ["Gluten"],
      dietary_flags: ["Vegetarian"],
      safety_data_verified: true,
      spice_level: 0,
      prep_time_minutes: 25,
      portion_size: "10-piece portion",
    },
  },
  {
    handle: "nigerian-meat-pie",
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Homemade_meat_pie.jpg",
    title: "Nigerian Meat Pie",
    description: "Flaky pastry filled with seasoned minced meat, potato, and carrot.",
    price: 3000,
    optionTitle: "Portion",
    optionValue: "Regular (2 pcs)",
    food_details: {
      ingredients: ["Flour", "Minced beef", "Potato", "Carrot", "Onion"],
      allergens: ["Gluten", "Egg"],
      dietary_flags: [],
      safety_data_verified: true,
      spice_level: 1,
      prep_time_minutes: 30,
      portion_size: "2-piece portion",
    },
  },

  {
    handle: "special-fried-rice-shrimp",
    realImageUrl: "/brand/products/dish-fried-rice-shrimp.webp",
    title: "Special Fried Rice with Shrimp",
    description:
      "Wok-fried rice with prawns, diced beef, sweet peppers and garden peas.",
    price: 7500,
    optionTitle: "Portion",
    optionValue: "Single portion",
    food_details: {
      ingredients: [
        "Rice",
        "Prawns",
        "Beef",
        "Green peas",
        "Carrots",
        "Sweet peppers",
        "Spring onion",
      ],
      allergens: ["Shellfish", "Soy"],
      dietary_flags: [],
      safety_data_verified: false,
      spice_level: 1,
      prep_time_minutes: 25,
      portion_size: "Single portion",
    },
  },

  /**
   * ---------------------------------------------------------------------
   * Second batch — added so no category renders a nearly-empty page.
   * ---------------------------------------------------------------------
   *
   * Every category except `whisky` and `spirits` had between one and four
   * products, so most category pages showed one or two cards under a full
   * set of filters. Paul asked for a minimum of six per category; these 46
   * products take every one of them to at least that.
   *
   * **Additive only, by explicit instruction — "ensure our products there
   * are not removed or changed, it is new products we want".** Nothing above
   * this comment was touched. That matters more than it looks: the script's
   * refresh loop rewrites the thumbnail of any *existing* product whose
   * `realImageUrl` has changed, so editing an entry above would silently
   * republish its image on the next run. Appending cannot do that, and the
   * creation pass already skips any handle that exists.
   *
   * **The titles match the bottles.** The first batch is named after real
   * producers — Macallan, Grey Goose, Patrón — while the photography carries
   * invented brands, so the label on the card contradicts the name beside it.
   * These are named after what is actually in the frame, which also keeps
   * trademarks LiquorCentral does not represent off the new cards. Paul's
   * direction: "you can add any title name, all these are placeholders until
   * we are ready to add our real product."
   *
   * **Images point at the storefront's own committed cut-outs** rather than
   * at Wikimedia, so these products need no entry in
   * `demo-product-images.ts` — the thumbnail on the product is already the
   * right picture. That file stays only for the first batch, and gets
   * smaller as those products are renamed or rephotographed.
   *
   * The five accessories deliberately carry no image at all. Every photograph
   * supplied so far is a bottle; a decanter rendered as a gin bottle would be
   * a worse lie than an honest placeholder.
   */
  {
    handle: "villa-doro-prosecco-superiore",
    realImageUrl: "/brand/products/sparkling-prosecco.webp",
    title: "Villa d'Oro Prosecco Superiore",
    description:
      "A crisp DOCG prosecco — green apple and white blossom with a fine, persistent bead.",
    price: 42000,
    categoryHandles: ["wines", "champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Villa d'Oro",
      region: "Valdobbiadene, Italy",
      bottle_size: "750ml",
      abv: 11.5,
      tasting_notes: "Green apple and white blossom with a fine, persistent bead.",
    },
  },
  {
    handle: "elegant-doro-brut-reserve",
    realImageUrl: "/brand/products/sparkling-prosecco.webp",
    title: "Elegant d'Oro Brut Réserve",
    description:
      "A dry sparkling reserve — citrus and toasted brioche over a long, clean finish.",
    price: 58000,
    categoryHandles: ["wines", "champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Villa d'Oro",
      region: "Italy",
      bottle_size: "750ml",
      abv: 12,
      tasting_notes: "Citrus and toasted brioche with a long, clean finish.",
    },
  },
  {
    handle: "maison-lumiere-blanc-de-blancs",
    realImageUrl: "/brand/products/sparkling-prosecco.webp",
    title: "Maison Lumière Blanc de Blancs",
    description:
      "All-white-grape sparkling wine — lemon zest, almond and a chalky, mineral finish.",
    price: 96000,
    categoryHandles: ["wines", "champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Maison Lumière",
      region: "France",
      bottle_size: "750ml",
      abv: 12,
      tasting_notes: "Lemon zest and almond over a chalky, mineral finish.",
    },
  },
  {
    handle: "cote-sereine-rose-brut",
    realImageUrl: "/brand/products/sparkling-prosecco.webp",
    title: "Côte Sereine Rosé Brut",
    description:
      "A pale pink sparkling brut — wild strawberry and rose petal, dry rather than sweet.",
    price: 64000,
    categoryHandles: ["wines", "champagne"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Côte Sereine",
      region: "France",
      bottle_size: "750ml",
      abv: 12,
      tasting_notes: "Wild strawberry and rose petal, finishing dry.",
    },
  },
  {
    handle: "domaine-du-soleil-sauvignon-blanc",
    realImageUrl: "/brand/products/wine-white-sauvignon.webp",
    title: "Domaine du Soleil Sauvignon Blanc",
    description:
      "A chilled, zesty white — grapefruit, cut grass and a bright citrus finish.",
    price: 19500,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Domaine du Soleil",
      region: "France",
      bottle_size: "750ml",
      abv: 12.5,
      tasting_notes: "Grapefruit and cut grass with a bright citrus finish.",
      vintage: 2023,
    },
  },
  {
    handle: "chateau-val-de-paix-rose",
    realImageUrl: "/brand/products/wine-rose.webp",
    title: "Château Val de Paix Provence Rosé",
    description:
      "A pale Provence rosé — redcurrant and peach, dry and mineral, best served cold.",
    price: 23500,
    categoryHandles: ["wines"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Château Val de Paix",
      region: "Provence, France",
      bottle_size: "750ml",
      abv: 12.5,
      tasting_notes: "Redcurrant and peach, dry and mineral.",
      vintage: 2023,
    },
  },
  {
    handle: "cristal-vodka-original",
    realImageUrl: "/brand/products/vodka-clear.webp",
    title: "Cristal Vodka Original",
    description:
      "A clean, neutral grain vodka — filtered smooth, with a soft pepper finish.",
    price: 26000,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Cristal",
      region: "Poland",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Clean and neutral with a soft pepper finish.",
    },
  },
  {
    handle: "cristal-vodka-citrus",
    realImageUrl: "/brand/products/vodka-clear.webp",
    title: "Cristal Vodka Citrus",
    description:
      "Grain vodka infused with lemon and grapefruit peel — bright, dry and crisp.",
    price: 27500,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Cristal",
      region: "Poland",
      bottle_size: "750ml",
      abv: 37.5,
      tasting_notes: "Lemon and grapefruit peel over a dry, crisp base.",
    },
  },
  {
    handle: "northgate-grain-vodka",
    realImageUrl: "/brand/products/vodka-clear.webp",
    title: "Northgate Grain Vodka",
    description:
      "An everyday grain vodka — smooth enough to sip, priced to mix.",
    price: 21000,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Northgate",
      region: "United Kingdom",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Smooth and lightly sweet, built for mixing.",
    },
  },
  {
    handle: "aurora-wheat-vodka",
    realImageUrl: "/brand/products/vodka-clear.webp",
    title: "Aurora Wheat Vodka",
    description:
      "A soft wheat vodka, distilled five times — creamy texture, almost no burn.",
    price: 34000,
    categoryHandles: ["spirits", "vodka"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Aurora",
      region: "Sweden",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Creamy wheat texture with almost no burn.",
    },
  },
  {
    handle: "wildwood-botanical-gin",
    realImageUrl: "/brand/products/gin-botanical.webp",
    title: "The Wildwood Botanical Gin",
    description:
      "A small-batch botanical gin — juniper, elderflower and meadow herbs.",
    price: 31000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "The Wildwood Distillery",
      region: "United Kingdom",
      bottle_size: "750ml",
      abv: 42,
      tasting_notes: "Juniper, elderflower and meadow herbs.",
    },
  },
  {
    handle: "crown-and-key-london-dry-gin",
    realImageUrl: "/brand/products/gin-london-dry.webp",
    title: "The Crown & Key London Dry Gin",
    description:
      "A classic London dry, distilled with twelve botanicals — juniper-forward and citrus-bright.",
    price: 29000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "The Crown & Key",
      region: "London, United Kingdom",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Juniper-forward with bright citrus and a dry finish.",
    },
  },
  {
    handle: "elaras-pink-gin",
    realImageUrl: "/brand/products/gin-pink.webp",
    title: "Elara's Rose & Grapefruit Pink Gin",
    description:
      "A small-batch pink gin infused with rose petal and pink grapefruit — floral, not sweet.",
    price: 28000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Elara's Botanical Distillery",
      region: "United Kingdom",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Rose petal and pink grapefruit, floral and off-dry.",
    },
  },
  {
    handle: "juniper-row-navy-strength-gin",
    realImageUrl: "/brand/products/gin-london-dry.webp",
    title: "Juniper Row Navy Strength Gin",
    description:
      "Overproof and unapologetic — intense juniper, black pepper and a long, warm finish.",
    price: 38000,
    categoryHandles: ["spirits", "gin"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Juniper Row",
      region: "United Kingdom",
      bottle_size: "750ml",
      abv: 57,
      tasting_notes: "Intense juniper and black pepper with a long, warm finish.",
    },
  },
  {
    handle: "caribenos-reserve-12",
    realImageUrl: "/brand/products/rum-dark.webp",
    title: "Caribeño's Reserve 12 Year",
    description:
      "Twelve years in oak — molasses, dried fig and toasted almond.",
    price: 44000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Caribeño's",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Molasses, dried fig and toasted almond.",
    },
  },
  {
    handle: "premium-spiced-gold-rum",
    realImageUrl: "/brand/products/rum-spiced.webp",
    title: "Premium Spiced Gold Rum",
    description:
      "Aged rum infused with cinnamon, clove and vanilla — a Caribbean small-batch tradition.",
    price: 24000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Caribbean Tradition",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Cinnamon, clove and vanilla over aged gold rum.",
    },
  },
  {
    handle: "islander-gold-rum",
    realImageUrl: "/brand/products/rum-dark.webp",
    title: "Islander Gold Rum",
    description:
      "A light gold rum with soft caramel sweetness — the everyday mixing bottle.",
    price: 19000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Islander",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 37.5,
      tasting_notes: "Soft caramel sweetness, built for mixing.",
    },
  },
  {
    handle: "anchor-and-spice-dark-rum",
    realImageUrl: "/brand/products/rum-spiced.webp",
    title: "Anchor & Spice Dark Rum",
    description:
      "A deep, treacly dark rum — burnt sugar, baking spice and a warm finish.",
    price: 27000,
    categoryHandles: ["spirits", "rum"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Anchor & Spice",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Burnt sugar and baking spice with a warm finish.",
    },
  },
  {
    handle: "alta-agave-blanco",
    realImageUrl: "/brand/products/tequila-blanco.webp",
    title: "Alta Agave Blanco",
    description:
      "Unaged 100% agave tequila — clean, peppery and citrus-sharp.",
    price: 41000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Alta Agave",
      region: "Jalisco, Mexico",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Clean and peppery with sharp citrus.",
    },
  },
  {
    handle: "el-tesoro-reposado",
    realImageUrl: "/brand/products/tequila-reposado.webp",
    title: "El Tesoro de Agave Reposado",
    description:
      "Rested in oak for eight months — cooked agave, vanilla and a gentle warmth.",
    price: 47000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "El Tesoro de Agave",
      region: "Jalisco, Mexico",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Cooked agave and vanilla with a gentle warmth.",
    },
  },
  {
    handle: "mezcal-artesanal-espadin",
    realImageUrl: "/brand/products/mezcal-artesanal.webp",
    title: "Mezcal Artesanal Oaxaqueño Espadín",
    description:
      "Artisanal Espadín mezcal — smoke, green agave and a long mineral finish.",
    price: 52000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Mezcal Artesanal Oaxaqueño",
      region: "Oaxaca, Mexico",
      bottle_size: "750ml",
      abv: 45,
      tasting_notes: "Smoke, green agave and a long mineral finish.",
    },
  },
  {
    handle: "alta-agave-anejo",
    realImageUrl: "/brand/products/tequila-reposado.webp",
    title: "Alta Agave Añejo",
    description:
      "Eighteen months in oak — butterscotch, dried orange and toasted oak.",
    price: 68000,
    categoryHandles: ["spirits", "tequila"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Alta Agave",
      region: "Jalisco, Mexico",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Butterscotch, dried orange and toasted oak.",
    },
  },
  {
    handle: "maison-dor-xo",
    realImageUrl: "/brand/products/cognac-xo.webp",
    title: "Maison d'Or XO Cognac",
    description:
      "An extra-old cognac in a presentation case — dried fruit, leather and old oak.",
    price: 185000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Maison d'Or",
      region: "Cognac, France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Dried fruit, leather and old oak.",
    },
  },
  {
    handle: "maison-dor-vsop",
    realImageUrl: "/brand/products/cognac-xo.webp",
    title: "Maison d'Or VSOP",
    description:
      "Four years in French oak — apricot, honey and a warm, rounded finish.",
    price: 78000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Maison d'Or",
      region: "Cognac, France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Apricot and honey with a warm, rounded finish.",
    },
  },
  {
    handle: "vieux-chene-napoleon-brandy",
    realImageUrl: "/brand/products/cognac-xo.webp",
    title: "Vieux Chêne Napoléon Brandy",
    description:
      "A rich Napoléon-grade brandy — baked plum, walnut and soft spice.",
    price: 56000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Vieux Chêne",
      region: "France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Baked plum, walnut and soft spice.",
    },
  },
  {
    handle: "fontaine-dor-fine-cognac",
    realImageUrl: "/brand/products/cognac-xo.webp",
    title: "Fontaine d'Or Fine Cognac",
    description:
      "A fine cognac for everyday pouring — vanilla, dried apricot and light oak.",
    price: 64000,
    categoryHandles: ["spirits", "cognac"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Fontaine d'Or",
      region: "Cognac, France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Vanilla, dried apricot and light oak.",
    },
  },
  {
    handle: "obriens-irish-cream",
    realImageUrl: "/brand/products/liqueur-irish-cream.webp",
    title: "O'Brien's Irish Cream Liqueur",
    description:
      "Irish whiskey blended with fresh cream — cocoa, vanilla and a silky finish.",
    price: 17500,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "O'Brien's",
      region: "Ireland",
      bottle_size: "750ml",
      abv: 17,
      tasting_notes: "Cocoa and vanilla over a silky cream base.",
    },
  },
  {
    handle: "barnerine-herbal-liqueur",
    realImageUrl: "/brand/products/liqueur-herbal.webp",
    title: "Barnerine Artisanal Herbal Liqueur",
    description:
      "An artisanal herbal liqueur — bitter roots, citrus peel and warm baking spice.",
    price: 33000,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Barnerine",
      region: "Europe",
      bottle_size: "750ml",
      abv: 30,
      tasting_notes: "Bitter roots, citrus peel and warm baking spice.",
    },
  },
  {
    handle: "conker-coffee-liqueur",
    realImageUrl: "/brand/products/liqueur-coffee.webp",
    title: "Conker Spirit Coffee Liqueur",
    description:
      "Cold-brew coffee liqueur in a gift box — dark roast, cocoa and cane sugar.",
    price: 29500,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "500ml",
    wine_details: {
      producer: "Conker Spirit",
      region: "United Kingdom",
      bottle_size: "750ml",
      abv: 25,
      tasting_notes: "Dark roast coffee, cocoa and cane sugar.",
    },
  },
  {
    handle: "obriens-salted-caramel-cream",
    realImageUrl: "/brand/products/liqueur-irish-cream.webp",
    title: "O'Brien's Salted Caramel Cream",
    description:
      "The cream liqueur with burnt caramel and a pinch of sea salt.",
    price: 18500,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "O'Brien's",
      region: "Ireland",
      bottle_size: "750ml",
      abv: 17,
      tasting_notes: "Burnt caramel and sea salt over Irish cream.",
    },
  },
  {
    handle: "amaro-verde-digestif",
    realImageUrl: "/brand/products/liqueur-herbal.webp",
    title: "Amaro Verde Herbal Digestif",
    description:
      "A bittersweet after-dinner amaro — gentian, mint and orange peel.",
    price: 31000,
    categoryHandles: ["spirits", "liqueurs"],
    optionTitle: "Size",
    optionValue: "700ml",
    wine_details: {
      producer: "Amaro Verde",
      region: "Italy",
      bottle_size: "750ml",
      abv: 28,
      tasting_notes: "Gentian, mint and orange peel, bittersweet.",
    },
  },
  {
    handle: "obsidian-craft-stout",
    realImageUrl: "/brand/products/beer-craft-stout.webp",
    title: "Obsidian Brewery Craft Stout",
    description:
      "A dry Irish-style stout — roasted barley, dark chocolate and a soft, bitter finish.",
    price: 1800,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "330ml",
    wine_details: {
      producer: "Obsidian Brewery",
      region: "Nigeria",
      bottle_size: "330ml",
      abv: 4.8,
      tasting_notes: "Roasted barley and dark chocolate with a soft bitter finish.",
    },
  },
  {
    handle: "obsidian-pale-ale",
    realImageUrl: "/brand/products/beer-craft-stout.webp",
    title: "Obsidian Brewery Pale Ale",
    description:
      "A hoppy pale ale — grapefruit, pine and a clean, dry finish.",
    price: 1900,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "330ml",
    wine_details: {
      producer: "Obsidian Brewery",
      region: "Nigeria",
      bottle_size: "330ml",
      abv: 5.2,
      tasting_notes: "Grapefruit and pine over a clean, dry finish.",
    },
  },
  {
    handle: "obsidian-lager-crate",
    realImageUrl: "/brand/products/beer-craft-stout.webp",
    title: "Obsidian Brewery Lager (Crate of 12)",
    description:
      "A crisp, cold-conditioned lager — a crate of twelve for the whole table.",
    price: 11000,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "330ml x 12",
    wine_details: {
      producer: "Obsidian Brewery",
      region: "Nigeria",
      bottle_size: "330ml x 12",
      abv: 4.6,
      tasting_notes: "Crisp and cold-conditioned, lightly bitter.",
    },
  },
  {
    handle: "old-orchard-apple-cider",
    realImageUrl: "/brand/products/cider-apple.webp",
    title: "Old Orchard Artisanal Apple Cider",
    description:
      "Small-batch unfiltered cider pressed from crisp local apples — dry, not sweet.",
    price: 4500,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "750ml",
    wine_details: {
      producer: "Old Orchard",
      region: "Vermont, United States",
      bottle_size: "750ml",
      abv: 6.5,
      tasting_notes: "Dry and crisp, pressed from local apples.",
    },
  },
  {
    handle: "obsidian-session-ipa",
    realImageUrl: "/brand/products/beer-craft-stout.webp",
    title: "Obsidian Brewery Session IPA",
    description:
      "All the hops, half the strength — citrus and stone fruit, easy to drink.",
    price: 1900,
    categoryHandles: ["beer"],
    optionTitle: "Size",
    optionValue: "330ml",
    wine_details: {
      producer: "Obsidian Brewery",
      region: "Nigeria",
      bottle_size: "330ml",
      abv: 3.8,
      tasting_notes: "Citrus and stone fruit, light-bodied.",
    },
  },
  {
    handle: "glen-glassaugh-18-gift-tube",
    realImageUrl: "/brand/products/whisky-gift-tube.webp",
    title: "Glen Glassaugh 18 Year Gift Tube",
    description:
      "An eighteen-year single malt in its presentation tube — ready to give as it arrives.",
    price: 128000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "700ml + tube",
    wine_details: {
      producer: "Glen Glassaugh",
      region: "Scotland",
      bottle_size: "750ml",
      abv: 43,
      tasting_notes: "Honeyed orchard fruit, toffee and gentle smoke.",
    },
  },
  {
    handle: "crown-and-key-gin-gift-box",
    realImageUrl: "/brand/products/gin-london-dry.webp",
    title: "The Crown & Key Gin Gift Box",
    description:
      "The London dry in its illustrated presentation box — a gift that needs no wrapping.",
    price: 37000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "700ml + box",
    wine_details: {
      producer: "The Crown & Key",
      region: "London, United Kingdom",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Juniper-forward with bright citrus.",
    },
  },
  {
    handle: "mezcal-artesanal-gift-box",
    realImageUrl: "/brand/products/mezcal-artesanal.webp",
    title: "Mezcal Artesanal Gift Box",
    description:
      "Artisanal Espadín mezcal boxed for giving — smoke, agave and a long finish.",
    price: 62000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "700ml + box",
    wine_details: {
      producer: "Mezcal Artesanal Oaxaqueño",
      region: "Oaxaca, Mexico",
      bottle_size: "750ml",
      abv: 45,
      tasting_notes: "Smoke, green agave and a long mineral finish.",
    },
  },
  {
    handle: "maison-dor-xo-presentation-case",
    realImageUrl: "/brand/products/cognac-xo.webp",
    title: "Maison d'Or XO Presentation Case",
    description:
      "The XO in its satin-lined case — the bottle to arrive with when it matters.",
    price: 195000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "700ml + case",
    wine_details: {
      producer: "Maison d'Or",
      region: "Cognac, France",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Dried fruit, leather and old oak.",
    },
  },
  {
    handle: "caribenos-reserve-gift-tube",
    realImageUrl: "/brand/products/rum-dark.webp",
    title: "Caribeño's Reserve Gift Tube",
    description:
      "Twelve-year Caribbean rum in its presentation tube, boxed and ready to give.",
    price: 49000,
    categoryHandles: ["gift-sets"],
    optionTitle: "Set",
    optionValue: "700ml + tube",
    wine_details: {
      producer: "Caribeño's",
      region: "Caribbean",
      bottle_size: "750ml",
      abv: 40,
      tasting_notes: "Molasses, dried fig and toasted almond.",
    },
  },
  {
    handle: "crystal-whisky-tumblers-set-of-4",
    title: "Crystal Whisky Tumblers (Set of 4)",
    description:
      "Heavy-based lead-free crystal tumblers, cut to catch the light. Set of four.",
    price: 22000,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "4 x 300ml",
  },
  {
    handle: "crystal-wine-glasses-set-of-6",
    title: "Crystal Wine Glasses (Set of 6)",
    description:
      "Fine-rimmed crystal glasses with a long stem, for red and white alike. Set of six.",
    price: 28000,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "6 x 450ml",
  },
  {
    handle: "hand-cut-decanter",
    title: "Hand-Cut Glass Decanter",
    description:
      "A weighted hand-cut decanter with a ground-glass stopper — for whisky, brandy or wine.",
    price: 34000,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "1.2L",
  },
  {
    handle: "insulated-ice-bucket-and-tongs",
    title: "Insulated Ice Bucket & Tongs",
    description:
      "A double-walled stainless bucket that keeps ice solid for hours, with matching tongs.",
    price: 19500,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "3L",
  },
  {
    handle: "bartenders-cocktail-tool-kit",
    title: "Bartender's Cocktail Tool Kit",
    description:
      "Shaker, jigger, strainer, muddler, bar spoon and three pourers, in a stand.",
    price: 26500,
    categoryHandles: ["accessories"],
    optionTitle: "Set",
    optionValue: "8-piece",
  },
];

export default async function product_catalog_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  // Real product photography sourced from Wikimedia Commons (openly
  // licensed) — not brand-supplied imagery. Fine for a UI-review pass;
  // if LiquorCentral secures real supplier/brand photography later,
  // that should replace these, not the other way around.
  const imageUrl = (seed: SeedProduct, _index: number) => seed.realImageUrl;

  const existingProducts = await productModuleService.listProducts(
    {},
    { select: ["id", "handle", "thumbnail"] }
  );
  const existingProductByHandle = new Map(
    existingProducts.map((p) => [p.handle, p])
  );

  const toCreate = PRODUCTS.filter((p) => !existingProductByHandle.has(p.handle));

  // Corrects images on products created by an earlier run of this script
  // (e.g. before topically-relevant placeholder photos replaced generic
  // random ones) — re-runs harmlessly if images already match.
  for (const [index, seed] of PRODUCTS.entries()) {
    const existing = existingProductByHandle.get(seed.handle);
    if (!existing) continue;

    const newUrl = imageUrl(seed, index);
    // A seed with no declared image never overwrites what is already on the
    // product. Otherwise re-running this would wipe the thumbnail off
    // anything that had since been given real photography in Admin.
    if (!newUrl) continue;
    if (existing.thumbnail === newUrl) continue;

    await productModuleService.updateProducts(existing.id, {
      thumbnail: newUrl,
      images: [{ url: newUrl }],
    });
  }

  if (toCreate.length === 0) {
    logger.info("product-catalog-seed: all seed products already exist — images refreshed, skipping creation.");
  } else {
    await createMissingProducts();
  }

  await seedCuratedCollections();

  async function createMissingProducts() {
  const categories = await productModuleService.listProductCategories(
    {},
    { select: ["id", "handle"] }
  );
  const categoryIdByHandle = new Map(categories.map((c) => [c.handle, c.id]));

  const salesChannels = await salesChannelModuleService.listSalesChannels(
    {},
    { select: ["id", "name"] }
  );
  const salesChannel =
    salesChannels.find((sc) => sc.name === "LiquorCentral Storefront") ??
    salesChannels[0];

  if (!salesChannel) {
    logger.warn(
      "product-catalog-seed: no sales channel found — skipping product seed."
    );
    return;
  }

  let shippingProfiles = await fulfillmentModuleService.listShippingProfiles(
    { type: "default" },
    { select: ["id"] }
  );
  let shippingProfileId = shippingProfiles[0]?.id;

  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default Shipping Profile", type: "default" }],
      },
    });
    shippingProfileId = result[0].id;
    logger.info("product-catalog-seed: created a default shipping profile.");
  }

  logger.info(
    `product-catalog-seed: creating ${toCreate.length} product(s)...`
  );

  for (const seed of toCreate) {
    const index = PRODUCTS.indexOf(seed);
    const url = imageUrl(seed, index);
    const categoryIds = (seed.categoryHandles ?? [])
      .map((handle) => categoryIdByHandle.get(handle))
      .filter((id): id is string => !!id);

    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: seed.title,
            handle: seed.handle,
            description: seed.description,
            status: "published",
            ...(url ? { thumbnail: url, images: [{ url }] } : {}),
            category_ids: categoryIds,
            sales_channels: [{ id: salesChannel.id }],
            shipping_profile_id: shippingProfileId,
            options: [{ title: seed.optionTitle, values: [seed.optionValue] }],
            variants: [
              {
                title: seed.optionValue,
                sku: seed.handle.toUpperCase(),
                options: { [seed.optionTitle]: seed.optionValue },
                prices: [{ amount: seed.price, currency_code: "ngn" }],
                manage_inventory: false,
              },
            ],
          },
        ],
        additional_data: {
          ...(seed.wine_details ?? {}),
          ...(seed.food_details ?? {}),
        },
      },
    });
  }

  logger.info(
    `product-catalog-seed: finished creating ${toCreate.length} product(s).`
  );
  }

  // Curated Collections — 02_HOMEPAGE_SPECIFICATION.md §8.4/§19: the
  // homepage's Curated Collections section only ever renders its
  // fallback link until at least one real Collection exists. Seeding two
  // here so the homepage has genuine shelves to show, same UI-review
  // rationale as the products themselves — not a final merchandising
  // decision on naming or grouping.
  async function seedCuratedCollections() {
  const COLLECTIONS: { title: string; handle: string; productHandles: string[] }[] = [
    {
      title: "Featured Wines & Spirits",
      handle: "featured-wines-spirits",
      productHandles: [
        "chateau-margaux-2015",
        "dom-perignon-vintage-2013",
        "johnnie-walker-blue-label",
        "hennessy-vsop",
      ],
    },
    {
      title: "Everyday Favourites",
      handle: "everyday-favourites",
      productHandles: [
        "casillero-del-diablo-cabernet-sauvignon",
        "jack-daniels-old-no-7",
        "grey-goose-vodka",
        "heineken-lager-crate",
      ],
    },
    {
      title: "Top Shelf Whisky",
      handle: "top-shelf-whisky",
      productHandles: [
        "johnnie-walker-blue-label",
        "macallan-12-double-cask",
        "chivas-regal-12",
        "glenfiddich-12",
      ],
    },
    {
      title: "Nigerian Kitchen Favourites",
      handle: "nigerian-kitchen-favourites",
      productHandles: [
        "jollof-rice-grilled-chicken",
        "suya-platter-beef-skewers",
        "egusi-soup-pounded-yam",
        "moin-moin",
      ],
    },
  ];

  const existingCollections = await productModuleService.listProductCollections(
    {},
    { select: ["id", "handle"] }
  );
  const allProducts = await productModuleService.listProducts(
    {},
    { select: ["id", "handle"] }
  );
  const productIdByHandle = new Map(allProducts.map((p) => [p.handle, p.id]));

  for (const collectionSeed of COLLECTIONS) {
    let collectionId = existingCollections.find(
      (c) => c.handle === collectionSeed.handle
    )?.id;

    if (!collectionId) {
      const { result } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            { title: collectionSeed.title, handle: collectionSeed.handle },
          ],
        },
      });
      collectionId = result[0].id;
      logger.info(`product-catalog-seed: created collection "${collectionSeed.title}".`);
    }

    const productIds = collectionSeed.productHandles
      .map((handle) => productIdByHandle.get(handle))
      .filter((id): id is string => !!id);

    for (const productId of productIds) {
      await productModuleService.updateProducts(productId, {
        collection_id: collectionId,
      });
    }
  }

  logger.info("product-catalog-seed: finished seeding curated collections.");
  }
}
