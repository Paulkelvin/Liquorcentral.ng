import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import QuantityStepper from "../index"

function Controlled({ max }: { max?: number }) {
  const [quantity, setQuantity] = useState(1)
  return <QuantityStepper quantity={quantity} onChange={setQuantity} max={max} />
}

describe("QuantityStepper", () => {
  it("increments and decrements", async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(screen.getByLabelText("Increase quantity"))
    expect(screen.getByLabelText("Quantity")).toHaveValue(2)

    await user.click(screen.getByLabelText("Decrease quantity"))
    expect(screen.getByLabelText("Quantity")).toHaveValue(1)
  })

  it("never goes below 1", async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(screen.getByLabelText("Decrease quantity"))
    expect(screen.getByLabelText("Quantity")).toHaveValue(1)
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled()
  })

  // 05_PRODUCT_DETAILS_SPECIFICATION.md §17 — Wine & Spirits is genuinely
  // stock-capped; this is the mechanism under test.
  it("caps at the given max (Wine & Spirits stock) and disables further increase", async () => {
    const user = userEvent.setup()
    render(<Controlled max={2} />)

    await user.click(screen.getByLabelText("Increase quantity"))
    await user.click(screen.getByLabelText("Increase quantity"))
    await user.click(screen.getByLabelText("Increase quantity"))

    expect(screen.getByLabelText("Quantity")).toHaveValue(2)
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled()
  })

  // §17 — Food Central is not capped by an invented stock number.
  it("is uncapped when no max is given (Food Central)", async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByLabelText("Increase quantity"))
    }

    expect(screen.getByLabelText("Quantity")).toHaveValue(11)
  })
})
