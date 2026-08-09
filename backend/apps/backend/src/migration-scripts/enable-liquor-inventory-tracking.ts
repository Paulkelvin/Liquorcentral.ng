import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createInventoryItemsWorkflow,
  createLinksWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Every Wine & Spirits variant was originally seeded with
 * `manage_inventory: false` (`product-catalog-seed-v4.ts`), so the
 * storefront's already-correct "Sold out" logic (product cards, PDP,
 * cart re-validation — all check `manage_inventory`/`inventory_quantity`)
 * never actually triggers, no matter the real stock level. Paul asked for
 * real stock-based sold-out behaviour on liquor; this is a one-time
 * migration to switch tracking on for every existing Wine & Spirits
 * variant already live in the database (a code/seed-data change alone
 * can't retroactively touch already-created records — same reason
 * `product-catalog-seed-v4.ts`'s `manage_inventory: true` for new
 * products, added alongside this file, only affects products created
 * *after* this deploys).
 *
 * Food Central is deliberately excluded — dishes are made-to-order, not
 * stock-counted, and already have their own "Unavailable" toggle
 * (`food_available` metadata, see `food-availability.ts`). Distinguishing
 * the two departments the same way the storefront does: by the
 * `food_details` module link, not by category (Food Central products
 * carry no Product Category at all, per `navigation-category-seed.ts`).
 *
 * `updateProductVariantsWorkflow` (the same one the Admin API's own
 * variant-update route uses) only *flips the flag* — confirmed by
 * reading its source — it does not create the InventoryItem a variant
 * needs before Admin can show a quantity field for it. `createProducts
 * Workflow` only gets that behaviour at creation time via a different,
 * internal step. So this script does explicitly, in order, what that
 * internal step does for a new variant: create a real InventoryItem per
 * variant (SKU-matched) with one stock level at the existing warehouse,
 * then link that item to the variant via the same remote-link shape
 * Medusa's own variant-creation workflow uses.
 *
 * Every new stock level starts at 0 — an honest default, not a real
 * count. The immediate, visible effect once this runs is that every
 * Wine & Spirits product shows "Sold out" until real quantities are
 * entered per variant in Admin → Products → (variant) → Inventory. That
 * tradeoff was discussed and confirmed before writing this.
 *
 * Idempotent: skips any variant that's already tracked, so safe to
 * re-run on every deploy via `railway.json`'s `preDeployCommand` chain —
 * matching this directory's other seed scripts. Must run after both
 * `product-catalog-seed-v4.ts` (products must exist) and
 * `shipping-options-seed.ts` (the stock location must exist).
 */
export default async function enable_liquor_inventory_tracking({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  // Matches `shipping-options-seed.ts`'s `LOCATION_NAME` exactly.
  const [stockLocation] = await stockLocationModuleService.listStockLocations(
    { name: "LiquorCentral Lagos Warehouse" },
    { select: ["id"], take: 1 }
  );

  if (!stockLocation) {
    logger.warn(
      "enable-liquor-inventory-tracking: no stock location found — run shipping-options-seed.ts first. Skipping."
    );
    return;
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "food_details.id",
      "variants.id",
      "variants.sku",
      "variants.manage_inventory",
    ],
  });

  const variantsToTrack = products
    .filter((p) => !p.food_details)
    .flatMap((p) => p.variants ?? [])
    .filter((v) => v.manage_inventory !== true);

  if (variantsToTrack.length === 0) {
    logger.info(
      "enable-liquor-inventory-tracking: all Wine & Spirits variants already tracked — nothing to do."
    );
    return;
  }

  logger.info(
    `enable-liquor-inventory-tracking: enabling stock tracking on ${variantsToTrack.length} Wine & Spirits variant(s)...`
  );

  await updateProductVariantsWorkflow(container).run({
    input: {
      product_variants: variantsToTrack.map((v) => ({
        id: v.id,
        manage_inventory: true,
      })),
    },
  });

  const { result: createdItems } = await createInventoryItemsWorkflow(
    container
  ).run({
    input: {
      items: variantsToTrack.map((v) => ({
        sku: v.sku ?? undefined,
        location_levels: [
          { location_id: stockLocation.id, stocked_quantity: 0 },
        ],
      })),
    },
  });

  await createLinksWorkflow(container).run({
    input: variantsToTrack.map((v, index) => ({
      [Modules.PRODUCT]: { variant_id: v.id },
      [Modules.INVENTORY]: { inventory_item_id: createdItems[index].id },
    })),
  });

  logger.info(
    `enable-liquor-inventory-tracking: done — ${variantsToTrack.length} variant(s) now tracked. Stock defaults to 0 (shows "Sold out") until real counts are entered in Admin.`
  );
}
