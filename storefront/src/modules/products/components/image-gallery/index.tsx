"use client"

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { XMark } from "@medusajs/icons"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"
import { useState } from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  /** Product title, used to build distinct, descriptive alt text per image (§6, §27). */
  title: string
}

/**
 * 05_PRODUCT_DETAILS_SPECIFICATION.md §6 — zoom is required, not optional.
 * Desktop: click-to-zoom via a full-viewport lightbox. Mobile: the
 * lightbox's plain `<img>` supports native pinch-to-zoom and double-tap
 * (never trapped inside a fixed frame — no custom pan/zoom engine
 * reimplements what the browser already does natively). No gallery images
 * configured falls back to a single, honest placeholder (§23) rather than
 * a blank region.
 */
const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 gap-y-4">
          <Container className="relative aspect-[29/34] w-full overflow-hidden bg-surface flex items-center justify-center">
            <PlaceholderImage size={36} />
          </Container>
        </div>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]
  const activeAlt = `${title} — photo ${activeIndex + 1} of ${images.length}`

  return (
    <div className="relative">
      {/* Design Audit Phase 3 roadmap item 12 — "proper image gallery with
          thumbnails," replacing the previous vertical stack of every
          full-size image one after another. One large image at a time,
          selected from a thumbnail strip — the zoom lightbox (§6) is
          unchanged, now zooming whichever image is currently active. */}
      <Container
        className="relative aspect-[29/34] w-full overflow-hidden bg-surface"
        id={activeImage.id}
      >
        {!!activeImage.url && (
          <button
            type="button"
            onClick={() => setZoomedIndex(activeIndex)}
            aria-label={`Zoom in on ${activeAlt}`}
            className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <Image
              src={activeImage.url}
              priority
              className="absolute inset-0 rounded-rounded"
              alt={activeAlt}
              fill
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          </button>
        )}
      </Container>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`${title} photos`}
          className="mt-4 grid grid-cols-5 gap-3"
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                onClick={() => setActiveIndex(index)}
                className={
                  "relative aspect-square w-full overflow-hidden rounded-radius-sm bg-surface border transition-colors " +
                  (isActive
                    ? "border-primary"
                    : "border-border hover:border-text-secondary")
                }
              >
                {image.url && (
                  <Image
                    src={image.url}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0"
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <Dialog
        open={zoomedIndex !== null}
        onClose={() => setZoomedIndex(null)}
        className="relative z-[80]"
      >
        <DialogBackdrop className="fixed inset-0 bg-overlay" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setZoomedIndex(null)}
              aria-label="Close zoomed image"
              className="absolute -top-12 right-0 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md bg-surface-elevated text-text-primary"
            >
              <XMark />
            </button>
            {zoomedIndex !== null && images[zoomedIndex]?.url && (
              // Plain <img>, not next/image, so native pinch-to-zoom/
              // double-tap gestures work unmodified on mobile (§6).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[zoomedIndex].url}
                alt={`${title} — photo ${zoomedIndex + 1} of ${images.length}, zoomed`}
                className="max-h-[85vh] w-full touch-pinch-zoom object-contain"
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default ImageGallery
