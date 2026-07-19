import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Minimal store-level foundation for LiquorCentral: one sales channel, one
 * store (NGN default currency), one Nigeria region, and a Nigeria tax
 * region shell. No specific VAT/tax rate is set here — the exact rate is
 * an open business/legal decision (see docs/PROJECT_STATUS.md), not
 * something this script should invent. No stock locations, fulfillment
 * sets, shipping options, or products are seeded here — those depend on
 * DELIVERY_MODEL.md and the wine-details/food-details modules, which are
 * later, separate milestones, not backend foundation.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "LiquorCentral Storefront",
          description: "LiquorCentral.ng's single storefront sales channel — Wine & Spirits and Food Central both sell through it (see PRODUCT_BLUEPRINT.md §9 — no order-splitting, one cart, one checkout).",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "LiquorCentral Storefront API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "LiquorCentral",
          supported_currencies: [
            {
              currency_code: "ngn",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });
  logger.info("Finished seeding store data.");

  logger.info("Seeding region data...");
  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Nigeria",
          currency_code: "ngn",
          countries: ["ng"],
          // pp_system_default is Medusa's built-in placeholder payment
          // provider — it exists so the region is functionally valid.
          // It is not the local Nigerian payment provider named in
          // MEDUSA_EXTENSIONS.md #4; that is separate, later work gated
          // on Paul's provider decision (see TIER_B_LOCAL_PAYMENT_PROVIDER_MODULE.md).
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  // No default tax rate is set here — the exact Nigerian tax treatment
  // (VAT rate, any alcohol/food-specific rules) is an open business/legal
  // decision, not one this script should invent. This creates the region
  // shell only, using Medusa's native system tax provider.
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "ng",
        provider_id: "tp_system",
      },
    ],
  });
  logger.info("Finished seeding tax regions.");
}
