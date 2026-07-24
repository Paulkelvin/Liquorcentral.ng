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

  it("renders one large active image with a descriptive alt text and a thumbnail per image", () => {
    render(
      <ImageGallery
        images={[
          { id: "img_1", url: "http://localhost/1.jpg" } as never,
          { id: "img_2", url: "http://localhost/2.jpg" } as never,
        ]}
        title="Test Wine"
      />
    )

    // Only the active (first) image is the large, zoomable, alt-described
    // one — the rest are thumbnails (design audit Phase 3 roadmap item 12,
    // "proper image gallery with thumbnails").
    expect(screen.getByAltText("Test Wine — photo 1 of 2")).toBeInTheDocument()
    expect(screen.queryByAltText("Test Wine — photo 2 of 2")).not.toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /zoom in on/i })).toHaveLength(1)
    expect(screen.getAllByRole("tab")).toHaveLength(2)
  })

  it("switches the active large image when a thumbnail is clicked", async () => {
    const user = userEvent.setup()
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

    await user.click(screen.getByRole("tab", { name: "Show photo 2 of 2" }))

    expect(screen.getByAltText("Test Wine — photo 2 of 2")).toBeInTheDocument()
    expect(screen.queryByAltText("Test Wine — photo 1 of 2")).not.toBeInTheDocument()
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
