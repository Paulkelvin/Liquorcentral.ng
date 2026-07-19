import { defineLink } from "@medusajs/framework/utils"
import FulfillmentModule from "@medusajs/medusa/fulfillment"
import DeliverySlotModule from "../modules/delivery-slot"

/**
 * Many-to-one in practice: many delivery_slot rows (recurring windows
 * across many days) link to the one Shipping Option a customer selects
 * (e.g. "Food Central Delivery") — restating TIER_B_DELIVERY_SLOT_MODULE.md
 * §10 directly. No cardinality enforcement is needed here, unlike
 * product-wine-details' 1:1 link: a Shipping Option naturally having many
 * linked delivery slots is the correct, unconstrained shape, not a rule
 * this link definition or any workflow step needs to guard.
 */
export default defineLink(
  DeliverySlotModule.linkable.deliverySlot,
  FulfillmentModule.linkable.shippingOption
)
