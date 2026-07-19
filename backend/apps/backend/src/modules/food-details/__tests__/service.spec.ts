import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { FOOD_DETAILS_MODULE } from ".."
import FoodDetailsModuleService from "../service"
import { FoodDetails } from "../models/food-details"

moduleIntegrationTestRunner<FoodDetailsModuleService>({
  moduleName: FOOD_DETAILS_MODULE,
  moduleModels: [FoodDetails],
  resolve: "./src/modules/food-details",
  testSuite: ({ service }) => {
    describe("FoodDetailsModuleService", () => {
      it("creates and retrieves a record with every field populated", async () => {
        const created = await service.createFoodDetails({
          ingredients: ["rice", "tomato stew", "chicken"],
          allergens: [],
          dietary_flags: ["halal"],
          safety_data_verified: true,
          spice_level: 3,
          prep_time_minutes: 25,
          portion_size: "Serves 1",
        })

        const retrieved = await service.retrieveFoodDetails(created.id)

        expect(retrieved).toEqual(
          expect.objectContaining({
            id: created.id,
            ingredients: ["rice", "tomato stew", "chicken"],
            allergens: [],
            dietary_flags: ["halal"],
            safety_data_verified: true,
            spice_level: 3,
            prep_time_minutes: 25,
            portion_size: "Serves 1",
          })
        )
      })

      it("defaults safety_data_verified to false when not supplied", async () => {
        const created = await service.createFoodDetails({
          ingredients: ["plantain"],
        })

        expect(created.safety_data_verified).toBe(false)
      })

      it("distinguishes null (not yet entered) from [] (verified: none apply) for allergens", async () => {
        const notYetEntered = await service.createFoodDetails({
          ingredients: ["bread"],
          allergens: null,
        })
        const verifiedNone = await service.createFoodDetails({
          ingredients: ["bread"],
          allergens: [],
        })

        expect(notYetEntered.allergens).toBeNull()
        expect(verifiedNone.allergens).toEqual([])
      })

      it("tolerates every content field being null", async () => {
        const created = await service.createFoodDetails({
          ingredients: null,
          allergens: null,
          dietary_flags: null,
          spice_level: null,
          prep_time_minutes: null,
          portion_size: null,
        })

        const retrieved = await service.retrieveFoodDetails(created.id)

        expect(retrieved.ingredients).toBeNull()
        expect(retrieved.spice_level).toBeNull()
      })

      it("updates an existing record in place", async () => {
        const created = await service.createFoodDetails({
          spice_level: 1,
        })

        const updated = await service.updateFoodDetails({
          id: created.id,
          spice_level: 4,
          safety_data_verified: true,
        })

        expect(updated.spice_level).toBe(4)
        expect(updated.safety_data_verified).toBe(true)
      })

      it("deletes a record", async () => {
        const created = await service.createFoodDetails({
          ingredients: ["to be deleted"],
        })

        await service.deleteFoodDetails(created.id)

        await expect(
          service.retrieveFoodDetails(created.id)
        ).rejects.toThrow()
      })

      it("lists multiple records", async () => {
        await service.createFoodDetails({ ingredients: ["a"] })
        await service.createFoodDetails({ ingredients: ["b"] })

        const all = await service.listFoodDetails()

        expect(all.length).toBeGreaterThanOrEqual(2)
      })
    })
  },
})

jest.setTimeout(60 * 1000)
