import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
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
  imageKeywords: string;
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
    imageKeywords: "red-wine,wine-bottle",
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
    imageKeywords: "red-wine,wine-bottle",
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
    imageKeywords: "champagne,champagne-bottle",
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
    imageKeywords: "champagne,champagne-bottle",
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
    imageKeywords: "whisky,whiskey",
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
    imageKeywords: "whisky,scotch",
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
    imageKeywords: "whiskey,bourbon",
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
    imageKeywords: "cognac,brandy",
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
    imageKeywords: "vodka,bottle",
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
    imageKeywords: "gin,bottle",
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
    imageKeywords: "rum,bottle",
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
    imageKeywords: "tequila,bottle",
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
    imageKeywords: "cream-liqueur,bottle",
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
    imageKeywords: "beer,lager",
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
    handle: "jollof-rice-grilled-chicken",
    imageKeywords: "jollof-rice,nigerian-food",
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
    imageKeywords: "suya,skewers",
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
    imageKeywords: "goat-meat,nigerian-food",
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
    imageKeywords: "grilled-fish,plantain",
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
    imageKeywords: "shawarma,wrap",
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
    imageKeywords: "spring-rolls,snacks",
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

  const imageUrl = (seed: SeedProduct, index: number) =>
    `https://loremflickr.com/600/800/${encodeURIComponent(seed.imageKeywords)}?lock=${index + 1}`;

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
    return;
  }

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
