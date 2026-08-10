import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Swaps in Paul-supplied product photography for products that were
 * already live (seeded with a Wikipedia stock photo) before the real
 * photo existed. Editing `product-catalog-seed-v4.ts`'s `realImageUrl`
 * alone only affects a *fresh* database — these 4 products already exist
 * in production with the old `thumbnail`/`images`, and nothing re-runs
 * `createProductsWorkflow` against an existing product, so this is a
 * one-time direct update against the live records. Same pattern as
 * `enable-liquor-inventory-tracking.ts`.
 *
 * Idempotent: re-running it just re-sets the same value, so it's safe to
 * leave in `railway.json`'s `preDeployCommand` chain rather than running
 * it once and removing it — the next photo swap can just add a row here.
 */
const PHOTO_UPDATES: { handle: string; imageUrl: string }[] = [
  { handle: "jameson-irish-whiskey", imageUrl: "/brand/products/jameson-irish-whiskey.webp" },
  { handle: "grey-goose-vodka", imageUrl: "/brand/products/grey-goose-vodka.webp" },
  { handle: "baileys-irish-cream", imageUrl: "/brand/products/baileys-irish-cream.webp" },
  { handle: "heineken-lager-crate", imageUrl: "/brand/products/heineken-lager-crate.webp" },
];

export default async function update_product_photography({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  const handles = PHOTO_UPDATES.map((p) => p.handle);
  const products = await productModuleService.listProducts(
    { handle: handles },
    { select: ["id", "handle", "thumbnail"] }
  );
  const productByHandle = new Map(products.map((p) => [p.handle, p]));

  let updated = 0;
  for (const { handle, imageUrl } of PHOTO_UPDATES) {
    const product = productByHandle.get(handle);
    if (!product) {
      logger.warn(
        `update-product-photography: no product found for handle "${handle}" — skipping.`
      );
      continue;
    }
    if (product.thumbnail === imageUrl) {
      continue;
    }
    await productModuleService.updateProducts(product.id, {
      thumbnail: imageUrl,
      images: [{ url: imageUrl }],
    });
    updated += 1;
  }

  logger.info(
    `update-product-photography: updated ${updated} of ${PHOTO_UPDATES.length} product(s).`
  );
}
