import { resolveReorderDecision } from "../reorder"

describe("resolveReorderDecision", () => {
  it("is unavailable when the variant no longer exists at all", () => {
    expect(resolveReorderDecision({ quantity: 2 }, undefined)).toEqual({
      action: "unavailable",
    })
  })

  it("adds the full original quantity when inventory isn't tracked (Food Central)", () => {
    expect(
      resolveReorderDecision(
        { quantity: 3 },
        { manage_inventory: false }
      )
    ).toEqual({ action: "add", quantity: 3 })
  })

  it("adds the full original quantity when backorder is allowed", () => {
    expect(
      resolveReorderDecision(
        { quantity: 3 },
        { manage_inventory: true, allow_backorder: true, inventory_quantity: 0 }
      )
    ).toEqual({ action: "add", quantity: 3 })
  })

  it("is unavailable when stock-managed and genuinely at zero", () => {
    expect(
      resolveReorderDecision(
        { quantity: 2 },
        { manage_inventory: true, allow_backorder: false, inventory_quantity: 0 }
      )
    ).toEqual({ action: "unavailable" })
  })

  it("clamps down to available stock rather than the original quantity", () => {
    expect(
      resolveReorderDecision(
        { quantity: 5 },
        { manage_inventory: true, allow_backorder: false, inventory_quantity: 2 }
      )
    ).toEqual({ action: "add", quantity: 2 })
  })

  it("adds the full original quantity when stock now comfortably covers it", () => {
    expect(
      resolveReorderDecision(
        { quantity: 2 },
        { manage_inventory: true, allow_backorder: false, inventory_quantity: 10 }
      )
    ).toEqual({ action: "add", quantity: 2 })
  })
})
