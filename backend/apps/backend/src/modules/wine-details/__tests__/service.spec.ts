import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { WINE_DETAILS_MODULE } from ".."
import WineDetailsModuleService from "../service"
import { WineDetails } from "../models/wine-details"

moduleIntegrationTestRunner<WineDetailsModuleService>({
  moduleName: WINE_DETAILS_MODULE,
  moduleModels: [WineDetails],
  resolve: "./src/modules/wine-details",
  testSuite: ({ service }) => {
    describe("WineDetailsModuleService", () => {
      it("creates and retrieves a record with every field populated", async () => {
        const created = await service.createWineDetails({
          vintage: 2019,
          producer: "Example Winery",
          region: "Bordeaux, France",
          bottle_size: "750ml",
          tasting_notes: "Dark fruit, soft tannins.",
          serving_temperature: "Room temperature",
          abv: 13.5,
        })

        const retrieved = await service.retrieveWineDetails(created.id)

        expect(retrieved).toEqual(
          expect.objectContaining({
            id: created.id,
            vintage: 2019,
            producer: "Example Winery",
            region: "Bordeaux, France",
            bottle_size: "750ml",
            tasting_notes: "Dark fruit, soft tannins.",
            serving_temperature: "Room temperature",
            abv: 13.5,
          })
        )
      })

      it("tolerates every field being null (TIER_B §3 — genuine inapplicability)", async () => {
        const created = await service.createWineDetails({
          vintage: null,
          producer: null,
          region: null,
          bottle_size: null,
          tasting_notes: null,
          serving_temperature: null,
          abv: null,
        })

        const retrieved = await service.retrieveWineDetails(created.id)

        expect(retrieved.vintage).toBeNull()
        expect(retrieved.abv).toBeNull()
      })

      it("supports a non-vintage spirit: every field but vintage populated", async () => {
        const created = await service.createWineDetails({
          vintage: null,
          producer: "Example Distillery",
          region: "Scotland",
          bottle_size: "700ml",
          tasting_notes: "Smoky, peated.",
          serving_temperature: "Neat or with a splash of water",
          abv: 43,
        })

        expect(created.vintage).toBeNull()
        expect(created.abv).toBe(43)
      })

      it("updates an existing record in place", async () => {
        const created = await service.createWineDetails({
          producer: "Original Producer",
        })

        const updated = await service.updateWineDetails({
          id: created.id,
          producer: "Corrected Producer",
        })

        expect(updated.producer).toBe("Corrected Producer")
      })

      it("deletes a record", async () => {
        const created = await service.createWineDetails({
          producer: "To Be Deleted",
        })

        await service.deleteWineDetails(created.id)

        await expect(service.retrieveWineDetails(created.id)).rejects.toThrow()
      })

      it("lists multiple records", async () => {
        await service.createWineDetails({ producer: "Producer A" })
        await service.createWineDetails({ producer: "Producer B" })

        const all = await service.listWineDetails()

        expect(all.length).toBeGreaterThanOrEqual(2)
      })
    })
  },
})

jest.setTimeout(60 * 1000)
