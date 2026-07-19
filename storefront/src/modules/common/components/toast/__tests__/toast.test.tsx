import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToastProvider, useToast } from "@modules/common/components/toast"

function TriggerToast() {
  const { showToast } = useToast()

  return (
    <button
      onClick={() =>
        showToast({ title: "Saved", variant: "success", description: "Your changes were saved." })
      }
    >
      Trigger
    </button>
  )
}

describe("Toast infrastructure", () => {
  it("useToast throws when used outside a ToastProvider", () => {
    // Suppress the expected React error boundary console.error noise.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {})

    function Broken() {
      useToast()
      return null
    }

    expect(() => render(<Broken />)).toThrow(
      "useToast must be used within a ToastProvider"
    )

    spy.mockRestore()
  })

  it("shows a toast via useToast, announced through an aria-live region", async () => {
    render(
      <ToastProvider>
        <TriggerToast />
      </ToastProvider>
    )

    await userEvent.click(screen.getByRole("button", { name: "Trigger" }))

    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument()
    })
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument()
  })

  it("dismisses a toast when its dismiss button is clicked", async () => {
    render(
      <ToastProvider>
        <TriggerToast />
      </ToastProvider>
    )

    await userEvent.click(screen.getByRole("button", { name: "Trigger" }))
    await waitFor(() => screen.getByText("Saved"))

    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }))

    await waitFor(() => {
      expect(screen.queryByText("Saved")).not.toBeInTheDocument()
    })
  })
})
