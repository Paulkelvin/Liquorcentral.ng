import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WINE_DETAILS_MODULE } from "../../../modules/wine-details"
import WineDetailsModuleService from "../../../modules/wine-details/service"
import { WineDetailsFields } from "../helpers"

export const createWineDetailsStep = createStep(
  "create-wine-details",
  async (fields: WineDetailsFields, { container }) => {
    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    const wineDetails = await wineDetailsModuleService.createWineDetails(
      fields
    )

    return new StepResponse(wineDetails, wineDetails.id)
  },
  async (wineDetailsId: string | undefined, { container }) => {
    if (!wineDetailsId) {
      return
    }

    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    await wineDetailsModuleService.deleteWineDetails(wineDetailsId)
  }
)
