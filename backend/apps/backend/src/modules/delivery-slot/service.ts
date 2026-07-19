import { MedusaService } from "@medusajs/framework/utils"
import { DeliverySlot } from "./models/delivery-slot"

/**
 * Generated CRUD methods (createDeliverySlots, retrieveDeliverySlot,
 * updateDeliverySlots, listDeliverySlots, ...) come from MedusaService —
 * this module remains the raw scheduling/capacity data layer only
 * (TIER_B_DELIVERY_SLOT_MODULE.md §3); atomic capacity check-and-increment
 * logic lives in the workflow step that calls this service
 * (src/workflows/delivery-slot), not here.
 */
class DeliverySlotModuleService extends MedusaService({
  DeliverySlot,
}) {}

export default DeliverySlotModuleService
