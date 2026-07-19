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

  if (images.length === 0) {
    return (
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
          <Container className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle flex items-center justify-center">
            <PlaceholderImage size={36} />
          </Container>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          const alt = `${title} — photo ${index + 1} of ${images.length}`

          return (
            <Container
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              id={image.id}
            >
              {!!image.url && (
                <button
                  type="button"
                  onClick={() => setZoomedIndex(index)}
                  aria-label={`Zoom in on ${alt}`}
                  className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  <Image
                    src={image.url}
                    priority={index <= 2 ? true : false}
                    className="absolute inset-0 rounded-rounded"
                    alt={alt}
                    fill
                    sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </button>
              )}
            </Container>
          )
        })}
      </div>

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
