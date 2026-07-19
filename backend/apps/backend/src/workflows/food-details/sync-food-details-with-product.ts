import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { ProductDTO } from "@medusajs/framework/types"
import { FOOD_DETAILS_MODULE } from "../../modules/food-details"
import { createFoodDetailsStep } from "./steps/create-food-details"
import { updateFoodDetailsStep } from "./steps/update-food-details"
import { deleteFoodDetailsStep } from "./steps/delete-food-details"
import { hasAnyFoodDetailsValue, pickFoodDetailsFields } from "./helpers"

export type SyncFoodDetailsWithProductWorkflowInput = {
  product: ProductDTO
  additional_data?: Record<string, unknown> | null
}

/**
 * The linked food_details field isn't part of ProductDTO's static type —
 * Query composes it at runtime from the `fields` string below, per
 * Medusa's remote-link model (same reasoning as
 * sync-wine-details-with-product.ts's identical cast).
 */
type ProductWithFoodDetails = ProductDTO & {
  food_details: {
    id: string
    ingredients: string[] | null
    allergens: string[] | null
    dietary_flags: string[] | null
    safety_data_verified: boolean
    spice_level: number | null
    prep_time_minutes: number | null
    portion_size: string | null
  } | null
}

/**
 * Runs from updateProductsWorkflow.hooks.productsUpdated (see
 * hooks/product-updated.ts). Same three-case structure as
 * sync-wine-details-with-product.ts:
 *
 *   - no existing record, values supplied  -> create + link
 *   - existing record, values supplied     -> update in place
 *   - existing record, every value cleared -> delete + unlink
 *
 * An update request that doesn't mention food-details fields at all
 * leaves the existing record untouched.
 */
export const syncFoodDetailsWithProductWorkflow = createWorkflow(
  "sync-food-details-with-product",
  (input: SyncFoodDetailsWithProductWorkflowInput) => {
    const { data: productsData } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "food_details.*"],
      filters: { id: input.product.id },
    })
    const products = productsData as unknown as ProductWithFoodDetails[]

    const fields = transform({ input }, (data) =>
      pickFoodDetailsFields(data.input.additional_data)
    )

    const suppliedAnyField = transform({ input }, (data) =>
      Object.keys(data.input.additional_data ?? {}).some((key) =>
        [
          "ingredients",
          "allergens",
          "dietary_flags",
          "safety_data_verified",
          "spice_level",
          "prep_time_minutes",
          "portion_size",
        ].includes(key)
      )
    )

    const created = when(
      "create-product-food-details-link",
      { products, fields, suppliedAnyField },
      (data) =>
        !data.products[0].food_details &&
        data.suppliedAnyField &&
        hasAnyFoodDetailsValue(data.fields)
    ).then(() => {
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
    })

    const updated = when(
      "update-product-food-details",
      { products, fields, suppliedAnyField },
      (data) =>
        !!data.products[0].food_details &&
        data.suppliedAnyField &&
        hasAnyFoodDetailsValue(data.fields)
    ).then(() => {
      // Non-null: only reached when the `when` condition above already
      // confirmed products[0].food_details exists.
      return updateFoodDetailsStep({
        id: products[0].food_details!.id,
        fields,
      })
    })

    const deleted = when(
      "delete-product-food-details",
      { products, suppliedAnyField, fields },
      (data) =>
        !!data.products[0].food_details &&
        data.suppliedAnyField &&
        !hasAnyFoodDetailsValue(data.fields)
    ).then(() => {
      // Non-null: only reached when the `when` condition above already
      // confirmed products[0].food_details exists.
      const existing = products[0].food_details!

      deleteFoodDetailsStep(existing)

      dismissRemoteLinkStep([
        {
          [Modules.PRODUCT]: {
            product_id: input.product.id,
          },
          [FOOD_DETAILS_MODULE]: {
            food_details_id: existing.id,
          },
        },
      ])

      return existing.id
    })

    return new WorkflowResponse({ created, updated, deleted })
  }
)
