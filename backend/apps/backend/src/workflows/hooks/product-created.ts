import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  attachWineDetailsToProductWorkflow,
  AttachWineDetailsToProductWorkflowInput,
} from "../wine-details/attach-wine-details-to-product"
import {
  attachFoodDetailsToProductWorkflow,
  AttachFoodDetailsToProductWorkflowInput,
} from "../food-details/attach-food-details-to-product"

/**
 * Medusa allows exactly one handler registration per native workflow
 * hook (confirmed empirically: registering a second
 * `createProductsWorkflow.hooks.productsCreated(...)` throws "Cannot
 * define multiple hook handlers for the productsCreated hook") — so
 * this is the single, shared integration point every attribute module's
 * "attach on product create" workflow runs from, not something any one
 * module's own directory can own. Each module's workflow
 * (attach-wine-details-to-product, attach-food-details-to-product)
 * remains independently responsible for its own no-op-when-empty logic;
 * this file only sequences calling them.
 */
createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    const wineDetailsWorkflow = attachWineDetailsToProductWorkflow(container)
    const foodDetailsWorkflow = attachFoodDetailsToProductWorkflow(container)

    for (const product of products) {
      await wineDetailsWorkflow.run({
        input: {
          product,
          additional_data,
        } as AttachWineDetailsToProductWorkflowInput,
      })

      await foodDetailsWorkflow.run({
        input: {
          product,
          additional_data,
        } as AttachFoodDetailsToProductWorkflowInput,
      })
    }
  }
)
