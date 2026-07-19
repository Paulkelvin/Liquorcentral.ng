import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WINE_DETAILS_MODULE } from "../../../modules/wine-details"
import WineDetailsModuleService from "../../../modules/wine-details/service"
import { WineDetailsFields } from "../helpers"

type UpdateWineDetailsStepInput = {
  id: string
  fields: WineDetailsFields
}

export const updateWineDetailsStep = createStep(
  "update-wine-details",
  async ({ id, fields }: UpdateWineDetailsStepInput, { container }) => {
    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    const previous = await wineDetailsModuleService.retrieveWineDetails(id)

    const updated = await wineDetailsModuleService.updateWineDetails({
      id,
      ...fields,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const wineDetailsModuleService: WineDetailsModuleService =
      container.resolve(WINE_DETAILS_MODULE)

    await wineDetailsModuleService.updateWineDetails(previous)
  }
)
