import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AgeGate from "../index"

describe("AgeGate", () => {
  afterEach(() => {
    document.cookie = "lc_age_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  })

  it("is shown when the visitor has not yet verified", () => {
    render(<AgeGate initiallyVerified={false} />)

    expect(screen.getByTestId("age-gate")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Welcome to LiquorCentral" })
    ).toBeInTheDocument()
  })

  it("is not shown when the visitor already verified in a prior visit", () => {
    render(<AgeGate initiallyVerified={true} />)

    expect(screen.queryByTestId("age-gate")).not.toBeInTheDocument()
  })

  it("closes and sets the verification cookie on confirm", async () => {
    const user = userEvent.setup()
    render(<AgeGate initiallyVerified={false} />)

    expect(document.cookie).not.toContain("lc_age_verified=true")
    await user.click(screen.getByTestId("age-gate-confirm"))

    expect(document.cookie).toContain("lc_age_verified=true")
    await waitForElementToBeRemoved(() => screen.queryByTestId("age-gate"))
  })

  it("shows the restricted message, not the underlying page, on decline", async () => {
    const user = userEvent.setup()
    render(<AgeGate initiallyVerified={false} />)

    await user.click(screen.getByTestId("age-gate-decline"))

    expect(
      screen.getByRole("heading", { name: "Age restricted" })
    ).toBeInTheDocument()
    expect(screen.queryByTestId("age-gate-confirm")).not.toBeInTheDocument()
  })

  it("does not close on Escape — a legal gate must not be silently bypassable", async () => {
    const user = userEvent.setup()
    render(<AgeGate initiallyVerified={false} />)

    await user.keyboard("{Escape}")

    expect(screen.getByTestId("age-gate")).toBeInTheDocument()
    expect(document.cookie).not.toContain("lc_age_verified=true")
  })
})
