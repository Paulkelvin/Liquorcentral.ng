import { render, screen } from "@testing-library/react"
import EmptyState from "@modules/common/components/empty-state"

describe("EmptyState", () => {
  it("renders a title, optional description, and action", () => {
    render(
      <EmptyState
        title="Your cart is empty"
        description="Browse Wine & Spirits or Food Central to get started."
        action={<button>Start shopping</button>}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Your cart is empty" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Browse Wine & Spirits or Food Central to get started.")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Start shopping" })
    ).toBeInTheDocument()
  })

  it("renders without a description or action", () => {
    render(<EmptyState title="No results" />)

    expect(screen.getByRole("heading", { name: "No results" })).toBeInTheDocument()
  })
})
