import { MedusaContainer } from "@medusajs/framework/types"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import { ILockingModule } from "@medusajs/framework/types"
import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot"
import DeliverySlotModuleService from "../../../modules/delivery-slot/service"

/**
 * Atomic capacity check-and-increment (TIER_B_DELIVERY_SLOT_MODULE.md §3,
 * §6, §10). Reuses Medusa's own Locking Module — the same mechanism the
 * platform uses elsewhere for reservation-style concurrency control —
 * rather than inventing a new concurrency-control approach, per §10's
 * explicit instruction. Throws MedusaError.Types.NOT_ALLOWED if the slot
 * has no remaining capacity; the caller (a workflow step or a workflow
 * hook) is responsible for turning that into a workflow failure.
 */
export async function bookDeliverySlotCapacity(
  container: MedusaContainer,
  deliverySlotId: string
): Promise<void> {
  const lockingModuleService: ILockingModule = container.resolve(
    Modules.LOCKING
  )
  const deliverySlotModuleService: DeliverySlotModuleService =
    container.resolve(DELIVERY_SLOT_MODULE)

  await lockingModuleService.execute(deliverySlotId, async () => {
    const slot = await deliverySlotModuleService.retrieveDeliverySlot(
      deliverySlotId
    )

    if (slot.booked_count >= slot.capacity) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Delivery slot ${deliverySlotId} is at capacity`
      )
    }

    await deliverySlotModuleService.updateDeliverySlots({
      id: deliverySlotId,
      booked_count: slot.booked_count + 1,
    })
  })
}

/**
 * Compensation for bookDeliverySlotCapacity — releases the one unit of
 * capacity booked above. Locked the same way, for the same reason: two
 * concurrent releases (or a release racing a new booking) must not
 * corrupt the count.
 */
export async function releaseDeliverySlotCapacity(
  container: MedusaContainer,
  deliverySlotId: string
): Promise<void> {
  const lockingModuleService: ILockingModule = container.resolve(
    Modules.LOCKING
  )
  const deliverySlotModuleService: DeliverySlotModuleService =
    container.resolve(DELIVERY_SLOT_MODULE)

  await lockingModuleService.execute(deliverySlotId, async () => {
    const slot = await deliverySlotModuleService.retrieveDeliverySlot(
      deliverySlotId
    )

    await deliverySlotModuleService.updateDeliverySlots({
      id: deliverySlotId,
      booked_count: Math.max(0, slot.booked_count - 1),
    })
  })
}
