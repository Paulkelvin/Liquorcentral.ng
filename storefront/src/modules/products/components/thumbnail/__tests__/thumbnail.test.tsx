import { fireEvent, render, screen } from "@testing-library/react"
import Thumbnail from "../index"

describe("Thumbnail", () => {
  it("renders the product image when a thumbnail URL is present", () => {
    render(
      <Thumbnail thumbnail="http://localhost/bottle.jpg" alt="Test Wine" />
    )

    expect(screen.getByRole("img", { name: "Test Wine" })).toBeInTheDocument()
  })

  it("shows the placeholder icon when no thumbnail or image is configured", () => {
    render(<Thumbnail alt="Test Wine" />)

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  // A thumbnail URL can still fail to actually load at runtime (dead
  // link, network hiccup) — distinct from having no URL at all. The
  // image should fall back to the same placeholder rather than leaving
  // a blank, collapsed void.
  it("falls back to the placeholder if the image fails to load", () => {
    render(
      <Thumbnail thumbnail="http://localhost/broken.jpg" alt="Test Wine" />
    )

    const img = screen.getByRole("img", { name: "Test Wine" })
    fireEvent.error(img)

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
