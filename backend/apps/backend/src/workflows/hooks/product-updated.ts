import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  syncWineDetailsWithProductWorkflow,
  SyncWineDetailsWithProductWorkflowInput,
} from "../wine-details/sync-wine-details-with-product"
import {
  syncFoodDetailsWithProductWorkflow,
  SyncFoodDetailsWithProductWorkflowInput,
} from "../food-details/sync-food-details-with-product"

/**
 * See product-created.ts's identical note: exactly one handler may be
 * registered per native workflow hook, so this is the single, shared
 * integration point every attribute module's "sync on product update"
 * workflow runs from.
 */
updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    const wineDetailsWorkflow = syncWineDetailsWithProductWorkflow(container)
    const foodDetailsWorkflow = syncFoodDetailsWithProductWorkflow(container)

    for (const product of products) {
      await wineDetailsWorkflow.run({
        input: {
          product,
          additional_data,
        } as SyncWineDetailsWithProductWorkflowInput,
      })

      await foodDetailsWorkflow.run({
        input: {
          product,
          additional_data,
        } as SyncFoodDetailsWithProductWorkflowInput,
      })
    }
  }
)
