import { hasAnyWineDetailsValue, pickWineDetailsFields } from "../helpers"

describe("pickWineDetailsFields", () => {
  it("returns an empty object when additional_data is undefined", () => {
    expect(pickWineDetailsFields(undefined)).toEqual({})
  })

  it("returns an empty object when additional_data is null", () => {
    expect(pickWineDetailsFields(null)).toEqual({})
  })

  it("picks only the known wine-details keys, ignoring everything else", () => {
    const result = pickWineDetailsFields({
      vintage: 2019,
      abv: 13.5,
      // a field belonging to some other module's additional_data, on the
      // same flat payload — must not leak into wine-details fields
      spice_level: "mild",
      title: "Some Product",
    })

    expect(result).toEqual({ vintage: 2019, abv: 13.5 })
  })

  it("preserves explicit null values (used to clear a field)", () => {
    const result = pickWineDetailsFields({ vintage: null })

    expect(result).toEqual({ vintage: null })
  })

  it("picks every wine-details field when all are supplied", () => {
    const input = {
      vintage: 2020,
      producer: "Example Winery",
      region: "Bordeaux, France",
      bottle_size: "750ml",
      tasting_notes: "Dark fruit, soft tannins.",
      serving_temperature: "Room temperature",
      abv: 14.0,
    }

    expect(pickWineDetailsFields(input)).toEqual(input)
  })
})

describe("hasAnyWineDetailsValue", () => {
  it("is false for an empty fields object", () => {
    expect(hasAnyWineDetailsValue({})).toBe(false)
  })

  it("is false when every field is explicitly null", () => {
    expect(
      hasAnyWineDetailsValue({
        vintage: null,
        producer: null,
        region: null,
        bottle_size: null,
        tasting_notes: null,
        serving_temperature: null,
        abv: null,
      })
    ).toBe(false)
  })

  it("is true when exactly one field carries a real value", () => {
    expect(hasAnyWineDetailsValue({ abv: 13.5 })).toBe(true)
  })

  it("is true for a falsy-but-real value like 0", () => {
    // ABV of 0 is a real (if unusual) value, not "no data" — must not be
    // treated the same as null/undefined.
    expect(hasAnyWineDetailsValue({ abv: 0 })).toBe(true)
  })

  it("is true when a non-vintage product carries other fields but no vintage", () => {
    expect(
      hasAnyWineDetailsValue({ vintage: null, abv: 40, producer: "Example Distillery" })
    ).toBe(true)
  })
})
