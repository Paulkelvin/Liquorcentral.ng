import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DETAILS_MODULE } from "../../../modules/food-details"
import FoodDetailsModuleService from "../../../modules/food-details/service"
import { FoodDetailsFields } from "../helpers"

type UpdateFoodDetailsStepInput = {
  id: string
  fields: FoodDetailsFields
}

export const updateFoodDetailsStep = createStep(
  "update-food-details",
  async ({ id, fields }: UpdateFoodDetailsStepInput, { container }) => {
    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    const previous = await foodDetailsModuleService.retrieveFoodDetails(id)

    const updated = await foodDetailsModuleService.updateFoodDetails({
      id,
      ...fields,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    await foodDetailsModuleService.updateFoodDetails(previous)
  }
)
