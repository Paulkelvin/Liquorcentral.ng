import {
  getAvailableStock,
  groupSubtotal,
  hasFoodCentralItems,
  hasUnresolvedDeliveryConflict,
  isFoodCentralItem,
  isLagosAddress,
  isPickupShippingMethod,
  isStockManaged,
  splitGiftWrapLines,
} from "../cart-fulfillment"
import { HttpTypes } from "@medusajs/types"

const lineItem = (
  overrides: Partial<HttpTypes.StoreCartLineItem> & {
    product?: { food_details?: unknown; wine_details?: unknown }
    variant?: Partial<HttpTypes.StoreProductVariant>
  } = {}
): HttpTypes.StoreCartLineItem =>
  ({
    id: "item_1",
    quantity: 1,
    unit_price: 1000,
    total: 1000,
    metadata: null,
    ...overrides,
  } as unknown as HttpTypes.StoreCartLineItem)

describe("isFoodCentralItem", () => {
  it("is true when the line item's product has food_details", () => {
    const item = lineItem({ product: { food_details: { spice_level: 2 } } } as never)
    expect(isFoodCentralItem(item)).toBe(true)
  })

  it("is false when the line item's product has wine_details instead", () => {
    const item = lineItem({ product: { wine_details: { vintage: 2020 } } } as never)
    expect(isFoodCentralItem(item)).toBe(false)
  })

  it("is false when neither catalog's linked module is present", () => {
    expect(isFoodCentralItem(lineItem())).toBe(false)
  })
})

describe("splitGiftWrapLines", () => {
  it("separates a metadata-linked gift-wrap line from its parent product line", () => {
    const wine = lineItem({ id: "wine_1" })
    const giftWrap = lineItem({ id: "gift_1", metadata: { gift_wrap_for: "wine_1" } as never })

    const { productLines, giftWrapByParent } = splitGiftWrapLines([wine, giftWrap])

    expect(productLines).toEqual([wine])
    expect(giftWrapByParent.get("wine_1")).toBe(giftWrap)
  })

  it("treats a line item with no gift_wrap_for metadata as an ordinary product line", () => {
    const wine = lineItem({ id: "wine_1" })
    const { productLines, giftWrapByParent } = splitGiftWrapLines([wine])

    expect(productLines).toEqual([wine])
    expect(giftWrapByParent.size).toBe(0)
  })
})

describe("isStockManaged", () => {
  it("is true only when inventory is tracked and backorder isn't allowed", () => {
    expect(
      isStockManaged(lineItem({ variant: { manage_inventory: true, allow_backorder: false } } as never))
    ).toBe(true)
  })

  it("is false when backorder is allowed", () => {
    expect(
      isStockManaged(lineItem({ variant: { manage_inventory: true, allow_backorder: true } } as never))
    ).toBe(false)
  })

  it("is false when inventory isn't tracked at all (Food Central)", () => {
    expect(
      isStockManaged(lineItem({ variant: { manage_inventory: false, allow_backorder: false } } as never))
    ).toBe(false)
  })
})

describe("getAvailableStock", () => {
  it("returns undefined (uncapped) for an item that isn't stock-managed", () => {
    const item = lineItem({ variant: { manage_inventory: false } } as never)
    expect(getAvailableStock(item, 5)).toBeUndefined()
  })

  it("returns undefined when stock-managed but the real count isn't known yet", () => {
    const item = lineItem({ variant: { manage_inventory: true, allow_backorder: false } } as never)
    expect(getAvailableStock(item, undefined)).toBeUndefined()
  })

  it("never defaults an unknown count to zero", () => {
    const item = lineItem({ variant: { manage_inventory: true, allow_backorder: false } } as never)
    expect(getAvailableStock(item)).not.toBe(0)
  })

  it("returns the known quantity when stock-managed", () => {
    const item = lineItem({ variant: { manage_inventory: true, allow_backorder: false } } as never)
    expect(getAvailableStock(item, 3)).toBe(3)
  })
})

describe("isLagosAddress", () => {
  it("is true when the province names Lagos", () => {
    expect(isLagosAddress({ province: "Lagos", city: "Ikoyi" })).toBe(true)
  })

  it("is true when only the city names Lagos (case-insensitive)", () => {
    expect(isLagosAddress({ province: "", city: "lagos island" })).toBe(true)
  })

  it("is false for a genuinely non-Lagos address", () => {
    expect(isLagosAddress({ province: "FCT", city: "Abuja" })).toBe(false)
  })

  it("is false when no address exists yet", () => {
    expect(isLagosAddress(null)).toBe(false)
  })
})

describe("hasFoodCentralItems", () => {
  it("is true when at least one item is Food Central", () => {
    const wine = lineItem({ product: { wine_details: {} } } as never)
    const food = lineItem({ product: { food_details: {} } } as never)
    expect(hasFoodCentralItems([wine, food])).toBe(true)
  })

  it("is false when the cart has no Food Central items", () => {
    const wine = lineItem({ product: { wine_details: {} } } as never)
    expect(hasFoodCentralItems([wine])).toBe(false)
  })
})

describe("isPickupShippingMethod", () => {
  it("recognizes a pickup-named method", () => {
    expect(isPickupShippingMethod({ name: "Pickup — Lagos Island" })).toBe(true)
  })

  it("is false for a delivery-named method", () => {
    expect(isPickupShippingMethod({ name: "Standard Delivery" })).toBe(false)
  })

  it("is false when no method has been selected yet", () => {
    expect(isPickupShippingMethod(null)).toBe(false)
  })
})

describe("hasUnresolvedDeliveryConflict", () => {
  const foodItem = lineItem({ product: { food_details: {} } } as never)

  it("is false for a Wine & Spirits-only cart regardless of address", () => {
    const wineItem = lineItem({ product: { wine_details: {} } } as never)
    expect(
      hasUnresolvedDeliveryConflict({
        items: [wineItem],
        shipping_address: { province: "FCT", city: "Abuja" },
      })
    ).toBe(false)
  })

  it("is false when the address is genuinely in Lagos", () => {
    expect(
      hasUnresolvedDeliveryConflict({
        items: [foodItem],
        shipping_address: { province: "Lagos", city: "Ikoyi" },
      })
    ).toBe(false)
  })

  it("is true when a Food Central item exists and the address isn't Lagos", () => {
    expect(
      hasUnresolvedDeliveryConflict({
        items: [foodItem],
        shipping_address: { province: "FCT", city: "Abuja" },
      })
    ).toBe(true)
  })

  it("is false once pickup is selected, even outside Lagos", () => {
    expect(
      hasUnresolvedDeliveryConflict({
        items: [foodItem],
        shipping_address: { province: "FCT", city: "Abuja" },
        shipping_methods: [{ name: "Pickup — Lagos Island" }],
      })
    ).toBe(false)
  })
})

describe("groupSubtotal", () => {
  it("sums product lines plus each one's paired gift-wrap line", () => {
    const wine = lineItem({ id: "wine_1", total: 15000 })
    const giftWrap = lineItem({ id: "gift_1", total: 1500 })
    const giftWrapByParent = new Map([["wine_1", giftWrap]])

    expect(groupSubtotal([wine], giftWrapByParent)).toBe(16500)
  })

  it("excludes a group's gift-wrap line from a different group's subtotal", () => {
    const food = lineItem({ id: "food_1", total: 6500 })
    const giftWrapByParent = new Map([["wine_1", lineItem({ id: "gift_1", total: 1500 })]])

    expect(groupSubtotal([food], giftWrapByParent)).toBe(6500)
  })
})
