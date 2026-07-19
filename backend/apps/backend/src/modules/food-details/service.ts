import { MedusaService } from "@medusajs/framework/utils"
import { FoodDetails } from "./models/food-details"

/**
 * Generated CRUD methods (createFoodDetails, retrieveFoodDetails,
 * updateFoodDetails, deleteFoodDetails, listFoodDetails, ...) come from
 * MedusaService — this module holds no business logic beyond data
 * access; the "should a record exist for this product" logic lives in
 * the workflow steps that call this service (src/workflows/food-details).
 */
class FoodDetailsModuleService extends MedusaService({
  FoodDetails,
}) {}

export default FoodDetailsModuleService
