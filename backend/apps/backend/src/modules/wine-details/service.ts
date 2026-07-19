import { MedusaService } from "@medusajs/framework/utils"
import { WineDetails } from "./models/wine-details"

/**
 * Generated CRUD methods (createWineDetails, retrieveWineDetails,
 * updateWineDetails, deleteWineDetails, listWineDetails, ...) come from
 * MedusaService — this module holds no business logic beyond data access;
 * the "should a record exist for this product" logic lives in the
 * workflow steps that call this service (src/workflows/wine-details).
 */
class WineDetailsModuleService extends MedusaService({
  WineDetails,
}) {}

export default WineDetailsModuleService
