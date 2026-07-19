import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button, Heading, Text, Input } from "@modules/common/components/ui"

describe("shared UI primitives", () => {
  it("Button renders its label and responds to click", async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Add to cart</Button>)

    const button = screen.getByRole("button", { name: "Add to cart" })
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("Button is disabled while isLoading", () => {
    render(<Button isLoading>Save</Button>)

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("Heading renders the correct semantic level", () => {
    render(<Heading level="h1">Wine & Spirits</Heading>)

    expect(
      screen.getByRole("heading", { level: 1, name: "Wine & Spirits" })
    ).toBeInTheDocument()
  })

  it("Text renders as a paragraph by default", () => {
    render(<Text>Tasting notes go here.</Text>)

    const el = screen.getByText("Tasting notes go here.")
    expect(el.tagName).toBe("P")
  })

  it("Input renders a visible label, never placeholder-only (DESIGN_SYSTEM.md §B9)", () => {
    render(<Input id="email" label="Email" placeholder="you@example.com" />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("Input surfaces an error message with role=alert", () => {
    render(<Input id="email" label="Email" error="Enter a valid email address" />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address"
    )
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  })
})
