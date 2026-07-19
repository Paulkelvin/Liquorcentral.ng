import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ProductDTO } from "@medusajs/framework/types"
import { FOOD_DETAILS_MODULE } from "../../modules/food-details"
import { createFoodDetailsStep } from "./steps/create-food-details"
import { hasAnyFoodDetailsValue, pickFoodDetailsFields } from "./helpers"

export type AttachFoodDetailsToProductWorkflowInput = {
  product: ProductDTO
  additional_data?: Record<string, unknown> | null
}

/**
 * Runs from src/workflows/hooks/product-created.ts, the single shared
 * hook handler every attribute module's "attach on create" workflow is
 * called from (Medusa allows only one handler per native hook — see
 * that file's own comment). Only creates a food_details record — and
 * only links it — when the create request actually supplied at least
 * one food-details value; a plain Wine & Spirits product never gets an
 * empty record.
 */
export const attachFoodDetailsToProductWorkflow = createWorkflow(
  "attach-food-details-to-product",
  (input: AttachFoodDetailsToProductWorkflowInput) => {
    const fields = transform({ input }, (data) =>
      pickFoodDetailsFields(data.input.additional_data)
    )

    const shouldCreate = transform({ fields }, (data) =>
      hasAnyFoodDetailsValue(data.fields)
    )

    const created = when({ shouldCreate }, (data) => data.shouldCreate).then(
      () => {
        const foodDetails = createFoodDetailsStep(fields)

        createRemoteLinkStep([
          {
            [Modules.PRODUCT]: {
              product_id: input.product.id,
            },
            [FOOD_DETAILS_MODULE]: {
              food_details_id: foodDetails.id,
            },
          },
        ])

        return foodDetails
      }
    )

    return new WorkflowResponse({ foodDetails: created })
  }
)
