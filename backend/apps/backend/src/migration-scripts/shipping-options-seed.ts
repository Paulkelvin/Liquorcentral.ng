import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * No stock location, fulfillment set, service zone, or shipping option was
 * ever seeded for this store (`initial-data-seed.ts`'s own comment says so
 * explicitly — deferred as later work). The practical effect: every cart's
 * `/store/shipping-options` call returns an empty list, so checkout's
 * Delivery step has nothing to offer and "Continue to payment" can never
 * enable — confirmed directly against both the local and production
 * backends with a real cart and a real Lagos address.
 *
 * This is a placeholder, not a real logistics model — one stock location,
 * one service zone covering all of Nigeria, one flat-rate option, so
 * checkout is unblocked end to end. Paul owns the real rates/zones/carrier
 * decision (a business call, not a code one) and should adjust this in
 * Admin → Settings → Locations & Shipping once that's decided; nothing here
 * assumes it's final.
 *
 * Idempotent: every step checks for an existing record by name before
 * creating one, matching this directory's other seed scripts (see
 * `product-catalog-seed-v4.ts`'s identical pattern) — safe to re-run on
 * every deploy via `railway.json`'s `preDeployCommand` chain.
 */
export default async function shipping_options_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  const LOCATION_NAME = "LiquorCentral Lagos Warehouse";
  const FULFILLMENT_SET_NAME = "Nigeria Delivery";
  const SERVICE_ZONE_NAME = "Nigeria";
  const SHIPPING_OPTION_NAME = "Standard delivery";
  // The manual fulfillment provider Medusa ships by default — the same one
  // already registered for this store (confirmed: `fulfillment_provider`
  // has exactly one row, `manual_manual`). Swap for a real carrier
  // integration later; this exists to make a shipping method selectable,
  // not to model real logistics.
  const PROVIDER_ID = "manual_manual";
  // A placeholder flat rate, in the same "major units, no /100" convention
  // every product price in this store already uses (confirmed against
  // `product-catalog-seed-v4.ts`'s own prices and the storefront's price
  // display, neither of which divides by 100). Edit in Admin once a real
  // rate is decided.
  const FLAT_RATE_NGN = 2500;

  let [stockLocation] = await stockLocationModuleService.listStockLocations(
    { name: LOCATION_NAME },
    { select: ["id"] }
  );

  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: LOCATION_NAME }] },
    });
    stockLocation = result[0];
    logger.info(`shipping-options-seed: created stock location "${LOCATION_NAME}".`);

    // Links the location to the manual provider so a shipping option
    // placed there can actually use it — the same `remoteLink`/`LINK`
    // mechanism Medusa's own quickstart seed uses for this exact link,
    // since a stock location's fulfillment providers aren't settable at
    // creation time.
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: PROVIDER_ID },
    });
  }

  // Checked unconditionally, not just on first creation — the link
  // `/store/shipping-options` actually filters on. Without it, the stock
  // location can carry a fulfillment set, a service zone and a priced
  // shipping option and still never show up for a real storefront cart,
  // because the store query scopes stock locations to the cart's sales
  // channel first (confirmed locally: shipping-options returned `[]` for a
  // real cart until this link existed, despite every other piece already
  // being in place).
  const [salesChannel] = await salesChannelModuleService.listSalesChannels(
    {},
    { select: ["id"], take: 1 }
  );
  if (salesChannel) {
    // Cross-module link, not a native relation on either module's own
    // entity — only the Query module can join the two, hence `query.graph`
    // rather than `stockLocationModuleService.listStockLocations`.
    const { data: linkedLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "sales_channels.id"],
      filters: { id: stockLocation.id },
    });
    const alreadyLinked = linkedLocations[0]?.sales_channels?.some(
      (sc) => sc?.id === salesChannel.id
    );
    if (!alreadyLinked) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: stockLocation.id, add: [salesChannel.id] },
      });
      logger.info("shipping-options-seed: linked stock location to the default sales channel.");
    }
  }

  let [fulfillmentSet] = await fulfillmentModuleService.listFulfillmentSets(
    { name: FULFILLMENT_SET_NAME },
    { select: ["id"], relations: ["service_zones"] }
  );

  if (!fulfillmentSet) {
    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocation.id,
        fulfillment_set_data: { name: FULFILLMENT_SET_NAME, type: "shipping" },
      },
    });
    ;[fulfillmentSet] = await fulfillmentModuleService.listFulfillmentSets(
      { name: FULFILLMENT_SET_NAME },
      { select: ["id"], relations: ["service_zones"] }
    );
    logger.info(`shipping-options-seed: created fulfillment set "${FULFILLMENT_SET_NAME}".`);
  }

  let serviceZone = fulfillmentSet.service_zones?.find(
    (z: { name: string }) => z.name === SERVICE_ZONE_NAME
  );

  if (!serviceZone) {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            name: SERVICE_ZONE_NAME,
            fulfillment_set_id: fulfillmentSet.id,
            geo_zones: [{ type: "country", country_code: "ng" }],
          },
        ],
      },
    });
    serviceZone = result[0];
    logger.info(`shipping-options-seed: created service zone "${SERVICE_ZONE_NAME}" (all of Nigeria).`);
  }

  const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles(
    { type: "default" },
    { select: ["id"] }
  );

  if (!shippingProfile) {
    logger.warn(
      "shipping-options-seed: no default shipping profile found — skipping shipping option creation."
    );
    return;
  }

  const [existingOption] = await fulfillmentModuleService.listShippingOptions(
    { name: SHIPPING_OPTION_NAME },
    { select: ["id"] }
  );

  if (!existingOption) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: SHIPPING_OPTION_NAME,
          service_zone_id: serviceZone.id,
          shipping_profile_id: shippingProfile.id,
          provider_id: PROVIDER_ID,
          type: {
            label: "Standard",
            description: "Standard delivery",
            code: "standard",
          },
          price_type: "flat",
          prices: [{ amount: FLAT_RATE_NGN, currency_code: "ngn" }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
    logger.info(
      `shipping-options-seed: created shipping option "${SHIPPING_OPTION_NAME}" at a flat ₦${FLAT_RATE_NGN}.`
    );
  } else {
    logger.info("shipping-options-seed: shipping option already exists, skipping.");
  }
}
