import { initModules } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { DELIVERY_SLOT_MODULE } from ".."
import DeliverySlotModuleService from "../service"
import {
  bookDeliverySlotCapacity,
  releaseDeliverySlotCapacity,
} from "../../../workflows/delivery-slot/lib/capacity"

/**
 * Real-execution validation of TIER_B_DELIVERY_SLOT_MODULE.md §20's
 * single highest-severity risk: "a race condition on slot capacity under
 * concurrent bookings." Boots the real `locking` module with its real
 * `locking-redis` provider (the exact provider medusa-config.ts configures
 * for this project) alongside the real delivery_slot module against this
 * environment's actual running Postgres and Redis — not a mock, and not
 * the in-memory locking default a bare moduleIntegrationTestRunner
 * container would otherwise fall back to for an unconfigured Modules.LOCKING.
 *
 * Deliberately uses initModules (a two-module boot) rather than the full
 * medusaIntegrationTestRunner app boot: the full app boot's migration set
 * (every core module, admin included) proved too slow for this
 * environment's default Jest hook timeout during development of this
 * test, and a full HTTP app is not needed to validate this module's own
 * concurrency behavior — only the locking module's genuine Redis-backed
 * coordination is.
 */
describe("Delivery slot capacity enforcement (concurrency)", () => {
  let shutdown: () => Promise<void>
  let deliverySlotModuleService: DeliverySlotModuleService
  let container: { resolve: (key: string) => any }

  beforeAll(async () => {
    const { medusaApp, shutdown: shutdownApp } = await initModules({
      databaseConfig: {
        clientUrl: process.env.DATABASE_URL as string,
      },
      modulesConfig: {
        [Modules.LOCKING]: {
          resolve: "@medusajs/medusa/locking",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/locking-redis",
                id: "locking-redis",
                is_default: true,
                options: {
                  redisUrl: process.env.LOCKING_REDIS_URL,
                },
              },
            ],
          },
        },
        [DELIVERY_SLOT_MODULE]: {
          resolve: "./src/modules/delivery-slot",
        },
      },
    })

    shutdown = shutdownApp
    container = medusaApp.sharedContainer
    deliverySlotModuleService = container.resolve(DELIVERY_SLOT_MODULE)
  }, 30000)

  afterAll(async () => {
    await shutdown()
  })

  it("allows exactly one of two concurrent bookings against a slot with capacity 1", async () => {
    const slot = await deliverySlotModuleService.createDeliverySlots({
      starts_at: new Date("2026-09-01T10:00:00.000Z"),
      ends_at: new Date("2026-09-01T12:00:00.000Z"),
      capacity: 1,
      booked_count: 0,
    })

    const results = await Promise.allSettled([
      bookDeliverySlotCapacity(container as any, slot.id),
      bookDeliverySlotCapacity(container as any, slot.id),
    ])

    const fulfilled = results.filter((r) => r.status === "fulfilled")
    const rejected = results.filter((r) => r.status === "rejected")

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(
      /at capacity/
    )

    const finalSlot = await deliverySlotModuleService.retrieveDeliverySlot(
      slot.id
    )
    expect(finalSlot.booked_count).toBe(1)

    await deliverySlotModuleService.deleteDeliverySlots(slot.id)
  }, 20000)

  it("allows exactly capacity bookings out of a larger concurrent burst, never more", async () => {
    const slot = await deliverySlotModuleService.createDeliverySlots({
      starts_at: new Date("2026-09-02T10:00:00.000Z"),
      ends_at: new Date("2026-09-02T12:00:00.000Z"),
      capacity: 3,
      booked_count: 0,
    })

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        bookDeliverySlotCapacity(container as any, slot.id)
      )
    )

    const fulfilled = results.filter((r) => r.status === "fulfilled")
    const rejected = results.filter((r) => r.status === "rejected")

    expect(fulfilled).toHaveLength(3)
    expect(rejected).toHaveLength(5)

    const finalSlot = await deliverySlotModuleService.retrieveDeliverySlot(
      slot.id
    )
    expect(finalSlot.booked_count).toBe(3)

    await deliverySlotModuleService.deleteDeliverySlots(slot.id)
  }, 20000)

  it("releases capacity back so a subsequent booking can succeed", async () => {
    const slot = await deliverySlotModuleService.createDeliverySlots({
      starts_at: new Date("2026-09-03T10:00:00.000Z"),
      ends_at: new Date("2026-09-03T12:00:00.000Z"),
      capacity: 1,
      booked_count: 0,
    })

    await bookDeliverySlotCapacity(container as any, slot.id)
    await expect(
      bookDeliverySlotCapacity(container as any, slot.id)
    ).rejects.toThrow(/at capacity/)

    await releaseDeliverySlotCapacity(container as any, slot.id)

    const afterRelease = await deliverySlotModuleService.retrieveDeliverySlot(
      slot.id
    )
    expect(afterRelease.booked_count).toBe(0)

    await expect(
      bookDeliverySlotCapacity(container as any, slot.id)
    ).resolves.toBeUndefined()

    const finalSlot = await deliverySlotModuleService.retrieveDeliverySlot(
      slot.id
    )
    expect(finalSlot.booked_count).toBe(1)

    await deliverySlotModuleService.deleteDeliverySlots(slot.id)
  }, 20000)
})
