"use client"

import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React, { useState } from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  className?: string
  /**
   * 04_PRODUCT_LISTING_SPECIFICATION.md §24 / §111 — "descriptive alt
   * text on every product image (never a generic filename)." Defaults to
   * a still-generic fallback only for the handful of callers that
   * genuinely have no product name in scope; every caller that does have
   * one should pass it.
   */
  alt?: string
  /**
   * Corner rounding. An explicit prop rather than something a caller
   * overrides through `className`, because the base below already needs
   * `!` (important) to beat Container's own hardcoded radius — and two
   * competing `!important` radius classes would be resolved by
   * Tailwind's internal utility ordering, not by which one the caller
   * passed. `false` is for a thumbnail sitting flush inside a parent
   * that clips the corners itself (the product card).
   */
  rounded?: boolean
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  className,
  rounded = true,
  "data-testid": dataTestid,
  alt = "Product photo",
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      elevated={false}
      className={clx(
        // §13 (Proposed Design Direction, "Depth is subtle") — elevation-0
        // at rest, elevation-1 on hover (the card's `group` class lives on
        // the surrounding link, e.g. ProductPreview). `shadow-elevation-1`
        // was previously `shadow-elevation-card-rest`/`-hover`, two classes
        // never actually defined anywhere in tailwind.config.js — Tailwind
        // silently generated no CSS for them, so every product card has
        // been rendering with zero shadow at all since it shipped.
        //
        // `!p-0 !rounded-radius-sm` overrides Container's own hardcoded
        // `rounded-radius-md p-4` base (a real bug: every product card
        // image sat inset by 16px of padding it never needed) — `!`
        // (important) is required since Tailwind doesn't guarantee a
        // later className wins over the component's own hardcoded
        // classes by source order alone.
        "relative w-full overflow-hidden !p-0 shadow-elevation-0 group-hover:shadow-elevation-1 transition-shadow duration-standard ease-in-out",
        rounded ? "!rounded-radius-sm" : "!rounded-none",
        className,
        {
          // "small"/"medium"/"large" are fixed-width line-item
          // thumbnails (cart, order review) and keep their own ratio.
          "aspect-[9/16]": size === "small" || size === "medium" || size === "large",
          // A 4:5 portrait crop for the product-grid card.
          "aspect-[4/5]": size === "full",
          "aspect-square": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} alt={alt} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  alt,
}: Pick<ThumbnailProps, "size" | "alt"> & { image?: string }) => {
  // A real image URL can still fail at runtime (dead link, network
  // hiccup, host outage) distinct from having no thumbnail at all — an
  // `onError` fallback catches that case too, so a broken image never
  // collapses into an empty void; both states land on the same
  // placeholder box below.
  const [failed, setFailed] = useState(false)
  // Until the photo actually decodes, the frame holds a quiet shimmer
  // rather than an empty box — so a slow image reads as loading instead
  // of as a card that failed to render.
  const [loaded, setLoaded] = useState(false)

  return image && !failed ? (
    <>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-ink-100"
          data-testid="thumbnail-skeleton"
        />
      )}
      <Image
        src={image}
        alt={alt || "Product photo"}
        className={clx(
          "absolute inset-0 object-cover object-center transition-[transform,opacity] duration-standard ease-out group-hover:scale-[1.03]",
          loaded ? "opacity-100" : "opacity-0"
        )}
        draggable={false}
        quality={50}
        sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        fill
      />
    </>
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-ink-100">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
