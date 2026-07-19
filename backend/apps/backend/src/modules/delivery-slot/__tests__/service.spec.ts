import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { DELIVERY_SLOT_MODULE } from ".."
import DeliverySlotModuleService from "../service"
import { DeliverySlot } from "../models/delivery-slot"

moduleIntegrationTestRunner<DeliverySlotModuleService>({
  moduleName: DELIVERY_SLOT_MODULE,
  moduleModels: [DeliverySlot],
  resolve: "./src/modules/delivery-slot",
  testSuite: ({ service }) => {
    describe("DeliverySlotModuleService", () => {
      it("creates and retrieves a slot with every field populated", async () => {
        const startsAt = new Date("2026-08-01T10:00:00.000Z")
        const endsAt = new Date("2026-08-01T12:00:00.000Z")
        const cutoffAt = new Date("2026-08-01T09:00:00.000Z")

        const created = await service.createDeliverySlots({
          starts_at: startsAt,
          ends_at: endsAt,
          cutoff_at: cutoffAt,
          capacity: 10,
          booked_count: 0,
        })

        const retrieved = await service.retrieveDeliverySlot(created.id)

        expect(retrieved).toEqual(
          expect.objectContaining({
            id: created.id,
            capacity: 10,
            booked_count: 0,
          })
        )
        expect(new Date(retrieved.starts_at).toISOString()).toBe(
          startsAt.toISOString()
        )
        expect(new Date(retrieved.ends_at).toISOString()).toBe(
          endsAt.toISOString()
        )
      })

      it("defaults booked_count to 0 when not supplied", async () => {
        const created = await service.createDeliverySlots({
          starts_at: new Date("2026-08-02T10:00:00.000Z"),
          ends_at: new Date("2026-08-02T12:00:00.000Z"),
          capacity: 5,
        })

        expect(created.booked_count).toBe(0)
      })

      it("tolerates a null cutoff_at (a scheduled slot with no same-day cutoff)", async () => {
        const created = await service.createDeliverySlots({
          starts_at: new Date("2026-08-05T10:00:00.000Z"),
          ends_at: new Date("2026-08-05T12:00:00.000Z"),
          cutoff_at: null,
          capacity: 5,
        })

        expect(created.cutoff_at).toBeNull()
      })

      it("updates capacity and booked_count in place", async () => {
        const created = await service.createDeliverySlots({
          starts_at: new Date("2026-08-03T10:00:00.000Z"),
          ends_at: new Date("2026-08-03T12:00:00.000Z"),
          capacity: 5,
          booked_count: 0,
        })

        const updated = await service.updateDeliverySlots({
          id: created.id,
          booked_count: 3,
        })

        expect(updated.booked_count).toBe(3)
        expect(updated.capacity).toBe(5)
      })

      it("deletes a slot", async () => {
        const created = await service.createDeliverySlots({
          starts_at: new Date("2026-08-04T10:00:00.000Z"),
          ends_at: new Date("2026-08-04T12:00:00.000Z"),
          capacity: 5,
        })

        await service.deleteDeliverySlots(created.id)

        await expect(
          service.retrieveDeliverySlot(created.id)
        ).rejects.toThrow()
      })

      it("lists multiple slots", async () => {
        await service.createDeliverySlots({
          starts_at: new Date("2026-08-06T10:00:00.000Z"),
          ends_at: new Date("2026-08-06T12:00:00.000Z"),
          capacity: 5,
        })
        await service.createDeliverySlots({
          starts_at: new Date("2026-08-06T14:00:00.000Z"),
          ends_at: new Date("2026-08-06T16:00:00.000Z"),
          capacity: 8,
        })

        const all = await service.listDeliverySlots()

        expect(all.length).toBeGreaterThanOrEqual(2)
      })
    })
  },
})
