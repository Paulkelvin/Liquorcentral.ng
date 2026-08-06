import { sortProducts } from "../sort-products"
import { HttpTypes } from "@medusajs/types"

const product = (
  id: string,
  overrides: Partial<HttpTypes.StoreProduct> = {}
): HttpTypes.StoreProduct =>
  ({
    id,
    created_at: "2024-01-01T00:00:00.000Z",
    variants: [
      { calculated_price: { calculated_amount: 1000 } },
    ],
    ...overrides,
  }) as unknown as HttpTypes.StoreProduct

/**
 * `listProductsWithSort`'s cumulative "Load More" re-fetches and re-sorts
 * the entire product list fresh on every request. Without a deterministic
 * tiebreaker, two products tied on the sort key had no guaranteed relative
 * order beyond whatever the database handed back that particular request
 * — so a product could silently swap pagination windows between "Load
 * More" clicks. Every sort mode needs to return the same order for the
 * same tied input, regardless of what order it arrives in.
 */
describe("sortProducts — deterministic tiebreaking", () => {
  it("breaks a price tie by id, regardless of input order", () => {
    const a = product("prod_a", { variants: [{ calculated_price: { calculated_amount: 500 } }] as never })
    const b = product("prod_b", { variants: [{ calculated_price: { calculated_amount: 500 } }] as never })

    const firstFetchOrder = sortProducts([a, b], "price_asc").map((p) => p.id)
    const secondFetchOrder = sortProducts([b, a], "price_asc").map((p) => p.id)

    expect(firstFetchOrder).toEqual(secondFetchOrder)
  })

  it("breaks a created_at tie by id, regardless of input order", () => {
    const a = product("prod_a")
    const b = product("prod_b")

    const firstFetchOrder = sortProducts([a, b], "created_at").map((p) => p.id)
    const secondFetchOrder = sortProducts([b, a], "created_at").map((p) => p.id)

    expect(firstFetchOrder).toEqual(secondFetchOrder)
  })

  it("orders featured (no real sort key) deterministically by id", () => {
    const a = product("prod_a")
    const b = product("prod_b")

    const firstFetchOrder = sortProducts([a, b], "featured").map((p) => p.id)
    const secondFetchOrder = sortProducts([b, a], "featured").map((p) => p.id)

    expect(firstFetchOrder).toEqual(secondFetchOrder)
    expect(firstFetchOrder).toEqual(["prod_a", "prod_b"])
  })

  it("still sorts by price first when prices differ", () => {
    const cheap = product("prod_z", { variants: [{ calculated_price: { calculated_amount: 100 } }] as never })
    const expensive = product("prod_a", { variants: [{ calculated_price: { calculated_amount: 900 } }] as never })

    const result = sortProducts([expensive, cheap], "price_asc").map((p) => p.id)

    expect(result).toEqual(["prod_z", "prod_a"])
  })
})
