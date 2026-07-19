import { extractDeliverySlotId } from "../lib/extract-delivery-slot-id"

describe("extractDeliverySlotId", () => {
  it("returns the delivery_slot_id from a shipping method's data field", () => {
    const cart = {
      shipping_methods: [
        { data: { delivery_slot_id: "dslot_01" } },
      ],
    }

    expect(extractDeliverySlotId(cart)).toBe("dslot_01")
  })

  it("returns undefined when no shipping method carries a delivery_slot_id (Wine & Spirits order)", () => {
    const cart = {
      shipping_methods: [{ data: { carrier_code: "fedex" } }],
    }

    expect(extractDeliverySlotId(cart)).toBeUndefined()
  })

  it("returns undefined when shipping_methods is empty or absent", () => {
    expect(extractDeliverySlotId({ shipping_methods: [] })).toBeUndefined()
    expect(extractDeliverySlotId({})).toBeUndefined()
    expect(extractDeliverySlotId(null)).toBeUndefined()
    expect(extractDeliverySlotId(undefined)).toBeUndefined()
  })

  it("returns undefined when data is null", () => {
    const cart = { shipping_methods: [{ data: null }] }

    expect(extractDeliverySlotId(cart)).toBeUndefined()
  })

  it("ignores a non-string delivery_slot_id value", () => {
    const cart = {
      shipping_methods: [{ data: { delivery_slot_id: 12345 } }],
    }

    expect(extractDeliverySlotId(cart)).toBeUndefined()
  })

  it("finds the delivery_slot_id on the second shipping method when the first has none", () => {
    const cart = {
      shipping_methods: [
        { data: { carrier_code: "fedex" } },
        { data: { delivery_slot_id: "dslot_02" } },
      ],
    }

    expect(extractDeliverySlotId(cart)).toBe("dslot_02")
  })
})
