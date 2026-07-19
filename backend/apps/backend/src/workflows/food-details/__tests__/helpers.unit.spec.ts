import { hasAnyFoodDetailsValue, pickFoodDetailsFields } from "../helpers"

describe("pickFoodDetailsFields", () => {
  it("returns an empty object when additional_data is undefined", () => {
    expect(pickFoodDetailsFields(undefined)).toEqual({})
  })

  it("returns an empty object when additional_data is null", () => {
    expect(pickFoodDetailsFields(null)).toEqual({})
  })

  it("picks only the known food-details keys, ignoring wine-details fields on the same flat payload", () => {
    const result = pickFoodDetailsFields({
      ingredients: ["rice", "chicken", "pepper"],
      spice_level: 3,
      // wine-details fields, present on the same additional_data payload
      // when both modules' fields are sent together — must not leak in
      vintage: 2019,
      abv: 13.5,
      title: "Some Product",
    })

    expect(result).toEqual({
      ingredients: ["rice", "chicken", "pepper"],
      spice_level: 3,
    })
  })

  it("preserves explicit null (used to clear a field back to not-yet-entered)", () => {
    expect(pickFoodDetailsFields({ allergens: null })).toEqual({
      allergens: null,
    })
  })

  it("preserves an explicit empty array (used to confirm none apply)", () => {
    expect(pickFoodDetailsFields({ allergens: [] })).toEqual({
      allergens: [],
    })
  })

  it("picks every food-details field when all are supplied", () => {
    const input = {
      ingredients: ["jollof rice", "fried plantain"],
      allergens: [],
      dietary_flags: ["halal"],
      safety_data_verified: true,
      spice_level: 2,
      prep_time_minutes: 25,
      portion_size: "Serves 1",
    }

    expect(pickFoodDetailsFields(input)).toEqual(input)
  })
})

describe("hasAnyFoodDetailsValue", () => {
  it("is false for an empty fields object", () => {
    expect(hasAnyFoodDetailsValue({})).toBe(false)
  })

  it("is false when every content field is null, even if safety_data_verified is true", () => {
    expect(
      hasAnyFoodDetailsValue({
        ingredients: null,
        allergens: null,
        dietary_flags: null,
        safety_data_verified: true,
        spice_level: null,
        prep_time_minutes: null,
        portion_size: null,
      })
    ).toBe(false)
  })

  it("is true when an allergen list is explicitly confirmed empty (verified: none apply)", () => {
    // [] is a real, meaningful value distinct from null — TIER_B §7's
    // completeness requirement depends on this distinction being real.
    expect(hasAnyFoodDetailsValue({ allergens: [] })).toBe(true)
  })

  it("is true when exactly one field carries a real value", () => {
    expect(hasAnyFoodDetailsValue({ prep_time_minutes: 15 })).toBe(true)
  })

  it("is true for a falsy-but-real value like spice_level 0", () => {
    expect(hasAnyFoodDetailsValue({ spice_level: 0 })).toBe(true)
  })

  it("does not treat safety_data_verified alone as a genuine attempt to describe a dish", () => {
    expect(hasAnyFoodDetailsValue({ safety_data_verified: true })).toBe(
      false
    )
  })
})
