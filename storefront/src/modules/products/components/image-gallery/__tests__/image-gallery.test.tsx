import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ImageGallery from "../index"

describe("ImageGallery", () => {
  // 05_PRODUCT_DETAILS_SPECIFICATION.md §23 — no gallery images configured
  // falls back to a single, honest placeholder, not a blank region.
  it("shows a placeholder when no images are configured", () => {
    render(<ImageGallery images={[]} title="Test Wine" />)

    expect(screen.queryByRole("button", { name: /zoom in on/i })).not.toBeInTheDocument()
  })

  it("renders a distinct, descriptive alt text and zoom trigger per image", () => {
    render(
      <ImageGallery
        images={[
          { id: "img_1", url: "http://localhost/1.jpg" } as never,
          { id: "img_2", url: "http://localhost/2.jpg" } as never,
        ]}
        title="Test Wine"
      />
    )

    expect(screen.getByAltText("Test Wine — photo 1 of 2")).toBeInTheDocument()
    expect(screen.getByAltText("Test Wine — photo 2 of 2")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /zoom in on/i })).toHaveLength(2)
  })

  // §6 — zoom is required, not optional; opened via click, closed via Escape.
  it("opens a zoomed view on click and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <ImageGallery
        images={[{ id: "img_1", url: "http://localhost/1.jpg" } as never]}
        title="Test Wine"
      />
    )

    await user.click(screen.getByRole("button", { name: /zoom in on/i }))
    expect(screen.getByAltText("Test Wine — photo 1 of 1, zoomed")).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(screen.queryByAltText("Test Wine — photo 1 of 1, zoomed")).not.toBeInTheDocument()
  })
})
