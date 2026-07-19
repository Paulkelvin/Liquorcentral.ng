import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FOOD_DETAILS_MODULE } from "../../../modules/food-details"
import FoodDetailsModuleService from "../../../modules/food-details/service"

/**
 * Removes a product's food_details record entirely — used when every
 * content field has been cleared, so the module never stores an empty,
 * all-null row (TIER_B_FOOD_ATTRIBUTES_MODULE.md §3's "raw data layer
 * only" responsibility implies no data means no record).
 */
export const deleteFoodDetailsStep = createStep(
  "delete-food-details",
  async (foodDetails: Record<string, unknown>, { container }) => {
    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    await foodDetailsModuleService.deleteFoodDetails(
      foodDetails.id as string
    )

    return new StepResponse(foodDetails.id, foodDetails)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const foodDetailsModuleService: FoodDetailsModuleService =
      container.resolve(FOOD_DETAILS_MODULE)

    await foodDetailsModuleService.createFoodDetails(
      previous as Record<string, unknown>
    )
  }
)
