import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  attachWineDetailsToProductWorkflow,
  AttachWineDetailsToProductWorkflowInput,
} from "../attach-wine-details-to-product"

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    const workflow = attachWineDetailsToProductWorkflow(container)

    for (const product of products) {
      await workflow.run({
        input: {
          product,
          additional_data,
        } as AttachWineDetailsToProductWorkflowInput,
      })
    }
  }
)
