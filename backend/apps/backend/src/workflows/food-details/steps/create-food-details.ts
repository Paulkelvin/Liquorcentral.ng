import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DETAILS_MODULE } from "../../../modules/food-details"
import FoodDetailsModuleService from "../../../modules/food-details/service"
import { FoodDetailsFields } from "../helpers"

export const createFoodDetailsStep = createStep(
  "create-food-details",
  async (fields: FoodDetailsFields, { container }) => {
    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    const foodDetails = await foodDetailsModuleService.createFoodDetails(
      fields
    )

    return new StepResponse(foodDetails, foodDetails.id)
  },
  async (foodDetailsId: string | undefined, { container }) => {
    if (!foodDetailsId) {
      return
    }

    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    await foodDetailsModuleService.deleteFoodDetails(foodDetailsId)
  }
)
