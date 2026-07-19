import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WINE_DETAILS_MODULE } from "../../../modules/wine-details"
import WineDetailsModuleService from "../../../modules/wine-details/service"

/**
 * Removes a product's wine_details record entirely — used when every
 * field has been cleared, so the module never stores an empty,
 * all-null row (TIER_B_WINE_ATTRIBUTES_MODULE.md §3's "raw data layer
 * only" responsibility implies no data means no record).
 */
export const deleteWineDetailsStep = createStep(
  "delete-wine-details",
  async (wineDetails: Record<string, unknown>, { container }) => {
    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    await wineDetailsModuleService.deleteWineDetails(
      wineDetails.id as string
    )

    return new StepResponse(wineDetails.id, wineDetails)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    await wineDetailsModuleService.createWineDetails(
      previous as Record<string, unknown>
    )
  }
)
