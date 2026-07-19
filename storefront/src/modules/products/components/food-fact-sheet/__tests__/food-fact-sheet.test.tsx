import { render, screen } from "@testing-library/react"
import FoodFactSheet from "../index"

describe("FoodFactSheet", () => {
  it("renders ingredients, allergens (icon + text), dietary flags, and preparation facts", () => {
    render(
      <FoodFactSheet
        details={{
          ingredients: ["Rice", "Chicken"],
          allergens: ["Peanuts"],
          dietary_flags: ["Halal"],
          spice_level: 2,
          prep_time_minutes: 25,
          portion_size: "One plate",
        }}
      />
    )

    expect(screen.getByText("Rice, Chicken")).toBeInTheDocument()
    expect(screen.getByTestId("allergen-info")).toHaveTextContent("Peanuts")
    expect(screen.getByText("Halal")).toBeInTheDocument()
    expect(screen.getByText("~25 min")).toBeInTheDocument()
    expect(screen.getByText("Medium")).toBeInTheDocument()
    expect(screen.getByText("One plate")).toBeInTheDocument()
  })

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §11, §25 — allergen information is
  // never conveyed by color alone; the icon accompanies explicit text.
  it("pairs the allergen icon with explicit text, never icon alone", () => {
    render(
      <FoodFactSheet
        details={{ allergens: ["Dairy"], ingredients: null, dietary_flags: null, spice_level: null, prep_time_minutes: null, portion_size: null }}
      />
    )

    const allergenRow = screen.getByTestId("allergen-info")
    expect(allergenRow).toHaveTextContent("Contains:")
    expect(allergenRow).toHaveTextContent("Dairy")
    expect(allergenRow.querySelector("svg")).toBeInTheDocument()
  })

  it("renders nothing when no facts are populated at all", () => {
    const { container } = render(
      <FoodFactSheet
        details={{
          ingredients: null,
          allergens: null,
          dietary_flags: null,
          spice_level: null,
          prep_time_minutes: null,
          portion_size: null,
        }}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
