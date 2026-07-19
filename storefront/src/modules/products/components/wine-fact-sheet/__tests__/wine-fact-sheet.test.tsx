import { render, screen } from "@testing-library/react"
import WineFactSheet from "../index"

describe("WineFactSheet", () => {
  it("renders every populated fact, grouped under About this wine / Tasting", () => {
    render(
      <WineFactSheet
        details={{
          vintage: 2019,
          producer: "Test Vineyards",
          region: "Stellenbosch",
          bottle_size: "750ml",
          tasting_notes: "Blackcurrant and cedar.",
          serving_temperature: "16-18°C",
          abv: 13.5,
        }}
      />
    )

    expect(screen.getByText("About this wine")).toBeInTheDocument()
    expect(screen.getByText("Tasting")).toBeInTheDocument()
    expect(screen.getByText("2019")).toBeInTheDocument()
    expect(screen.getByText("Test Vineyards")).toBeInTheDocument()
    expect(screen.getByText("13.5%")).toBeInTheDocument()
    expect(screen.getByText("Blackcurrant and cedar.")).toBeInTheDocument()
  })

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §10, §23, Acceptance Criteria —
  // vintage (and any other field) is omitted, not shown blank, when it
  // does not apply to a given product (e.g. a non-vintage spirit/blend).
  it("omits vintage entirely when absent, rather than rendering an empty row", () => {
    render(
      <WineFactSheet
        details={{
          vintage: null,
          producer: "Test Distillery",
          region: null,
          bottle_size: null,
          tasting_notes: null,
          serving_temperature: null,
          abv: 40,
        }}
      />
    )

    expect(screen.queryByText("Vintage")).not.toBeInTheDocument()
    expect(screen.getByText("Producer")).toBeInTheDocument()
    expect(screen.queryByText("Tasting")).not.toBeInTheDocument()
  })

  it("renders nothing when no facts are populated at all", () => {
    const { container } = render(
      <WineFactSheet
        details={{
          vintage: null,
          producer: null,
          region: null,
          bottle_size: null,
          tasting_notes: null,
          serving_temperature: null,
          abv: null,
        }}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
