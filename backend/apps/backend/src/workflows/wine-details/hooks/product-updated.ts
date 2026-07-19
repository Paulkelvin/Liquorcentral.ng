import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  syncWineDetailsWithProductWorkflow,
  SyncWineDetailsWithProductWorkflowInput,
} from "../sync-wine-details-with-product"

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    const workflow = syncWineDetailsWithProductWorkflow(container)

    for (const product of products) {
      await workflow.run({
        input: {
          product,
          additional_data,
        } as SyncWineDetailsWithProductWorkflowInput,
      })
    }
  }
)
