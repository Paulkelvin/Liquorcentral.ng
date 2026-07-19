import { render, screen } from "@testing-library/react"
import FormField from "@modules/common/components/form-field"

describe("FormField", () => {
  it("renders a visible label associated with its control", () => {
    render(
      <FormField id="email" label="Email">
        <input id="email" />
      </FormField>
    )

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("marks required fields clearly (DESIGN_SYSTEM.md §B9)", () => {
    render(
      <FormField id="email" label="Email" required>
        <input id="email" />
      </FormField>
    )

    expect(screen.getByText("(required)")).toBeInTheDocument()
  })

  it("shows the error, not the hint, once an error is present", () => {
    render(
      <FormField id="email" label="Email" hint="We'll never share this." error="Enter a valid email address">
        <input id="email" />
      </FormField>
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address"
    )
    expect(screen.queryByText("We'll never share this.")).not.toBeInTheDocument()
  })
})
