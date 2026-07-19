import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ProductDTO } from "@medusajs/framework/types"
import { WINE_DETAILS_MODULE } from "../../modules/wine-details"
import { createWineDetailsStep } from "./steps/create-wine-details"
import { hasAnyWineDetailsValue, pickWineDetailsFields } from "./helpers"

export type AttachWineDetailsToProductWorkflowInput = {
  product: ProductDTO
  additional_data?: Record<string, unknown> | null
}

/**
 * Runs from src/workflows/hooks/product-created.ts, the single shared
 * hook handler every attribute module's "attach on create" workflow is
 * called from (Medusa allows only one handler per native hook — this
 * workflow originally had its own dedicated hook file until
 * food-details' addition surfaced that constraint; see that shared
 * file's own comment and DECISION_LOG.md). Only creates a wine_details
 * record — and only links it — when the create request actually
 * supplied at least one wine-details value; a plain Food Central
 * product never gets an empty record.
 */
export const attachWineDetailsToProductWorkflow = createWorkflow(
  "attach-wine-details-to-product",
  (input: AttachWineDetailsToProductWorkflowInput) => {
    const fields = transform({ input }, (data) =>
      pickWineDetailsFields(data.input.additional_data)
    )

    const shouldCreate = transform({ fields }, (data) =>
      hasAnyWineDetailsValue(data.fields)
    )

    const created = when({ shouldCreate }, (data) => data.shouldCreate).then(
      () => {
        const wineDetails = createWineDetailsStep(fields)

        createRemoteLinkStep([
          {
            [Modules.PRODUCT]: {
              product_id: input.product.id,
            },
            [WINE_DETAILS_MODULE]: {
              wine_details_id: wineDetails.id,
            },
          },
        ])

        return wineDetails
      }
    )

    return new WorkflowResponse({ wineDetails: created })
  }
)
