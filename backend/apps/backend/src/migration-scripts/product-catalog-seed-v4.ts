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
  realImageUrl: string;
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
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Jollof_rice_and_veggies.jpg",
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
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/54/Suya.jpg",
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
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Asun.jpg",
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
    realImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Pounded_Yam_and_Egusi_Soup.jpg",
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
            thumbnail: url,
            images: [{ url }],
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
