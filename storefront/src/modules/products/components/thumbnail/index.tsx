import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

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
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  className,
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
        "relative w-full overflow-hidden !p-0 !rounded-radius-sm shadow-elevation-0 group-hover:shadow-elevation-1 transition-shadow duration-standard ease-in-out",
        className,
        {
          // A single uniform 1:1 ratio across every product-card-grid
          // thumbnail ("full"/"square", used by ProductPreview) — the
          // previous 9:16/11:14 split rendered every grid card as a very
          // tall portrait strip. "small"/"medium"/"large" remain
          // unaffected: those sizes are used for fixed-width line-item
          // thumbnails (cart, order review), a different context this
          // task's product-card-grid scope doesn't cover.
          "aspect-[9/16]": size === "small" || size === "medium" || size === "large",
          "aspect-square": size === "full" || size === "square",
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
  return image ? (
    <Image
      src={image}
      alt={alt || "Product photo"}
      className="absolute inset-0 object-cover object-center transition-transform duration-standard ease-out group-hover:scale-[1.03]"
      draggable={false}
      quality={50}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
