import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  bookDeliverySlotCapacity,
  releaseDeliverySlotCapacity,
} from "../lib/capacity"

export type BookDeliverySlotCapacityStepInput = {
  delivery_slot_id: string
}

/**
 * Workflow-composable form of lib/capacity's bookDeliverySlotCapacity,
 * for use in ordinary workflow steps (as opposed to
 * src/workflows/hooks/complete-cart-validate.ts, which calls the same
 * lib functions directly since a hook handler is a plain invoke/compensate
 * pair, not a createStep). Kept as a thin wrapper so the same atomic
 * check-and-increment logic is exercised identically by both paths and by
 * this step's own dedicated tests.
 */
export const bookDeliverySlotCapacityStep = createStep(
  "book-delivery-slot-capacity",
  async (input: BookDeliverySlotCapacityStepInput, { container }) => {
    await bookDeliverySlotCapacity(container, input.delivery_slot_id)

    return new StepResponse(
      { delivery_slot_id: input.delivery_slot_id },
      { delivery_slot_id: input.delivery_slot_id }
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
