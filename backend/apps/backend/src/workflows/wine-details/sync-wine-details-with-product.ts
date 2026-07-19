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
import { WINE_DETAILS_MODULE } from "../../modules/wine-details"
import { createWineDetailsStep } from "./steps/create-wine-details"
import { updateWineDetailsStep } from "./steps/update-wine-details"
import { deleteWineDetailsStep } from "./steps/delete-wine-details"
import { hasAnyWineDetailsValue, pickWineDetailsFields } from "./helpers"

export type SyncWineDetailsWithProductWorkflowInput = {
  product: ProductDTO
  additional_data?: Record<string, unknown> | null
}

/**
 * The linked wine_details field isn't part of ProductDTO's static type —
 * Query composes it at runtime from the `fields` string below, per
 * Medusa's remote-link model. This is the query result's actual shape.
 */
type ProductWithWineDetails = ProductDTO & {
  wine_details: {
    id: string
    vintage: number | null
    producer: string | null
    region: string | null
    bottle_size: string | null
    tasting_notes: string | null
    serving_temperature: string | null
    abv: number | null
  } | null
}

/**
 * Runs from updateProductsWorkflow.hooks.productsUpdated (see
 * hooks/product-updated.ts). Three cases, matching the module's own
 * "raw data layer only, tolerate inapplicability" responsibility
 * (TIER_B_WINE_ATTRIBUTES_MODULE.md §3):
 *
 *   - no existing record, values supplied  -> create + link
 *   - existing record, values supplied     -> update in place
 *   - existing record, every value cleared -> delete + unlink
 *
 * An update request that doesn't mention wine-details fields at all
 * (additional_data has none of them) leaves the existing record
 * untouched, exactly like any other product field Medusa doesn't
 * receive in a given PATCH.
 */
export const syncWineDetailsWithProductWorkflow = createWorkflow(
  "sync-wine-details-with-product",
  (input: SyncWineDetailsWithProductWorkflowInput) => {
    const { data: productsData } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "wine_details.*"],
      filters: { id: input.product.id },
    })
    const products = productsData as unknown as ProductWithWineDetails[]

    const fields = transform({ input }, (data) =>
      pickWineDetailsFields(data.input.additional_data)
    )

    const suppliedAnyField = transform({ input }, (data) =>
      Object.keys(data.input.additional_data ?? {}).some((key) =>
        [
          "vintage",
          "producer",
          "region",
          "bottle_size",
          "tasting_notes",
          "serving_temperature",
          "abv",
        ].includes(key)
      )
    )

    const created = when(
      "create-product-wine-details-link",
      { products, fields, suppliedAnyField },
      (data) =>
        !data.products[0].wine_details &&
        data.suppliedAnyField &&
        hasAnyWineDetailsValue(data.fields)
    ).then(() => {
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
    })

    const updated = when(
      "update-product-wine-details",
      { products, fields, suppliedAnyField },
      (data) =>
        !!data.products[0].wine_details &&
        data.suppliedAnyField &&
        hasAnyWineDetailsValue(data.fields)
    ).then(() => {
      // Non-null: only reached when the `when` condition above already
      // confirmed products[0].wine_details exists.
      return updateWineDetailsStep({
        id: products[0].wine_details!.id,
        fields,
      })
    })

    const deleted = when(
      "delete-product-wine-details",
      { products, suppliedAnyField, fields },
      (data) =>
        !!data.products[0].wine_details &&
        data.suppliedAnyField &&
        !hasAnyWineDetailsValue(data.fields)
    ).then(() => {
      // Non-null: only reached when the `when` condition above already
      // confirmed products[0].wine_details exists.
      const existing = products[0].wine_details!

      deleteWineDetailsStep(existing)

      // dismissRemoteLinkStep needs both sides of the link (same shape as
      // createRemoteLinkStep's input) to identify which link definition to
      // dismiss — a single-sided payload throws inside Link.getLinkDataConfig.
      dismissRemoteLinkStep([
        {
          [Modules.PRODUCT]: {
            product_id: input.product.id,
          },
          [WINE_DETAILS_MODULE]: {
            wine_details_id: existing.id,
          },
        },
      ])

      return existing.id
    })

    return new WorkflowResponse({ created, updated, deleted })
  }
)
