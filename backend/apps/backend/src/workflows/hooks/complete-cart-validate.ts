import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { extractDeliverySlotId } from "../delivery-slot/lib/extract-delivery-slot-id"
import {
  bookDeliverySlotCapacity,
  releaseDeliverySlotCapacity,
} from "../delivery-slot/lib/capacity"

/**
 * Wires delivery-slot capacity enforcement into Medusa's native
 * completeCartWorkflow via its `validate` hook — the sanctioned extension
 * point for "custom validation that may stop the workflow" (the hook's
 * own doc comment: "executed before all operations... throw an error to
 * stop the workflow execution"), rather than editing complete-cart.js
 * directly (ARCHITECTURE.md's module-isolation rule applies to native
 * workflows too, not only native modules).
 *
 * Chosen over the workflow's other two hooks (beforePaymentAuthorization,
 * orderCreated) because `validate` runs before order creation, inventory
 * reservation, and payment authorization all begin — a slot at capacity
 * is rejected before any of that side-effecting work starts, rather than
 * after, which is both cheaper and satisfies
 * TIER_B_DELIVERY_SLOT_MODULE.md §12's requirement that a slot filling
 * between selection and final submission "must be caught before payment
 * is charged" as directly as this workflow allows.
 *
 * Registering a compensateFn (not just an invoke handler) is what makes
 * this satisfy §3/§10's "same transactional boundary... preserving
 * Medusa's compensation/rollback guarantees" requirement precisely, not
 * approximately: Medusa's createHook wires a hook handler's second
 * argument into the exact same invoke/compensate step machinery an
 * ordinary createStep gets (see
 * @medusajs/workflows-sdk/dist/utils/composer/create-hook.js), so if any
 * later step in completeCartWorkflow fails (inventory reservation,
 * payment authorization, order creation), this hook's compensation runs
 * automatically and releases the capacity this hook booked — exactly the
 * guarantee reserveInventoryStep gets natively.
 *
 * A cart with no delivery-slot-carrying shipping method (Wine & Spirits,
 * or a Food Central pickup order) is a deliberate no-op — see
 * lib/extract-delivery-slot-id.ts.
 */
completeCartWorkflow.hooks.validate(
  async ({ cart }, { container }) => {
    const deliverySlotId = extractDeliverySlotId(cart)

    if (!deliverySlotId) {
      return new StepResponse(undefined, undefined)
    }

    await bookDeliverySlotCapacity(container, deliverySlotId)

    return new StepResponse(
      { delivery_slot_id: deliverySlotId },
      { delivery_slot_id: deliverySlotId }
    )
  },
  async (compensationInput, { container }) => {
    if (!compensationInput?.delivery_slot_id) {
      return
    }

    await releaseDeliverySlotCapacity(
      container,
      compensationInput.delivery_slot_id
    )
  }
)
